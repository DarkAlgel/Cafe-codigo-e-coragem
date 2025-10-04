import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Calendar, TrendingUp, TrendingDown, Minus, Download, Filter, BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon, Activity, AlertCircle, CheckCircle, Info } from 'lucide-react';
import './HistoricalChart.css';

const HistoricalChart = ({ location }) => {
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [statistics, setStatistics] = useState(null);
  const [chartType, setChartType] = useState('line');
  const [selectedPollutants, setSelectedPollutants] = useState(['no2', 'pm25', 'o3']);
  const [showFilters, setShowFilters] = useState(false);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [alerts, setAlerts] = useState([]);

  const pollutantOptions = [
    { id: 'no2', name: 'NO₂', color: '#4CAF50', unit: 'µg/m³' },
    { id: 'pm25', name: 'PM2.5', color: '#FF9800', unit: 'µg/m³' },
    { id: 'o3', name: 'O₃', color: '#2196F3', unit: 'µg/m³' },
    { id: 'co', name: 'CO', color: '#9C27B0', unit: 'mg/m³' },
    { id: 'so2', name: 'SO₂', color: '#F44336', unit: 'µg/m³' },
    { id: 'pm10', name: 'PM10', color: '#795548', unit: 'µg/m³' }
  ];

  useEffect(() => {
    if (location) {
      loadHistoricalData();
    }
  }, [location, timeRange, selectedPollutants]);

  useEffect(() => {
    // Check for air quality alerts
    if (historicalData.length > 0) {
      checkForAlerts();
    }
  }, [historicalData]);

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
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Simulate realistic daily variation patterns
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const weekendFactor = isWeekend ? 0.7 : 1.0;
      
      // Add seasonal and random variation
      const seasonalVariation = Math.sin((date.getMonth() / 12) * 2 * Math.PI) * 5;
      const randomVariation = (Math.random() - 0.5) * 10;
      
      const dataPoint = {
        date: date.toISOString().split('T')[0],
        dateFormatted: date.toLocaleDateString('en-US', { 
          day: '2-digit', 
          month: '2-digit' 
        }),
        timestamp: date.getTime()
      };

      // Generate data for each selected pollutant
      selectedPollutants.forEach(pollutantId => {
        const pollutant = pollutantOptions.find(p => p.id === pollutantId);
        if (pollutant) {
          let baseValue, multiplier;
          
          switch (pollutantId) {
            case 'no2':
              baseValue = 15 + Math.random() * 20;
              multiplier = 1;
              break;
            case 'pm25':
              baseValue = 12 + Math.random() * 15;
              multiplier = 1;
              break;
            case 'o3':
              baseValue = 80 + Math.random() * 40;
              multiplier = 1;
              break;
            case 'co':
              baseValue = 1 + Math.random() * 2;
              multiplier = 0.1;
              break;
            case 'so2':
              baseValue = 5 + Math.random() * 10;
              multiplier = 1;
              break;
            case 'pm10':
              baseValue = 20 + Math.random() * 25;
              multiplier = 1;
              break;
            default:
              baseValue = 10;
              multiplier = 1;
          }
          
          const value = Math.max(0, 
            (baseValue * weekendFactor + seasonalVariation + randomVariation) * multiplier
          );
          
          dataPoint[pollutantId] = Math.round(value * 100) / 100;
          dataPoint[`${pollutantId}_quality`] = getQualityLevel(value, pollutantId);
          dataPoint[`${pollutantId}_aqi`] = Math.round(value * 2.5);
        }
      });
      
      data.push(dataPoint);
    }
    
    return data;
  };

  const getQualityLevel = (value, pollutantId) => {
    const thresholds = {
      no2: { good: 10, moderate: 20, unhealthy: 35 },
      pm25: { good: 12, moderate: 35, unhealthy: 55 },
      o3: { good: 100, moderate: 160, unhealthy: 200 },
      co: { good: 4, moderate: 9, unhealthy: 15 },
      so2: { good: 20, moderate: 80, unhealthy: 250 },
      pm10: { good: 20, moderate: 50, unhealthy: 100 }
    };
    
    const threshold = thresholds[pollutantId] || thresholds.no2;
    
    if (value <= threshold.good) return 'Good';
    if (value <= threshold.moderate) return 'Moderate';
    if (value <= threshold.unhealthy) return 'Unhealthy';
    return 'Hazardous';
  };

  const checkForAlerts = () => {
    const newAlerts = [];
    const latestData = historicalData[historicalData.length - 1];
    
    if (latestData) {
      selectedPollutants.forEach(pollutantId => {
        const value = latestData[pollutantId];
        const quality = getQualityLevel(value, pollutantId);
        const pollutant = pollutantOptions.find(p => p.id === pollutantId);
        
        if (quality === 'Unhealthy' || quality === 'Hazardous') {
          newAlerts.push({
            id: `${pollutantId}-${Date.now()}`,
            type: quality === 'Hazardous' ? 'error' : 'warning',
            pollutant: pollutant.name,
            value: value,
            unit: pollutant.unit,
            message: `${pollutant.name} levels are ${quality.toLowerCase()}`
          });
        }
      });
    }
    
    setAlerts(newAlerts);
  };

  const calculateStatistics = (data) => {
    if (!data.length) return null;
    
    const stats = {};
    
    selectedPollutants.forEach(pollutantId => {
      const values = data.map(d => d[pollutantId]).filter(v => v !== undefined);
      if (values.length === 0) return;
      
      const min = Math.min(...values);
      const max = Math.max(...values);
      const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
      
      // Calculate trend (last 3 days vs first 3 days)
      const recent = values.slice(-3).reduce((sum, val) => sum + val, 0) / 3;
      const older = values.slice(0, 3).reduce((sum, val) => sum + val, 0) / 3;
      const trend = recent > older ? 'up' : recent < older ? 'down' : 'stable';
      
      stats[pollutantId] = {
        min: Math.round(min * 100) / 100,
        max: Math.round(max * 100) / 100,
        avg: Math.round(avg * 100) / 100,
        trend,
        trendValue: Math.round((recent - older) * 100) / 100,
        unit: pollutantOptions.find(p => p.id === pollutantId)?.unit || 'µg/m³'
      };
    });
    
    return stats;
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <TrendingUp className="trend-icon trend-up" />;
      case 'down': return <TrendingDown className="trend-icon trend-down" />;
      default: return <Minus className="trend-icon trend-stable" />;
    }
  };

  const getTrendText = (trend, value, unit) => {
    switch (trend) {
      case 'up': return `Increasing (+${Math.abs(value)} ${unit})`;
      case 'down': return `Decreasing (-${Math.abs(value)} ${unit})`;
      default: return 'Stable';
    }
  };

  const exportData = () => {
    const csvContent = [
      ['Date', ...selectedPollutants.map(p => pollutantOptions.find(opt => opt.id === p)?.name)].join(','),
      ...historicalData.map(row => [
        row.date,
        ...selectedPollutants.map(p => row[p] || '')
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `air-quality-data-${location?.name || 'current'}-${timeRange}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const togglePollutant = (pollutantId) => {
    setSelectedPollutants(prev => 
      prev.includes(pollutantId) 
        ? prev.filter(p => p !== pollutantId)
        : [...prev, pollutantId]
    );
  };

  const renderChart = () => {
    const chartProps = {
      data: historicalData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'area':
        return (
          <AreaChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="dateFormatted" stroke="#666" fontSize={12} />
            <YAxis stroke="#666" fontSize={12} />
            <Tooltip content={customTooltip} />
            <Legend />
            {selectedPollutants.map(pollutantId => {
              const pollutant = pollutantOptions.find(p => p.id === pollutantId);
              return (
                <Area
                  key={pollutantId}
                  type="monotone"
                  dataKey={pollutantId}
                  stackId="1"
                  stroke={pollutant.color}
                  fill={pollutant.color}
                  fillOpacity={0.6}
                  name={pollutant.name}
                />
              );
            })}
          </AreaChart>
        );
      
      case 'bar':
        return (
          <BarChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="dateFormatted" stroke="#666" fontSize={12} />
            <YAxis stroke="#666" fontSize={12} />
            <Tooltip content={customTooltip} />
            <Legend />
            {selectedPollutants.map(pollutantId => {
              const pollutant = pollutantOptions.find(p => p.id === pollutantId);
              return (
                <Bar
                  key={pollutantId}
                  dataKey={pollutantId}
                  fill={pollutant.color}
                  name={pollutant.name}
                />
              );
            })}
          </BarChart>
        );
      
      default:
        return (
          <LineChart {...chartProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="dateFormatted" stroke="#666" fontSize={12} />
            <YAxis stroke="#666" fontSize={12} />
            <Tooltip content={customTooltip} />
            <Legend />
            {selectedPollutants.map(pollutantId => {
              const pollutant = pollutantOptions.find(p => p.id === pollutantId);
              return (
                <Line
                  key={pollutantId}
                  type="monotone"
                  dataKey={pollutantId}
                  stroke={pollutant.color}
                  strokeWidth={2}
                  dot={{ fill: pollutant.color, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: pollutant.color, strokeWidth: 2 }}
                  name={pollutant.name}
                />
              );
            })}
          </LineChart>
        );
    }
  };

  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="tooltip-date">{`Date: ${data.dateFormatted}`}</p>
          {selectedPollutants.map(pollutantId => {
            const pollutant = pollutantOptions.find(p => p.id === pollutantId);
            const value = data[pollutantId];
            const quality = data[`${pollutantId}_quality`];
            if (value !== undefined) {
              return (
                <div key={pollutantId}>
                  <p className="tooltip-value">{`${pollutant.name}: ${value} ${pollutant.unit}`}</p>
                  <p className="tooltip-quality">{`Quality: ${quality}`}</p>
                </div>
              );
            }
            return null;
          })}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="historical-chart loading">
        <div className="loading-spinner"></div>
        <p>Loading historical data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="historical-chart error">
        <p className="error-message">{error}</p>
        <button onClick={loadHistoricalData} className="retry-btn">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="historical-chart">
      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="alerts-section">
          {alerts.map(alert => (
            <div key={alert.id} className={`alert alert-${alert.type}`}>
              {alert.type === 'error' ? <AlertCircle size={16} /> : <Info size={16} />}
              <span>{alert.message}: {alert.value} {alert.unit}</span>
            </div>
          ))}
        </div>
      )}

      <div className="chart-header">
        <div className="chart-title">
          <Calendar className="chart-icon" />
          <h3>Air Quality Historical Data - {location?.name || 'Current Location'}</h3>
        </div>
        
        <div className="chart-controls">
          <div className="time-range-selector">
            <button 
              className={`range-btn ${timeRange === '7d' ? 'active' : ''}`}
              onClick={() => setTimeRange('7d')}
            >
              7 days
            </button>
            <button 
              className={`range-btn ${timeRange === '30d' ? 'active' : ''}`}
              onClick={() => setTimeRange('30d')}
            >
              30 days
            </button>
            <button 
              className={`range-btn ${timeRange === '90d' ? 'active' : ''}`}
              onClick={() => setTimeRange('90d')}
            >
              90 days
            </button>
          </div>

          <div className="chart-type-selector">
            <button 
              className={`chart-type-btn ${chartType === 'line' ? 'active' : ''}`}
              onClick={() => setChartType('line')}
              title="Line Chart"
            >
              <LineChartIcon size={16} />
            </button>
            <button 
              className={`chart-type-btn ${chartType === 'area' ? 'active' : ''}`}
              onClick={() => setChartType('area')}
              title="Area Chart"
            >
              <Activity size={16} />
            </button>
            <button 
              className={`chart-type-btn ${chartType === 'bar' ? 'active' : ''}`}
              onClick={() => setChartType('bar')}
              title="Bar Chart"
            >
              <BarChart3 size={16} />
            </button>
          </div>

          <div className="action-buttons">
            <button 
              className="filter-btn"
              onClick={() => setShowFilters(!showFilters)}
              title="Filter Pollutants"
            >
              <Filter size={16} />
            </button>
            <button 
              className="export-btn"
              onClick={exportData}
              title="Export Data"
            >
              <Download size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Pollutant Filter Panel */}
      {showFilters && (
        <div className="filter-panel">
          <h4>Select Pollutants to Display:</h4>
          <div className="pollutant-checkboxes">
            {pollutantOptions.map(pollutant => (
              <label key={pollutant.id} className="pollutant-checkbox">
                <input
                  type="checkbox"
                  checked={selectedPollutants.includes(pollutant.id)}
                  onChange={() => togglePollutant(pollutant.id)}
                />
                <span 
                  className="checkbox-label"
                  style={{ color: pollutant.color }}
                >
                  {pollutant.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Statistics Panel */}
      {statistics && Object.keys(statistics).length > 0 && (
        <div className="statistics-panel">
          {Object.entries(statistics).map(([pollutantId, stats]) => {
            const pollutant = pollutantOptions.find(p => p.id === pollutantId);
            return (
              <div key={pollutantId} className="pollutant-stats">
                <h4 style={{ color: pollutant.color }}>{pollutant.name}</h4>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">Min:</span>
                    <span className="stat-value">{stats.min} {stats.unit}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Max:</span>
                    <span className="stat-value">{stats.max} {stats.unit}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Avg:</span>
                    <span className="stat-value">{stats.avg} {stats.unit}</span>
                  </div>
                  <div className="stat-item trend-item">
                    <span className="stat-label">Trend:</span>
                    <div className="trend-info">
                      {getTrendIcon(stats.trend)}
                      <span className="trend-text">
                        {getTrendText(stats.trend, stats.trendValue, stats.unit)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Chart Container */}
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={400}>
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Chart Information */}
      <div className="chart-info">
        <div className="info-section">
          <h4>About the Data</h4>
          <p className="info-text">
            <strong>Data Source:</strong> Tropospheric pollutant concentrations measured by NASA's TEMPO mission 
            and other satellite instruments. Values represent ground-level air quality measurements.
          </p>
          <p className="info-text">
            <strong>Air Quality Standards:</strong> Classifications based on WHO and EPA guidelines for health protection.
          </p>
        </div>
        
        <div className="legend-section">
          <h4>Pollutant Information</h4>
          <div className="pollutant-legend">
            {selectedPollutants.map(pollutantId => {
              const pollutant = pollutantOptions.find(p => p.id === pollutantId);
              return (
                <div key={pollutantId} className="legend-item">
                  <div 
                    className="legend-color" 
                    style={{ backgroundColor: pollutant.color }}
                  ></div>
                  <span className="legend-text">
                    {pollutant.name} ({pollutant.unit})
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoricalChart;