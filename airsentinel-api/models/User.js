const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  profile: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    age: {
      type: Number,
      min: 0,
      max: 120
    },
    riskGroup: {
      type: String,
      enum: ['criancas', 'idosos', 'atletas', 'asmaticos', 'normal'],
      default: 'normal'
    },
    healthConditions: [{
      type: String,
      enum: ['asma', 'bronquite', 'doenca_cardiaca', 'diabetes', 'hipertensao', 'outros']
    }],
    location: {
      city: String,
      state: String,
      country: { type: String, default: 'Brasil' },
      coordinates: {
        lat: Number,
        lng: Number
      }
    },
    preferences: {
      notifications: {
        type: Boolean,
        default: true
      },
      alertThreshold: {
        type: String,
        enum: ['baixo', 'moderado', 'alto'],
        default: 'moderado'
      },
      activities: [{
        type: String,
        enum: ['corrida', 'caminhada', 'ciclismo', 'esportes_outdoor', 'jardinagem']
      }]
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware para hash da senha antes de salvar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Middleware para atualizar updatedAt
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Método para comparar senhas
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Método para obter perfil público
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Método para determinar nível de risco baseado no perfil
userSchema.methods.getRiskLevel = function() {
  const { age, riskGroup, healthConditions } = this.profile;
  
  let riskScore = 0;
  
  // Pontuação por idade
  if (age < 12 || age > 65) riskScore += 2;
  else if (age < 18 || age > 55) riskScore += 1;
  
  // Pontuação por grupo de risco
  switch (riskGroup) {
    case 'criancas':
    case 'idosos':
    case 'asmaticos':
      riskScore += 3;
      break;
    case 'atletas':
      riskScore += 1;
      break;
  }
  
  // Pontuação por condições de saúde
  if (healthConditions && healthConditions.length > 0) {
    riskScore += healthConditions.length;
  }
  
  // Determinar nível de risco
  if (riskScore >= 4) return 'alto';
  if (riskScore >= 2) return 'moderado';
  return 'baixo';
};

module.exports = mongoose.model('User', userSchema);