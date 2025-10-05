const express = require('express');
const { query, validationResult } = require('express-validator');
const HealthRecommendation = require('../models/HealthRecommendation');
const AirQuality = require('../models/AirQuality');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Rota para obter recomendações personalizadas
router.get('/recommendations', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Buscar usuário completo
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Buscar recomendação válida existente
    let recommendation = await HealthRecommendation.findOne({
      userId,
      'timeframe.validUntil': { $gt: new Date() },
      isActive: true
    }).sort({ createdAt: -1 });

    // Se não há recomendação válida, gerar nova
    if (!recommendation) {
      // Obter dados atuais de qualidade do ar
      const city = user.profile.location.city;
      const currentAirQuality = await AirQuality.findOne({
        'location.city': city,
        timestamp: { 
          $gte: new Date(Date.now() - 60 * 60 * 1000) // Última hora
        }
      }).sort({ timestamp: -1 });

      if (!currentAirQuality) {
        return res.status(404).json({ 
          error: 'Dados de qualidade do ar não disponíveis para sua localização' 
        });
      }

      // Gerar nova recomendação
      recommendation = await HealthRecommendation.generateForUser(
        user, 
        currentAirQuality.aqi, 
        user.profile.location
      );
      await recommendation.save();
    }

    res.json({
      success: true,
      data: {
        riskLevel: recommendation.riskLevel,
        currentAQI: recommendation.currentAQI,
        recommendations: recommendation.recommendations,
        personalization: recommendation.personalization,
        validUntil: recommendation.timeframe.validUntil,
        confidence: recommendation.metadata.confidence
      },
      user: {
        riskGroup: user.profile.riskGroup,
        healthConditions: user.profile.healthConditions,
        age: user.profile.age
      }
    });

  } catch (error) {
    console.error('Erro ao obter recomendações:', error);
    res.status(500).json({ error: 'Erro ao obter recomendações de saúde' });
  }
});

