const express = require('express');
const { query, validationResult } = require('express-validator');
const Prediction = require('../models/Prediction');
const AirQuality = require('../models/AirQuality');
const { auth, optionalAuth } = require('../middleware/auth');
const MLPredictor = require('../services/mlPredictor');

const router = express.Router();

// Instância do preditor ML
const mlPredictor = new MLPredictor();

// Rota para obter previsões
router.get('/', [
  query('city').optional().isString(),
  query('hours').optional().isInt({ min: 1, max: 168 }),
  query('lat').optional().isFloat(),
  query('lng').optional().isFloat()
], optionalAuth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Parâmetros inválidos', 
        details: errors.array() 
      });
    }

    let { city, hours = 24, lat, lng } = req.query;

    // Se usuário autenticado e não forneceu localização, usar do perfil
    if (req.user && !city && !lat && !lng) {
      const userLocation = req.user.profile.location;
      city = userLocation.city;
      lat = userLocation.coordinates?.lat;
      lng = userLocation.coordinates?.lng;
    }

    // Valores padrão
    if (!city) city = 'São Paulo';
    if (!lat) lat = -23.5505;
    if (!lng) lng = -46.6333;

    // Buscar previsão existente e válida
    let prediction = await Prediction.findOne({
      'location.city': city,
      predictionDate: { 
        $gte: new Date(Date.now() - 3 * 60 * 60 * 1000) // Últimas 3 horas
      },
      isActive: true
    }).sort({ predictionDate: -1 });

    // Se não encontrou previsão recente, gerar nova
    if (!prediction) {
      prediction = await mlPredictor.generatePrediction(city, parseFloat(lat), parseFloat(lng), parseInt(hours));
      await prediction.save();
    }

    // Filtrar previsões para o período solicitado
    const requestedPredictions = prediction.getNextHours(parseInt(hours));

    res.json({
      success: true,
      data: {
        location: prediction.location,
        predictionDate: prediction.predictionDate,
        model: prediction.model,
        predictions: requestedPredictions,
        metadata: {
          ...prediction.metadata,
          averageConfidence: prediction.getAverageConfidence(),
          requestedHours: parseInt(hours)
        }
      }
    });

  } catch (error) {
    console.error('Erro ao obter previsões:', error);
    res.status(500).json({ error: 'Erro ao obter previsões' });
  }
});

