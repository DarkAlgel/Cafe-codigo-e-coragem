import express from 'express';
import rateLimit from 'express-rate-limit';
import tempoController from '../controllers/tempoController.js';

const router = express.Router();

// Rate limiting mais permissivo para desenvolvimento
const tempoRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 100, // máximo 100 requests por minuto por IP
  message: {
    success: false,
    message: 'Muitas requisições para dados TEMPO. Tente novamente em 1 minuto.',
    limit: '100 requests per 1 minute',
    retry_after: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting mais permissivo para busca de dados NO2
const no2DataRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 50, // máximo 50 requests por minuto por IP
  message: {
    success: false,
    message: 'Limite de requisições para dados NO2 excedido. Tente novamente em 1 minuto.',
    limit: '50 requests per 1 minute',
    retry_after: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @swagger
 * components:
 *   schemas:
 *     TempoNO2Data:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indica se a requisição foi bem-sucedida
 *         message:
 *           type: string
 *           description: Mensagem descritiva do resultado
 *         parameters:
 *           type: object
 *           properties:
 *             latitude:
 *               type: number
 *               description: Latitude da localização
 *             longitude:
 *               type: number
 *               description: Longitude da localização
 *             start_date:
 *               type: string
 *               format: date
 *               description: Data de início da busca
 *             end_date:
 *               type: string
 *               format: date
 *               description: Data de fim da busca
 *         data:
 *           type: object
 *           properties:
 *             location:
 *               type: object
 *               properties:
 *                 latitude:
 *                   type: number
 *                 longitude:
 *                   type: number
 *                 description:
 *                   type: string
 *             dataset:
 *               type: object
 *               properties:
 *                 short_name:
 *                   type: string
 *                 full_name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 spatial_resolution:
 *                   type: string
 *                 temporal_resolution:
 *                   type: string
 *                 units:
 *                   type: string
 *             granules:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   time_start:
 *                     type: string
 *                     format: date-time
 *                   time_end:
 *                     type: string
 *                     format: date-time
 *                   no2_data:
 *                     type: object
 *                     properties:
 *                       nitrogendioxide_tropospheric_column:
 *                         type: object
 *                         properties:
 *                           value:
 *                             type: number
 *                             description: Valor da coluna troposférica de NO2
 *                           units:
 *                             type: string
 *                             example: "molecules/cm²"
 *                           quality_flag:
 *                             type: string
 *                             enum: [good, fair, poor]
 *             summary:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                 mean:
 *                   type: number
 *                 min:
 *                   type: number
 *                 max:
 *                   type: number
 *                 std:
 *                   type: number
 *                 units:
 *                   type: string
 *     
 *     TempoHealthCheck:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         service:
 *           type: string
 *         status:
 *           type: string
 *           enum: [healthy, unhealthy, error]
 *         message:
 *           type: string
 *         dataset:
 *           type: string
 *         last_check:
 *           type: string
 *           format: date-time
 *         timestamp:
 *           type: string
 *           format: date-time
 *
 *     TempoDatasetInfo:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         dataset:
 *           type: object
 *           properties:
 *             short_name:
 *               type: string
 *             full_name:
 *               type: string
 *             description:
 *               type: string
 *             platform:
 *               type: string
 *             instrument:
 *               type: string
 *             processing_level:
 *               type: string
 *             version:
 *               type: string
 *             spatial_coverage:
 *               type: string
 *             spatial_resolution:
 *               type: string
 *             temporal_coverage:
 *               type: string
 *             temporal_resolution:
 *               type: string
 *             data_format:
 *               type: string
 *             data_latency:
 *               type: string
 *         variables:
 *           type: object
 *         usage_notes:
 *           type: array
 *           items:
 *             type: string
 *         citation:
 *           type: string
 */

/**
 * @swagger
 * /api/tempo/health:
 *   get:
 *     summary: Verifica a saúde do serviço TEMPO NO2
 *     description: Endpoint para verificar se o serviço TEMPO está funcionando corretamente e consegue se comunicar com a NASA Earthdata
 *     tags: [TEMPO NO2]
 *     responses:
 *       200:
 *         description: Serviço funcionando corretamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TempoHealthCheck'
 *             example:
 *               success: true
 *               service: "TEMPO NO2 Service"
 *               status: "healthy"
 *               message: "Serviço TEMPO funcionando corretamente"
 *               dataset: "TEMPO_L3_NO2_NRT_V02"
 *               last_check: "2024-01-15T10:30:00.000Z"
 *               timestamp: "2024-01-15T10:30:00.000Z"
 *       503:
 *         description: Serviço indisponível
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TempoHealthCheck'
 *             example:
 *               success: false
 *               service: "TEMPO NO2 Service"
 *               status: "unhealthy"
 *               message: "Falha na autenticação com NASA Earthdata"
 *               error: "Invalid credentials"
 *               timestamp: "2024-01-15T10:30:00.000Z"
 */
router.get('/health', tempoController.healthCheck);

/**
 * @swagger
 * /api/tempo/no2:
 *   get:
 *     summary: Obtém dados de NO2 troposférico do TEMPO para uma localização
 *     description: |
 *       Busca dados de dióxido de nitrogênio troposférico do satélite TEMPO da NASA para coordenadas específicas.
 *       
 *       **Cobertura**: América do Norte (15°N a 70°N, 140°W a 40°W)
 *       
 *       **Resolução**: 2.1 km x 4.4 km
 *       
 *       **Frequência**: Horária durante o dia
 *       
 *       **Latência**: Near Real Time (< 1 hora)
 *     tags: [TEMPO NO2]
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *           minimum: -90
 *           maximum: 90
 *         description: Latitude da localização (-90 a 90)
 *         example: 40.7128
 *       - in: query
 *         name: lon
 *         required: true
 *         schema:
 *           type: number
 *           minimum: -180
 *           maximum: 180
 *         description: Longitude da localização (-180 a 180)
 *         example: -74.0060
 *       - in: query
 *         name: start_date
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de início (YYYY-MM-DD). Padrão: 7 dias atrás
 *         example: "2024-01-01"
 *       - in: query
 *         name: end_date
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de fim (YYYY-MM-DD). Padrão: hoje
 *         example: "2024-01-02"
 *     responses:
 *       200:
 *         description: Dados de NO2 obtidos com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TempoNO2Data'
 *             example:
 *               success: true
 *               message: "Dados TEMPO NO2 obtidos com sucesso"
 *               parameters:
 *                 latitude: 40.7128
 *                 longitude: -74.0060
 *                 start_date: "2024-01-01"
 *                 end_date: "2024-01-02"
 *                 interval_days: 1
 *               data:
 *                 location:
 *                   latitude: 40.7128
 *                   longitude: -74.0060
 *                   description: "Próximo a Nova York"
 *                 dataset:
 *                   short_name: "TEMPO_L3_NO2_NRT_V02"
 *                   full_name: "TEMPO Level 3 Nitrogen Dioxide (NO2) Near Real Time"
 *                   spatial_resolution: "2.1 km x 4.4 km"
 *                   temporal_resolution: "Hourly during daylight"
 *                   units: "molecules/cm²"
 *                 granules:
 *                   - id: "TEMPO_L3_NO2_NRT_V02_20240101T120000Z"
 *                     no2_data:
 *                       nitrogendioxide_tropospheric_column:
 *                         value: 1.5e15
 *                         units: "molecules/cm²"
 *                         quality_flag: "good"
 *                 summary:
 *                   count: 5
 *                   mean: 1.45e15
 *                   min: 1.2e15
 *                   max: 1.8e15
 *                   units: "molecules/cm²"
 *       400:
 *         description: Parâmetros inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Parâmetros lat (latitude) e lon (longitude) são obrigatórios"
 *       404:
 *         description: Nenhum dado encontrado para os parâmetros especificados
 *       429:
 *         description: Limite de requisições excedido
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/no2', no2DataRateLimit, tempoController.getNO2Data);

/**
 * @swagger
 * /api/tempo/dataset-info:
 *   get:
 *     summary: Obtém informações detalhadas sobre o dataset TEMPO NO2
 *     description: |
 *       Retorna informações completas sobre o dataset TEMPO Level 3 NO2 Near Real Time,
 *       incluindo descrição, variáveis, cobertura espacial e temporal, e notas de uso.
 *     tags: [TEMPO NO2]
 *     responses:
 *       200:
 *         description: Informações do dataset obtidas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TempoDatasetInfo'
 *             example:
 *               success: true
 *               message: "Informações do dataset TEMPO NO2 obtidas com sucesso"
 *               dataset:
 *                 short_name: "TEMPO_L3_NO2_NRT_V02"
 *                 full_name: "TEMPO Level 3 Nitrogen Dioxide (NO2) Near Real Time"
 *                 description: "O TEMPO é um instrumento de monitoramento da poluição atmosférica..."
 *                 platform: "TEMPO"
 *                 processing_level: "Level 3"
 *                 spatial_coverage: "América do Norte"
 *                 spatial_resolution: "2.1 km x 4.4 km"
 *                 temporal_resolution: "Hourly"
 *                 data_format: "NetCDF-4"
 *               variables:
 *                 primary:
 *                   name: "nitrogendioxide_tropospheric_column"
 *                   units: "molecules/cm²"
 *               usage_notes:
 *                 - "Dados disponíveis apenas durante o dia"
 *                 - "Qualidade dos dados pode ser afetada por cobertura de nuvens"
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/dataset-info', tempoRateLimit, tempoController.getDatasetInfo);

/**
 * @swagger
 * /api/tempo/example:
 *   get:
 *     summary: Obtém dados de exemplo TEMPO NO2 para Nova York
 *     description: |
 *       Retorna dados de exemplo do TEMPO NO2 para as coordenadas de Nova York.
 *       Útil para testar a API e entender o formato dos dados retornados.
 *     tags: [TEMPO NO2]
 *     responses:
 *       200:
 *         description: Dados de exemplo obtidos com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/TempoNO2Data'
 *                 - type: object
 *                   properties:
 *                     example_location:
 *                       type: string
 *                       example: "Nova York, NY, USA"
 *                     note:
 *                       type: string
 *                       example: "Este é um exemplo usando coordenadas de Nova York"
 *                     usage_example:
 *                       type: object
 *                       properties:
 *                         endpoint:
 *                           type: string
 *                         method:
 *                           type: string
 *                         parameters:
 *                           type: object
 *                         example_url:
 *                           type: string
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/example', tempoRateLimit, tempoController.getExampleData);

/**
 * @swagger
 * /api/tempo/example-locations:
 *   get:
 *     summary: Lista localizações de exemplo para testes
 *     description: |
 *       Retorna uma lista de localizações na América do Norte com suas coordenadas,
 *       úteis para testar a API TEMPO NO2. Inclui cidades com diferentes níveis
 *       esperados de poluição por NO2.
 *     tags: [TEMPO NO2]
 *     responses:
 *       200:
 *         description: Lista de localizações obtida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Localizações de exemplo para testes com dados TEMPO NO2"
 *                 locations:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                         example: "Nova York, NY"
 *                       country:
 *                         type: string
 *                         example: "Estados Unidos"
 *                       latitude:
 *                         type: number
 *                         example: 40.7128
 *                       longitude:
 *                         type: number
 *                         example: -74.0060
 *                       description:
 *                         type: string
 *                         example: "Área metropolitana com alta densidade de tráfego"
 *                       expected_no2:
 *                         type: string
 *                         example: "Alto (área urbana densa)"
 *                 coverage_area:
 *                   type: object
 *                   properties:
 *                     description:
 *                       type: string
 *                     latitude_range:
 *                       type: string
 *                     longitude_range:
 *                       type: string
 *                 example_requests:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       location:
 *                         type: string
 *                       url:
 *                         type: string
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/example-locations', tempoRateLimit, tempoController.getExampleLocations);

// Aplicar rate limiting geral para todas as rotas TEMPO
router.use(tempoRateLimit);

export default router;