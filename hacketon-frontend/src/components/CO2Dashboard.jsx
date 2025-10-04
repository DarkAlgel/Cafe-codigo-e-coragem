import React, { useState, useEffect } from 'react';
import { 
  Thermometer, 
  RefreshCw,
  MapPin,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import apiService from '../services/apiService';
import './CO2Dashboard.css';

const CO2Dashboard = () => {
  const [co2Data, setCo2Data] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiHealth, setApiHealth] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState({ 
    lat: -23.5505, 
    lon: -46.6333, 
    name: 'São Paulo, SP' 
  });

  useEffect(() => {
    loadCO2Data();
    checkApiHealth();
  }, []);

  const loadCO2Data = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        lat: selectedLocation.lat,
        lon: selectedLocation.lon,
        start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0]
      };

      console.log('Requesting CO2 data with params:', params);
      const response = await apiService.getCO2Data(params);
      console.log('CO2 API Response:', response);
      
      if (response.success) {
        setCo2Data(response.data);
      } else {
        setError(response.message || 'Erro ao carregar dados de CO2');
      }
    } catch (err) {
      console.error('Error loading CO2 data:', err);
      setError('Erro de conexão com a API');
    } finally {
      setLoading(false);
    }
  };

  const checkApiHealth = async () => {
    try {
      const health = await apiService.getHealthCheck();
      console.log('API Health:', health);
      setApiHealth(health);
    } catch (err) {
      console.error('Error checking API health:', err);
      setApiHealth({ status: 'error', message: 'API não disponível' });
    }
  };

  const getCO2Status = (co2Level) => {
    if (co2Level <= 400) return { status: 'excellent', label: 'Excelente', color: '#4CAF50' };
    if (co2Level <= 600) return { status: 'good', label: 'Bom', color: '#8BC34A' };
    if (co2Level <= 1000) return { status: 'acceptable', label: 'Aceitável', color: '#FF9800' };
    if (co2Level <= 5000) return { status: 'poor', label: 'Ruim', color: '#FF5722' };
    return { status: 'dangerous', label: 'Perigoso', color: '#f44336' };
  };

  const handleRefresh = () => {
    loadCO2Data();
    checkApiHealth();
  };

  const currentCO2 = co2Data?.current_co2 || 0;
  const co2Status = getCO2Status(currentCO2);

  return (
    <div className="co2-dashboard">
      <div className="dashboard-header">
        <h1>🌍 CO2 Monitor</h1>
        <p>Monitoramento de CO2 em Tempo Real</p>
        
        <div className="controls">
          <div className="location-info">
            <MapPin size={16} />
            <span>{selectedLocation.name}</span>
          </div>
          
          <button 
            onClick={handleRefresh} 
            disabled={loading}
            className="refresh-btn"
          >
            <RefreshCw size={16} className={loading ? 'spinning' : ''} />
            {loading ? 'Carregando...' : 'Atualizar'}
          </button>
        </div>
      </div>

      {/* Status da API */}
      <div className="api-status">
        <h3>Status da API</h3>
        {apiHealth ? (
          <div className={`status-indicator ${apiHealth.status}`}>
            {apiHealth.status === 'healthy' ? (
              <CheckCircle size={16} />
            ) : (
              <XCircle size={16} />
            )}
            <span>
              {apiHealth.status === 'healthy' ? 'API Online' : 'API Offline'}
              {apiHealth.uptime && ` - Uptime: ${Math.round(apiHealth.uptime)}s`}
            </span>
          </div>
        ) : (
          <div className="status-indicator loading">
            <Activity size={16} />
            <span>Verificando...</span>
          </div>
        )}
      </div>

      {/* Erro */}
      {error && (
        <div className="error-message">
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Dados de CO2 */}
      {co2Data && (
        <div className="co2-data-grid">
          {/* Card Principal de CO2 */}
          <div className="card co2-main-card">
            <h3>Nível Atual de CO2</h3>
            <div className="co2-value" style={{ color: co2Status.color }}>
              {currentCO2.toFixed(1)} ppm
            </div>
            <div className="co2-status" style={{ backgroundColor: co2Status.color }}>
              {co2Status.label}
            </div>
            <div className="co2-details">
              <p><strong>Localização:</strong> {co2Data.location}</p>
              <p><strong>Última Atualização:</strong> {new Date(co2Data.timestamp).toLocaleString('pt-BR')}</p>
              <p><strong>Qualidade:</strong> {co2Data.quality}</p>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="card co2-stats-card">
            <h3>Estatísticas (7 dias)</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Média</span>
                <span className="stat-value">{co2Data.average_co2?.toFixed(1) || 'N/A'} ppm</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Mínimo</span>
                <span className="stat-value">{co2Data.min_co2?.toFixed(1) || 'N/A'} ppm</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Máximo</span>
                <span className="stat-value">{co2Data.max_co2?.toFixed(1) || 'N/A'} ppm</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Tendência</span>
                <span className="stat-value">{co2Data.trend || 'Estável'}</span>
              </div>
            </div>
          </div>

          {/* Gráfico Histórico */}
          {co2Data.historical_data && co2Data.historical_data.length > 0 && (
            <div className="card co2-chart-card">
              <h3>Histórico de CO2</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={co2Data.historical_data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => new Date(date).toLocaleDateString('pt-BR')}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(date) => new Date(date).toLocaleDateString('pt-BR')}
                      formatter={(value) => [`${value} ppm`, 'CO2']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="co2" 
                      stroke="#667eea" 
                      strokeWidth={2}
                      dot={{ fill: '#667eea', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Interpretação */}
          <div className="card co2-interpretation-card">
            <h3>Interpretação dos Dados</h3>
            <div className="interpretation-content">
              <p><strong>Interpretação:</strong> {co2Data.interpretation || 'Dados de CO2 coletados via satélite'}</p>
              
              <div className="co2-levels-guide">
                <h4>Níveis de Referência:</h4>
                <div className="level-item">
                  <span className="level-color" style={{ backgroundColor: '#4CAF50' }}></span>
                  <span>≤ 400 ppm - Excelente (ar externo limpo)</span>
                </div>
                <div className="level-item">
                  <span className="level-color" style={{ backgroundColor: '#8BC34A' }}></span>
                  <span>400-600 ppm - Bom (ambientes bem ventilados)</span>
                </div>
                <div className="level-item">
                  <span className="level-color" style={{ backgroundColor: '#FF9800' }}></span>
                  <span>600-1000 ppm - Aceitável (pode causar sonolência)</span>
                </div>
                <div className="level-item">
                  <span className="level-color" style={{ backgroundColor: '#FF5722' }}></span>
                  <span>1000-5000 ppm - Ruim (ventilação inadequada)</span>
                </div>
                <div className="level-item">
                  <span className="level-color" style={{ backgroundColor: '#f44336' }}></span>
                  <span>&gt; 5000 ppm - Perigoso (risco à saúde)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && !co2Data && (
        <div className="loading-state">
          <Activity size={32} className="spinning" />
          <p>Carregando dados de CO2...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !co2Data && !error && (
        <div className="empty-state">
          <Thermometer size={48} />
          <p>Nenhum dado de CO2 disponível</p>
          <button onClick={loadCO2Data} className="retry-btn">
            Tentar Novamente
          </button>
        </div>
      )}
    </div>
  );
};

export default CO2Dashboard;