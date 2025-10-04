import nasaEarthdataService from '../services/nasaEarthdataService.js';
import { validationResult } from 'express-validator';

/**
 * Controlador para endpoints da NASA Earthdata API
 */
class NASAEarthdataController {
  
  /**
   * Busca dados M2IMNPASM por coordenadas e período
   * GET /api/nasa-earthdata/m2imnpasm
   */
  async getM2IMNPASMData(req, res) {
    try {
      // Validação dos parâmetros
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Parâmetros inválidos',
          errors: errors.array()
        });
      }

      const {
        latitude,
        longitude,
        startDate,
        endDate,
        variables
      } = req.query;

      // Validações adicionais
      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: 'Latitude e longitude são obrigatórias'
        });
      }

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Data de início e fim são obrigatórias'
        });
      }

      // Converte strings para números
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);

      // Validação de range
      if (lat < -90 || lat > 90) {
        return res.status(400).json({
          success: false,
          message: 'Latitude deve estar entre -90 e 90 graus'
        });
      }

      if (lon < -180 || lon > 180) {
        return res.status(400).json({
          success: false,
          message: 'Longitude deve estar entre -180 e 180 graus'
        });
      }

      // Processa variáveis se fornecidas
      let variablesList = ['PS', 'QV2M', 'T2M', 'U10M', 'V10M']; // Padrão
      if (variables) {
        variablesList = variables.split(',').map(v => v.trim().toUpperCase());
      }

      const params = {
        latitude: lat,
        longitude: lon,
        startDate,
        endDate,
        variables: variablesList
      };

      const result = await nasaEarthdataService.getM2IMNPASMData(params);

      res.json({
        success: true,
        message: 'Dados M2IMNPASM obtidos com sucesso',
        data: result.data,
        metadata: result.metadata,
        request_params: params,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Erro no controlador M2IMNPASM:', error.message);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Erro na consulta de dados'
      });
    }
  }

  /**
   * Lista produtos disponíveis no catálogo NASA
   * GET /api/nasa-earthdata/products
   */
  async getAvailableProducts(req, res) {
    try {
      const { search, limit = 50 } = req.query;

      const products = await nasaEarthdataService.getAvailableProducts(search);

      // Aplica limite se especificado
      const limitedProducts = products.slice(0, parseInt(limit));

      res.json({
        success: true,
        message: `${limitedProducts.length} produtos encontrados`,
        data: limitedProducts,
        total_found: products.length,
        limit: parseInt(limit),
        search_term: search || 'all',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Erro ao buscar produtos:', error.message);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar produtos disponíveis',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Erro na consulta'
      });
    }
  }

  /**
   * Obtém informações detalhadas de um produto específico
   * GET /api/nasa-earthdata/products/:conceptId
   */
  async getProductInfo(req, res) {
    try {
      const { conceptId } = req.params;

      if (!conceptId) {
        return res.status(400).json({
          success: false,
          message: 'Concept ID é obrigatório'
        });
      }

      const productInfo = await nasaEarthdataService.getProductInfo(conceptId);

      res.json({
        success: true,
        message: 'Informações do produto obtidas com sucesso',
        data: productInfo,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Erro ao buscar informações do produto:', error.message);
      
      if (error.message.includes('não encontrado')) {
        return res.status(404).json({
          success: false,
          message: 'Produto não encontrado',
          concept_id: req.params.conceptId
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erro ao buscar informações do produto',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Erro na consulta'
      });
    }
  }

  /**
   * Verifica status da conexão com NASA Earthdata
   * GET /api/nasa-earthdata/health
   */
  async healthCheck(req, res) {
    try {
      const healthStatus = await nasaEarthdataService.healthCheck();

      const statusCode = healthStatus.status === 'healthy' ? 200 : 503;

      res.status(statusCode).json({
        success: healthStatus.status === 'healthy',
        message: `NASA Earthdata API está ${healthStatus.status}`,
        data: healthStatus,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Erro no health check:', error.message);
      res.status(503).json({
        success: false,
        message: 'Erro ao verificar status da NASA Earthdata API',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Obtém informações sobre variáveis disponíveis no M2IMNPASM
   * GET /api/nasa-earthdata/m2imnpasm/variables
   */
  async getM2IMNPASMVariables(req, res) {
    try {
      const variables = {
        atmospheric_pressure: {
          PS: {
            name: 'Surface Pressure',
            description: 'Pressão atmosférica na superfície',
            units: 'Pa',
            typical_range: '98000-102000'
          }
        },
        temperature: {
          T2M: {
            name: '2-meter Temperature',
            description: 'Temperatura do ar a 2 metros de altura',
            units: 'K',
            typical_range: '200-320'
          }
        },
        humidity: {
          QV2M: {
            name: '2-meter Specific Humidity',
            description: 'Umidade específica a 2 metros de altura',
            units: 'kg/kg',
            typical_range: '0-0.03'
          },
          RH2M: {
            name: '2-meter Relative Humidity',
            description: 'Umidade relativa a 2 metros de altura',
            units: '%',
            typical_range: '0-100'
          }
        },
        wind: {
          U10M: {
            name: '10-meter U Wind Component',
            description: 'Componente U (leste-oeste) do vento a 10 metros',
            units: 'm/s',
            typical_range: '-50 to 50'
          },
          V10M: {
            name: '10-meter V Wind Component',
            description: 'Componente V (norte-sul) do vento a 10 metros',
            units: 'm/s',
            typical_range: '-50 to 50'
          }
        },
        precipitation: {
          PRECTOTCORR: {
            name: 'Corrected Total Precipitation',
            description: 'Precipitação total corrigida',
            units: 'mm/h',
            typical_range: '0-50'
          }
        },
        radiation: {
          SWGDN: {
            name: 'Surface Incoming Shortwave Flux',
            description: 'Fluxo de radiação solar de onda curta incidente na superfície',
            units: 'W/m²',
            typical_range: '0-1200'
          },
          LWGAB: {
            name: 'Surface Absorbed Longwave Radiation',
            description: 'Radiação de onda longa absorvida pela superfície',
            units: 'W/m²',
            typical_range: '100-500'
          }
        }
      };

      res.json({
        success: true,
        message: 'Variáveis M2IMNPASM disponíveis',
        data: {
          dataset: 'M2IMNPASM',
          full_name: 'MERRA-2 Instantaneous 3-Hourly Single-Level Assimilation',
          version: '5.12.4',
          spatial_resolution: '0.5° x 0.625°',
          temporal_resolution: '3-hourly',
          variables: variables,
          total_variables: Object.keys(variables).reduce((acc, category) => 
            acc + Object.keys(variables[category]).length, 0
          )
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Erro ao buscar variáveis M2IMNPASM:', error.message);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar variáveis disponíveis',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Erro interno'
      });
    }
  }

  /**
   * Obtém estatísticas de uso da API
   * GET /api/nasa-earthdata/stats
   */
  async getUsageStats(req, res) {
    try {
      // Em uma implementação real, essas estatísticas viriam de um banco de dados
      const stats = {
        total_requests: Math.floor(Math.random() * 10000) + 1000,
        successful_requests: Math.floor(Math.random() * 9000) + 900,
        failed_requests: Math.floor(Math.random() * 100) + 10,
        average_response_time: Math.floor(Math.random() * 2000) + 500,
        most_requested_dataset: 'M2IMNPASM',
        most_requested_variables: ['T2M', 'PS', 'QV2M', 'U10M', 'V10M'],
        geographic_coverage: {
          most_requested_regions: [
            { region: 'América do Sul', requests: 3245 },
            { region: 'América do Norte', requests: 2876 },
            { region: 'Europa', requests: 1987 },
            { region: 'Ásia', requests: 1654 },
            { region: 'África', requests: 987 }
          ]
        },
        temporal_coverage: {
          most_requested_period: 'Últimos 30 dias',
          average_time_range: '7 dias'
        }
      };

      res.json({
        success: true,
        message: 'Estatísticas de uso da NASA Earthdata API',
        data: stats,
        period: 'Últimos 30 dias',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error.message);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar estatísticas de uso',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Erro interno'
      });
    }
  }
}

export default new NASAEarthdataController();