// Rota para recomendações por grupo de risco específico
router.get('/recommendations/:riskGroup', [
  query('aqi').optional().isInt({ min: 0, max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Parâmetros inválidos', 
        details: errors.array() 
      });
    }

    const { riskGroup } = req.params;
    const { aqi = 100 } = req.query;

    const validRiskGroups = ['criancas', 'idosos', 'atletas', 'asmaticos', 'normal'];
    if (!validRiskGroups.includes(riskGroup)) {
      return res.status(400).json({ 
        error: 'Grupo de risco inválido',
        validGroups: validRiskGroups
      });
    }

    // Gerar recomendações genéricas para o grupo
    const recommendations = generateRecommendationsByGroup(riskGroup, parseInt(aqi));

    res.json({
      success: true,
      data: {
        riskGroup,
        aqi: parseInt(aqi),
        recommendations,
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('Erro ao obter recomendações por grupo:', error);
    res.status(500).json({ error: 'Erro ao obter recomendações por grupo' });
  }
});

// Rota para recomendações de atividades ao ar livre
router.get('/activities', auth, [
  query('activity').optional().isString(),
  query('duration').optional().isInt({ min: 15, max: 480 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Parâmetros inválidos', 
        details: errors.array() 
      });
    }

    const userId = req.user.userId;
    const { activity, duration = 60 } = req.query;

    // Buscar usuário
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Obter dados atuais de qualidade do ar
    const city = user.profile.location.city;
    const currentAirQuality = await AirQuality.findOne({
      'location.city': city,
      timestamp: { 
        $gte: new Date(Date.now() - 60 * 60 * 1000)
      }
    }).sort({ timestamp: -1 });

    if (!currentAirQuality) {
      return res.status(404).json({ 
        error: 'Dados de qualidade do ar não disponíveis' 
      });
    }

    // Gerar recomendações de atividades
    const activityRecommendations = generateActivityRecommendations(
      user, 
      currentAirQuality.aqi.value, 
      activity, 
      parseInt(duration)
    );

    res.json({
      success: true,
      data: {
        currentAQI: currentAirQuality.aqi,
        userRiskLevel: user.getRiskLevel(),
        activityRecommendations,
        requestedActivity: activity,
        requestedDuration: parseInt(duration),
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('Erro ao obter recomendações de atividades:', error);
    res.status(500).json({ error: 'Erro ao obter recomendações de atividades' });
  }
});

// Rota para feedback sobre recomendações
router.post('/recommendations/:recommendationId/feedback', auth, async (req, res) => {
  try {
    const { recommendationId } = req.params;
    const { helpful, rating, comments, followedRecommendations } = req.body;
    const userId = req.user.userId;

    const recommendation = await HealthRecommendation.findOne({
      _id: recommendationId,
      userId
    });

    if (!recommendation) {
      return res.status(404).json({ error: 'Recomendação não encontrada' });
    }

    // Atualizar feedback
    recommendation.feedback = {
      helpful: helpful !== undefined ? helpful : recommendation.feedback?.helpful,
      rating: rating || recommendation.feedback?.rating,
      comments: comments || recommendation.feedback?.comments,
      followedRecommendations: followedRecommendations || recommendation.feedback?.followedRecommendations || []
    };

    await recommendation.save();

    res.json({
      success: true,
      message: 'Feedback registrado com sucesso',
      data: {
        recommendationId,
        feedback: recommendation.feedback
      }
    });

  } catch (error) {
    console.error('Erro ao registrar feedback:', error);
    res.status(500).json({ error: 'Erro ao registrar feedback' });
  }
});

// Rota para obter estatísticas de saúde
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Buscar recomendações do usuário nos últimos 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const userRecommendations = await HealthRecommendation.find({
      userId,
      createdAt: { $gte: thirtyDaysAgo }
    }).sort({ createdAt: -1 });

    // Calcular estatísticas
    const stats = {
      totalRecommendations: userRecommendations.length,
      riskLevelDistribution: {},
      averageAQI: 0,
      feedbackStats: {
        totalFeedbacks: 0,
        averageRating: 0,
        helpfulPercentage: 0
      },
      mostCommonRecommendations: {},
      riskTrends: []
    };

    if (userRecommendations.length > 0) {
      // Distribuição de níveis de risco
      userRecommendations.forEach(rec => {
        stats.riskLevelDistribution[rec.riskLevel] = 
          (stats.riskLevelDistribution[rec.riskLevel] || 0) + 1;
      });

      // AQI médio
      const totalAQI = userRecommendations.reduce((sum, rec) => sum + rec.currentAQI.value, 0);
      stats.averageAQI = Math.round(totalAQI / userRecommendations.length);

      // Estatísticas de feedback
      const feedbacks = userRecommendations.filter(rec => rec.feedback && rec.feedback.rating);
      if (feedbacks.length > 0) {
        stats.feedbackStats.totalFeedbacks = feedbacks.length;
        stats.feedbackStats.averageRating = 
          feedbacks.reduce((sum, rec) => sum + rec.feedback.rating, 0) / feedbacks.length;
        
        const helpfulCount = feedbacks.filter(rec => rec.feedback.helpful === true).length;
        stats.feedbackStats.helpfulPercentage = 
          Math.round((helpfulCount / feedbacks.length) * 100);
      }

      // Recomendações mais comuns
      userRecommendations.forEach(rec => {
        rec.recommendations.general.forEach(genRec => {
          const key = genRec.category || 'geral';
          stats.mostCommonRecommendations[key] = 
            (stats.mostCommonRecommendations[key] || 0) + 1;
        });
      });

      // Tendências de risco (últimos 7 dias)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentRecs = userRecommendations.filter(rec => rec.createdAt >= sevenDaysAgo);
      const riskTrendMap = {};
      
      recentRecs.forEach(rec => {
        const date = rec.createdAt.toISOString().split('T')[0];
        if (!riskTrendMap[date]) {
          riskTrendMap[date] = { date, risks: [] };
        }
        riskTrendMap[date].risks.push(rec.riskLevel);
      });

      stats.riskTrends = Object.values(riskTrendMap).map(day => ({
        date: day.date,
        averageRisk: calculateAverageRiskScore(day.risks),
        count: day.risks.length
      }));
    }

    res.json({
      success: true,
      data: stats,
      period: '30 dias',
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({ error: 'Erro ao obter estatísticas de saúde' });
  }
});

// Função auxiliar para gerar recomendações por grupo
function generateRecommendationsByGroup(riskGroup, aqi) {
  const baseRecommendations = {
    general: [],
    activities: { outdoor: [], indoor: [] },
    protection: { mask: { required: false, type: 'nenhuma' }, clothing: [], accessories: [] },
    health: { medication: [], symptoms: [], monitoring: [] }
  };

  // Recomendações gerais baseadas no AQI
  if (aqi > 150) {
    baseRecommendations.general.push({
      type: 'Evite atividades ao ar livre',
      priority: 'alta',
      icon: 'warning',
      category: 'atividade'
    });
  }

  // Recomendações específicas por grupo
  switch (riskGroup) {
    case 'criancas':
      baseRecommendations.activities.outdoor.push({
        activity: 'Brincadeiras ao ar livre',
        recommendation: aqi > 100 ? 'Limite o tempo de exposição a 30 minutos' : 'Atividade liberada',
        safety: aqi > 150 ? 'evitar' : aqi > 100 ? 'cuidado' : 'seguro'
      });
      break;

    case 'idosos':
      baseRecommendations.health.monitoring.push({
        parameter: 'Sintomas respiratórios',
        frequency: 'Diariamente',
        normalRange: 'Sem falta de ar ou tosse'
      });
      break;

    case 'atletas':
      baseRecommendations.activities.outdoor.push({
        activity: 'Exercícios intensos',
        recommendation: aqi > 100 ? 'Reduza intensidade em 50%' : 'Atividade normal',
        safety: aqi > 150 ? 'evitar' : aqi > 100 ? 'cuidado' : 'seguro'
      });
      break;

    case 'asmaticos':
      baseRecommendations.health.medication.push({
        condition: 'asma',
        recommendation: 'Tenha sempre seu inalador em mãos',
        urgency: aqi > 150 ? 'alta' : 'media'
      });
      if (aqi > 100) {
        baseRecommendations.protection.mask.required = true;
        baseRecommendations.protection.mask.type = 'N95';
      }
      break;
  }

  return baseRecommendations;
}

// Função auxiliar para gerar recomendações de atividades
function generateActivityRecommendations(user, aqi, activity, duration) {
  const riskLevel = user.getRiskLevel();
  const recommendations = [];

  const activities = {
    'corrida': { intensity: 'alta', outdoor: true },
    'caminhada': { intensity: 'baixa', outdoor: true },
    'ciclismo': { intensity: 'media', outdoor: true },
    'jardinagem': { intensity: 'baixa', outdoor: true },
    'yoga': { intensity: 'baixa', outdoor: false }
  };

  const targetActivity = activities[activity] || activities['caminhada'];

  let safety = 'seguro';
  let recommendation = 'Atividade recomendada';
  let adjustments = [];

  // Avaliar segurança baseada no AQI e intensidade
  if (aqi > 150) {
    safety = targetActivity.outdoor ? 'evitar' : 'cuidado';
    recommendation = targetActivity.outdoor ? 'Evite atividades ao ar livre' : 'Prefira ambientes internos';
  } else if (aqi > 100) {
    safety = 'cuidado';
    if (targetActivity.intensity === 'alta') {
      adjustments.push('Reduza a intensidade');
      adjustments.push('Limite a duração');
    }
  }

  // Ajustes baseados no grupo de risco
  if (riskLevel === 'alto' && aqi > 100) {
    adjustments.push('Considere adiar a atividade');
    if (targetActivity.outdoor) {
      adjustments.push('Use máscara N95');
    }
  }

  // Ajustes de duração
  if (duration > 120 && aqi > 100) {
    adjustments.push(`Reduza duração para ${Math.max(30, duration / 2)} minutos`);
  }

  recommendations.push({
    activity: activity || 'atividade geral',
    safety,
    recommendation,
    adjustments,
    alternativeActivities: targetActivity.outdoor ? ['Yoga indoor', 'Exercícios em casa'] : [],
    bestTimeWindows: aqi > 100 ? ['06:00-08:00', '20:00-22:00'] : ['Qualquer horário'],
    riskFactors: {
      aqi: aqi > 100 ? 'Alto' : 'Baixo',
      userRisk: riskLevel,
      activityIntensity: targetActivity.intensity
    }
  });

  return recommendations;
}

// Função auxiliar para calcular score médio de risco
function calculateAverageRiskScore(risks) {
  const riskScores = { 'baixo': 1, 'moderado': 2, 'alto': 3, 'critico': 4 };
  const totalScore = risks.reduce((sum, risk) => sum + (riskScores[risk] || 2), 0);
  return Math.round(totalScore / risks.length * 10) / 10;
}

module.exports = router;