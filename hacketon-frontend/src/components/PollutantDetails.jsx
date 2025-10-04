import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TrendingUp, TrendingDown, Wind, Eye, Thermometer, Droplets, Sun, Cloud } from 'lucide-react';

const PollutantDetails = () => {
  const [searchParams] = useSearchParams();
  const locationId = searchParams.get('location') || '1';
  const [pollutantData, setPollutantData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPollutant, setSelectedPollutant] = useState('pm25');

  // Mock pollutant data
  const mockPollutantData = {
    location: 'New York Downtown',
    coordinates: { lat: 40.7128, lng: -74.0060 },
    lastUpdated: new Date().toISOString(),
    aqi: 85,
    status: 'moderate',
    pollutants: {
      pm25: {
        name: 'PM2.5',
        value: 35.2,
        unit: 'μg/m³',
        limit: 25,
        trend: 'up',
        description: 'Fine particulate matter with diameter less than 2.5 micrometers',
        healthEffects: [
          'Can penetrate deep into lungs and bloodstream',
          'May cause respiratory and cardiovascular problems',
          'Particularly harmful to children and elderly'
        ],
        sources: ['Vehicle emissions', 'Industrial processes', 'Wildfires', 'Construction dust']
      },
      pm10: {
        name: 'PM10',
        value: 52.8,
        unit: 'μg/m³',
        limit: 50,
        trend: 'stable',
        description: 'Particulate matter with diameter less than 10 micrometers',
        healthEffects: [
          'Can irritate eyes, nose, and throat',
          'May worsen asthma and lung diseases',
          'Can cause coughing and difficulty breathing'
        ],
        sources: ['Road dust', 'Construction', 'Agriculture', 'Natural sources']
      },
      no2: {
        name: 'NO₂',
        value: 42.1,
        unit: 'μg/m³',
        limit: 40,
        trend: 'down',
        description: 'Nitrogen dioxide, a reactive gas',
        healthEffects: [
          'Can irritate airways and worsen asthma',
          'May reduce lung function',
          'Increases risk of respiratory infections'
        ],
        sources: ['Vehicle emissions', 'Power plants', 'Industrial facilities']
      },
      o3: {
        name: 'O₃',
        value: 78.5,
        unit: 'μg/m³',
        limit: 120,
        trend: 'up',
        description: 'Ground-level ozone, a secondary pollutant',
        healthEffects: [
          'Can cause chest pain and throat irritation',
          'May worsen bronchitis and emphysema',
          'Can reduce lung function'
        ],
        sources: ['Formed by reaction of NOx and VOCs in sunlight']
      },
      co: {
        name: 'CO',
        value: 1.2,
        unit: 'mg/m³',
        limit: 10,
        trend: 'stable',
        description: 'Carbon monoxide, a colorless and odorless gas',
        healthEffects: [
          'Can reduce oxygen delivery to organs',
          'May cause headaches and dizziness',
          'Can be fatal in high concentrations'
        ],
        sources: ['Vehicle emissions', 'Industrial processes', 'Residential heating']
      },
      so2: {
        name: 'SO₂',
        value: 15.3,
        unit: 'μg/m³',
        limit: 20,
        trend: 'down',
        description: 'Sulfur dioxide, a reactive gas',
        healthEffects: [
          'Can irritate nose, throat, and airways',
          'May cause coughing and shortness of breath',
          'Can worsen asthma symptoms'
        ],
        sources: ['Power plants', 'Industrial facilities', 'Ships and vehicles']
      }
    }
  };

  // Mock weather data
  const mockWeatherData = {
    temperature: 24,
    humidity: 68,
    windSpeed: 12,
    windDirection: 'NE',
    pressure: 1013,
    visibility: 8.5,
    uvIndex: 6,
    conditions: 'Partly Cloudy',
    forecast: [
      { time: '12:00', temp: 26, condition: 'sunny' },
      { time: '15:00', temp: 28, condition: 'partly-cloudy' },
      { time: '18:00', temp: 25, condition: 'cloudy' },
      { time: '21:00', temp: 22, condition: 'clear' }
    ]
  };

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPollutantData(mockPollutantData);
      setWeatherData(mockWeatherData);
      setLoading(false);
    }, 1000);
  }, [locationId]);

  const getPollutantColor = (value, limit) => {
    const ratio = value / limit;
    if (ratio <= 0.5) return '#4CAF50'; // Good
    if (ratio <= 1.0) return '#FF9800'; // Moderate
    if (ratio <= 1.5) return '#f44336'; // Unhealthy
    return '#9C27B0'; // Very Unhealthy
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <TrendingUp className="trend-icon up" />;
      case 'down': return <TrendingDown className="trend-icon down" />;
      default: return <div className="trend-icon stable">—</div>;
    }
  };

  const getWeatherIcon = (condition) => {
    switch (condition) {
      case 'sunny': return <Sun className="weather-icon" />;
      case 'partly-cloudy': return <Cloud className="weather-icon" />;
      case 'cloudy': return <Cloud className="weather-icon" />;
      default: return <Sun className="weather-icon" />;
    }
  };

  if (loading) {
    return (
      <div className="pollutant-details">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading detailed air quality data...</p>
        </div>
      </div>
    );
  }

  const currentPollutant = pollutantData.pollutants[selectedPollutant];

  const getStatusColor = (status) => {
    switch (status) {
      case 'good': return '#4CAF50';
      case 'moderate': return '#FF9800';
      case 'unhealthy': return '#f44336';
      default: return '#666';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'good': return 'Good';
      case 'moderate': return 'Moderate';
      case 'unhealthy': return 'Unhealthy';
      default: return 'Unknown';
    }
  };

  return (
    <div className="pollutant-details">
      <div className="details-header">
        <div className="location-info">
          <h1>{pollutantData.location}</h1>
          <p className="coordinates">
            {pollutantData.coordinates.lat.toFixed(4)}, {pollutantData.coordinates.lng.toFixed(4)}
          </p>
          <p className="last-updated">
            Last updated: {new Date(pollutantData.lastUpdated).toLocaleString()}
          </p>
        </div>
        
        <div className="overall-aqi">
          <div className="aqi-circle-large" style={{ borderColor: getPollutantColor(pollutantData.aqi, 100) }}>
            <span className="aqi-value-large">{pollutantData.aqi}</span>
            <span className="aqi-label">AQI</span>
          </div>
          <div className="aqi-status" style={{ color: getPollutantColor(pollutantData.aqi, 100) }}>
            {pollutantData.status.toUpperCase()}
          </div>
        </div>
      </div>

      <div className="content-grid">
        {/* Pollutant Selection */}
        <div className="pollutant-selector">
          <h3>Select Pollutant</h3>
          <div className="pollutant-tabs">
            {Object.entries(pollutantData.pollutants).map(([key, pollutant]) => (
              <button
                key={key}
                className={`pollutant-tab ${selectedPollutant === key ? 'active' : ''}`}
                onClick={() => setSelectedPollutant(key)}
                style={{
                  borderColor: selectedPollutant === key ? getPollutantColor(pollutant.value, pollutant.limit) : '#ddd'
                }}
              >
                <div className="tab-name">{pollutant.name}</div>
                <div className="tab-value" style={{ color: getPollutantColor(pollutant.value, pollutant.limit) }}>
                  {pollutant.value} {pollutant.unit}
                </div>
                {getTrendIcon(pollutant.trend)}
              </button>
            ))}
          </div>
        </div>

        {/* Current Pollutant Details */}
        <div className="current-pollutant">
          <div className="pollutant-header">
            <h3>{currentPollutant.name} Details</h3>
            <div className="pollutant-status">
              <span className="current-value" style={{ color: getPollutantColor(currentPollutant.value, currentPollutant.limit) }}>
                {currentPollutant.value} {currentPollutant.unit}
              </span>
              <span className="limit-info">Limit: {currentPollutant.limit} {currentPollutant.unit}</span>
            </div>
          </div>

          <div className="pollutant-gauge">
            <div className="gauge-container">
              <div className="gauge-bar">
                <div 
                  className="gauge-fill"
                  style={{ 
                    width: `${Math.min((currentPollutant.value / currentPollutant.limit) * 100, 100)}%`,
                    backgroundColor: getPollutantColor(currentPollutant.value, currentPollutant.limit)
                  }}
                ></div>
              </div>
              <div className="gauge-labels">
                <span>0</span>
                <span>{currentPollutant.limit}</span>
                <span>{currentPollutant.limit * 2}</span>
              </div>
            </div>
          </div>

          <div className="pollutant-description">
            <p>{currentPollutant.description}</p>
          </div>

          <div className="health-effects">
            <h4>Health Effects</h4>
            <ul>
              {currentPollutant.healthEffects.map((effect, index) => (
                <li key={index}>{effect}</li>
              ))}
            </ul>
          </div>

          <div className="pollution-sources">
            <h4>Main Sources</h4>
            <div className="sources-list">
              {currentPollutant.sources.map((source, index) => (
                <span key={index} className="source-tag">{source}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Weather Conditions */}
        <div className="weather-conditions">
          <h3>Current Weather Conditions</h3>
          <div className="weather-grid">
            <div className="weather-item">
              <Thermometer className="weather-icon" />
              <div className="weather-info">
                <span className="weather-value">{weatherData.temperature}°C</span>
                <span className="weather-label">Temperature</span>
              </div>
            </div>
            
            <div className="weather-item">
              <Droplets className="weather-icon" />
              <div className="weather-info">
                <span className="weather-value">{weatherData.humidity}%</span>
                <span className="weather-label">Humidity</span>
              </div>
            </div>
            
            <div className="weather-item">
              <Wind className="weather-icon" />
              <div className="weather-info">
                <span className="weather-value">{weatherData.windSpeed} km/h</span>
                <span className="weather-label">Wind Speed</span>
              </div>
            </div>
            
            <div className="weather-item">
              <Eye className="weather-icon" />
              <div className="weather-info">
                <span className="weather-value">{weatherData.visibility} km</span>
                <span className="weather-label">Visibility</span>
              </div>
            </div>
          </div>

          <div className="weather-forecast">
            <h4>Today's Forecast</h4>
            <div className="forecast-items">
              {weatherData.forecast.map((item, index) => (
                <div key={index} className="forecast-item">
                  <span className="forecast-time">{item.time}</span>
                  {getWeatherIcon(item.condition)}
                  <span className="forecast-temp">{item.temp}°C</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Health Recommendations */}
        <div className="health-recommendations">
          <h3>Health Recommendations</h3>
          <div className="recommendations-content">
            {pollutantData.aqi <= 50 && (
              <div className="recommendation good">
                <h4>Good Air Quality</h4>
                <p>Air quality is satisfactory. Enjoy outdoor activities!</p>
                <ul>
                  <li>Perfect time for outdoor exercise</li>
                  <li>Open windows for fresh air</li>
                  <li>Great conditions for all age groups</li>
                </ul>
              </div>
            )}
            
            {pollutantData.aqi > 50 && pollutantData.aqi <= 100 && (
              <div className="recommendation moderate">
                <h4>Moderate Air Quality</h4>
                <p>Air quality is acceptable for most people. Sensitive individuals should be cautious.</p>
                <ul>
                  <li>Sensitive people should limit prolonged outdoor exertion</li>
                  <li>Consider indoor activities during peak hours</li>
                  <li>Monitor symptoms if you have respiratory conditions</li>
                </ul>
              </div>
            )}
            
            {pollutantData.aqi > 100 && (
              <div className="recommendation unhealthy">
                <h4>Unhealthy Air Quality</h4>
                <p>Everyone should limit outdoor activities, especially prolonged exertion.</p>
                <ul>
                  <li>Avoid outdoor exercise</li>
                  <li>Keep windows closed</li>
                  <li>Use air purifiers if available</li>
                  <li>Wear masks when going outside</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button className="btn btn-primary" onClick={() => {
          window.location.href = `/alert-settings?location=${locationId}`;
        }}>
          Set Up Alerts
        </button>
        <button className="btn btn-secondary" onClick={() => {
          window.location.href = `/historical-chart?location=${locationId}`;
        }}>
          View Historical Data
        </button>
        <button className="btn btn-secondary" onClick={() => {
          window.location.href = `/health-tips`;
        }}>
          Health Tips
        </button>
      </div>
    </div>
  );
};

export default PollutantDetails;