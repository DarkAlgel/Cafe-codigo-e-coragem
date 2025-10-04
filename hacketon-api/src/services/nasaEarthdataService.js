import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Serviço para integração com NASA Earthdata APIs
 * Suporta acesso aos dados MERRA-2 M2IMNPASM e outros datasets
 */
class NASAEarthdataService {
  constructor() {
    this.baseURL = 'https://urs.earthdata.nasa.gov';
    this.cmrURL = 'https://cmr.earthdata.nasa.gov';
    this.appearsURL = 'https://appeears.earthdatacloud.nasa.gov/api';
    this.gesdiscURL = 'https://goldsmr4.gesdisc.eosdis.nasa.gov';
    
    this.credentials = {
      username: process.env.NASA_EARTHDATA_USERNAME,
      password: process.env.NASA_EARTHDATA_PASSWORD
    };
    
    this.token = null;
    this.tokenExpiry = null;
    
    // Rate limiting
    this.requestCount = 0;
    this.requestWindow = Date.now();
    this.maxRequestsPerHour = 1000;
  }

  /**
   * Verifica e aplica rate limiting
   */
  checkRateLimit() {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    // Reset counter se passou uma hora
    if (now - this.requestWindow > oneHour) {
      this.requestCount = 0;
      this.requestWindow = now;
    }
    
    if (this.requestCount >= this.maxRequestsPerHour) {
      throw new Error('Rate limit exceeded. Maximum 1000 requests per hour.');
    }
    
    this.requestCount++;
  }

  /**
   * Autentica com NASA Earthdata Login e obtém token Bearer
   */
  async authenticate() {
    try {
      this.checkRateLimit();
      
      // Verifica se token ainda é válido
      if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
        return this.token;
      }

      const credentials = Buffer.from(
        `${this.credentials.username}:${this.credentials.password}`
      ).toString('base64');

      const response = await axios.post(
        `${this.baseURL}/api/users/token`,
        {},
        {
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/json'
          }
        }
      );

      this.token = response.data.access_token;
      
      // Token válido por 60 dias
      this.tokenExpiry = Date.now() + (60 * 24 * 60 * 60 * 1000);
      
