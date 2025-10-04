// API Service para integração com backend Air Sentinel
const API_BASE_URL = 'http://localhost:3001/api';

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

  // ===== ENDPOINTS NASA EARTHDATA (MERRA-2) =====
  
  async getNasaHealth() {
    return this.makeRequest('/nasa/health');
  }

  async getNasaData(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/nasa/data?${queryString}`);
  }

  async getNasaVariables() {
    return this.makeRequest('/nasa/variables');
  }

  async getNasaStats() {
    return this.makeRequest('/nasa/stats');
  }

  // ===== ENDPOINTS TEMPO NO2 =====
  
  async getTempoHealth() {
    return this.makeRequest('/tempo/health');
  }

  async getTempoNO2Data(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/tempo/no2?${queryString}`);
  }

  async getTempoDatasetInfo() {
    return this.makeRequest('/tempo/dataset-info');
  }

  async getTempoExampleData() {
    return this.makeRequest('/tempo/example-data');
  }

  async getTempoExampleLocations() {
    return this.makeRequest('/tempo/example-locations');
  }

  // ===== MÉTODOS UTILITÁRIOS =====

  // Obter dados de NO2 para uma localização específica
  async getNO2ForLocation(lat, lon, startDate = null, endDate = null) {
    const params = { lat, lon };
    
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    return this.getTempoNO2Data(params);
  }

  // Obter dados de exemplo para Nova York
  async getNewYorkNO2Data() {
    return this.getTempoExampleData();
  }

  // Verificar status de ambos os serviços
  async getServicesHealth() {
    try {
      const [nasaHealth, tempoHealth] = await Promise.allSettled([
        this.getNasaHealth(),
        this.getTempoHealth()
      ]);

      return {
        nasa: {
          status: nasaHealth.status === 'fulfilled' ? 'healthy' : 'unhealthy',
          data: nasaHealth.status === 'fulfilled' ? nasaHealth.value : null,
          error: nasaHealth.status === 'rejected' ? nasaHealth.reason.message : null
        },
        tempo: {
          status: tempoHealth.status === 'fulfilled' ? 'healthy' : 'unhealthy',
          data: tempoHealth.status === 'fulfilled' ? tempoHealth.value : null,
          error: tempoHealth.status === 'rejected' ? tempoHealth.reason.message : null
        }
      };
    } catch (error) {
      console.error('Error checking services health:', error);
      throw error;
    }
  }

  // Converter dados NO2 para formato do dashboard
  formatNO2DataForDashboard(tempoData) {
    if (!tempoData || !tempoData.success || !tempoData.data) {
      return null;
    }

    const { data } = tempoData;
    const no2Values = data.no2Data?.values || [];
    const statistics = data.no2Data?.statistics || {};

    return {
      location: data.location?.description || `${data.location?.lat}, ${data.location?.lon}`,
      no2: {
        current: statistics.mean || no2Values[no2Values.length - 1] || 0,
        min: statistics.min || 0,
        max: statistics.max || 0,
        average: statistics.mean || 0,
        unit: data.no2Data?.units || 'molecules/cm²',
        quality: data.no2Data?.quality || 'unknown',
        values: no2Values
      },
      metadata: {
        instrument: data.metadata?.instrument || 'TEMPO',
        resolution: data.metadata?.resolution || '2.1km x 4.4km',
        timeRange: data.timeRange || {},
        lastUpdated: new Date().toLocaleString('pt-BR')
      }
    };
  }

  // Calcular AQI baseado em NO2 (simplificado)
  calculateNO2AQI(no2Value) {
    // Conversão simplificada de molecules/cm² para µg/m³ (aproximada)
    // Valores de referência para NO2 em µg/m³
    const no2_ugm3 = no2Value * 0.0019; // Conversão aproximada
    
    if (no2_ugm3 <= 40) return { aqi: Math.round(no2_ugm3 * 1.25), status: 'good' };
    if (no2_ugm3 <= 80) return { aqi: Math.round(50 + (no2_ugm3 - 40) * 1.25), status: 'moderate' };
    if (no2_ugm3 <= 180) return { aqi: Math.round(100 + (no2_ugm3 - 80) * 0.5), status: 'unhealthy-sensitive' };
    if (no2_ugm3 <= 280) return { aqi: Math.round(150 + (no2_ugm3 - 180) * 0.5), status: 'unhealthy' };
    if (no2_ugm3 <= 400) return { aqi: Math.round(200 + (no2_ugm3 - 280) * 0.83), status: 'very-unhealthy' };
    return { aqi: Math.min(500, Math.round(300 + (no2_ugm3 - 400) * 0.5)), status: 'hazardous' };
  }
}

// Exportar instância singleton
const apiService = new ApiService();
export default apiService;