const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  location: {
    city: {
      type: String,
      required: true
    },
    state: String,
    country: {
      type: String,
      default: 'Brasil'
    },
    coordinates: {
      lat: {
        type: Number,
        required: true
      },
      lng: {
        type: Number,
        required: true
      }
    }
  },
  predictionDate: {
    type: Date,
    required: true
  },
  forecastHours: {
    type: Number,
    required: true,
    min: 1,
    max: 168 // 7 dias
  },
  predictions: [{
    timestamp: {
      type: Date,
      required: true
    },
    aqi: {
      predicted: {
        type: Number,
        required: true,
        min: 0,
        max: 500
      },
      confidence: {
        type: Number,
        min: 0,
        max: 1,
        default: 0.8
      },
      category: String,
      color: String
    },
    pollutants: {
      pm25: {
        predicted: Number,
        confidence: Number
      },
      pm10: {
        predicted: Number,
        confidence: Number
      },
      o3: {
        predicted: Number,
        confidence: Number
      },
      no2: {
        predicted: Number,
        confidence: Number
      }
    },
    weather: {
      temperature: Number,
      humidity: Number,
      windSpeed: Number,
      pressure: Number
    }
  }],
  model: {
    name: {
      type: String,
      required: true,
      enum: ['LinearRegression', 'RandomForest', 'LSTM', 'Ensemble']
    },
    version: {
      type: String,
      required: true
    },
    accuracy: {
      type: Number,
      min: 0,
      max: 1
    },
    trainingData: {
      startDate: Date,
      endDate: Date,
      sampleCount: Number
    }
  },
  metadata: {
    generatedAt: {
      type: Date,
      default: Date.now
    },
    generatedBy: {
      type: String,
      default: 'ML-Engine'
    },
    processingTime: Number, // em milissegundos
    dataQuality: {
      type: String,
      enum: ['Excelente', 'Boa', 'Regular', 'Ruim'],
      default: 'Boa'
    }
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

// Índices para otimização
predictionSchema.index({ 'location.coordinates': '2dsphere' });
predictionSchema.index({ predictionDate: -1 });
predictionSchema.index({ 'location.city': 1, predictionDate: -1 });
predictionSchema.index({ 'predictions.timestamp': 1 });

// Método para obter previsão por período
predictionSchema.methods.getPredictionForPeriod = function(startDate, endDate) {
  return this.predictions.filter(pred => 
    pred.timestamp >= startDate && pred.timestamp <= endDate
  );
};

// Método para obter próximas N horas
predictionSchema.methods.getNextHours = function(hours = 24) {
  const now = new Date();
  const endTime = new Date(now.getTime() + (hours * 60 * 60 * 1000));
  
  return this.predictions.filter(pred => 
    pred.timestamp >= now && pred.timestamp <= endTime
  ).sort((a, b) => a.timestamp - b.timestamp);
};

// Método para calcular média de confiança
predictionSchema.methods.getAverageConfidence = function() {
  if (!this.predictions || this.predictions.length === 0) return 0;
  
  const totalConfidence = this.predictions.reduce((sum, pred) => 
    sum + (pred.aqi.confidence || 0), 0
  );
  
  return totalConfidence / this.predictions.length;
};

// Método estático para limpar previsões antigas
predictionSchema.statics.cleanOldPredictions = function(daysOld = 7) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  return this.deleteMany({
    predictionDate: { $lt: cutoffDate }
  });
};

// Middleware para definir categoria e cor do AQI nas previsões
predictionSchema.pre('save', function(next) {
  this.predictions.forEach(prediction => {
    if (prediction.aqi && prediction.aqi.predicted) {
      const aqiValue = prediction.aqi.predicted;
      let category, color;
      
      if (aqiValue <= 50) {
        category = 'Boa';
        color = 'green';
      } else if (aqiValue <= 100) {
        category = 'Moderada';
        color = 'yellow';
      } else if (aqiValue <= 150) {
        category = 'Insalubre para Grupos Sensíveis';
        color = 'orange';
      } else if (aqiValue <= 200) {
        category = 'Insalubre';
        color = 'red';
      } else if (aqiValue <= 300) {
        category = 'Muito Insalubre';
        color = 'purple';
      } else {
        category = 'Perigosa';
        color = 'maroon';
      }
      
      prediction.aqi.category = category;
      prediction.aqi.color = color;
    }
  });
  next();
});

module.exports = mongoose.model('Prediction', predictionSchema);