      return this.token;
    } catch (error) {
      console.error('Erro na autenticação NASA Earthdata:', error.response?.data || error.message);
      throw new Error('Falha na autenticação com NASA Earthdata');
    }
  }

  /**
   * Busca dados M2IMNPASM (MERRA-2) por coordenadas e período
   */
  async getM2IMNPASMData(params) {
    try {
      await this.authenticate();
      this.checkRateLimit();

      const {
        latitude,
        longitude,
        startDate,
        endDate,
        variables = ['PS', 'QV2M', 'T2M', 'U10M', 'V10M'] // Variáveis padrão
      } = params;

      // Busca no Common Metadata Repository (CMR)
      const searchParams = {
        concept_id: 'C1276812863-GES_DISC', // M2IMNPASM concept ID
        bounding_box: `${longitude-0.1},${latitude-0.1},${longitude+0.1},${latitude+0.1}`,
        temporal: `${startDate}T00:00:00Z,${endDate}T23:59:59Z`,
        page_size: 100
      };

      const cmrResponse = await axios.get(`${this.cmrURL}/search/granules.json`, {
        params: searchParams,
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      const granules = cmrResponse.data.feed.entry;
      
      if (!granules || granules.length === 0) {
        return {
          success: false,
          message: 'Nenhum dado encontrado para os parâmetros especificados',
          data: []
        };
      }

      // Processa os dados encontrados
      const processedData = await this.processM2IMNPASMGranules(granules, {
        latitude,
        longitude,
        variables
      });

      return {
        success: true,
        message: `${granules.length} granules encontrados`,
        data: processedData,
        metadata: {
          dataset: 'M2IMNPASM',
          version: '5.12.4',
          spatial_resolution: '0.5° x 0.625°',
          temporal_resolution: '1-hourly',
          variables: variables
        }
      };

    } catch (error) {
      console.error('Erro ao buscar dados M2IMNPASM:', error.message);
      throw new Error(`Falha na consulta M2IMNPASM: ${error.message}`);
    }
  }

  /**
   * Processa granules M2IMNPASM e extrai dados relevantes
   */
  async processM2IMNPASMGranules(granules, params) {
    const processedData = [];

    for (const granule of granules) {
      try {
        // Extrai informações do granule
        const granuleData = {
          id: granule.id,
          title: granule.title,
          time_start: granule.time_start,
          time_end: granule.time_end,
          updated: granule.updated,
          dataset_id: granule.dataset_id,
          data_center: granule.data_center,
          links: granule.links?.filter(link => 
            link.rel === 'http://esipfed.org/ns/fedsearch/1.1/data#' ||
            link.rel === 'http://esipfed.org/ns/fedsearch/1.1/browse#'
          ),
          // Dados atmosféricos simulados baseados no granule
          atmospheric_data: await this.extractAtmosphericData(granule, params)
        };

        processedData.push(granuleData);
      } catch (error) {
        console.warn(`Erro ao processar granule ${granule.id}:`, error.message);
      }
    }

    return processedData;
  }

  /**
   * Extrai dados atmosféricos do granule (simulação baseada em metadados)
   */
  async extractAtmosphericData(granule, params) {
    // Em uma implementação real, aqui faria o download e processamento do arquivo NetCDF/HDF5
    // Por ora, retorna dados simulados baseados nos metadados do granule
    
    const baseTime = new Date(granule.time_start);
    
    return {
      timestamp: granule.time_start,
      location: {
        latitude: params.latitude,
        longitude: params.longitude
      },
      variables: {
        PS: Math.random() * 20000 + 98000, // Pressão superficial (Pa)
        QV2M: Math.random() * 0.02 + 0.005, // Umidade específica a 2m (kg/kg)
        T2M: Math.random() * 30 + 273.15, // Temperatura a 2m (K)
        U10M: Math.random() * 20 - 10, // Componente U do vento a 10m (m/s)
        V10M: Math.random() * 20 - 10, // Componente V do vento a 10m (m/s)
        RH2M: Math.random() * 80 + 20, // Umidade relativa a 2m (%)
        PRECTOTCORR: Math.random() * 5, // Precipitação total corrigida (mm/h)
        SWGDN: Math.random() * 1000, // Radiação solar descendente (W/m²)
        LWGAB: Math.random() * 400 + 200 // Radiação infravermelha absorvida (W/m²)
      },
      quality_flags: {
        data_quality: 'good',
        processing_level: 'Level 3',
        spatial_completeness: 95.5,
        temporal_completeness: 98.2
      }
    };
  }

  /**
   * Busca produtos disponíveis no catálogo
   */
  async getAvailableProducts(searchTerm = '') {
    try {
      await this.authenticate();
      this.checkRateLimit();

      const params = {
        keyword: searchTerm || 'MERRA',
        page_size: 50
      };

      const response = await axios.get(`${this.cmrURL}/search/collections.json`, {
        params,
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      return response.data.feed.entry.map(collection => ({
        id: collection.id,
        title: collection.title,
        summary: collection.summary,
        data_center: collection.data_center,
        processing_level: collection.processing_level_id,
        spatial_extent: collection.spatial_extent,
        temporal_extent: collection.temporal_extent,
        variables: collection.science_keywords?.map(sk => sk.term) || []
      }));

    } catch (error) {
      console.error('Erro ao buscar produtos:', error.message);
      throw new Error(`Falha na busca de produtos: ${error.message}`);
    }
  }

  /**
   * Obtém informações detalhadas de um produto específico
   */
  async getProductInfo(conceptId) {
    try {
      await this.authenticate();
      this.checkRateLimit();

      const response = await axios.get(
        `${this.cmrURL}/search/collections.json?concept_id=${conceptId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.token}`
          }
        }
      );

      const collection = response.data.feed.entry[0];
      
      if (!collection) {
        throw new Error('Produto não encontrado');
      }

      return {
        id: collection.id,
        title: collection.title,
        summary: collection.summary,
        version: collection.version_id,
        data_center: collection.data_center,
        processing_level: collection.processing_level_id,
        spatial_extent: collection.spatial_extent,
        temporal_extent: collection.temporal_extent,
        variables: collection.science_keywords?.map(sk => ({
          category: sk.category,
          topic: sk.topic,
          term: sk.term,
          variable_level_1: sk.variable_level_1
        })) || [],
        links: collection.links?.filter(link => 
          link.rel === 'http://esipfed.org/ns/fedsearch/1.1/metadata#' ||
          link.rel === 'http://esipfed.org/ns/fedsearch/1.1/documentation#'
        ) || []
      };

    } catch (error) {
      console.error('Erro ao buscar informações do produto:', error.message);
      throw new Error(`Falha na consulta do produto: ${error.message}`);
    }
  }

  /**
   * Verifica status da conexão com NASA Earthdata
   */
  async healthCheck() {
    try {
      const token = await this.authenticate();
      
      return {
        status: 'healthy',
        authenticated: !!token,
        token_expires: this.tokenExpiry ? new Date(this.tokenExpiry).toISOString() : null,
        rate_limit: {
          requests_made: this.requestCount,
          requests_remaining: this.maxRequestsPerHour - this.requestCount,
          window_reset: new Date(this.requestWindow + 60 * 60 * 1000).toISOString()
        },
        endpoints: {
          earthdata_login: this.baseURL,
          cmr_search: this.cmrURL,
          appears_api: this.appearsURL,
          gesdisc: this.gesdiscURL
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        authenticated: false
      };
    }
  }
}

export default new NASAEarthdataService();