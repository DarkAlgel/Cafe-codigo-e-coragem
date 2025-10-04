// API Service para integração com backend Air Sentinel
const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  // Método auxiliar para fazer requisições HTTP
  async makeRequest(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error);
      throw error;
    }
  }

  // ===== ENDPOINTS DE SAÚDE =====
  
  async getHealth() {
    return this.makeRequest('/health');
  }

  async getDetailedHealth() {
    return this.makeRequest('/health/detailed');
  }

  // ===== ENDPOINTS DE CO2 =====
  
  async getCO2Data(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/co2_data?${queryString}`);
  }

  async getCO2Info() {
    return this.makeRequest('/co2_info');
  }

  async getCO2Stats() {
    return this.makeRequest('/co2_stats');
  }

  // ===== ENDPOINTS DE DADOS ATMOSFÉRICOS =====

  async getTempoNO2Data() {
    return this.makeRequest('/tempo_no2');
  }

  async getMerra2PBLHData() {
    return this.makeRequest('/merra2_pblh');
  }

  async getAirsTemperatureData() {
    return this.makeRequest('/airs_temperature');
  }

  async getCygnssWindData() {
    return this.makeRequest('/cygnss_wind');
  }

  async getGoesCloudsData() {
    return this.makeRequest('/goes_clouds');
  }

  async getTempoData() {
    return this.makeRequest('/tempo/data');
  }

  async getEarthdataDatasets() {
    return this.makeRequest('/earthdata/datasets');
  }

  // ===== MÉTODOS UTILITÁRIOS =====

  // Obter dados de CO2 para uma localização específica
  async getCO2ForLocation(lat, lon, location = null) {
    const params = { lat, lon };
    if (location) params.location = location;
    return this.getCO2Data(params);
  }

  // Método para obter localizações de exemplo (usado pelo LocationSelector)
  async getTempoExampleLocations() {
    // Retorna localizações de exemplo para o seletor
    return [
      { lat: -23.5505, lon: -46.6333, name: 'São Paulo, SP' },
      { lat: -22.9068, lon: -43.1729, name: 'Rio de Janeiro, RJ' },
      { lat: -19.9167, lon: -43.9345, name: 'Belo Horizonte, MG' },
      { lat: -25.4284, lon: -49.2733, name: 'Curitiba, PR' },
      { lat: -30.0346, lon: -51.2177, name: 'Porto Alegre, RS' },
      { lat: -8.0476, lon: -34.8770, name: 'Recife, PE' },
      { lat: -12.9714, lon: -38.5014, name: 'Salvador, BA' },
      { lat: -3.7319, lon: -38.5267, name: 'Fortaleza, CE' }
    ];
  }

  // Método para verificar saúde (usado pelo Dashboard)
  async getHealthCheck() {
    return this.getHealth();
  }

  // Verificar status dos serviços
  async getServicesHealth() {
    try {
      const health = await this.getHealth();
      return {
        api: {
          status: 'healthy',
          data: health,
          error: null
        }
      };
    } catch (error) {
      console.error('Error checking services health:', error);
      return {
        api: {
          status: 'unhealthy',
          data: null,
          error: error.message
        }
      };
    }
  }

  // Converter dados CO2 para formato do dashboard
  formatCO2DataForDashboard(co2Data) {
    if (!co2Data || !co2Data.value) {
      return null;
    }

    return {
      location: co2Data.location || 'Localização não especificada',
      co2: {
        current: co2Data.value,
        unit: co2Data.units || 'ppm',
        quality: co2Data.quality || 'unknown',
        interpretation: co2Data.context?.interpretation || null
      },
      metadata: {
        source: co2Data.source || 'NASA/MERRA-2',
        dataset: co2Data.metadata?.dataset || 'MERRA-2_CO2_Simulation',
        resolution: co2Data.metadata?.spatial_resolution || '0.5° x 0.625°',
        lastUpdated: co2Data.timestamp ? new Date(co2Data.timestamp).toLocaleString('pt-BR') : new Date().toLocaleString('pt-BR')
      },
      recommendations: co2Data.context?.recommendations || []
    };
  }

  // Calcular status baseado em CO2
  calculateCO2Status(co2Value) {
    if (co2Value < 400) {
      return { status: 'good', color: '#4CAF50', description: 'Baixo', aqi: 50, label: 'Bom' };
    } else if (co2Value < 420) {
      return { status: 'normal', color: '#2196F3', description: 'Normal', aqi: 100, label: 'Moderado' };
    } else if (co2Value < 440) {
      return { status: 'elevated', color: '#FF9800', description: 'Elevado', aqi: 150, label: 'Insalubre para Grupos Sensíveis' };
    } else {
      return { status: 'high', color: '#F44336', description: 'Muito Elevado', aqi: 200, label: 'Insalubre' };
    }
  }

  // ===== MÉTODOS DE TEMPO REAL =====

  // Buscar todos os dados atmosféricos em tempo real
  async getAllAtmosphericData() {
    try {
      const [co2Data, tempoData, temperatureData, windData, cloudsData] = await Promise.all([
        this.getCO2Data(),
        this.getTempoData(),
        this.getAirsTemperatureData(),
        this.getCygnssWindData(),
        this.getGoesCloudsData()
      ]);

      return {
        co2: co2Data,
        tempo: tempoData,
        temperature: temperatureData,
        wind: windData,
        clouds: cloudsData,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching all atmospheric data:', error);
      throw error;
    }
  }

  // Configurar polling para dados em tempo real
  startRealTimePolling(callback, interval = 60000) {
    const pollData = async () => {
      try {
        const data = await this.getAllAtmosphericData();
        callback(data);
      } catch (error) {
        console.error('Error in real-time polling:', error);
        callback(null, error);
      }
    };

    // Primeira chamada imediata
    pollData();

    // Configurar intervalo
    const intervalId = setInterval(pollData, interval);

    // Retornar função para parar o polling
    return () => clearInterval(intervalId);
  }

  // Formatar dados para o dashboard
  formatAtmosphericDataForDashboard(data) {
    if (!data) return null;

    return {
      airQuality: {
        co2: data.co2?.value || 0,
        co2Unit: data.co2?.units || 'ppm',
        no2: data.tempo?.data?.value || 0,
        no2Unit: data.tempo?.data?.units || 'mol/m²',
        pollutant: data.tempo?.data?.pollutant || 'NO2',
        quality: data.tempo?.data?.quality || 'unknown'
      },
      weather: {
        temperature: data.temperature?.celsius || 0,
        temperatureF: data.temperature?.fahrenheit || 0,
        windSpeed: data.wind?.wind_speed || 0,
        windDirection: data.wind?.wind_direction || 0,
        cloudCoverage: data.clouds?.cloud_fraction || 0
      },
      metadata: {
        lastUpdated: data.timestamp,
        sources: {
          co2: data.co2?.source || 'NASA/MERRA-2',
          tempo: data.tempo?.data?.source || 'TEMPO',
          temperature: data.temperature?.source_dataset || 'AIRS',
          wind: data.wind?.source_dataset || 'CYGNSS',
          clouds: data.clouds?.source_dataset || 'GOES'
        }
      }
    };
  }
}

// Exportar instância singleton
const apiService = new ApiService();
export default apiService;