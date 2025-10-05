const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Obter token do header Authorization
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({ error: 'Token de acesso não fornecido' });
    }

    // Verificar formato do token (Bearer token)
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    if (!token) {
      return res.status(401).json({ error: 'Token de acesso inválido' });
    }

    // Verificar e decodificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    // Buscar usuário no banco de dados
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Conta desativada' });
    }

    // Adicionar informações do usuário à requisição
    req.user = {
      userId: user._id,
      username: user.username,
      email: user.email,
      profile: user.profile,
      riskLevel: user.getRiskLevel()
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }

    console.error('Erro no middleware de autenticação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Middleware opcional - não falha se não houver token
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      req.user = null;
      return next();
    }

    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (user && user.isActive) {
      req.user = {
        userId: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile,
        riskLevel: user.getRiskLevel()
      };
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    // Em caso de erro, continua sem usuário autenticado
    req.user = null;
    next();
  }
};

// Middleware para verificar permissões específicas
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Autenticação necessária' });
    }

    const userRole = req.user.profile.riskGroup || 'normal';
    
    if (roles.includes(userRole) || roles.includes('all')) {
      return next();
    }

    res.status(403).json({ error: 'Permissão insuficiente' });
  };
};

// Middleware para verificar se é admin
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Autenticação necessária' });
  }

  if (req.user.username !== 'admin') {
    return res.status(403).json({ error: 'Acesso restrito a administradores' });
  }

  next();
};

module.exports = {
  auth,
  optionalAuth,
  requireRole,
  requireAdmin
};