const express = require('express');
const axios = require('axios');
const { body, query, validationResult } = require('express-validator');
const AirQuality = require('../models/AirQuality');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Dados simulados para demonstração (quando NASA API não estiver disponível)
const mockAirQualityData = {
  'São Paulo': {
    aqi: { value: 85, category: 'Moderada', color: 'yellow' },
    pollutants: {
      pm25: { value: 24, unit: 'µg/m³' },
      pm10: { value: 45, unit: 'µg/m³' },
      o3: { value: 120, unit: 'µg/m³' },
      no2: { value: 35, unit: 'µg/m³' },
      co: { value: 1.2, unit: 'mg/m³' }
    },
    weather: {
      temperature: 28,
      humidity: 65,
      windSpeed: 18,
      pressure: 1013
    }
  },
  'Rio de Janeiro': {
    aqi: { value: 72, category: 'Moderada', color: 'yellow' },
    pollutants: {
      pm25: { value: 18, unit: 'µg/m³' },
      pm10: { value: 38, unit: 'µg/m³' },
      o3: { value: 95, unit: 'µg/m³' },
      no2: { value: 28, unit: 'µg/m³' },
      co: { value: 0.9, unit: 'mg/m³' }
    },
    weather: {
      temperature: 32,
      humidity: 78,
      windSpeed: 12,
      pressure: 1015
    }
  },
  'Belo Horizonte': {
    aqi: { value: 95, category: 'Moderada', color: 'yellow' },
    pollutants: {
      pm25: { value: 28, unit: 'µg/m³' },
      pm10: { value: 52, unit: 'µg/m³' },
      o3: { value: 140, unit: 'µg/m³' },
      no2: { value: 42, unit: 'µg/m³' },
      co: { value: 1.5, unit: 'mg/m³' }
    },
    weather: {
      temperature: 25,
      humidity: 55,
      windSpeed: 15,
      pressure: 1018
    }
  }
};

// Função para buscar dados da NASA (simulada)
async function fetchNASAData(lat, lng, city) {
  try {
    // Simular chamada para NASA API
    // Em produção, usar: https://api.nasa.gov/planetary/earth/assets
    
    // Por enquanto, retornar dados simulados baseados na cidade
    const cityData = mockAirQualityData[city] || mockAirQualityData['São Paulo'];
    
    // Adicionar alguma variação aleatória para simular dados em tempo real
    const variation = (Math.random() - 0.5) * 0.2; // ±10% de variação
    const aqiValue = Math.max(0, Math.min(500, Math.round(cityData.aqi.value * (1 + variation))));
    
    return {
      location: {
        city,
        coordinates: { lat, lng }
      },
      aqi: {
        value: aqiValue,
        ...AirQuality.calculateAQICategory(aqiValue)
      },
      pollutants: {
        pm25: { 
          value: Math.round(cityData.pollutants.pm25.value * (1 + variation)), 
          unit: 'µg/m³' 
        },
        pm10: { 
          value: Math.round(cityData.pollutants.pm10.value * (1 + variation)), 
          unit: 'µg/m³' 
        },
        o3: { 
          value: Math.round(cityData.pollutants.o3.value * (1 + variation)), 
          unit: 'µg/m³' 
        },
        no2: { 
          value: Math.round(cityData.pollutants.no2.value * (1 + variation)), 
          unit: 'µg/m³' 
        },
        co: { 
          value: Math.round(cityData.pollutants.co.value * (1 + variation) * 10) / 10, 
          unit: 'mg/m³' 
        }
      },
      weather: {
        temperature: Math.round(cityData.weather.temperature + (Math.random() - 0.5) * 6),
        humidity: Math.max(0, Math.min(100, Math.round(cityData.weather.humidity + (Math.random() - 0.5) * 20))),
        windSpeed: Math.max(0, Math.round(cityData.weather.windSpeed + (Math.random() - 0.5) * 10)),
        pressure: Math.round(cityData.weather.pressure + (Math.random() - 0.5) * 10)
      },
      source: 'NASA',
      timestamp: new Date()
    };
  } catch (error) {
    console.error('Erro ao buscar dados da NASA:', error);
    throw new Error('Falha ao obter dados de qualidade do ar');
  }
}

