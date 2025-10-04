import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Wind, 
  Eye, 
  Thermometer, 
  Droplets, 
  Sun, 
  AlertTriangle, 
  TrendingUp, 
  Activity, 
  Shield, 
  Clock,
  Navigation,
  BarChart3,
  Settings,
  RefreshCw
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import LocationSelector from './LocationSelector';
import HistoricalChart from './HistoricalChart';
import DatasetInfo from './DatasetInfo';
import apiService from '../services/apiService';
import './Dashboard.css';

const Dashboard = () => {
  const [airQualityData, setAirQualityData] = useState({
    aqi: 85,
    status: 'moderate',
    location: 'São Paulo, SP',
    lastUpdated: new Date().toLocaleString('pt-BR'),
    pollutants: {
      pm25: 35,
      pm10: 45,
      o3: 120,
      no2: 25,
      so2: 15,
      co: 8,
      co2: 420
    },
    weather: {
      temperature: 24,
      humidity: 65,
      windSpeed: 12,
      visibility: 8
    }
  });

  const [co2Data, setCo2Data] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [servicesHealth, setServicesHealth] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState({ lat: -23.5505, lon: -46.6333, name: 'São Paulo, SP' });

  // Carregar dados iniciais
  useEffect(() => {
    loadInitialData();
    checkServicesHealth();
  }, []);

  // Carregar dados quando a localização mudar
  useEffect(() => {
    if (selectedLocation.lat && selectedLocation.lon) {
      loadCo2Data();
    }
  }, [selectedLocation]);

  const loadInitialData = async () => {
    try {
      // Carregar dados de CO2 com parâmetros da localização selecionada
      const co2Response = await apiService.getCO2Data({
        lat: selectedLocation.lat,
        lon: selectedLocation.lon,
        location: selectedLocation.name
      });
      
      if (co2Response.success) {
        const formattedData = apiService.formatCO2DataForDashboard(co2Response.data);
        setCo2Data(formattedData);
        
        // Atualizar dados de qualidade do ar com dados reais
        if (formattedData) {
          const co2Status = apiService.calculateCO2Status(formattedData.co2.current);
          setAirQualityData(prev => ({
            ...prev,
            aqi: co2Status.aqi,
            status: co2Status.status,
            location: formattedData.location,
            lastUpdated: formattedData.metadata.lastUpdated,
            pollutants: {
              ...prev.pollutants,
              co2: Math.round(formattedData.co2.current)
            }
          }));
        }
      }
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError('Erro ao carregar dados iniciais');
    }
  };

  const loadCo2Data = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiService.getCO2Data({
        lat: selectedLocation.lat,
        lon: selectedLocation.lon,
        start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0]
      });
      
      if (data.success) {
        const formattedData = apiService.formatCO2DataForDashboard(data);
        setCo2Data(formattedData);
        
        // Atualizar status baseado nos dados reais
        if (formattedData) {
          const co2Status = apiService.calculateCO2Status(formattedData.co2.current);
          setAirQualityData(prev => ({
            ...prev,
            aqi: co2Status.aqi,
            status: co2Status.status,
            location: selectedLocation.name,
            lastUpdated: formattedData.metadata.lastUpdated,
            pollutants: {
              ...prev.pollutants,
              co2: Math.round(formattedData.co2.current)
            }
          }));
        }
      }
    } catch (err) {
      console.error('Error loading CO2 data:', err);
      setError('Erro ao carregar dados de CO2');
    } finally {
      setLoading(false);
    }
  };

  const checkServicesHealth = async () => {
    try {
      const health = await apiService.getHealthCheck();
      setServicesHealth(health);
    } catch (err) {
      console.error('Error checking services health:', err);
    }
  };

  const handleLocationChange = (location) => {
    setSelectedLocation(location);
  };

  const handleRefresh = () => {
    loadCo2Data();
    checkServicesHealth();
  };

  const getAirQualityStatus = (aqi) => {
    if (aqi <= 50) return { status: 'good', label: 'Boa', color: '#4CAF50' };
    if (aqi <= 100) return { status: 'moderate', label: 'Moderada', color: '#FF9800' };
    if (aqi <= 150) return { status: 'unhealthy-sensitive', label: 'Insalubre para Grupos Sensíveis', color: '#FF5722' };
    if (aqi <= 200) return { status: 'unhealthy', label: 'Insalubre', color: '#f44336' };
    if (aqi <= 300) return { status: 'very-unhealthy', label: 'Muito Insalubre', color: '#9C27B0' };
    return { status: 'hazardous', label: 'Perigosa', color: '#8B0000' };
  };

  const pollutantData = [
    { name: 'PM2.5', value: airQualityData.pollutants.pm25, limit: 25, unit: 'µg/m³' },
    { name: 'PM10', value: airQualityData.pollutants.pm10, limit: 50, unit: 'µg/m³' },
    { name: 'O3', value: airQualityData.pollutants.o3, limit: 100, unit: 'µg/m³' },
    { name: 'NO2', value: airQualityData.pollutants.no2, limit: 40, unit: 'µg/m³' },
    { name: 'SO2', value: airQualityData.pollutants.so2, limit: 20, unit: 'µg/m³' },
    { name: 'CO2', value: airQualityData.pollutants.co2, limit: 400, unit: 'ppm' }
  ];

  const currentStatus = getAirQualityStatus(airQualityData.aqi);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="status-icon good" />;
      case 'moderate':
        return <AlertTriangle className="status-icon moderate" />;
      default:
        return <XCircle className="status-icon unhealthy" />;
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Air Sentinel</h1>
        <p>Real-Time Air Quality Monitoring with NASA CO₂ Data</p>
        <div className="location-controls">
          <LocationSelector 
            currentLocation={selectedLocation}
            onLocationChange={handleLocationChange}
          />
          <button 
            className="refresh-btn" 
            onClick={handleRefresh} 
            disabled={loading}
            title="Atualizar dados"
          >
            <RefreshCw className={`refresh-icon ${loading ? 'spinning' : ''}`} />
          </button>
        </div>
        <p className="last-updated">Last updated: {airQualityData.lastUpdated}</p>
        
        {/* Status dos Serviços */}
        {servicesHealth && (
          <div className="services-status">
            <div className={`service-indicator ${servicesHealth.nasa ? servicesHealth.nasa.status : 'unknown'}`}>
              NASA CO₂: {servicesHealth.nasa ? servicesHealth.nasa.status : 'unknown'}
            </div>
          </div>
        )}

        {/* Mensagem de erro */}
        {error && (
          <div className="error-message">
            <AlertTriangle className="error-icon" />
            {error}
          </div>
        )}
      </div>

      {/* AQI Principal */}
      <div className="aqi-main-card card">
        <div className="aqi-display">
          <div className="aqi-circle" style={{ borderColor: currentStatus.color }}>
            <span className="aqi-value">{airQualityData.aqi}</span>
            <span className="aqi-label">AQI</span>
          </div>
          <div className="aqi-info">
            {getStatusIcon(currentStatus.status)}
            <h2 className="aqi-status" style={{ color: currentStatus.color }}>
              {currentStatus.label}
            </h2>
            <p className="aqi-description">
              {currentStatus.status === 'good' && 'Air quality is satisfactory and air pollution poses little or no risk.'}
              {currentStatus.status === 'moderate' && 'Air quality is acceptable for most people. Sensitive groups may experience minor symptoms.'}
              {currentStatus.status !== 'good' && currentStatus.status !== 'moderate' && 'Air quality may be harmful to health. Consider limiting outdoor activities.'}
            </p>
            {co2Data && (
              <div className="co2-info">
                <p><strong>CO₂:</strong> {co2Data.co2.current.toFixed(2)} {co2Data.co2.unit}</p>
                <p><strong>Quality:</strong> {co2Data.co2.quality}</p>
                <p><strong>Source:</strong> {co2Data.metadata.source}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* CO2 Data Card */}
        {co2Data && (
          <div className="card co2-data-card">
            <h3>NASA CO₂ Data</h3>
            <div className="co2-stats">
              <div className="stat-item">
                <span className="stat-label">Current</span>
                <span className="stat-value">{co2Data.co2.current.toFixed(2)} {co2Data.co2.unit}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Average</span>
                <span className="stat-value">{co2Data.co2.average.toFixed(2)} {co2Data.co2.unit}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Min</span>
                <span className="stat-value">{co2Data.co2.min.toFixed(2)} {co2Data.co2.unit}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Max</span>
                <span className="stat-value">{co2Data.co2.max.toFixed(2)} {co2Data.co2.unit}</span>
              </div>
            </div>
            <div className="co2-metadata">
              <p><strong>Resolution:</strong> {co2Data.metadata.resolution}</p>
              <p><strong>Data Quality:</strong> {co2Data.co2.quality}</p>
            </div>
          </div>
        )}

        {/* Pollutant Levels Chart */}
        <div className="card pollutants-chart">
          <h3>Pollutant Levels</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pollutantData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [`${value} ${pollutantData.find(p => p.name === name)?.unit}`, 'Concentration']}
                />
                <Bar 
                  dataKey="value" 
                  fill="#667eea"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weather Conditions */}
        <div className="card weather-info">
          <h3>Weather Conditions</h3>
          <div className="weather-grid">
            <div className="weather-item">
              <Thermometer className="weather-icon" />
              <div>
                <span className="weather-value">{airQualityData.weather.temperature}°C</span>
                <span className="weather-label">Temperature</span>
              </div>
            </div>
            <div className="weather-item">
              <Droplets className="weather-icon" />
              <div>
                <span className="weather-value">{airQualityData.weather.humidity}%</span>
                <span className="weather-label">Humidity</span>
              </div>
            </div>
            <div className="weather-item">
              <Wind className="weather-icon" />
              <div>
                <span className="weather-value">{airQualityData.weather.windSpeed} km/h</span>
                <span className="weather-label">Wind Speed</span>
              </div>
            </div>
            <div className="weather-item">
              <Eye className="weather-icon" />
              <div>
                <span className="weather-value">{airQualityData.weather.visibility} km</span>
                <span className="weather-label">Visibility</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pollutant Details */}
        <div className="card pollutants-details">
          <h3>Pollutant Details</h3>
          <div className="pollutants-list">
            {pollutantData.map((pollutant) => (
              <div key={pollutant.name} className="pollutant-item">
                <div className="pollutant-header">
                  <span className="pollutant-name">{pollutant.name}</span>
                  <span className="pollutant-value">
                    {pollutant.value} {pollutant.unit}
                  </span>
                </div>
                <div className="pollutant-bar">
                  <div 
                    className="pollutant-progress"
                    style={{ 
                      width: `${Math.min((pollutant.value / pollutant.limit) * 100, 100)}%`,
                      backgroundColor: pollutant.value > pollutant.limit ? '#f44336' : '#4CAF50'
                    }}
                  />
                </div>
                <span className="pollutant-limit">Limite: {pollutant.limit} {pollutant.unit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico Histórico */}
        <HistoricalChart location={selectedLocation} />

        {/* Informações do Dataset */}
        <DatasetInfo />

        {/* Recomendações */}
        <div className="card recommendations">
          <h3>Recomendações</h3>
          <div className="recommendations-list">
            {currentStatus.status === 'good' && (
              <>
                <div className="recommendation-item good">
                  <CheckCircle size={20} />
                  <span>Ideal para atividades ao ar livre</span>
                </div>
                <div className="recommendation-item good">
                  <CheckCircle size={20} />
                  <span>Janelas podem permanecer abertas</span>
                </div>
              </>
            )}
            {currentStatus.status === 'moderate' && (
              <>
                <div className="recommendation-item moderate">
                  <AlertTriangle size={20} />
                  <span>Grupos sensíveis devem considerar reduzir atividades prolongadas ao ar livre</span>
                </div>
                <div className="recommendation-item moderate">
                  <AlertTriangle size={20} />
                  <span>Use purificador de ar em ambientes fechados</span>
                </div>
              </>
            )}
            {(currentStatus.status === 'unhealthy' || currentStatus.status === 'very-unhealthy') && (
              <>
                <div className="recommendation-item unhealthy">
                  <XCircle size={20} />
                  <span>Evite atividades ao ar livre</span>
                </div>
                <div className="recommendation-item unhealthy">
                  <XCircle size={20} />
                  <span>Mantenha janelas fechadas</span>
                </div>
                <div className="recommendation-item unhealthy">
                  <XCircle size={20} />
                  <span>Use máscara ao sair</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;