// Rota para previsões de múltiplas cidades
router.get('/cities', [
  query('hours').optional().isInt({ min: 1, max: 72 })
], optionalAuth, async (req, res) => {
  try {
    const { hours = 24 } = req.query;
    const cities = ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Porto Alegre', 'Salvador'];
    const citiesPredictions = [];

    for (const city of cities) {
      try {
        // Buscar previsão existente
        let prediction = await Prediction.findOne({
          'location.city': city,
          predictionDate: { 
            $gte: new Date(Date.now() - 3 * 60 * 60 * 1000)
          },
          isActive: true
        }).sort({ predictionDate: -1 });

        // Se não encontrou, gerar nova previsão
        if (!prediction) {
          const coordinates = {
            'São Paulo': { lat: -23.5505, lng: -46.6333 },
            'Rio de Janeiro': { lat: -22.9068, lng: -43.1729 },
            'Belo Horizonte': { lat: -19.9167, lng: -43.9345 },
            'Porto Alegre': { lat: -30.0346, lng: -51.2177 },
            'Salvador': { lat: -12.9714, lng: -38.5014 }
          };

          const coords = coordinates[city] || coordinates['São Paulo'];
          prediction = await mlPredictor.generatePrediction(city, coords.lat, coords.lng, parseInt(hours));
          await prediction.save();
        }

        const nextPredictions = prediction.getNextHours(parseInt(hours));
        
        citiesPredictions.push({
          city,
          currentPrediction: nextPredictions[0] || null,
          next24h: nextPredictions.slice(0, 24),
          averageAQI: nextPredictions.length > 0 
            ? Math.round(nextPredictions.reduce((sum, p) => sum + p.aqi.predicted, 0) / nextPredictions.length)
            : null,
          confidence: prediction.getAverageConfidence(),
          lastUpdate: prediction.predictionDate
        });

      } catch (cityError) {
        console.error(`Erro ao obter previsão de ${city}:`, cityError);
      }
    }

    res.json({
      success: true,
      data: citiesPredictions,
      requestedHours: parseInt(hours),
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Erro ao obter previsões das cidades:', error);
    res.status(500).json({ error: 'Erro ao obter previsões das cidades' });
  }
});

// Rota para previsão detalhada por período
router.get('/detailed', [
  query('city').optional().isString(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601()
], optionalAuth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Parâmetros inválidos', 
        details: errors.array() 
      });
    }

    let { city, startDate, endDate } = req.query;

    // Se usuário autenticado e não forneceu cidade, usar do perfil
    if (req.user && !city) {
      city = req.user.profile.location.city;
    }

    if (!city) city = 'São Paulo';

    // Definir período padrão se não fornecido
    if (!startDate) startDate = new Date().toISOString();
    if (!endDate) {
      const end = new Date();
      end.setDate(end.getDate() + 3); // 3 dias à frente
      endDate = end.toISOString();
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Buscar previsões para o período
    const predictions = await Prediction.find({
      'location.city': city,
      'predictions.timestamp': {
        $gte: start,
        $lte: end
      },
      isActive: true
    }).sort({ predictionDate: -1 }).limit(1);

    if (!predictions || predictions.length === 0) {
      return res.status(404).json({ 
        error: 'Nenhuma previsão encontrada para o período solicitado' 
      });
    }

    const prediction = predictions[0];
    const periodPredictions = prediction.getPredictionForPeriod(start, end);

    // Calcular estatísticas do período
    const stats = {
      averageAQI: periodPredictions.length > 0 
        ? Math.round(periodPredictions.reduce((sum, p) => sum + p.aqi.predicted, 0) / periodPredictions.length)
        : 0,
      maxAQI: periodPredictions.length > 0 
        ? Math.max(...periodPredictions.map(p => p.aqi.predicted))
        : 0,
      minAQI: periodPredictions.length > 0 
        ? Math.min(...periodPredictions.map(p => p.aqi.predicted))
        : 0,
      averageConfidence: periodPredictions.length > 0 
        ? periodPredictions.reduce((sum, p) => sum + (p.aqi.confidence || 0), 0) / periodPredictions.length
        : 0,
      totalHours: periodPredictions.length
    };

    // Agrupar por categoria de qualidade
    const categoryDistribution = {};
    periodPredictions.forEach(p => {
      const category = p.aqi.category || 'Desconhecida';
      categoryDistribution[category] = (categoryDistribution[category] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        location: prediction.location,
        period: { start, end },
        predictions: periodPredictions,
        statistics: stats,
        categoryDistribution,
        model: prediction.model,
        metadata: prediction.metadata
      }
    });

  } catch (error) {
    console.error('Erro ao obter previsão detalhada:', error);
    res.status(500).json({ error: 'Erro ao obter previsão detalhada' });
  }
});

// Rota para gerar nova previsão (forçar atualização)
router.post('/generate', auth, [
  query('city').optional().isString(),
  query('hours').optional().isInt({ min: 1, max: 168 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Parâmetros inválidos', 
        details: errors.array() 
      });
    }

    let { city, hours = 48 } = req.query;

    // Se não forneceu cidade, usar do perfil do usuário
    if (!city && req.user) {
      city = req.user.profile.location.city;
    }

    if (!city) city = 'São Paulo';

    // Coordenadas das cidades
    const coordinates = {
      'São Paulo': { lat: -23.5505, lng: -46.6333 },
      'Rio de Janeiro': { lat: -22.9068, lng: -43.1729 },
      'Belo Horizonte': { lat: -19.9167, lng: -43.9345 },
      'Porto Alegre': { lat: -30.0346, lng: -51.2177 },
      'Salvador': { lat: -12.9714, lng: -38.5014 }
    };

    const coords = coordinates[city] || coordinates['São Paulo'];

    // Gerar nova previsão
    const prediction = await mlPredictor.generatePrediction(city, coords.lat, coords.lng, parseInt(hours));
    await prediction.save();

    res.json({
      success: true,
      message: 'Nova previsão gerada com sucesso',
      data: {
        location: prediction.location,
        predictionDate: prediction.predictionDate,
        forecastHours: prediction.forecastHours,
        model: prediction.model,
        averageConfidence: prediction.getAverageConfidence(),
        predictionsCount: prediction.predictions.length
      }
    });

  } catch (error) {
    console.error('Erro ao gerar previsão:', error);
    res.status(500).json({ error: 'Erro ao gerar previsão' });
  }
});