// Rota para obter dados atuais de qualidade do ar
router.get('/current', [
  query('city').optional().isString(),
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

    let { city, lat, lng } = req.query;

    // Se usuário autenticado e não forneceu localização, usar do perfil
    if (req.user && !city && !lat && !lng) {
      const userLocation = req.user.profile.location;
      city = userLocation.city;
      lat = userLocation.coordinates?.lat;
      lng = userLocation.coordinates?.lng;
    }

    // Valores padrão se não fornecidos
    if (!city) city = 'São Paulo';
    if (!lat) lat = -23.5505;
    if (!lng) lng = -46.6333;

    // Buscar dados mais recentes no banco
    let airQualityData = await AirQuality.findOne({
      'location.city': city,
      timestamp: { 
        $gte: new Date(Date.now() - 30 * 60 * 1000) // Últimos 30 minutos
      }
    }).sort({ timestamp: -1 });

    // Se não encontrou dados recentes, buscar da NASA
    if (!airQualityData) {
      const nasaData = await fetchNASAData(parseFloat(lat), parseFloat(lng), city);
      
      // Salvar no banco
      airQualityData = new AirQuality(nasaData);
      await airQualityData.save();
    }

    res.json({
      success: true,
      data: airQualityData.getSummary(),
      timestamp: airQualityData.timestamp,
      source: airQualityData.source
    });

  } catch (error) {
    console.error('Erro ao obter dados atuais:', error);
    res.status(500).json({ error: 'Erro ao obter dados de qualidade do ar' });
  }
});

// Rota para obter histórico de dados
router.get('/history', [
  query('city').optional().isString(),
  query('days').optional().isInt({ min: 1, max: 30 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], optionalAuth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Parâmetros inválidos', 
        details: errors.array() 
      });
    }

    let { city, days = 7, limit = 50 } = req.query;

    // Se usuário autenticado e não forneceu cidade, usar do perfil
    if (req.user && !city) {
      city = req.user.profile.location.city;
    }

    if (!city) city = 'São Paulo';

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const historyData = await AirQuality.find({
      'location.city': city,
      timestamp: { $gte: startDate }
    })
    .sort({ timestamp: -1 })
    .limit(parseInt(limit))
    .select('timestamp aqi pollutants weather source');

    // Gerar dados simulados se não houver histórico suficiente
    if (historyData.length < 10) {
      const simulatedData = [];
      const baseData = mockAirQualityData[city] || mockAirQualityData['São Paulo'];
      
      for (let i = parseInt(days) * 24; i >= 0; i -= 3) { // A cada 3 horas
        const timestamp = new Date(Date.now() - (i * 60 * 60 * 1000));
        const variation = (Math.random() - 0.5) * 0.3;
        const aqiValue = Math.max(0, Math.min(500, Math.round(baseData.aqi.value * (1 + variation))));
        
        simulatedData.push({
          timestamp,
          aqi: {
            value: aqiValue,
            ...AirQuality.calculateAQICategory(aqiValue)
          },
          pollutants: {
            pm25: { value: Math.round(baseData.pollutants.pm25.value * (1 + variation)) },
            pm10: { value: Math.round(baseData.pollutants.pm10.value * (1 + variation)) },
            o3: { value: Math.round(baseData.pollutants.o3.value * (1 + variation)) }
          },
          source: 'Simulated'
        });
      }
      
      return res.json({
        success: true,
        data: simulatedData.slice(0, parseInt(limit)),
        city,
        period: `${days} dias`,
        note: 'Dados simulados para demonstração'
      });
    }

    res.json({
      success: true,
      data: historyData,
      city,
      period: `${days} dias`,
      count: historyData.length
    });

  } catch (error) {
    console.error('Erro ao obter histórico:', error);
    res.status(500).json({ error: 'Erro ao obter histórico de dados' });
  }
});

