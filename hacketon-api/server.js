import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// Importar configurações
import { connectDB } from './src/config/database.js';
import { errorHandler } from './src/middleware/errorHandler.js';
import { specs, swaggerUi, swaggerUiOptions } from './src/config/swagger.js';

// Importar rotas
// import authRoutes from './src/routes/auth.js';
// import airQualityRoutes from './src/routes/airQuality.js';
// import userRoutes from './src/routes/user.js';
// import alertRoutes from './src/routes/alerts.js';
// import stationRoutes from './src/routes/stations.js';
import nasaEarthdataRoutes from './src/routes/nasaEarthdataRoutes.js';
import tempoRoutes from './src/routes/tempoRoutes.js';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Conectar ao banco de dados
connectDB();

// Middleware de segurança
app.use(helmet());

// Configurar CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // máximo 100 requests por janela
  message: {
    error: 'Muitas requisições deste IP, tente novamente em alguns minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Middleware de logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Middleware para parsing de JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Air Sentinel API está funcionando',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Documentação da API com Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerUiOptions));

// Rota para acessar a especificação OpenAPI em JSON
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});

// Rotas da API
// Configurar rotas
// app.use('/api/auth', authRoutes);
// app.use('/api/air-quality', airQualityRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/alerts', alertRoutes);
// app.use('/api/stations', stationRoutes);
app.use('/api/nasa-earthdata', nasaEarthdataRoutes);
app.use('/api/tempo', tempoRoutes);

// Middleware de tratamento de erros
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV}`);
  console.log(`📊 API disponível em: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (err, promise) => {
  console.log('❌ Erro não tratado:', err.message);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.log('❌ Exceção não capturada:', err.message);
  process.exit(1);
});

export default app;