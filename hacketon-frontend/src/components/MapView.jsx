import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Navigation, Info, MapPin, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './MapView.css';

// Fix para ícones do Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapView = () => {
  const mapRef = useRef(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const [airQualityData, setAirQualityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userPosition, setUserPosition] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);
  
  // Nova York como centro padrão
  const mapCenter = { lat: 40.7128, lng: -74.0060 };

  // Dados das estações de monitoramento em Nova York
  const airQualityStations = [
    {
      id: 1,
      name: 'Manhattan - Times Square',
      position: [40.7580, -73.9855],
      aqi: 85,
      status: 'moderate',
      pollutants: { pm25: 35, pm10: 45, o3: 120, no2: 42 },
      lastUpdated: new Date().toLocaleString()
    },
    {
      id: 2,
      name: 'Central Park',
      position: [40.7829, -73.9654],
      aqi: 65,
      status: 'moderate',
      pollutants: { pm25: 28, pm10: 38, o3: 95, no2: 35 },
      lastUpdated: new Date().toLocaleString()
    },
    {
      id: 3,
      name: 'Brooklyn Bridge',
      position: [40.7061, -73.9969],
      aqi: 45,
      status: 'good',
      pollutants: { pm25: 18, pm10: 25, o3: 75, no2: 28 },
      lastUpdated: new Date().toLocaleString()
    },
    {
      id: 4,
      name: 'Queens - Flushing',
      position: [40.7677, -73.8331],
      aqi: 95,
      status: 'moderate',
      pollutants: { pm25: 42, pm10: 52, o3: 110, no2: 48 },
      lastUpdated: new Date().toLocaleString()
    },
    {
      id: 5,
      name: 'Bronx - Yankee Stadium',
      position: [40.8296, -73.9262],
      aqi: 75,
      status: 'moderate',
      pollutants: { pm25: 32, pm10: 40, o3: 88, no2: 38 },
      lastUpdated: new Date().toLocaleString()
    }
  ];

  const getAirQualityColor = (aqi) => {
    if (aqi <= 50) return '#4CAF50';
    if (aqi <= 100) return '#FF9800';
    if (aqi <= 150) return '#FF5722';
    if (aqi <= 200) return '#f44336';
    if (aqi <= 300) return '#9C27B0';
    return '#8B0000';
  };

  const getAirQualityLabel = (aqi) => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  };

  // Criar ícone personalizado para cada estação
  const createCustomIcon = (aqi) => {
    const color = getAirQualityColor(aqi);
    return L.divIcon({
      html: `
        <div style="
          background-color: ${color};
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 12px;
        ">
          ${aqi}
        </div>
      `,
      className: 'custom-marker',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
  };

  // Componente para marcador de localização do usuário
  const LocationMarker = ({ position, setPosition }) => {
    const map = useMapEvents({
      click() {
        map.locate();
      },
      locationfound(e) {
        setPosition(e.latlng);
        map.flyTo(e.latlng, map.getZoom());
      },
    });

    return position === null ? null : (
      <Marker position={position}>
        <Popup>Você está aqui</Popup>
      </Marker>
    );
  };

  // Integração com API real
  useEffect(() => {
    const fetchAirQualityData = async () => {
      try {
        setLoading(true);
        
        // Buscar dados de CO2
        const co2Response = await fetch('http://localhost:5000/api/co2_data');
        const co2Data = await co2Response.json();
        
        // Buscar dados de NO2
        const no2Response = await fetch('http://localhost:5000/api/tempo/data?pollutant=NO2');
        const no2Data = await no2Response.json();
        
        // Buscar dados de temperatura
        const tempResponse = await fetch('http://localhost:5000/api/airs_temperature');
        const tempData = await tempResponse.json();
        
        // Atualizar estações com dados reais
        const updatedStations = airQualityStations.map(station => ({
          ...station,
          realData: {
            co2: co2Data.data?.co2_ppm || 'N/A',
            no2: no2Data.data?.value || 'N/A',
            temperature: tempData.data?.temperature || 'N/A',
            location: co2Data.data?.location || 'Nova Iorque, NY'
          },
          lastUpdated: new Date().toLocaleString()
        }));
        
        setAirQualityData(updatedStations);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao buscar dados da API:', error);
        setLoading(false);
      }
    };

    fetchAirQualityData();
    
    // Atualizar dados a cada 30 segundos
    const interval = setInterval(fetchAirQualityData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Obter localização do usuário (opcional)
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserPosition([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.log('Erro ao obter localização:', error);
          // Usar Nova York como padrão
          setUserPosition([40.7128, -74.0060]);
        }
      );
    } else {
      setUserPosition([40.7128, -74.0060]);
    }
  }, []);

  const handleGetLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserPosition([position.coords.latitude, position.coords.longitude]);
          if (mapInstance) {
            mapInstance.flyTo([position.coords.latitude, position.coords.longitude], 13);
          }
          setLoading(false);
        },
        (error) => {
          console.log('Erro ao obter localização:', error);
          setLoading(false);
        }
      );
    }
  };

  // Controles de zoom personalizados
  const handleZoomIn = () => {
    if (mapInstance) {
      mapInstance.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstance) {
      mapInstance.zoomOut();
    }
  };

  const handleResetView = () => {
    if (mapInstance) {
      mapInstance.flyTo([mapCenter.lat, mapCenter.lng], 11);
    }
  };

  // Componente para capturar a instância do mapa
  const MapController = () => {
    const map = useMapEvents({});
    
    useEffect(() => {
      setMapInstance(map);
    }, [map]);
    
    return null;
  };

  if (loading) {
    return (
      <div className="map-loading">
        <div className="spinner"></div>
        <p>Carregando mapa...</p>
      </div>
    );
  }

  return (
    <div className="map-view">
      <div className="map-header">
        <h1>Mapa da Qualidade do Ar - Nova York</h1>
        <p>Visualize a qualidade do ar em diferentes regiões de Nova York</p>
        <div className="map-controls">
          <button className="btn btn-primary" onClick={handleGetLocation}>
            <Navigation size={20} />
            Minha Localização
          </button>
          <button className="btn btn-secondary" onClick={handleZoomIn}>
            <ZoomIn size={20} />
            Zoom In
          </button>
          <button className="btn btn-secondary" onClick={handleZoomOut}>
            <ZoomOut size={20} />
            Zoom Out
          </button>
          <button className="btn btn-secondary" onClick={handleResetView}>
            <RotateCcw size={20} />
            Resetar Vista
          </button>
        </div>
      </div>

      <div className="map-container">
        <MapContainer
          center={[mapCenter.lat, mapCenter.lng]}
          zoom={11}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <MapController />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {userPosition && (
            <LocationMarker position={userPosition} setPosition={setUserPosition} />
          )}

          {(airQualityData.length > 0 ? airQualityData : airQualityStations).map((station) => (
            <Marker
              key={station.id}
              position={station.position}
              icon={createCustomIcon(station.aqi)}
              eventHandlers={{
                click: () => setSelectedStation(station)
              }}
            >
              <Popup>
                <div className="popup-content">
                  <h3>{station.name}</h3>
                  <div className="popup-aqi">
                    <span className="aqi-value" style={{ color: getAirQualityColor(station.aqi) }}>
                      AQI: {station.aqi}
                    </span>
                    <span className="aqi-status">
                      {getAirQualityLabel(station.aqi)}
                    </span>
                  </div>
                  <div className="popup-pollutants">
                    <div>PM2.5: {station.pollutants.pm25} µg/m³</div>
                    <div>PM10: {station.pollutants.pm10} µg/m³</div>
                    <div>O₃: {station.pollutants.o3} µg/m³</div>
                    {station.pollutants.no2 && <div>NO₂: {station.pollutants.no2} µg/m³</div>}
                  </div>
                  {station.realData && (
                    <div className="popup-real-data">
                      <div>CO₂: {station.realData.co2} ppm</div>
                      <div>Temperatura: {station.realData.temperature}°C</div>
                    </div>
                  )}
                  <div className="popup-updated">
                    Atualizado: {station.lastUpdated}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Legenda */}
      <div className="map-legend card">
        <h3>
          <Info size={20} />
          Air Quality Legend
        </h3>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#4CAF50' }}></div>
            <span>Good (0-50)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#FF9800' }}></div>
            <span>Moderate (51-100)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#FF5722' }}></div>
            <span>Unhealthy for Sensitive Groups (101-150)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#f44336' }}></div>
            <span>Unhealthy (151-200)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#9C27B0' }}></div>
            <span>Very Unhealthy (201-300)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#8B0000' }}></div>
            <span>Hazardous (301+)</span>
          </div>
        </div>
      </div>

      {/* Informações da estação selecionada */}
      {selectedStation && (
        <div className="station-info card">
          <h3>
            <MapPin size={20} />
            {selectedStation.name}
          </h3>
          <div className="station-details">
            <div className="station-aqi">
              <span className="aqi-label">Air Quality Index</span>
              <span 
                className="aqi-value-large" 
                style={{ color: getAirQualityColor(selectedStation.aqi) }}
              >
                {selectedStation.aqi}
              </span>
              <span className="aqi-status-large">
                {getAirQualityLabel(selectedStation.aqi)}
              </span>
            </div>
            <div className="station-pollutants">
              <h4>Poluentes</h4>
              <div className="pollutant-grid">
                <div className="pollutant-item">
                  <span className="pollutant-name">PM2.5</span>
                  <span className="pollutant-value">{selectedStation.pollutants.pm25} µg/m³</span>
                </div>
                <div className="pollutant-item">
                  <span className="pollutant-name">PM10</span>
                  <span className="pollutant-value">{selectedStation.pollutants.pm10} µg/m³</span>
                </div>
                <div className="pollutant-item">
                  <span className="pollutant-name">NO₂</span>
                  <span className="pollutant-value">{selectedStation.pollutants.no2} µg/m³</span>
                </div>
              </div>
            </div>
            {selectedStation.realData && (
              <div className="station-real-data">
                <h4>Dados em Tempo Real</h4>
                <div className="real-data-grid">
                  <div className="real-data-item">
                    <span className="data-name">CO₂</span>
                    <span className="data-value">{selectedStation.realData.co2} ppm</span>
                  </div>
                  <div className="real-data-item">
                    <span className="data-name">Temperatura</span>
                    <span className="data-value">{selectedStation.realData.temperature}°C</span>
                  </div>
                  <div className="real-data-item">
                    <span className="data-name">Localização</span>
                    <span className="data-value">{selectedStation.realData.location}</span>
                  </div>
                </div>
              </div>
            )}
            <div className="station-updated">
              Última atualização: {selectedStation.lastUpdated}
            </div>
          </div>
          <button 
            className="btn btn-secondary"
            onClick={() => setSelectedStation(null)}
          >
            Fechar
          </button>
        </div>
      )}
    </div>
  );
};

export default MapView;