const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Usuários pré-cadastrados para demonstração
const preRegisteredUsers = [
  {
    username: 'admin',
    email: 'admin@airsentinel.com',
    password: 'admin123',
    profile: {
      name: 'Administrador',
      age: 35,
      riskGroup: 'normal',
      location: {
        city: 'São Paulo',
        state: 'SP',
        coordinates: { lat: -23.5505, lng: -46.6333 }
      }
    }
  },
  {
    username: 'joao_atleta',
    email: 'joao@email.com',
    password: 'joao123',
    profile: {
      name: 'João Silva',
      age: 28,
      riskGroup: 'atletas',
      healthConditions: [],
      location: {
        city: 'Rio de Janeiro',
        state: 'RJ',
        coordinates: { lat: -22.9068, lng: -43.1729 }
      },
      preferences: {
        activities: ['corrida', 'ciclismo'],
        alertThreshold: 'baixo'
      }
    }
  },
  {
    username: 'maria_asma',
    email: 'maria@email.com',
    password: 'maria123',
    profile: {
      name: 'Maria Santos',
      age: 45,
      riskGroup: 'asmaticos',
      healthConditions: ['asma', 'bronquite'],
      location: {
        city: 'Belo Horizonte',
        state: 'MG',
        coordinates: { lat: -19.9167, lng: -43.9345 }
      },
      preferences: {
        activities: ['caminhada'],
        alertThreshold: 'alto'
      }
    }
  },
  {
    username: 'ana_crianca',
    email: 'ana@email.com',
    password: 'ana123',
    profile: {
      name: 'Ana Costa (Responsável)',
      age: 35,
      riskGroup: 'criancas',
      healthConditions: [],
      location: {
        city: 'Porto Alegre',
        state: 'RS',
        coordinates: { lat: -30.0346, lng: -51.2177 }
      },
      preferences: {
        activities: ['jardinagem'],
        alertThreshold: 'moderado'
      }
    }
  },
  {
    username: 'carlos_idoso',
    email: 'carlos@email.com',
    password: 'carlos123',
    profile: {
      name: 'Carlos Oliveira',
      age: 72,
      riskGroup: 'idosos',
      healthConditions: ['hipertensao', 'diabetes'],
      location: {
        city: 'Salvador',
        state: 'BA',
        coordinates: { lat: -12.9714, lng: -38.5014 }
      },
      preferences: {
        activities: ['caminhada'],
        alertThreshold: 'alto'
      }
    }
  }
];

// Função para inicializar usuários pré-cadastrados
async function initializeUsers() {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🔄 Criando usuários pré-cadastrados...');
      
      for (const userData of preRegisteredUsers) {
        const existingUser = await User.findOne({ 
          $or: [
            { username: userData.username },
            { email: userData.email }
          ]
        });
        
        if (!existingUser) {
          const user = new User(userData);
          await user.save();
          console.log(`✅ Usuário criado: ${userData.username}`);
        }
      }
      
      console.log('✅ Usuários pré-cadastrados criados com sucesso!');
    }
  } catch (error) {
    console.error('❌ Erro ao criar usuários pré-cadastrados:', error);
  }
}

// Inicializar usuários quando o módulo for carregado
initializeUsers();

// Rota de login
router.post('/login', [
  body('username').notEmpty().withMessage('Username é obrigatório'),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Dados inválidos', 
        details: errors.array() 
      });
    }

    const { username, password } = req.body;

    // Buscar usuário por username ou email
    const user = await User.findOne({
      $or: [
        { username: username },
        { email: username }
      ]
    });

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Verificar senha
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Atualizar último login
    user.lastLogin = new Date();
    await user.save();

    // Gerar token JWT
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota de registro (para novos usuários)
router.post('/register', [
  body('username').isLength({ min: 3, max: 30 }).withMessage('Username deve ter entre 3 e 30 caracteres'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
  body('profile.name').notEmpty().withMessage('Nome é obrigatório')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Dados inválidos', 
        details: errors.array() 
      });
    }

    const { username, email, password, profile } = req.body;

    // Verificar se usuário já existe
    const existingUser = await User.findOne({
      $or: [
        { username: username },
        { email: email }
      ]
    });

    if (existingUser) {
      return res.status(409).json({ 
        error: 'Usuário já existe',
        field: existingUser.username === username ? 'username' : 'email'
      });
    }

    // Criar novo usuário
    const user = new User({
      username,
      email,
      password,
      profile: {
        ...profile,
        riskGroup: profile.riskGroup || 'normal'
      }
    });

    await user.save();

    // Gerar token JWT
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      token,
      user: user.getPublicProfile()
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para verificar token
router.get('/verify', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({
      valid: true,
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Erro na verificação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para listar usuários pré-cadastrados (para demonstração)
router.get('/demo-users', (req, res) => {
  const demoUsers = preRegisteredUsers.map(user => ({
    username: user.username,
    email: user.email,
    name: user.profile.name,
    riskGroup: user.profile.riskGroup,
    location: user.profile.location.city
  }));

  res.json({
    message: 'Usuários de demonstração disponíveis',
    users: demoUsers,
    note: 'Use username/email e senha para fazer login'
  });
});

// Rota de logout (invalidar token no frontend)
router.post('/logout', auth, (req, res) => {
  res.json({ message: 'Logout realizado com sucesso' });
});

module.exports = router;