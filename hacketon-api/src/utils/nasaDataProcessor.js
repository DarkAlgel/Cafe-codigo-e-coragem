/**
 * Utilitário para processar e formatar dados da NASA Earthdata
 * Inclui conversões de unidades, formatação de dados e validações
 */

class NASADataProcessor {
  constructor() {
    this.supportedFormats = ['netcdf', 'hdf5', 'json', 'csv'];
    this.m2imnpasmVariables = {
      'PS': {
        name: 'Surface Pressure',
        unit: 'Pa',
        description: 'Pressão atmosférica na superfície',
        conversion: (value) => value // Pa para Pa
      },
      'T2M': {
        name: 'Temperature at 2m',
        unit: 'K',
        description: 'Temperatura do ar a 2 metros de altura',
        conversion: (value) => value // K para K
      },
      'QV2M': {
        name: 'Specific Humidity at 2m',
        unit: 'kg/kg',
        description: 'Umidade específica a 2 metros de altura',
        conversion: (value) => value // kg/kg para kg/kg
      },
      'U10M': {
        name: 'U-component of Wind at 10m',
        unit: 'm/s',
        description: 'Componente U (leste-oeste) do vento a 10 metros',
        conversion: (value) => value // m/s para m/s
      },
      'V10M': {
        name: 'V-component of Wind at 10m',
        unit: 'm/s',
        description: 'Componente V (norte-sul) do vento a 10 metros',
        conversion: (value) => value // m/s para m/s
      },
      'RH2M': {
        name: 'Relative Humidity at 2m',
        unit: '%',
        description: 'Umidade relativa a 2 metros de altura',
        conversion: (value) => value * 100 // fração para %
      },
      'PRECTOTCORR': {
        name: 'Corrected Total Precipitation',
        unit: 'mm/day',
        description: 'Precipitação total corrigida',
        conversion: (value) => value * 86400 // kg/m²/s para mm/day
      },
      'SWGDN': {
        name: 'Surface Incoming Shortwave Flux',
        unit: 'W/m²',
        description: 'Fluxo de radiação solar incidente na superfície',
        conversion: (value) => value // W/m² para W/m²
      },
      'LWGAB': {
        name: 'Surface Absorbed Longwave Radiation',
        unit: 'W/m²',
        description: 'Radiação de onda longa absorvida na superfície',
        conversion: (value) => value // W/m² para W/m²
      }
    };
  }

  /**
   * Processa dados brutos do granule M2IMNPASM
   * @param {Object} granuleData - Dados brutos do granule
   * @param {Array} requestedVariables - Variáveis solicitadas
   * @param {Object} coordinates - Coordenadas de interesse
   * @returns {Object} Dados processados
   */
  processM2IMNPASMData(granuleData, requestedVariables = [], coordinates = null) {
    try {
      const processedData = {
        metadata: this.extractMetadata(granuleData),
        temporal_coverage: this.extractTemporalCoverage(granuleData),
        spatial_coverage: this.extractSpatialCoverage(granuleData),
        variables: {},
        processing_info: {
          processed_at: new Date().toISOString(),
          processor_version: '1.0.0',
          data_source: 'NASA MERRA-2 M2IMNPASM'
        }
      };

      // Processar variáveis solicitadas
      const variablesToProcess = requestedVariables.length > 0 
        ? requestedVariables 
        : Object.keys(this.m2imnpasmVariables);

      for (const variable of variablesToProcess) {
        if (this.m2imnpasmVariables[variable]) {
          processedData.variables[variable] = this.processVariable(
            granuleData, 
            variable, 
            coordinates
          );
        }
      }

      return processedData;
    } catch (error) {
      throw new Error(`Erro ao processar dados M2IMNPASM: ${error.message}`);
    }
  }

  /**
   * Extrai metadados do granule
   * @param {Object} granuleData - Dados do granule
   * @returns {Object} Metadados extraídos
   */
  extractMetadata(granuleData) {
    return {
      granule_id: granuleData.id || 'unknown',
      title: granuleData.title || 'M2IMNPASM Granule',
      producer_granule_id: granuleData.producer_granule_id,
      collection_concept_id: granuleData.collection_concept_id,
      data_center: granuleData.data_center || 'GES DISC',
      processing_level: 'Level 3',
      instrument: 'MERRA-2 Model',
      platform: 'MERRA-2',
      format: granuleData.granule_size ? 'NetCDF-4' : 'Unknown'
    };
  }

  /**
   * Extrai cobertura temporal
   * @param {Object} granuleData - Dados do granule
   * @returns {Object} Cobertura temporal
   */
  extractTemporalCoverage(granuleData) {
    return {
      start_date: granuleData.time_start || null,
      end_date: granuleData.time_end || null,
      temporal_resolution: 'Instantaneous',
      time_type: 'UTC'
    };
  }

  /**
   * Extrai cobertura espacial
   * @param {Object} granuleData - Dados do granule
   * @returns {Object} Cobertura espacial
   */
  extractSpatialCoverage(granuleData) {
    const defaultCoverage = {
      type: 'global',
      resolution: '0.5° x 0.625°',
      coordinate_system: 'WGS84',
      bounds: {
        north: 90,
        south: -90,
        east: 180,
        west: -180
      }
    };

    if (granuleData.boxes && granuleData.boxes.length > 0) {
      const box = granuleData.boxes[0];
      return {
        ...defaultCoverage,
        bounds: {
          north: parseFloat(box.north),
          south: parseFloat(box.south),
          east: parseFloat(box.east),
          west: parseFloat(box.west)
        }
      };
    }

    return defaultCoverage;
  }

