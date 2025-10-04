import React, { useState, useEffect } from 'react';
import { MapPin, Search, Navigation } from 'lucide-react';
import apiService from '../services/apiService';
import './LocationSelector.css';

const LocationSelector = ({ onLocationChange, currentLocation }) => {
  const [exampleLocations, setExampleLocations] = useState([]);
  const [customLocation, setCustomLocation] = useState({ lat: '', lon: '', name: '' });
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadExampleLocations();
  }, []);

  const loadExampleLocations = async () => {
    try {
      const response = await apiService.getTempoExampleLocations();
      if (response.success && response.data) {
        setExampleLocations(response.data);
      }
    } catch (error) {
      console.error('Error loading example locations:', error);
    }
  };

  const handleLocationSelect = (location) => {
    onLocationChange(location);
    setIsOpen(false);
  };

  const handleCustomLocationSubmit = (e) => {
    e.preventDefault();
    if (customLocation.lat && customLocation.lon) {
      const location = {
        lat: parseFloat(customLocation.lat),
        lon: parseFloat(customLocation.lon),
        name: customLocation.name || `${customLocation.lat}, ${customLocation.lon}`
      };
      handleLocationSelect(location);
      setCustomLocation({ lat: '', lon: '', name: '' });
    }
  };

  const getCurrentLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            name: `Current Location (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`
          };
          handleLocationSelect(location);
          setLoading(false);
        },
        (error) => {
          console.error('Error getting current location:', error);
          alert('Não foi possível obter sua localização atual');
          setLoading(false);
        }
      );
    } else {
      alert('Geolocalização não é suportada pelo seu navegador');
      setLoading(false);
    }
  };

  return (
    <div className="location-selector">
      <button 
        className="location-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="Selecionar localização"
      >
        <MapPin className="location-icon" />
        <span className="location-text">{currentLocation.name}</span>
        <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="location-dropdown">
          <div className="location-section">
            <h4>Localização Atual</h4>
            <button 
              className="current-location-btn"
              onClick={getCurrentLocation}
              disabled={loading}
            >
              <Navigation className="nav-icon" />
              {loading ? 'Obtendo localização...' : 'Usar minha localização'}
            </button>
          </div>

          <div className="location-section">
            <h4>Localizações de Exemplo</h4>
            <div className="example-locations">
              {exampleLocations.map((location, index) => (
                <button
                  key={index}
                  className="location-option"
                  onClick={() => handleLocationSelect({
                    lat: location.coordinates.lat,
                    lon: location.coordinates.lon,
                    name: location.name
                  })}
                >
                  <MapPin className="location-pin" />
                  <div className="location-details">
                    <span className="location-name">{location.name}</span>
                    <span className="location-coords">
                      {location.coordinates.lat.toFixed(4)}, {location.coordinates.lon.toFixed(4)}
                    </span>
                    <span className="location-description">{location.description}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="location-section">
            <h4>Coordenadas Personalizadas</h4>
            <form onSubmit={handleCustomLocationSubmit} className="custom-location-form">
              <div className="form-row">
                <input
                  type="number"
                  step="any"
                  placeholder="Latitude"
                  value={customLocation.lat}
                  onChange={(e) => setCustomLocation(prev => ({ ...prev, lat: e.target.value }))}
                  className="coord-input"
                />
                <input
                  type="number"
                  step="any"
                  placeholder="Longitude"
                  value={customLocation.lon}
                  onChange={(e) => setCustomLocation(prev => ({ ...prev, lon: e.target.value }))}
                  className="coord-input"
                />
              </div>
              <input
                type="text"
                placeholder="Nome da localização (opcional)"
                value={customLocation.name}
                onChange={(e) => setCustomLocation(prev => ({ ...prev, name: e.target.value }))}
                className="name-input"
              />
              <button type="submit" className="submit-btn">
                <Search className="search-icon" />
                Buscar Dados
              </button>
            </form>
          </div>

          <div className="location-info">
            <p><strong>Cobertura TEMPO:</strong> América do Norte (15°N-70°N, 140°W-40°W)</p>
            <p><strong>Resolução:</strong> 2.1 km × 4.4 km</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;