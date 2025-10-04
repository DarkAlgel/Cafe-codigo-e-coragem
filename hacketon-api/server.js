const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const co2Routes = require('./routes/co2Routes');
const healthRoutes = require('./routes/healthRoutes');
const tempoRoutes = require('./routes/tempoRoutes');
const earthdataRoutes = require('./routes/earthdataRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares de segurança e logging
app.use(helmet());
app.use(morgan('combined'));

// Configuração do CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

// Middleware para parsing JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware para adicionar headers de resposta
app.use((req, res, next) => {
  res.header('X-API-Version', '1.0.0');
  res.header('X-Powered-By', 'Hacketon API');
  next();
});

// Rotas da API
app.use('/api/health', healthRoutes);
app.use('/api', co2Routes);
app.use('/api/tempo', tempoRoutes);
app.use('/api/earthdata', earthdataRoutes);

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: 'Hacketon API - Dados de CO2 e Qualidade do Ar',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      co2_data: '/api/co2_data'
    },
    documentation: 'https://github.com/hacketon-team/api-docs'
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint não encontrado',
    message: `A rota ${req.originalUrl} não existe nesta API`,
    availableEndpoints: [
      '/api/health',
      '/api/co2_data'
    ]
  });
});

// Middleware global de tratamento de erros
app.use((error, req, res, next) => {
  console.error('Erro na API:', error);
  
  res.status(error.status || 500).json({
    error: error.message || 'Erro interno do servidor',
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method
  });
});

// Inicialização do servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📡 API disponível em: http://localhost:${PORT}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Recebido SIGTERM, encerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Recebido SIGINT, encerrando servidor...');
  process.exit(0);
});

module.exports = app;