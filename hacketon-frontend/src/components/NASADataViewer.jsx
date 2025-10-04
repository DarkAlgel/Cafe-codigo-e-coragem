import React, { useState, useEffect } from 'react';
import { 
  Satellite, 
  Globe, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  Download,
  RefreshCw,
  MapPin,
  Calendar,
  BarChart3,
  TrendingUp,
  Wind,
  Eye,
  ExternalLink
} from 'lucide-react';
import './NASADataViewer.css';

const NASADataViewer = ({ location = { lat: 40.7128, lon: -74.0060, name: 'New York' } }) => {
  const [tempoData, setTempoData] = useState(null);
  const [selectedPollutants, setSelectedPollutants] = useState(['NO2', 'PM', 'O3']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [datasetInfo, setDatasetInfo] = useState(null);

  const pollutantOptions = [
    { id: 'NO2', name: 'Nitrogen Dioxide', color: '#ff6b6b', icon: Wind },
    { id: 'HCHO', name: 'Formaldehyde', color: '#4ecdc4', icon: Activity },
    { id: 'AI', name: 'Aerosol Index', color: '#45b7d1', icon: Eye },
    { id: 'PM', name: 'Particulate Matter', color: '#96ceb4', icon: BarChart3 },
    { id: 'O3', name: 'Ozone', color: '#feca57', icon: TrendingUp }
  ];

  useEffect(() => {
    fetchTEMPOData();
    fetchDatasetInfo();
  }, [location, selectedPollutants]);

  const fetchTEMPOData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const pollutantParams = selectedPollutants.join(',');
      const response = await fetch(
        `http://localhost:5000/api/tempo/multi?lat=${location.lat}&lon=${location.lon}&pollutants=${pollutantParams}&location=${encodeURIComponent(location.name)}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setTempoData(result.data);
        setLastUpdated(new Date().toLocaleString());
      } else {
        throw new Error(result.message || 'Failed to fetch TEMPO data');
      }
    } catch (err) {
      console.error('Error fetching TEMPO data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDatasetInfo = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/tempo/info');
      const result = await response.json();
      
      if (result.success) {
        setDatasetInfo(result.data);
      }
    } catch (err) {
      console.error('Error fetching dataset info:', err);
    }
  };

  const handlePollutantToggle = (pollutantId) => {
    setSelectedPollutants(prev => {
      if (prev.includes(pollutantId)) {
        return prev.filter(id => id !== pollutantId);
      } else {
        return [...prev, pollutantId];
      }
    });
  };

  const getQualityColor = (level) => {
    const colors = {
      good: '#00e400',
      moderate: '#ffff00',
      unhealthy_sensitive: '#ff7e00',
      unhealthy: '#ff0000',
      very_unhealthy: '#8f3f97',
      hazardous: '#7e0023'
    };
    return colors[level] || '#666';
  };

  const getQualityIcon = (level) => {
    if (level === 'good') return CheckCircle;
    if (level === 'moderate') return Info;
    return AlertTriangle;
  };

  const exportData = () => {
    if (!tempoData) return;

    const csvData = [
      ['Pollutant', 'Value', 'Unit', 'Quality', 'AQI', 'Timestamp'],
      ...Object.entries(tempoData.pollutants).map(([pollutant, data]) => [
        pollutant,
        data.value,
        data.unit,
        data.quality,
        data.aqi_equivalent,
        data.timestamp
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nasa_tempo_data_${location.name}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="nasa-data-viewer loading">
        <div className="loading-content">
          <RefreshCw className="loading-icon spinning" />
          <h3>Loading NASA TEMPO Data...</h3>
          <p>Fetching real-time air quality measurements</p>
        </div>
      </div>
    );
  }

  return (
    <div className="nasa-data-viewer">
      <div className="viewer-header">
        <div className="header-content">
          <div className="title-section">
            <Satellite className="title-icon" />
            <div>
              <h2>NASA TEMPO Air Quality Data</h2>
              <p>Real-time tropospheric pollution monitoring</p>
            </div>
          </div>
          
          <div className="header-controls">
            <button 
              className="refresh-btn"
              onClick={fetchTEMPOData}
              disabled={loading}
              title="Refresh data"
            >
              <RefreshCw className={loading ? 'spinning' : ''} />
            </button>
            
            <button 
              className="export-btn"
              onClick={exportData}
              disabled={!tempoData}
              title="Export data"
            >
              <Download />
              Export
            </button>
          </div>
        </div>

        <div className="location-info">
          <MapPin className="location-icon" />
          <span>{location.name} ({location.lat?.toFixed(4) || 'N/A'}, {location.lng?.toFixed(4) || location.lon?.toFixed(4) || 'N/A'})</span>
          {lastUpdated && (
            <>
              <Calendar className="calendar-icon" />
              <span>Updated: {lastUpdated}</span>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">
          <AlertTriangle className="error-icon" />
          <div>
            <h4>Error Loading Data</h4>
            <p>{error}</p>
          </div>
        </div>
      )}

      <div className="pollutant-selector">
        <h3>Select Pollutants</h3>
        <div className="pollutant-options">
          {pollutantOptions.map(pollutant => {
            const IconComponent = pollutant.icon;
            return (
              <button
                key={pollutant.id}
                className={`pollutant-option ${selectedPollutants.includes(pollutant.id) ? 'selected' : ''}`}
                onClick={() => handlePollutantToggle(pollutant.id)}
                style={{ '--pollutant-color': pollutant.color }}
              >
                <IconComponent className="pollutant-icon" />
                <span>{pollutant.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {tempoData && (
        <>
          <div className="overall-status">
            <div className="status-card">
              <div className="status-header">
                <Globe className="status-icon" />
                <h3>Overall Air Quality</h3>
              </div>
              <div className="status-content">
                <div 
                  className="aqi-display"
                  style={{ backgroundColor: getQualityColor(tempoData.overall_health_advisory) }}
                >
                  <span className="aqi-value">{tempoData.overall_aqi}</span>
                  <span className="aqi-label">AQI</span>
                </div>
                <div className="status-details">
                  <p className="status-level">
                    {tempoData.overall_health_advisory.replace('_', ' ').toUpperCase()}
                  </p>
                  <p className="status-description">
                    Based on {Object.keys(tempoData.pollutants).length} pollutant measurements
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pollutants-grid">
            {Object.entries(tempoData.pollutants).map(([pollutantId, data]) => {
              const pollutantInfo = pollutantOptions.find(p => p.id === pollutantId);
              const QualityIcon = getQualityIcon(data.quality);
              
              return (
                <div key={pollutantId} className="pollutant-card">
                  <div className="card-header">
                    <div className="pollutant-info">
                      {pollutantInfo && <pollutantInfo.icon className="card-icon" />}
                      <div>
                        <h4>{pollutantInfo?.name || pollutantId}</h4>
                        <p className="pollutant-id">{pollutantId}</p>
                      </div>
                    </div>
                    <div 
                      className="quality-indicator"
                      style={{ backgroundColor: getQualityColor(data.quality) }}
                    >
                      <QualityIcon className="quality-icon" />
                    </div>
                  </div>

                  <div className="measurement-display">
                    <span className="value">{data.value}</span>
                    <span className="unit">{data.unit}</span>
                  </div>

                  <div className="quality-info">
                    <p className="quality-level">
                      {data.quality.replace('_', ' ').toUpperCase()}
                    </p>
                    <p className="aqi-info">AQI Equivalent: {data.aqi_equivalent}</p>
                  </div>

                  <div className="health-advisory">
                    <h5>Health Advisory</h5>
                    <p>{data.health_advisory.message}</p>
                    {data.health_advisory.sensitive_groups && (
                      <div className="sensitive-groups">
                        <strong>Sensitive Groups:</strong>
                        <ul>
                          {data.health_advisory.sensitive_groups.map((group, index) => (
                            <li key={index}>{group}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="data-details">
                    <div className="detail-item">
                      <span className="label">Source:</span>
                      <span className="value">{data.source}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Resolution:</span>
                      <span className="value">{data.spatial_resolution}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {datasetInfo && (
            <div className="dataset-info">
              <h3>About NASA TEMPO</h3>
              <div className="info-grid">
                <div className="info-item">
                  <h4>Mission</h4>
                  <p>{datasetInfo.description}</p>
                </div>
                <div className="info-item">
                  <h4>Coverage</h4>
                  <p>{datasetInfo.spatial_coverage}</p>
                </div>
                <div className="info-item">
                  <h4>Resolution</h4>
                  <p>Spatial: {datasetInfo.spatial_resolution}</p>
                  <p>Temporal: {datasetInfo.temporal_resolution}</p>
                </div>
                <div className="info-item">
                  <h4>Data Period</h4>
                  <p>{datasetInfo.temporal_coverage}</p>
                </div>
              </div>
              
              <div className="external-links">
                <a 
                  href={datasetInfo.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="external-link"
                >
                  <ExternalLink className="link-icon" />
                  Visit TEMPO Website
                </a>
                <a 
                  href="https://earthdata.nasa.gov/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="external-link"
                >
                  <ExternalLink className="link-icon" />
                  NASA Earthdata
                </a>
              </div>

              {datasetInfo.citation && (
                <div className="citation">
                  <h4>Citation</h4>
                  <p>{datasetInfo.citation}</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NASADataViewer;