// Rota para obter dados de múltiplas cidades
router.get('/cities', optionalAuth, async (req, res) => {
  try {
    const cities = ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Porto Alegre', 'Salvador'];
    const citiesData = [];

    for (const city of cities) {
      try {
        // Buscar dados recentes no banco
        let cityData = await AirQuality.findOne({
          'location.city': city,
          timestamp: { 
            $gte: new Date(Date.now() - 60 * 60 * 1000) // Última hora
          }
        }).sort({ timestamp: -1 });

        // Se não encontrou, usar dados simulados
        if (!cityData) {
          const mockData = mockAirQualityData[city] || mockAirQualityData['São Paulo'];
          const variation = (Math.random() - 0.5) * 0.2;
          const aqiValue = Math.max(0, Math.min(500, Math.round(mockData.aqi.value * (1 + variation))));
          
          cityData = {
            location: { city },
            aqi: {
              value: aqiValue,
              ...AirQuality.calculateAQICategory(aqiValue)
            },
            pollutants: {
              pm25: { value: Math.round(mockData.pollutants.pm25.value * (1 + variation)) }
            },
            weather: {
              temperature: Math.round(mockData.weather.temperature + (Math.random() - 0.5) * 6)
            },
            timestamp: new Date(),
            source: 'Simulated'
          };
        }

        citiesData.push({
          city,
          aqi: cityData.aqi,
          temperature: cityData.weather?.temperature,
          timestamp: cityData.timestamp,
          source: cityData.source
        });
      } catch (cityError) {
        console.error(`Erro ao obter dados de ${city}:`, cityError);
      }
    }

    res.json({
      success: true,
      data: citiesData,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Erro ao obter dados das cidades:', error);
    res.status(500).json({ error: 'Erro ao obter dados das cidades' });
  }
});

// Rota para buscar por coordenadas geográficas
router.get('/nearby', [
  query('lat').isFloat().withMessage('Latitude é obrigatória'),
  query('lng').isFloat().withMessage('Longitude é obrigatória'),
  query('radius').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Parâmetros inválidos', 
        details: errors.array() 
      });
    }

    const { lat, lng, radius = 50 } = req.query;

    // Buscar dados próximos usando índice geoespacial
    const nearbyData = await AirQuality.find({
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius) * 1000 // Converter km para metros
        }
      },
      timestamp: { 
        $gte: new Date(Date.now() - 2 * 60 * 60 * 1000) // Últimas 2 horas
      }
    }).limit(10);

    res.json({
      success: true,
      data: nearbyData.map(item => item.getSummary()),
      searchCenter: { lat: parseFloat(lat), lng: parseFloat(lng) },
      radius: `${radius} km`
    });

  } catch (error) {
    console.error('Erro ao buscar dados próximos:', error);
    res.status(500).json({ error: 'Erro ao buscar dados próximos' });
  }
});

// Rota para atualizar dados manualmente (admin)
router.post('/update', auth, [
  body('city').notEmpty().withMessage('Cidade é obrigatória'),
  body('lat').isFloat().withMessage('Latitude inválida'),
  body('lng').isFloat().withMessage('Longitude inválida')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Dados inválidos', 
        details: errors.array() 
      });
    }

    const { city, lat, lng } = req.body;

    // Buscar novos dados da NASA
    const nasaData = await fetchNASAData(lat, lng, city);
    
    // Salvar no banco
    const airQualityData = new AirQuality(nasaData);
    await airQualityData.save();

    res.json({
      success: true,
      message: 'Dados atualizados com sucesso',
      data: airQualityData.getSummary()
    });

  } catch (error) {
    console.error('Erro ao atualizar dados:', error);
    res.status(500).json({ error: 'Erro ao atualizar dados' });
  }
});

module.exports = router;