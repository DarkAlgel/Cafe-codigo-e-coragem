import React, { useState, useEffect } from 'react';
import { ChevronRight, Clock, Thermometer, Droplets, Wind, Eye } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import apiService from '../services/apiService';
import './Dashboard.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Dashboard = () => {
  // Estados para dados em tempo real
  const [atmosphericData, setAtmosphericData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Configurar polling de dados em tempo real
  useEffect(() => {
    let stopPolling = null;

    const handleDataUpdate = (data, error) => {
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (data) {
        const formattedData = apiService.formatAtmosphericDataForDashboard(data);
        setAtmosphericData(formattedData);
        setLastUpdated(new Date());
        setError(null);
      }
      setLoading(false);
    };

    // Iniciar polling (atualização a cada 1 minuto)
    stopPolling = apiService.startRealTimePolling(handleDataUpdate, 60000);

    // Cleanup ao desmontar componente
    return () => {
      if (stopPolling) {
        stopPolling();
      }
    };
  }, []);

  // Calcular IQA baseado nos dados reais
  const calculateIQA = () => {
    if (!atmosphericData) return { value: 85, status: 'MODERADA', color: '#f59e0b' };

    const co2 = atmosphericData.airQuality.co2;
    const co2Status = apiService.calculateCO2Status(co2);
    
    return {
      value: co2Status.aqi,
      status: co2Status.label.toUpperCase(),
      color: co2Status.color,
      description: `CO2: ${co2} ${atmosphericData.airQuality.co2Unit} - ${co2Status.description}`
    };
  };

  // Gerar dados do gráfico baseados em dados históricos simulados
  const generateChartData = () => {
    if (!atmosphericData) {
      return [
        { time: '0h', value: 82 },
        { time: '6h', value: 85 },
        { time: '12h', value: 88 },
        { time: '18h', value: 92 },
        { time: '24h', value: 95 }
      ];
    }

    const currentValue = atmosphericData.airQuality.co2;
    return [
      { time: '0h', value: Math.max(currentValue - 10, 300) },
      { time: '6h', value: Math.max(currentValue - 5, 300) },
      { time: '12h', value: currentValue },
      { time: '18h', value: currentValue + 3 },
      { time: '24h', value: currentValue + 8 }
    ];
  };

  const iqa = calculateIQA();
  const chartData = generateChartData();

  // Marcadores do mapa
  const mapMarkers = [
    { id: 1, position: [-23.5505, -46.6333], color: 'green', status: 'Bom' },
    { id: 2, position: [-23.5605, -46.6433], color: 'green', status: 'Bom' },
    { id: 3, position: [-23.5405, -46.6233], color: 'yellow', status: 'Moderado' },
    { id: 4, position: [-23.5705, -46.6533], color: 'orange', status: 'Ruim' },
    { id: 5, position: [-23.5305, -46.6133], color: 'yellow', status: 'Moderado' }
  ];

  const createCustomIcon = (color) => {
    const colors = {
      green: '#22c55e',
      yellow: '#eab308',
      orange: '#f97316'
    };
    
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="background-color: ${colors[color]}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
  };

  return (
    <div className="dashboard">
      {loading && (
        <div className="loading-indicator" style={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          background: '#3b82f6',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '12px',
          zIndex: 999,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          🔄 Carregando dados...
        </div>
      )}
      
      {error && (
        <div className="error-indicator" style={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          background: '#ef4444',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '12px',
          zIndex: 999,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          ❌ Erro: {error}
        </div>
      )}

      {lastUpdated && !loading && !error && (
        <div className="last-updated" style={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          background: '#10b981',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '12px',
          zIndex: 999,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          ✅ Atualizado: {lastUpdated.toLocaleTimeString('pt-BR')}
        </div>
      )}

      <div className="dashboard-grid">
        {/* Card IQA */}
        <div className="dashboard-card iqa-card">
          <div className="iqa-circle" style={{ borderColor: iqa.color }}>
            <span className="iqa-value" style={{ color: iqa.color }}>{iqa.value}</span>
          </div>
          <div className="iqa-info">
            <h3>IQA</h3>
            <p className="iqa-status" style={{ color: iqa.color }}>{iqa.status}</p>
            <p className="iqa-description">
              {atmosphericData ? iqa.description : 
                "Air quality is acceptable. However, there may be a moderate risk for a very small number of people, particularly those sensitive to air pollution."
              }
            </p>
          </div>
        </div>

        {/* Container para os outros três cards no mobile */}
        <div className="mobile-cards-container">
          {/* Predictive Analysis & History */}
          <div className="dashboard-card chart-card">
            <div className="card-header">
              <h3>Predictive Analysis & History</h3>
              <ChevronRight size={20} />
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="time" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <YAxis hide />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#4ade80" 
                    strokeWidth={2}
                    fill="url(#colorGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="chart-info">
                <p><strong>Próximas 12h:</strong> Qualidade do ar se mantém <strong>MODERADA</strong></p>
              </div>
            </div>
          </div>

          {/* Mapa Interativo */}
          <div className="dashboard-card map-card">
            <div className="card-header">
              <h3>Mapa Interativo</h3>
              <ChevronRight size={20} />
            </div>
            <div className="map-container">
              <MapContainer 
                center={[-23.5505, -46.6333]} 
                zoom={13} 
                style={{ height: '200px', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {mapMarkers.map(marker => (
                  <Marker 
                    key={marker.id}
                    position={marker.position}
                    icon={createCustomIcon(marker.color)}
                  >
                    <Popup>
                      Status: {marker.status}
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
              <div className="map-legend">
                <span className="legend-item">
                  <div className="legend-dot green"></div>
                  Good
                </span>
                <span className="legend-item">
                  <div className="legend-dot yellow"></div>
                  Moderate
                </span>
                <span className="legend-item">
                  <div className="legend-dot orange"></div>
                  Poor
                </span>
              </div>
            </div>
          </div>

          {/* Weather Conditions */}
          <div className="dashboard-card weather-card">
            <div className="card-header">
              <h3>Weather Conditions</h3>
              <ChevronRight size={20} />
            </div>
            <div className="weather-grid">
              <div className="weather-item">
                <div className="weather-icon">
                  <Thermometer size={24} />
                </div>
                <div className="weather-info">
                  <span className="weather-value">
                    {atmosphericData ? `${atmosphericData.weather.temperature.toFixed(1)}°C` : '28°C'}
                  </span>
                  <span className="weather-label">Temperature</span>
                </div>
                <div className="weather-status">
                  <Clock size={16} />
                </div>
              </div>
              
              <div className="weather-item">
                <div className="weather-icon">
                  <Droplets size={24} />
                </div>
                <div className="weather-info">
                  <span className="weather-value">
                    {atmosphericData ? `${(atmosphericData.weather.cloudCoverage * 100).toFixed(0)}%` : '65%'}
                  </span>
                  <span className="weather-label">Cloud Coverage</span>
                </div>
              </div>
              
              <div className="weather-item">
                <div className="weather-icon">
                  <Wind size={24} />
                </div>
                <div className="weather-info">
                  <span className="weather-value">
                    {atmosphericData ? `${atmosphericData.weather.windSpeed.toFixed(1)} m/s` : '18 km/h'}
                  </span>
                  <span className="weather-label">Wind Speed</span>
                </div>
              </div>
              
              <div className="weather-item">
                <div className="weather-icon">
                  <Eye size={24} />
                </div>
                <div className="weather-info">
                  <span className="weather-value">
                    {atmosphericData ? `NO2: ${atmosphericData.airQuality.no2.toFixed(2)}` : '10 km'}
                  </span>
                  <span className="weather-label">
                    {atmosphericData ? atmosphericData.airQuality.no2Unit : 'Visibility'}
                  </span>
                </div>
              </div>
              
              <div className="weather-item">
                <div className="weather-info">
                  <span className="weather-value">10 km</span>
                  <span className="weather-label">Visibility</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;