import React, { useState, useEffect, useRef } from 'react';

const MapView = () => {
  const mapRef = useRef(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [airQualityData, setAirQualityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState({ lat: -23.5505, lng: -46.6333 }); // São Paulo

  // Dados simulados de estações de monitoramento
  const airQualityStations = [
    {
      id: 1,
      name: 'Centro - São Paulo',
      position: [-23.5505, -46.6333],
      aqi: 85,
      status: 'moderate',
      pollutants: { pm25: 35, pm10: 45, o3: 120 },
      lastUpdated: '2024-01-15 14:30'
    },
    {
      id: 2,
      name: 'Vila Madalena',
      position: [-23.5489, -46.6917],
      aqi: 65,
      status: 'moderate',
      pollutants: { pm25: 28, pm10: 38, o3: 95 },
      lastUpdated: '2024-01-15 14:25'
    },
    {
      id: 3,
      name: 'Ibirapuera',
      position: [-23.5873, -46.6573],
      aqi: 45,
      status: 'good',
      pollutants: { pm25: 18, pm10: 25, o3: 75 },
      lastUpdated: '2024-01-15 14:35'
    },
    {
      id: 4,
      name: 'Marginal Tietê',
      position: [-23.5186, -46.6094],
      aqi: 125,
      status: 'unhealthy-sensitive',
      pollutants: { pm25: 55, pm10: 75, o3: 145 },
      lastUpdated: '2024-01-15 14:20'
    },
    {
      id: 5,
      name: 'Zona Leste',
      position: [-23.5629, -46.5477],
      aqi: 95,
      status: 'moderate',
      pollutants: { pm25: 42, pm10: 52, o3: 110 },
      lastUpdated: '2024-01-15 14:28'
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
    if (aqi <= 50) return 'Boa';
    if (aqi <= 100) return 'Moderada';
    if (aqi <= 150) return 'Insalubre para Grupos Sensíveis';
    if (aqi <= 200) return 'Insalubre';
    if (aqi <= 300) return 'Muito Insalubre';
    return 'Perigosa';
  };

  // Criar ícone personalizado para cada estação
  const createCustomIcon = (aqi) => {
    const color = getAirQualityColor(aqi);
    return divIcon({
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

  // Obter localização do usuário
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserPosition([position.coords.latitude, position.coords.longitude]);
          setLoading(false);
        },
        (error) => {
          console.log('Erro ao obter localização:', error);
          // Usar São Paulo como padrão
          setUserPosition([-23.5505, -46.6333]);
          setLoading(false);
        }
      );
    } else {
      setUserPosition([-23.5505, -46.6333]);
      setLoading(false);
    }
  }, []);

  const handleGetLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserPosition([position.coords.latitude, position.coords.longitude]);
          setLoading(false);
        },
        (error) => {
          console.log('Erro ao obter localização:', error);
          setLoading(false);
        }
      );
    }
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
        <h1>Mapa da Qualidade do Ar</h1>
        <p>Visualize a qualidade do ar em diferentes regiões</p>
        <button className="btn btn-primary" onClick={handleGetLocation}>
          <Navigation size={20} />
          Minha Localização
        </button>
      </div>

      <div className="map-container">
        <MapContainer
          center={userPosition || [-23.5505, -46.6333]}
          zoom={11}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {userPosition && (
            <LocationMarker position={userPosition} setPosition={setUserPosition} />
          )}

          {airQualityStations.map((station) => (
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
                  </div>
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
          Legenda da Qualidade do Ar
        </h3>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#4CAF50' }}></div>
            <span>Boa (0-50)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#FF9800' }}></div>
            <span>Moderada (51-100)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#FF5722' }}></div>
            <span>Insalubre para Grupos Sensíveis (101-150)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#f44336' }}></div>
            <span>Insalubre (151-200)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#9C27B0' }}></div>
            <span>Muito Insalubre (201-300)</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#8B0000' }}></div>
            <span>Perigosa (301+)</span>
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
              <span className="aqi-label">Índice de Qualidade do Ar</span>
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
                  <span className="pollutant-name">O₃</span>
                  <span className="pollutant-value">{selectedStation.pollutants.o3} µg/m³</span>
                </div>
              </div>
            </div>
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