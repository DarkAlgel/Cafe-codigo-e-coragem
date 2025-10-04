import tempoService from '../services/tempoService.js';

/**
 * Controller para endpoints relacionados aos dados TEMPO NO2
 * Implementa a funcionalidade descrita no arquivo dados2.txt
 */
class TempoController {
  
  /**
   * Health check específico para o serviço TEMPO
   * GET /api/tempo/health
   */
  async healthCheck(req, res) {
    try {
      const health = await tempoService.healthCheck();
      
      const statusCode = health.status === 'healthy' ? 200 : 503;
      
      res.status(statusCode).json({
        success: health.status === 'healthy',
        service: 'TEMPO NO2 Service',
        ...health,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        service: 'TEMPO NO2 Service',
        status: 'error',
        message: 'Erro interno no health check',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Obtém dados TEMPO NO2 para uma localização específica
   * GET /api/tempo/no2
   * Query params: lat, lon, start_date, end_date
   */
  async getNO2Data(req, res) {
    try {
      const { lat, lon, start_date, end_date } = req.query;

      // Validação dos parâmetros obrigatórios
      if (!lat || !lon) {
        return res.status(400).json({
          success: false,
          message: 'Parâmetros lat (latitude) e lon (longitude) são obrigatórios',
          example: '/api/tempo/no2?lat=40.7128&lon=-74.0060&start_date=2024-01-01&end_date=2024-01-02'
        });
      }

      // Validação de latitude
      const latitude = parseFloat(lat);
      if (isNaN(latitude) || latitude < -90 || latitude > 90) {
        return res.status(400).json({
          success: false,
          message: 'Latitude deve ser um número entre -90 e 90',
          provided: lat
        });
      }

      // Validação de longitude
      const longitude = parseFloat(lon);
      if (isNaN(longitude) || longitude < -180 || longitude > 180) {
        return res.status(400).json({
          success: false,
          message: 'Longitude deve ser um número entre -180 e 180',
          provided: lon
        });
      }

      // Validação de datas (opcional, usa padrões se não fornecidas)
      let startDate = start_date;
      let endDate = end_date;

      if (!startDate) {
        // Padrão: últimos 7 dias
        const date = new Date();
        date.setDate(date.getDate() - 7);
        startDate = date.toISOString().split('T')[0];
      }

      if (!endDate) {
        // Padrão: hoje
        endDate = new Date().toISOString().split('T')[0];
      }

      // Validação do formato de data
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
        return res.status(400).json({
          success: false,
          message: 'Datas devem estar no formato YYYY-MM-DD',
          provided: { start_date: startDate, end_date: endDate }
        });
      }

      // Validação de intervalo de datas
      const start = new Date(startDate);
      const end = new Date(endDate);
      const now = new Date();

      if (start > end) {
        return res.status(400).json({
          success: false,
          message: 'Data de início deve ser anterior à data de fim',
          provided: { start_date: startDate, end_date: endDate }
        });
      }

      if (end > now) {
        return res.status(400).json({
          success: false,
          message: 'Data de fim não pode ser no futuro',
          provided: { end_date: endDate, current_date: now.toISOString().split('T')[0] }
        });
      }

      // Limita o intervalo máximo a 30 dias
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 30) {
        return res.status(400).json({
          success: false,
          message: 'Intervalo máximo permitido é de 30 dias',
          provided_interval: `${diffDays} dias`,
          max_allowed: '30 dias'
        });
      }

      // Busca os dados TEMPO NO2
      const result = await tempoService.getTEMPONO2Data(latitude, longitude, startDate, endDate);

      if (!result.success) {
        return res.status(404).json({
          success: false,
          message: result.message,
          parameters: {
            latitude,
            longitude,
            start_date: startDate,
            end_date: endDate
          }
        });
      }

      res.json({
        success: true,
        message: result.message,
        parameters: {
          latitude,
          longitude,
          start_date: startDate,
          end_date: endDate,
          interval_days: diffDays
        },
        data: result.data,
        metadata: {
          request_time: new Date().toISOString(),
          data_source: 'NASA TEMPO',
          processing_level: 'L3',
          version: 'V02'
        }
      });

    } catch (error) {
      console.error('Erro no controller TEMPO NO2:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor ao buscar dados TEMPO NO2',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Obtém informações sobre o dataset TEMPO NO2
   * GET /api/tempo/dataset-info
   */
  async getDatasetInfo(req, res) {
    try {
      const info = tempoService.getDatasetInfo();
      
      res.json({
        success: true,
        message: 'Informações do dataset TEMPO NO2 obtidas com sucesso',
        ...info,
        metadata: {
          request_time: new Date().toISOString(),
          api_version: '1.0.0'
        }
      });
    } catch (error) {
      console.error('Erro ao obter informações do dataset:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno ao obter informações do dataset',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Obtém dados de exemplo para demonstração
   * GET /api/tempo/example
   */
  async getExampleData(req, res) {
    try {
      // Coordenadas de exemplo (Nova York)
      const latitude = 40.7128;
      const longitude = -74.0060;
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const result = await tempoService.getTEMPONO2Data(latitude, longitude, startDate, endDate);

      res.json({
        success: true,
        message: 'Dados de exemplo TEMPO NO2 para Nova York',
        example_location: 'Nova York, NY, USA',
        parameters: {
          latitude,
          longitude,
          start_date: startDate,
          end_date: endDate
        },
        data: result.success ? result.data : null,
        note: 'Este é um exemplo usando coordenadas de Nova York. Use /api/tempo/no2 com suas próprias coordenadas.',
        usage_example: {
          endpoint: '/api/tempo/no2',
          method: 'GET',
          parameters: {
            lat: 'latitude (obrigatório)',
            lon: 'longitude (obrigatório)', 
            start_date: 'YYYY-MM-DD (opcional, padrão: 7 dias atrás)',
            end_date: 'YYYY-MM-DD (opcional, padrão: hoje)'
          },
          example_url: '/api/tempo/no2?lat=40.7128&lon=-74.0060&start_date=2024-01-01&end_date=2024-01-02'
        },
        metadata: {
          request_time: new Date().toISOString(),
          data_source: 'NASA TEMPO',
          processing_level: 'L3'
        }
      });

    } catch (error) {
      console.error('Erro ao gerar dados de exemplo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno ao gerar dados de exemplo',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Lista localizações de exemplo para testes
   * GET /api/tempo/example-locations
   */
  async getExampleLocations(req, res) {
    try {
      const locations = [
        {
          name: 'Nova York, NY',
          country: 'Estados Unidos',
          latitude: 40.7128,
          longitude: -74.0060,
          description: 'Área metropolitana com alta densidade de tráfego',
          expected_no2: 'Alto (área urbana densa)'
        },
        {
          name: 'São Paulo, SP',
          country: 'Brasil',
          latitude: -23.5505,
          longitude: -46.6333,
          description: 'Maior metrópole da América do Sul',
          expected_no2: 'Alto (megacidade)'
        },
        {
          name: 'Los Angeles, CA',
          country: 'Estados Unidos',
          latitude: 34.0522,
          longitude: -118.2437,
          description: 'Conhecida por problemas de qualidade do ar',
          expected_no2: 'Alto (poluição urbana)'
        },
        {
          name: 'Denver, CO',
          country: 'Estados Unidos',
          latitude: 39.7392,
          longitude: -104.9903,
          description: 'Cidade em alta altitude',
          expected_no2: 'Moderado (altitude elevada)'
        },
        {
          name: 'Miami, FL',
          country: 'Estados Unidos',
          latitude: 25.7617,
          longitude: -80.1918,
          description: 'Cidade costeira com brisa marinha',
          expected_no2: 'Moderado (efeito oceânico)'
        },
        {
          name: 'Yellowstone National Park',
          country: 'Estados Unidos',
          latitude: 44.4280,
          longitude: -110.5885,
          description: 'Área natural protegida',
          expected_no2: 'Baixo (área rural/natural)'
        }
      ];

      res.json({
        success: true,
        message: 'Localizações de exemplo para testes com dados TEMPO NO2',
        locations: locations,
        usage_note: 'Use estas coordenadas com o endpoint /api/tempo/no2 para obter dados reais',
        coverage_area: {
          description: 'TEMPO cobre a América do Norte',
          latitude_range: '15°N a 70°N',
          longitude_range: '140°W a 40°W',
          note: 'Dados disponíveis apenas durante o dia'
        },
        example_requests: locations.slice(0, 3).map(loc => ({
          location: loc.name,
          url: `/api/tempo/no2?lat=${loc.latitude}&lon=${loc.longitude}&start_date=2024-01-01&end_date=2024-01-02`
        })),
        metadata: {
          request_time: new Date().toISOString(),
          total_locations: locations.length
        }
      });

    } catch (error) {
      console.error('Erro ao listar localizações de exemplo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno ao listar localizações de exemplo',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

export default new TempoController();