// Rota para obter acurácia do modelo
router.get('/model/accuracy', auth, async (req, res) => {
  try {
    const accuracy = mlPredictor.getModelAccuracy();
    
    res.json({
      success: true,
      data: {
        accuracy,
        lastTraining: mlPredictor.lastTrainingTime,
        modelStatus: mlPredictor.isModelTrained() ? 'trained' : 'not_trained'
      }
    });

  } catch (error) {
    console.error('Erro ao obter acurácia:', error);
    res.status(500).json({ error: 'Erro ao obter acurácia do modelo' });
  }
});

// Rota para treinar modelo manualmente
router.post('/train', auth, async (req, res) => {
  try {
    const { location, forceRetrain = false } = req.body;

    // Verificar se usuário tem permissão (admin)
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Permissão insuficiente para treinar modelos' 
      });
    }

    let targetLocation = location || req.user.profile?.location?.city || 'São Paulo';

    // Verificar se já existe modelo treinado recentemente
    if (!forceRetrain && mlPredictor.isModelTrained()) {
      const lastTraining = mlPredictor.lastTrainingTime;
      const hoursSinceTraining = (Date.now() - lastTraining) / (1000 * 60 * 60);
      
      if (hoursSinceTraining < 6) { // Menos de 6 horas
        return res.json({
          success: true,
          message: 'Modelo já foi treinado recentemente',
          data: {
            lastTraining: new Date(lastTraining),
            hoursSinceTraining: Math.round(hoursSinceTraining * 10) / 10,
            accuracy: mlPredictor.getModelAccuracy()
          }
        });
      }
    }

    // Buscar dados para treinamento
    const trainingData = await AirQuality.find({
      'location.city': { $regex: new RegExp(targetLocation, 'i') },
      timestamp: { 
        $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Últimos 30 dias
      }
    }).sort({ timestamp: -1 });

    if (trainingData.length < 100) {
      return res.status(400).json({ 
        error: 'Dados insuficientes para treinamento',
        available: trainingData.length,
        minimum: 100
      });
    }

    // Treinar modelos
    console.log(`Iniciando treinamento ML para ${targetLocation}...`);
    const trainingResults = await mlPredictor.trainModels(trainingData);

    res.json({
      success: true,
      message: 'Modelos treinados com sucesso',
      data: {
        location: targetLocation,
        trainingResults,
        dataPointsUsed: trainingData.length,
        trainedAt: new Date(),
        accuracy: mlPredictor.getModelAccuracy()
      }
    });

  } catch (error) {
    console.error('Erro ao treinar modelos:', error);
    res.status(500).json({ 
      error: 'Erro ao treinar modelos ML',
      details: error.message 
    });
  }
});

