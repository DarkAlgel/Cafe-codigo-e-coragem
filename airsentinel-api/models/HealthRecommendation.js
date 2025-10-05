const mongoose = require('mongoose');

const healthRecommendationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    city: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  currentAQI: {
    value: {
      type: Number,
      required: true
    },
    category: String,
    color: String
  },
  riskLevel: {
    type: String,
    enum: ['baixo', 'moderado', 'alto', 'critico'],
    required: true
  },
  recommendations: {
    general: [{
      type: String,
      priority: {
        type: String,
        enum: ['baixa', 'media', 'alta', 'critica'],
        default: 'media'
      },
      icon: String,
      category: {
        type: String,
        enum: ['atividade', 'protecao', 'medicacao', 'ambiente', 'monitoramento']
      }
    }],
    activities: {
      outdoor: [{
        activity: String,
        recommendation: String,
        safety: {
          type: String,
          enum: ['seguro', 'cuidado', 'evitar', 'proibido']
        },
        timeRestriction: String,
        alternatives: [String]
      }],
      indoor: [{
        activity: String,
        recommendation: String,
        benefits: [String]
      }]
    },
    protection: {
      mask: {
        required: Boolean,
        type: {
          type: String,
          enum: ['N95', 'PFF2', 'cirurgica', 'tecido', 'nenhuma']
        },
        duration: String
      },
      clothing: [String],
      accessories: [String]
    },
    health: {
      medication: [{
        condition: String,
        recommendation: String,
        urgency: {
          type: String,
          enum: ['baixa', 'media', 'alta', 'emergencia']
        }
      }],
      symptoms: [{
        symptom: String,
        action: String,
        whenToSeekHelp: String
      }],
      monitoring: [{
        parameter: String,
        frequency: String,
        normalRange: String
      }]
    }
  },
  timeframe: {
    validFrom: {
      type: Date,
      default: Date.now
    },
    validUntil: {
      type: Date,
      required: true
    },
    updateFrequency: {
      type: String,
      enum: ['1h', '3h', '6h', '12h', '24h'],
      default: '3h'
    }
  },
  personalization: {
    riskGroup: String,
    healthConditions: [String],
    age: Number,
    activities: [String],
    preferences: {
      detailLevel: {
        type: String,
        enum: ['basico', 'detalhado', 'completo'],
        default: 'detalhado'
      },
      language: {
        type: String,
        default: 'pt-BR'
      }
    }
  },
  metadata: {
    generatedAt: {
      type: Date,
      default: Date.now
    },
    algorithm: {
      name: String,
      version: String
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.8
    },
    sources: [String]
  },
  feedback: {
    helpful: Boolean,
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comments: String,
    followedRecommendations: [String]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Índices
healthRecommendationSchema.index({ userId: 1, createdAt: -1 });
healthRecommendationSchema.index({ 'timeframe.validUntil': 1 });
healthRecommendationSchema.index({ riskLevel: 1 });

// Método estático para gerar recomendações baseadas no perfil do usuário
healthRecommendationSchema.statics.generateForUser = async function(user, currentAQI, location) {
  const riskLevel = user.getRiskLevel();
  const aqiValue = currentAQI.value;
  
  let recommendations = {
    general: [],
    activities: { outdoor: [], indoor: [] },
    protection: { mask: { required: false, type: 'nenhuma' }, clothing: [], accessories: [] },
    health: { medication: [], symptoms: [], monitoring: [] }
  };

  // Recomendações gerais baseadas no AQI
  if (aqiValue > 150) {
    recommendations.general.push({
      type: 'Evite atividades ao ar livre prolongadas',
      priority: 'alta',
      icon: 'warning',
      category: 'atividade'
    });
  }

  if (aqiValue > 100) {
    recommendations.general.push({
      type: 'Mantenha janelas fechadas',
      priority: 'media',
      icon: 'home',
      category: 'ambiente'
    });
  }

  // Recomendações específicas por grupo de risco
  if (user.profile.riskGroup === 'asmaticos' || user.profile.healthConditions.includes('asma')) {
    recommendations.health.medication.push({
      condition: 'asma',
      recommendation: 'Tenha sempre seu inalador em mãos',
      urgency: aqiValue > 150 ? 'alta' : 'media'
    });
    
    if (aqiValue > 100) {
      recommendations.protection.mask.required = true;
      recommendations.protection.mask.type = 'N95';
    }
  }

  if (user.profile.riskGroup === 'criancas') {
    recommendations.activities.outdoor.push({
      activity: 'Brincadeiras ao ar livre',
      recommendation: aqiValue > 100 ? 'Limite o tempo de exposição' : 'Atividade liberada',
      safety: aqiValue > 150 ? 'evitar' : aqiValue > 100 ? 'cuidado' : 'seguro',
      alternatives: ['Jogos internos', 'Atividades educativas em casa']
    });
  }

  if (user.profile.riskGroup === 'atletas') {
    recommendations.activities.outdoor.push({
      activity: 'Exercícios intensos',
      recommendation: aqiValue > 100 ? 'Reduza a intensidade ou mude para ambiente interno' : 'Atividade normal',
      safety: aqiValue > 150 ? 'evitar' : aqiValue > 100 ? 'cuidado' : 'seguro',
      timeRestriction: aqiValue > 100 ? 'Evite horários de pico (6h-10h, 17h-20h)' : null
    });
  }

  // Determinar validade da recomendação
  const validUntil = new Date();
  validUntil.setHours(validUntil.getHours() + 3); // Válida por 3 horas

  return new this({
    userId: user._id,
    location,
    currentAQI,
    riskLevel,
    recommendations,
    timeframe: {
      validUntil,
      updateFrequency: '3h'
    },
    personalization: {
      riskGroup: user.profile.riskGroup,
      healthConditions: user.profile.healthConditions,
      age: user.profile.age,
      activities: user.profile.preferences.activities
    },
    metadata: {
      algorithm: {
        name: 'RiskBasedRecommendation',
        version: '1.0.0'
      },
      confidence: 0.85,
      sources: ['WHO Guidelines', 'EPA Standards', 'Medical Literature']
    }
  });
};

// Método para verificar se a recomendação ainda é válida
healthRecommendationSchema.methods.isValid = function() {
  return this.timeframe.validUntil > new Date() && this.isActive;
};

// Método para obter recomendações por categoria
healthRecommendationSchema.methods.getByCategory = function(category) {
  return this.recommendations.general.filter(rec => rec.category === category);
};

module.exports = mongoose.model('HealthRecommendation', healthRecommendationSchema);