  /**
   * Processa uma variável específica
   * @param {Object} granuleData - Dados do granule
   * @param {string} variable - Nome da variável
   * @param {Object} coordinates - Coordenadas específicas
   * @returns {Object} Dados da variável processada
   */
  processVariable(granuleData, variable, coordinates = null) {
    const varInfo = this.m2imnpasmVariables[variable];
    
    return {
      name: varInfo.name,
      standard_name: variable,
      unit: varInfo.unit,
      description: varInfo.description,
      data_type: 'float32',
      fill_value: -9999.0,
      valid_range: this.getValidRange(variable),
      coordinates: coordinates || 'global',
      // Nota: Em uma implementação real, aqui seria onde os dados numéricos
      // seriam extraídos do arquivo NetCDF/HDF5
      data_available: true,
      download_urls: granuleData.links?.filter(link => 
        link.rel === 'http://esipfed.org/ns/fedsearch/1.1/data#'
      ) || []
    };
  }

  /**
   * Obtém o range válido para uma variável
   * @param {string} variable - Nome da variável
   * @returns {Array} Range [min, max]
   */
  getValidRange(variable) {
    const ranges = {
      'PS': [50000, 110000], // Pa
      'T2M': [180, 330], // K
      'QV2M': [0, 0.03], // kg/kg
      'U10M': [-50, 50], // m/s
      'V10M': [-50, 50], // m/s
      'RH2M': [0, 100], // %
      'PRECTOTCORR': [0, 100], // mm/day
      'SWGDN': [0, 1500], // W/m²
      'LWGAB': [0, 500] // W/m²
    };
    
    return ranges[variable] || [-9999, 9999];
  }

  /**
   * Converte dados para diferentes formatos
   * @param {Object} processedData - Dados processados
   * @param {string} format - Formato desejado (json, csv, etc.)
   * @returns {Object|string} Dados no formato solicitado
   */
  convertToFormat(processedData, format = 'json') {
    switch (format.toLowerCase()) {
      case 'json':
        return processedData;
      
      case 'csv':
        return this.convertToCSV(processedData);
      
      case 'geojson':
        return this.convertToGeoJSON(processedData);
      
      default:
        throw new Error(`Formato não suportado: ${format}`);
    }
  }

  /**
   * Converte dados para formato CSV
   * @param {Object} processedData - Dados processados
   * @returns {string} Dados em formato CSV
   */
  convertToCSV(processedData) {
    const headers = ['timestamp', 'latitude', 'longitude'];
    const variableNames = Object.keys(processedData.variables);
    headers.push(...variableNames);

    let csv = headers.join(',') + '\n';
    
    // Nota: Em uma implementação real, aqui seria onde os dados temporais
    // seriam iterados para criar as linhas do CSV
    csv += `${processedData.temporal_coverage.start_date},0,0,`;
    csv += variableNames.map(v => 'data_value').join(',') + '\n';
    
    return csv;
  }

  /**
   * Converte dados para formato GeoJSON
   * @param {Object} processedData - Dados processados
   * @returns {Object} Dados em formato GeoJSON
   */
  convertToGeoJSON(processedData) {
    return {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [0, 0] // Coordenadas seriam extraídas dos dados reais
        },
        properties: {
          timestamp: processedData.temporal_coverage.start_date,
          variables: processedData.variables
        }
      }]
    };
  }

  /**
   * Valida dados de entrada
   * @param {Object} data - Dados para validar
   * @returns {Object} Resultado da validação
   */
  validateData(data) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: []
    };

    if (!data || typeof data !== 'object') {
      validation.isValid = false;
      validation.errors.push('Dados inválidos ou ausentes');
      return validation;
    }

    // Validar metadados obrigatórios
    if (!data.id) {
      validation.warnings.push('ID do granule não encontrado');
    }

    if (!data.time_start || !data.time_end) {
      validation.warnings.push('Cobertura temporal incompleta');
    }

    return validation;
  }

  /**
   * Calcula estatísticas dos dados
   * @param {Object} processedData - Dados processados
   * @returns {Object} Estatísticas calculadas
   */
  calculateStatistics(processedData) {
    const stats = {
      total_variables: Object.keys(processedData.variables).length,
      temporal_span: null,
      spatial_coverage: processedData.spatial_coverage,
      data_quality: 'good', // Seria calculado baseado nos dados reais
      completeness: 100 // Percentual de dados válidos
    };

    if (processedData.temporal_coverage.start_date && processedData.temporal_coverage.end_date) {
      const start = new Date(processedData.temporal_coverage.start_date);
      const end = new Date(processedData.temporal_coverage.end_date);
      stats.temporal_span = {
        duration_hours: (end - start) / (1000 * 60 * 60),
        start: processedData.temporal_coverage.start_date,
        end: processedData.temporal_coverage.end_date
      };
    }

    return stats;
  }
}

export default new NASADataProcessor();