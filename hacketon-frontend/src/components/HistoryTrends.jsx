import React, { useState } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, Filter, Download, BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon, Activity, Wind, Droplets, Sun, AlertTriangle } from 'lucide-react';
import './HistoryTrends.css';

const HistoryTrends = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7days');
  const [selectedPollutant, setSelectedPollutant] = useState('aqi');
  const [chartType, setChartType] = useState('line');

  // Dados simulados para diferentes períodos
  const generateData = (period) => {
    const baseData = {
      '24hours': Array.from({ length: 24 }, (_, i) => ({
        time: `${i}:00`,
        aqi: Math.floor(Math.random() * 100) + 30,
        pm25: Math.floor(Math.random() * 50) + 10,
        pm10: Math.floor(Math.random() * 80) + 20,
        o3: Math.floor(Math.random() * 120) + 40,
        no2: Math.floor(Math.random() * 60) + 15,
        temperature: Math.floor(Math.random() * 15) + 20,
        humidity: Math.floor(Math.random() * 40) + 40
      })),
      '7days': Array.from({ length: 7 }, (_, i) => ({
        time: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][i],
        aqi: Math.floor(Math.random() * 120) + 20,
        pm25: Math.floor(Math.random() * 60) + 5,
        pm10: Math.floor(Math.random() * 100) + 15,
        o3: Math.floor(Math.random() * 150) + 30,
        no2: Math.floor(Math.random() * 80) + 10,
        temperature: Math.floor(Math.random() * 20) + 15,
        humidity: Math.floor(Math.random() * 50) + 30
      })),
      '30days': Array.from({ length: 30 }, (_, i) => ({
        time: `${i + 1}`,
        aqi: Math.floor(Math.random() * 150) + 10,
        pm25: Math.floor(Math.random() * 70) + 3,
        pm10: Math.floor(Math.random() * 120) + 10,
        o3: Math.floor(Math.random() * 180) + 20,
        no2: Math.floor(Math.random() * 100) + 5,
        temperature: Math.floor(Math.random() * 25) + 10,
        humidity: Math.floor(Math.random() * 60) + 20
      })),
      '1year': Array.from({ length: 12 }, (_, i) => ({
        time: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][i],
        aqi: Math.floor(Math.random() * 200) + 5,
        pm25: Math.floor(Math.random() * 80) + 2,
        pm10: Math.floor(Math.random() * 150) + 5,
        o3: Math.floor(Math.random() * 200) + 15,
        no2: Math.floor(Math.random() * 120) + 3,
        temperature: [15, 18, 22, 25, 28, 30, 32, 31, 28, 24, 20, 16][i] + Math.floor(Math.random() * 5),
        humidity: [70, 65, 60, 55, 50, 45, 40, 45, 55, 65, 70, 75][i] + Math.floor(Math.random() * 10)
      }))
    };
    return baseData[period] || baseData['7days'];
  };

  const data = generateData(selectedPeriod);

  const pollutantOptions = [
    { value: 'aqi', label: 'Índice AQI', color: '#667eea', unit: '' },
    { value: 'pm25', label: 'PM2.5', color: '#f44336', unit: 'μg/m³' },
    { value: 'pm10', label: 'PM10', color: '#ff9800', unit: 'μg/m³' },
    { value: 'o3', label: 'Ozônio (O3)', color: '#4caf50', unit: 'μg/m³' },
    { value: 'no2', label: 'NO2', color: '#9c27b0', unit: 'μg/m³' }
  ];

  const periodOptions = [
    { value: '24hours', label: 'Últimas 24h' },
    { value: '7days', label: 'Últimos 7 dias' },
    { value: '30days', label: 'Últimos 30 dias' },
    { value: '1year', label: 'Último ano' }
  ];

  const chartTypes = [
    { value: 'line', label: 'Linha', icon: LineChartIcon },
    { value: 'area', label: 'Área', icon: Activity },
    { value: 'bar', label: 'Barras', icon: BarChart3 }
  ];

  const getCurrentPollutant = () => {
    return pollutantOptions.find(p => p.value === selectedPollutant) || pollutantOptions[0];
  };

  const calculateTrend = () => {
    if (data.length < 2) return { direction: 'stable', percentage: 0 };
    
    const current = data[data.length - 1][selectedPollutant];
    const previous = data[data.length - 2][selectedPollutant];
    const percentage = ((current - previous) / previous * 100).toFixed(1);
    
    if (Math.abs(percentage) < 5) return { direction: 'stable', percentage: 0 };
    return { 
      direction: percentage > 0 ? 'up' : 'down', 
      percentage: Math.abs(percentage) 
    };
  };

  const trend = calculateTrend();

  const getAverageValue = () => {
    const sum = data.reduce((acc, item) => acc + item[selectedPollutant], 0);
    return (sum / data.length).toFixed(1);
  };

  const getMaxValue = () => {
    return Math.max(...data.map(item => item[selectedPollutant]));
  };

  const getMinValue = () => {
    return Math.min(...data.map(item => item[selectedPollutant]));
  };

  const getAQIColor = (value) => {
    if (value <= 50) return '#4CAF50';
    if (value <= 100) return '#FFEB3B';
    if (value <= 150) return '#FF9800';
    if (value <= 200) return '#F44336';
    if (value <= 300) return '#9C27B0';
    return '#8D6E63';
  };

  const renderChart = () => {
    const currentPollutant = getCurrentPollutant();
    
    const commonProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
            <XAxis dataKey="time" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255,255,255,0.95)', 
                border: '1px solid rgba(102,126,234,0.2)',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
              formatter={(value) => [`${value}${currentPollutant.unit}`, currentPollutant.label]}
            />
            <Area 
              type="monotone" 
              dataKey={selectedPollutant} 
              stroke={currentPollutant.color}
              fill={`${currentPollutant.color}20`}
              strokeWidth={3}
            />
          </AreaChart>
        );
      
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
            <XAxis dataKey="time" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255,255,255,0.95)', 
                border: '1px solid rgba(102,126,234,0.2)',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
              formatter={(value) => [`${value}${currentPollutant.unit}`, currentPollutant.label]}
            />
            <Bar 
              dataKey={selectedPollutant} 
              fill={currentPollutant.color}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        );
      
      default:
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
            <XAxis dataKey="time" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255,255,255,0.95)', 
                border: '1px solid rgba(102,126,234,0.2)',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
              formatter={(value) => [`${value}${currentPollutant.unit}`, currentPollutant.label]}
            />
            <Line 
              type="monotone" 
              dataKey={selectedPollutant} 
              stroke={currentPollutant.color}
              strokeWidth={3}
              dot={{ fill: currentPollutant.color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: currentPollutant.color, strokeWidth: 2 }}
            />
          </LineChart>
        );
    }
  };

  const pollutantDistribution = pollutantOptions.slice(1).map(pollutant => ({
    name: pollutant.label,
    value: getAverageValue(),
    color: pollutant.color
  }));

  const weatherData = data.slice(-7).map(item => ({
    day: item.time,
    temperature: item.temperature,
    humidity: item.humidity
  }));

  return (
    <div className="history-trends">
      <div className="container">
        <div className="page-header">
          <h1><BarChart3 className="header-icon" />Histórico e Tendências</h1>
          <p>Análise detalhada da qualidade do ar ao longo do tempo</p>
        </div>

        <div className="controls-section">
          <div className="control-group">
            <label>Período:</label>
            <select 
              value={selectedPeriod} 
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="control-select"
            >
              {periodOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label>Poluente:</label>
            <select 
              value={selectedPollutant} 
              onChange={(e) => setSelectedPollutant(e.target.value)}
              className="control-select"
            >
              {pollutantOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label>Tipo de Gráfico:</label>
            <div className="chart-type-buttons">
              {chartTypes.map(type => {
                const IconComponent = type.icon;
                return (
                  <button
                    key={type.value}
                    className={`chart-type-btn ${chartType === type.value ? 'active' : ''}`}
                    onClick={() => setChartType(type.value)}
                  >
                    <IconComponent size={16} />
                    {type.label}
                  </button>
                );
              })}
            </div>
          </div>

          <button className="export-btn">
            <Download size={16} />
            Exportar Dados
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <Activity size={24} />
            </div>
            <div className="stat-content">
              <h3>Média</h3>
              <span className="stat-value">
                {getAverageValue()}{getCurrentPollutant().unit}
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
              <h3>Máximo</h3>
              <span className="stat-value">
                {getMaxValue()}{getCurrentPollutant().unit}
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <TrendingDown size={24} />
            </div>
            <div className="stat-content">
              <h3>Mínimo</h3>
              <span className="stat-value">
                {getMinValue()}{getCurrentPollutant().unit}
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              {trend.direction === 'up' ? (
                <TrendingUp size={24} style={{ color: '#f44336' }} />
              ) : trend.direction === 'down' ? (
                <TrendingDown size={24} style={{ color: '#4caf50' }} />
              ) : (
                <Activity size={24} style={{ color: '#666' }} />
              )}
            </div>
            <div className="stat-content">
              <h3>Tendência</h3>
              <span className="stat-value">
                {trend.direction === 'stable' ? 'Estável' : `${trend.percentage}%`}
              </span>
            </div>
          </div>
        </div>

        <div className="main-chart-section">
          <div className="chart-header">
            <h2>{getCurrentPollutant().label} - {periodOptions.find(p => p.value === selectedPeriod)?.label}</h2>
            <div className="chart-legend">
              <div className="legend-item">
                <div 
                  className="legend-color" 
                  style={{ backgroundColor: getCurrentPollutant().color }}
                ></div>
                <span>{getCurrentPollutant().label}</span>
              </div>
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={400}>
              {renderChart()}
            </ResponsiveContainer>
          </div>
        </div>

        <div className="secondary-charts">
          <div className="chart-section">
            <h3><PieChartIcon size={20} />Distribuição de Poluentes</h3>
            <div className="chart-container small">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pollutantDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pollutantDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}`, 'Média']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-section">
            <h3><Sun size={20} />Condições Climáticas</h3>
            <div className="chart-container small">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weatherData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis dataKey="day" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255,255,255,0.95)', 
                      border: '1px solid rgba(102,126,234,0.2)',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="temperature" 
                    stroke="#ff9800" 
                    strokeWidth={2}
                    name="Temperatura (°C)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="humidity" 
                    stroke="#2196f3" 
                    strokeWidth={2}
                    name="Umidade (%)"
                  />
                  <Legend />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="insights-section">
          <h2><AlertTriangle size={24} />Insights e Análises</h2>
          <div className="insights-grid">
            <div className="insight-card">
              <h3>Padrões Identificados</h3>
              <ul>
                <li>Picos de poluição geralmente ocorrem entre 7h-9h e 17h-19h</li>
                <li>Finais de semana apresentam níveis 20% menores de poluição</li>
                <li>Dias chuvosos reduzem significativamente os poluentes</li>
              </ul>
            </div>
            
            <div className="insight-card">
              <h3>Correlações Climáticas</h3>
              <ul>
                <li>Alta umidade correlaciona com menor concentração de PM2.5</li>
                <li>Temperaturas elevadas aumentam a formação de ozônio</li>
                <li>Ventos fortes dispersam poluentes efetivamente</li>
              </ul>
            </div>
            
            <div className="insight-card">
              <h3>Recomendações</h3>
              <ul>
                <li>Evite exercícios ao ar livre nos horários de pico</li>
                <li>Aproveite os finais de semana para atividades externas</li>
                <li>Monitore alertas em dias de alta temperatura</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryTrends;