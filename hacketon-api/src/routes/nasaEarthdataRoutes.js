import express from 'express';
import { body, query, param } from 'express-validator';
import nasaEarthdataController from '../controllers/nasaEarthdataController.js';
import { authenticateToken } from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting específico para NASA Earthdata API
const nasaApiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 100, // máximo 100 requests por hora por IP
  message: {
    success: false,
    message: 'Muitas requisições para NASA Earthdata API. Tente novamente em 1 hora.',
    retry_after: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Validações para coordenadas geográficas
const coordinateValidation = [
  query('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude deve ser um número entre -90 e 90'),
  query('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude deve ser um número entre -180 e 180')
];

// Validações para datas
const dateValidation = [
  query('startDate')
    .isISO8601()
    .withMessage('Data de início deve estar no formato ISO 8601 (YYYY-MM-DD)'),
  query('endDate')
    .isISO8601()
    .withMessage('Data de fim deve estar no formato ISO 8601 (YYYY-MM-DD)')
    .custom((endDate, { req }) => {
      if (new Date(endDate) <= new Date(req.query.startDate)) {
        throw new Error('Data de fim deve ser posterior à data de início');
      }
      return true;
    })
];

// Validação para variáveis M2IMNPASM
const variablesValidation = [
  query('variables')
    .optional()
    .custom((variables) => {
      if (variables) {
        const validVariables = [
          'PS', 'QV2M', 'T2M', 'U10M', 'V10M', 'RH2M', 
          'PRECTOTCORR', 'SWGDN', 'LWGAB'
        ];
        const requestedVars = variables.split(',').map(v => v.trim().toUpperCase());
        const invalidVars = requestedVars.filter(v => !validVariables.includes(v));
        
        if (invalidVars.length > 0) {
          throw new Error(`Variáveis inválidas: ${invalidVars.join(', ')}. Variáveis válidas: ${validVariables.join(', ')}`);
        }
      }
      return true;
    })
];

/**
 * @swagger
 * components:
 *   schemas:
 *     M2IMNPASMData:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID único do granule
 *         title:
 *           type: string
 *           description: Título do granule
 *         time_start:
 *           type: string
 *           format: date-time
 *           description: Início do período temporal
 *         time_end:
 *           type: string
 *           format: date-time
 *           description: Fim do período temporal
 *         atmospheric_data:
 *           type: object
 *           properties:
 *             timestamp:
 *               type: string
 *               format: date-time
 *             location:
 *               type: object
 *               properties:
 *                 latitude:
 *                   type: number
 *                 longitude:
 *                   type: number
 *             variables:
 *               type: object
 *               properties:
 *                 PS:
 *                   type: number
 *                   description: Pressão superficial (Pa)
 *                 T2M:
 *                   type: number
 *                   description: Temperatura a 2m (K)
 *                 QV2M:
 *                   type: number
 *                   description: Umidade específica a 2m (kg/kg)
 *                 U10M:
 *                   type: number
 *                   description: Componente U do vento a 10m (m/s)
 *                 V10M:
 *                   type: number
 *                   description: Componente V do vento a 10m (m/s)
 */

/**
 * @swagger
 * /api/nasa-earthdata/health:
 *   get:
 *     summary: Verifica status da conexão com NASA Earthdata
 *     tags: [NASA Earthdata]
 *     responses:
 *       200:
 *         description: Serviço funcionando normalmente
 *       503:
 *         description: Serviço indisponível
 */
router.get('/health', nasaEarthdataController.healthCheck);

/**
 * @swagger
 * /api/nasa-earthdata/m2imnpasm:
 *   get:
 *     summary: Busca dados M2IMNPASM (MERRA-2) por coordenadas e período
 *     tags: [NASA Earthdata]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *           minimum: -90
 *           maximum: 90
 *         description: Latitude em graus decimais
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *           minimum: -180
 *           maximum: 180
 *         description: Longitude em graus decimais
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de início (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de fim (YYYY-MM-DD)
 *       - in: query
 *         name: variables
 *         required: false
 *         schema:
 *           type: string
 *         description: Variáveis separadas por vírgula (PS,T2M,QV2M,U10M,V10M)
 *     responses:
 *       200:
 *         description: Dados obtidos com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/M2IMNPASMData'
 *       400:
 *         description: Parâmetros inválidos
 *       401:
 *         description: Token de autenticação necessário
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/m2imnpasm', 
  nasaApiLimiter,
  authenticateToken,
  coordinateValidation,
  dateValidation,
  variablesValidation,
  nasaEarthdataController.getM2IMNPASMData
);

/**
 * @swagger
 * /api/nasa-earthdata/m2imnpasm/variables:
 *   get:
 *     summary: Lista variáveis disponíveis no dataset M2IMNPASM
 *     tags: [NASA Earthdata]
 *     responses:
 *       200:
 *         description: Lista de variáveis disponíveis
 */
router.get('/m2imnpasm/variables', nasaEarthdataController.getM2IMNPASMVariables);

/**
 * @swagger
 * /api/nasa-earthdata/products:
 *   get:
 *     summary: Lista produtos disponíveis no catálogo NASA
 *     tags: [NASA Earthdata]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *         description: Termo de busca para filtrar produtos
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Número máximo de resultados
 *     responses:
 *       200:
 *         description: Lista de produtos disponíveis
 *       401:
 *         description: Token de autenticação necessário
 */
router.get('/products',
  nasaApiLimiter,
  authenticateToken,
  [
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit deve ser um número entre 1 e 100')
  ],
  nasaEarthdataController.getAvailableProducts
);

/**
 * @swagger
 * /api/nasa-earthdata/products/{conceptId}:
 *   get:
 *     summary: Obtém informações detalhadas de um produto específico
 *     tags: [NASA Earthdata]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conceptId
 *         required: true
 *         schema:
 *           type: string
 *         description: Concept ID do produto
 *     responses:
 *       200:
 *         description: Informações detalhadas do produto
 *       404:
 *         description: Produto não encontrado
 *       401:
 *         description: Token de autenticação necessário
 */
router.get('/products/:conceptId',
  nasaApiLimiter,
  authenticateToken,
  [
    param('conceptId')
      .notEmpty()
      .withMessage('Concept ID é obrigatório')
      .matches(/^C\d+-\w+$/)
      .withMessage('Concept ID deve ter o formato C{número}-{centro_dados}')
  ],
  nasaEarthdataController.getProductInfo
);

/**
 * @swagger
 * /api/nasa-earthdata/stats:
 *   get:
 *     summary: Obtém estatísticas de uso da API
 *     tags: [NASA Earthdata]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas de uso
 *       401:
 *         description: Token de autenticação necessário
 */
router.get('/stats',
  authenticateToken,
  nasaEarthdataController.getUsageStats
);

// Middleware de tratamento de erros específico para rotas NASA
router.use((error, req, res, next) => {
  console.error('Erro nas rotas NASA Earthdata:', error);
  
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'JSON inválido na requisição'
    });
  }
  
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      message: 'Arquivo muito grande'
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Erro na API NASA Earthdata'
  });
});

export default router;