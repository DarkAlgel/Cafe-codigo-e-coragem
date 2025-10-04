import React, { useState, useEffect } from 'react';
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Eye, 
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
      co: 8
    },
    weather: {
      temperature: 24,
      humidity: 65,
      windSpeed: 12,
      visibility: 8
    }
  });

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
    { name: 'O₃', value: airQualityData.pollutants.o3, limit: 100, unit: 'µg/m³' },
    { name: 'NO₂', value: airQualityData.pollutants.no2, limit: 40, unit: 'µg/m³' },
    { name: 'SO₂', value: airQualityData.pollutants.so2, limit: 20, unit: 'µg/m³' },
    { name: 'CO', value: airQualityData.pollutants.co, limit: 10, unit: 'mg/m³' }
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
        <p>Real-Time Air Quality Monitoring</p>
        <p className="location">{airQualityData.location}</p>
        <p className="last-updated">Last updated: {airQualityData.lastUpdated}</p>
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
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
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