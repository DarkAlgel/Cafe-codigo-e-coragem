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
}

// Exportar instância singleton
const apiService = new ApiService();
export default apiService;