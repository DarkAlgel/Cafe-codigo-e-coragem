const mongoose = require('mongoose');

const airQualitySchema = new mongoose.Schema({
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
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  aqi: {
    value: {
      type: Number,
      required: true,
      min: 0,
      max: 500
    },
    category: {
      type: String,
      enum: ['Boa', 'Moderada', 'Insalubre para Grupos Sensíveis', 'Insalubre', 'Muito Insalubre', 'Perigosa'],
      required: true
    },
    color: {
      type: String,
      enum: ['green', 'yellow', 'orange', 'red', 'purple', 'maroon'],
      required: true
    }
  },
  pollutants: {
    pm25: {
      value: Number,
      unit: { type: String, default: 'µg/m³' }
    },
    pm10: {
      value: Number,
      unit: { type: String, default: 'µg/m³' }
    },
    o3: {
      value: Number,
      unit: { type: String, default: 'µg/m³' }
    },
    no2: {
      value: Number,
      unit: { type: String, default: 'µg/m³' }
    },
    so2: {
      value: Number,
      unit: { type: String, default: 'µg/m³' }
    },
    co: {
      value: Number,
      unit: { type: String, default: 'mg/m³' }
    }
  },
  weather: {
    temperature: Number,
    humidity: Number,
    windSpeed: Number,
    windDirection: Number,
    pressure: Number,
    visibility: Number
  },
  source: {
    type: String,
    enum: ['NASA', 'INPE', 'Manual', 'Sensor'],
    default: 'NASA'
  },
  dataQuality: {
    type: String,
    enum: ['Excelente', 'Boa', 'Regular', 'Ruim'],
    default: 'Boa'
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

// Índices para otimização de consultas
airQualitySchema.index({ 'location.coordinates': '2dsphere' });
airQualitySchema.index({ timestamp: -1 });
airQualitySchema.index({ 'location.city': 1, timestamp: -1 });
airQualitySchema.index({ 'aqi.value': 1 });

// Método estático para calcular categoria do AQI
airQualitySchema.statics.calculateAQICategory = function(aqiValue) {
  if (aqiValue <= 50) return { category: 'Boa', color: 'green' };
  if (aqiValue <= 100) return { category: 'Moderada', color: 'yellow' };
  if (aqiValue <= 150) return { category: 'Insalubre para Grupos Sensíveis', color: 'orange' };
  if (aqiValue <= 200) return { category: 'Insalubre', color: 'red' };
  if (aqiValue <= 300) return { category: 'Muito Insalubre', color: 'purple' };
  return { category: 'Perigosa', color: 'maroon' };
};

// Método para obter dados resumidos
airQualitySchema.methods.getSummary = function() {
  return {
    id: this._id,
    location: this.location,
    timestamp: this.timestamp,
    aqi: this.aqi,
    mainPollutants: {
      pm25: this.pollutants.pm25?.value,
      pm10: this.pollutants.pm10?.value,
      o3: this.pollutants.o3?.value
    },
    weather: {
      temperature: this.weather?.temperature,
      humidity: this.weather?.humidity
    }
  };
};

// Middleware para definir categoria e cor do AQI automaticamente
airQualitySchema.pre('save', function(next) {
  if (this.isModified('aqi.value')) {
    const aqiInfo = this.constructor.calculateAQICategory(this.aqi.value);
    this.aqi.category = aqiInfo.category;
    this.aqi.color = aqiInfo.color;
  }
  next();
});

module.exports = mongoose.model('AirQuality', airQualitySchema);