// Rota para obter status detalhado do modelo
router.get('/model/status', async (req, res) => {
  try {
    const status = {
      isTrained: mlPredictor.isModelTrained(),
      lastTraining: mlPredictor.lastTrainingTime ? new Date(mlPredictor.lastTrainingTime) : null,
      accuracy: mlPredictor.getModelAccuracy(),
      availableModels: ['linear', 'polynomial', 'ensemble']
    };

    if (status.lastTraining) {
      const hoursSinceTraining = (Date.now() - mlPredictor.lastTrainingTime) / (1000 * 60 * 60);
      status.hoursSinceTraining = Math.round(hoursSinceTraining * 10) / 10;
      status.needsRetraining = hoursSinceTraining > 24; // Mais de 24 horas
    }

    res.json({
      success: true,
      data: status,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Erro ao obter status do modelo:', error);
    res.status(500).json({ 
      error: 'Erro ao obter status do modelo' 
    });
  }
});

// Rota para validação de previsões
router.get('/validation', auth, [
  query('hours').optional().isInt({ min: 1, max: 48 }),
  query('location').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Parâmetros inválidos', 
        details: errors.array() 
      });
    }

    const { hours = 24, location } = req.query;
    let targetLocation = location || req.user.profile?.location?.city || 'São Paulo';

    // Buscar dados reais das últimas horas
    const hoursAgo = new Date(Date.now() - parseInt(hours) * 60 * 60 * 1000);
    const realData = await AirQuality.find({
      'location.city': { $regex: new RegExp(targetLocation, 'i') },
      timestamp: { $gte: hoursAgo }
    }).sort({ timestamp: 1 });

    if (realData.length === 0) {
      return res.status(404).json({ 
        error: 'Dados reais não disponíveis para validação' 
      });
    }

    // Buscar previsões correspondentes
    const predictions = await Prediction.find({
      'location.city': { $regex: new RegExp(targetLocation, 'i') },
      predictionDate: { $gte: hoursAgo },
      'predictions.timestamp': { $gte: hoursAgo }
    }).sort({ predictionDate: 1 });

    // Comparar previsões com dados reais
    const validation = [];
    let totalError = 0;
    let totalAbsoluteError = 0;
    let comparisons = 0;

    for (const real of realData) {
      // Encontrar previsão mais próxima no tempo
      let closestPrediction = null;
      let minTimeDiff = Infinity;

      for (const predDoc of predictions) {
        for (const pred of predDoc.predictions) {
          const timeDiff = Math.abs(new Date(pred.timestamp) - new Date(real.timestamp));
          if (timeDiff < minTimeDiff && timeDiff < 60 * 60 * 1000) { // Máximo 1 hora de diferença
            minTimeDiff = timeDiff;
            closestPrediction = pred;
          }
        }
      }

      if (closestPrediction) {
        const aqiError = closestPrediction.aqi.value - real.aqi.value;
        const absoluteError = Math.abs(aqiError);

        validation.push({
          timestamp: real.timestamp,
          real: {
            aqi: real.aqi.value,
            category: real.aqi.category,
            pm25: real.pollutants.pm25,
            pm10: real.pollutants.pm10
          },
          predicted: {
            aqi: closestPrediction.aqi.value,
            category: closestPrediction.aqi.category,
            pm25: closestPrediction.pollutants.pm25,
            pm10: closestPrediction.pollutants.pm10
          },
          errors: {
            aqi: aqiError,
            absoluteAqi: absoluteError,
            pm25: closestPrediction.pollutants.pm25 - real.pollutants.pm25,
            pm10: closestPrediction.pollutants.pm10 - real.pollutants.pm10
          },
          accuracy: Math.max(0, 100 - (absoluteError / real.aqi.value) * 100),
          timeDifference: minTimeDiff / (1000 * 60) // em minutos
        });

        totalError += aqiError;
        totalAbsoluteError += absoluteError;
        comparisons++;
      }
    }

    if (comparisons === 0) {
      return res.status(404).json({ 
        error: 'Nenhuma previsão encontrada para comparação' 
      });
    }

    const validationSummary = {
      totalComparisons: comparisons,
      meanError: totalError / comparisons,
      meanAbsoluteError: totalAbsoluteError / comparisons,
      accuracy: validation.reduce((sum, v) => sum + v.accuracy, 0) / validation.length,
      rmse: Math.sqrt(validation.reduce((sum, v) => sum + Math.pow(v.errors.aqi, 2), 0) / validation.length)
    };

    res.json({
      success: true,
      data: {
        location: targetLocation,
        validationPeriod: `${hours} horas`,
        summary: validationSummary,
        detailedComparison: validation.slice(0, 50), // Limitar resposta
        metadata: {
          modelAccuracy: mlPredictor.getModelAccuracy(),
          validatedAt: new Date()
        }
      }
    });

  } catch (error) {
    console.error('Erro na validação:', error);
    res.status(500).json({ 
      error: 'Erro na validação das previsões',
      details: error.message 
    });
  }
});

module.exports = router;