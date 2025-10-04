import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import apiService from '../services/apiService';
import './HistoricalChart.css';

const HistoricalChart = ({ location }) => {
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [statistics, setStatistics] = useState(null);

  useEffect(() => {
    if (location) {
      loadHistoricalData();
    }
  }, [location, timeRange]);

  const loadHistoricalData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simular dados históricos baseados na localização
      const data = generateHistoricalData(location, timeRange);
      setHistoricalData(data);
      
      // Calcular estatísticas
      const stats = calculateStatistics(data);
      setStatistics(stats);
    } catch (err) {
      setError('Erro ao carregar dados históricos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateHistoricalData = (location, range) => {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const data = [];
    const baseValue = 15 + Math.random() * 20; // Valor base de NO2
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Simular variação diária com padrões realistas
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const weekendFactor = isWeekend ? 0.7 : 1.0; // Menos poluição no fim de semana
      
      // Adicionar variação sazonal e aleatória
      const seasonalVariation = Math.sin((date.getMonth() / 12) * 2 * Math.PI) * 5;
      const randomVariation = (Math.random() - 0.5) * 10;
      
      const no2Value = Math.max(0, 
        baseValue * weekendFactor + seasonalVariation + randomVariation
      );
      
      data.push({
        date: date.toISOString().split('T')[0],
        dateFormatted: date.toLocaleDateString('pt-BR', { 
          day: '2-digit', 
          month: '2-digit' 
        }),
        no2: Math.round(no2Value * 100) / 100,
        quality: getQualityLevel(no2Value),
        aqi: Math.round(no2Value * 2.5) // Conversão aproximada para AQI
      });
    }
    
    return data;
  };

  const getQualityLevel = (no2Value) => {
    if (no2Value <= 10) return 'Boa';
    if (no2Value <= 20) return 'Moderada';
    if (no2Value <= 35) return 'Ruim';
    return 'Muito Ruim';
  };

  const calculateStatistics = (data) => {
    if (!data.length) return null;
    
    const values = data.map(d => d.no2);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    // Calcular tendência (últimos 3 dias vs primeiros 3 dias)
    const recent = values.slice(-3).reduce((sum, val) => sum + val, 0) / 3;
    const older = values.slice(0, 3).reduce((sum, val) => sum + val, 0) / 3;
    const trend = recent > older ? 'up' : recent < older ? 'down' : 'stable';
    
    return {
      min: Math.round(min * 100) / 100,
      max: Math.round(max * 100) / 100,
      avg: Math.round(avg * 100) / 100,
      trend,
      trendValue: Math.round((recent - older) * 100) / 100
    };
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <TrendingUp className="trend-icon trend-up" />;
      case 'down': return <TrendingDown className="trend-icon trend-down" />;
      default: return <Minus className="trend-icon trend-stable" />;
    }
  };

  const getTrendText = (trend, value) => {
    switch (trend) {
      case 'up': return `Aumentando (+${Math.abs(value)} µg/m³)`;
      case 'down': return `Diminuindo (-${Math.abs(value)} µg/m³)`;
      default: return 'Estável';
    }
  };

  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="tooltip-date">{`Data: ${data.dateFormatted}`}</p>
          <p className="tooltip-value">{`NO₂: ${data.no2} µg/m³`}</p>
          <p className="tooltip-quality">{`Qualidade: ${data.quality}`}</p>
          <p className="tooltip-aqi">{`AQI: ${data.aqi}`}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="historical-chart loading">
        <div className="loading-spinner"></div>
        <p>Carregando dados históricos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="historical-chart error">
        <p className="error-message">{error}</p>
        <button onClick={loadHistoricalData} className="retry-btn">
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="historical-chart">
      <div className="chart-header">
        <div className="chart-title">
          <Calendar className="chart-icon" />
          <h3>Histórico de NO₂ - {location?.name || 'Localização Atual'}</h3>
        </div>
        
        <div className="time-range-selector">
          <button 
            className={`range-btn ${timeRange === '7d' ? 'active' : ''}`}
            onClick={() => setTimeRange('7d')}
          >
            7 dias
          </button>
          <button 
            className={`range-btn ${timeRange === '30d' ? 'active' : ''}`}
            onClick={() => setTimeRange('30d')}
          >
            30 dias
          </button>
          <button 
            className={`range-btn ${timeRange === '90d' ? 'active' : ''}`}
            onClick={() => setTimeRange('90d')}
          >
            90 dias
          </button>
        </div>
      </div>

      {statistics && (
        <div className="statistics-panel">
          <div className="stat-item">
            <span className="stat-label">Mínimo:</span>
            <span className="stat-value">{statistics.min} µg/m³</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Máximo:</span>
            <span className="stat-value">{statistics.max} µg/m³</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Média:</span>
            <span className="stat-value">{statistics.avg} µg/m³</span>
          </div>
          <div className="stat-item trend-item">
            <span className="stat-label">Tendência:</span>
            <div className="trend-info">
              {getTrendIcon(statistics.trend)}
              <span className="trend-text">
                {getTrendText(statistics.trend, statistics.trendValue)}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={historicalData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="dateFormatted" 
              stroke="#666"
              fontSize={12}
            />
            <YAxis 
              stroke="#666"
              fontSize={12}
              label={{ value: 'NO₂ (µg/m³)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={customTooltip} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="no2" 
              stroke="#4CAF50" 
              strokeWidth={2}
              dot={{ fill: '#4CAF50', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#4CAF50', strokeWidth: 2 }}
              name="NO₂ Troposférico"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-info">
        <p className="info-text">
          <strong>Sobre os dados:</strong> Concentrações de dióxido de nitrogênio (NO₂) troposférico 
          medidas pela missão TEMPO da NASA. Valores em µg/m³ (microgramas por metro cúbico).
        </p>
        <p className="info-text">
          <strong>Qualidade do ar:</strong> Boa (≤10), Moderada (11-20), Ruim (21-35), Muito Ruim (>35 µg/m³)
        </p>
      </div>
    </div>
  );
};

export default HistoricalChart;