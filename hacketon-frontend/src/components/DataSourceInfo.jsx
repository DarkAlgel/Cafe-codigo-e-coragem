import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Satellite, 
  Globe, 
  Cloud, 
  Wind, 
  Thermometer,
  Eye,
  Download,
  ExternalLink,
  Info,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import './DataSourceInfo.css';

const DataSourceInfo = () => {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [authStatus, setAuthStatus] = useState(null);

  useEffect(() => {
    fetchDatasets();
    checkAuthStatus();
  }, []);

  const fetchDatasets = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/earthdata/datasets');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setDatasets(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch datasets');
      }
    } catch (err) {
      console.error('Error fetching datasets:', err);
      setError(err.message);
      // Fallback to static data from Dados.txt
      setDatasets(getStaticDataSources());
    } finally {
      setLoading(false);
    }
  };

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/earthdata/auth/status');
      const data = await response.json();
      if (data.success) {
        setAuthStatus(data.data);
      }
    } catch (err) {
      console.error('Error checking auth status:', err);
    }
  };

  const getStaticDataSources = () => {
    return {
      atmospheric: [
        {
          id: 'tempo',
          name: 'NASA TEMPO',
          description: 'Tropospheric Emissions: Monitoring of Pollution - Real-time air quality monitoring',
          temporal_coverage: '2023-present',
          spatial_resolution: '2.1 x 4.4 km',
          update_frequency: 'Hourly',
          data_format: 'NetCDF-4',
          access_url: 'https://tempo.si.edu/',
          documentation: 'https://tempo.si.edu/data-products.html'
        },
        {
          id: 'merra2',
          name: 'MERRA-2',
          description: 'Modern-Era Retrospective analysis for Research and Applications, Version 2',
          temporal_coverage: '1980-present',
          spatial_resolution: '0.5° x 0.625°',
          update_frequency: 'Daily',
          data_format: 'NetCDF-4',
          access_url: 'https://gmao.gsfc.nasa.gov/reanalysis/MERRA-2/',
          documentation: 'https://gmao.gsfc.nasa.gov/reanalysis/MERRA-2/docs/'
        }
      ],
      tools: [
        {
          id: 'worldview',
          name: 'NASA Worldview',
          description: 'Interactive interface for browsing global satellite imagery',
          access_url: 'https://worldview.earthdata.nasa.gov/',
          documentation: 'https://worldview.earthdata.nasa.gov/about'
        },
        {
          id: 'giovanni',
          name: 'Giovanni',
          description: 'Web-based application for analysis and visualization of Earth science data',
          access_url: 'https://giovanni.gsfc.nasa.gov/giovanni/',
          documentation: 'https://giovanni.gsfc.nasa.gov/giovanni/doc/'
        }
      ],
      networks: [
        {
          id: 'pandora',
          name: 'Pandora Network',
          description: 'Ground-based remote sensing network for atmospheric composition',
          access_url: 'https://www.pandonia-global-network.org/',
          documentation: 'https://www.pandonia-global-network.org/home/documents/'
        },
        {
          id: 'tolnet',
          name: 'TOLNet',
          description: 'Tropospheric Ozone Lidar Network',
          access_url: 'https://www-air.larc.nasa.gov/missions/TOLNet/',
          documentation: 'https://www-air.larc.nasa.gov/missions/TOLNet/docs/'
        },
        {
          id: 'airnow',
          name: 'AirNow',
          description: 'Real-time air quality information across the United States',
          access_url: 'https://www.airnow.gov/',
          documentation: 'https://www.airnow.gov/about-airnow/'
        },
        {
          id: 'openaq',
          name: 'OpenAQ',
          description: 'Open air quality data platform',
          access_url: 'https://openaq.org/',
          documentation: 'https://docs.openaq.org/'
        }
      ]
    };
  };

  const getCategoryIcon = (category) => {
    const icons = {
      atmospheric: <Cloud className="category-icon" />,
      climate: <Thermometer className="category-icon" />,
      earth_observation: <Satellite className="category-icon" />,
      tools: <Eye className="category-icon" />,
      networks: <Globe className="category-icon" />
    };
    return icons[category] || <Database className="category-icon" />;
  };

  const getStatusIcon = (status) => {
    if (status === 'operational') return <CheckCircle className="status-icon operational" />;
    if (status === 'maintenance') return <AlertCircle className="status-icon maintenance" />;
    return <Clock className="status-icon" />;
  };

  const categories = [
    { id: 'all', name: 'All Sources', icon: <Database /> },
    { id: 'atmospheric', name: 'Atmospheric', icon: <Cloud /> },
    { id: 'climate', name: 'Climate', icon: <Thermometer /> },
    { id: 'earth_observation', name: 'Earth Observation', icon: <Satellite /> },
    { id: 'tools', name: 'Analysis Tools', icon: <Eye /> },
    { id: 'networks', name: 'Ground Networks', icon: <Globe /> }
  ];

  const filteredDatasets = () => {
    if (selectedCategory === 'all') {
      return Object.entries(datasets).flatMap(([category, items]) => 
        items.map(item => ({ ...item, category }))
      );
    }
    return datasets[selectedCategory] || [];
  };

  if (loading) {
    return (
      <div className="data-source-info loading">
        <div className="loading-spinner"></div>
        <p>Loading NASA data sources...</p>
      </div>
    );
  }

  return (
    <div className="data-source-info">
      <div className="data-source-header">
        <div className="header-content">
          <h1>
            <Database className="header-icon" />
            NASA Data Sources & References
          </h1>
          <p className="header-description">
            Comprehensive collection of NASA datasets, tools, and ground networks for atmospheric and climate research
          </p>
        </div>
        
        {authStatus && (
          <div className={`auth-status ${authStatus.authenticated ? 'authenticated' : 'public'}`}>
            {authStatus.authenticated ? (
              <CheckCircle className="auth-icon" />
            ) : (
              <AlertCircle className="auth-icon" />
            )}
            <span>{authStatus.message}</span>
          </div>
        )}
      </div>

      <div className="category-filters">
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-filter ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.id)}
          >
            {category.icon}
            <span>{category.name}</span>
          </button>
        ))}
      </div>

      {error && (
        <div className="error-message">
          <AlertCircle className="error-icon" />
          <div>
            <strong>Error loading datasets:</strong>
            <p>{error}</p>
            <p>Showing static data sources from documentation.</p>
          </div>
        </div>
      )}

      <div className="datasets-grid">
        {filteredDatasets().map((dataset, index) => (
          <div key={dataset.id || index} className="dataset-card">
            <div className="dataset-header">
              <div className="dataset-title">
                {getCategoryIcon(dataset.category)}
                <h3>{dataset.name}</h3>
              </div>
              {dataset.status && getStatusIcon(dataset.status)}
            </div>

            <p className="dataset-description">{dataset.description}</p>

            <div className="dataset-details">
              {dataset.temporal_coverage && (
                <div className="detail-item">
                  <Clock className="detail-icon" />
                  <span>Coverage: {dataset.temporal_coverage}</span>
                </div>
              )}
              
              {dataset.spatial_resolution && (
                <div className="detail-item">
                  <Globe className="detail-icon" />
                  <span>Resolution: {dataset.spatial_resolution}</span>
                </div>
              )}
              
              {dataset.update_frequency && (
                <div className="detail-item">
                  <Wind className="detail-icon" />
                  <span>Updates: {dataset.update_frequency}</span>
                </div>
              )}
              
              {dataset.data_format && (
                <div className="detail-item">
                  <Database className="detail-icon" />
                  <span>Format: {dataset.data_format}</span>
                </div>
              )}
            </div>

            <div className="dataset-actions">
              {dataset.access_url && (
                <a 
                  href={dataset.access_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="action-button primary"
                >
                  <ExternalLink className="button-icon" />
                  Access Data
                </a>
              )}
              
              {dataset.documentation && (
                <a 
                  href={dataset.documentation} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="action-button secondary"
                >
                  <Info className="button-icon" />
                  Documentation
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="data-source-footer">
        <div className="footer-section">
          <h4>About NASA Data Integration</h4>
          <p>
            This application integrates multiple NASA data sources to provide comprehensive 
            atmospheric and climate information. Data sources include real-time satellite 
            observations, historical reanalysis datasets, and ground-based measurement networks.
          </p>
        </div>
        
        <div className="footer-section">
          <h4>Data Usage & Citation</h4>
          <p>
            NASA data is freely available for research and educational purposes. 
            Please cite appropriate datasets when using this data in publications or research.
          </p>
        </div>
        
        <div className="footer-section">
          <h4>Support & Contact</h4>
          <p>
            For technical support or questions about NASA data access, 
            visit <a href="https://earthdata.nasa.gov/support" target="_blank" rel="noopener noreferrer">
              NASA Earthdata Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DataSourceInfo;