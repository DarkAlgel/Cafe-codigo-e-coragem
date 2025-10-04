const express = require('express');
const router = express.Router();

// Cache simples para health check
let healthCache = {
  lastCheck: null,
  status: null,
  details: null
};

const CACHE_DURATION = 30000; // 30 segundos

// Health check básico
router.get('/', async (req, res) => {
  try {
    const now = Date.now();
    
    // Verifica se o cache ainda é válido
    if (healthCache.lastCheck && (now - healthCache.lastCheck) < CACHE_DURATION) {
      return res.json(healthCache.status);
    }

    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024)
      },
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      services: {
        api: 'operational',
        co2_endpoint: 'operational'
      }
    };

    // Atualiza o cache
    healthCache = {
      lastCheck: now,
      status: healthStatus,
      details: null
    };

    res.json(healthStatus);
  } catch (error) {
    console.error('Erro no health check:', error);
    
    const errorStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      services: {
        api: 'degraded',
        co2_endpoint: 'unknown'
      }
    };

    res.status(503).json(errorStatus);
  }
});

// Health check detalhado
router.get('/detailed', async (req, res) => {
  try {
    const detailedHealth = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      system: {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        pid: process.pid
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024),
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        port: process.env.PORT || 3001,
        corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000'
      },
      services: {
        api: {
          status: 'operational',
          description: 'API principal funcionando normalmente'
        },
        co2_endpoint: {
          status: 'operational',
          description: 'Endpoint de CO2 disponível'
        }
      },
      endpoints: [
        { path: '/api/health', method: 'GET', status: 'active' },
        { path: '/api/co2_data', method: 'GET', status: 'active' }
      ]
    };

    res.json(detailedHealth);
  } catch (error) {
    console.error('Erro no health check detalhado:', error);
    
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

module.exports = router;