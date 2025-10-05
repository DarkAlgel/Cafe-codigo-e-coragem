import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  useTheme
} from '@mui/material';
import { 
  MyLocation, 
  Refresh, 
  ZoomIn, 
  ZoomOut,
  LocationOn 
} from '@mui/icons-material';

const MapView = ({ 
  data = [], 
  loading = false, 
  error = null,
  onLocationSelect,
  selectedLocation = null,
  height = 400,
  showControls = true
}) => {
  const theme = useTheme();
  const [mapCenter, setMapCenter] = useState({ lat: -23.5505, lng: -46.6333 }); // São Paulo
  const [zoom, setZoom] = useState(10);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    // Simular obtenção da localização do usuário
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn('Erro ao obter localização:', error);
        }
      );
    }
  }, []);

  const getAQIColor = (aqi) => {
    if (aqi <= 50) return '#4CAF50';
    if (aqi <= 100) return '#FFEB3B';
    if (aqi <= 150) return '#FF9800';
    if (aqi <= 200) return '#F44336';
    if (aqi <= 300) return '#9C27B0';
    return '#8D6E63';
  };

  const handleLocationClick = (location) => {
    if (onLocationSelect) {
      onLocationSelect(location);
    }
    setMapCenter({ lat: location.lat, lng: location.lng });
  };

  const handleMyLocation = () => {
    if (userLocation) {
      setMapCenter(userLocation);
      setZoom(12);
    }
  };

  const handleRefresh = () => {
    // Trigger refresh of data
    window.location.reload();
  };

  if (loading) {
    return (
      <Card sx={{ height: height + 100 }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ height: height + 100 }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Typography color="error">Erro ao carregar mapa</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Mapa Interativo
          </Typography>
          
          {showControls && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Minha localização">
                <IconButton onClick={handleMyLocation} size="small">
                  <MyLocation />
                </IconButton>
              </Tooltip>
              <Tooltip title="Atualizar">
                <IconButton onClick={handleRefresh} size="small">
                  <Refresh />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>

        {/* Simulação de mapa com pontos de monitoramento */}
        <Box
          sx={{
            width: '100%',
            height,
            backgroundColor: '#f0f8ff',
            borderRadius: 2,
            position: 'relative',
            overflow: 'hidden',
            border: '2px solid #e0e0e0',
            backgroundImage: `
              radial-gradient(circle at 20% 30%, rgba(76, 175, 80, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(33, 150, 243, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 60% 20%, rgba(255, 152, 0, 0.1) 0%, transparent 50%)
            `
          }}
        >
          {/* Pontos de monitoramento simulados */}
          {data.map((location, index) => (
            <Box
              key={location.id || index}
              sx={{
                position: 'absolute',
                left: `${20 + (index * 15) % 60}%`,
                top: `${30 + (index * 20) % 40}%`,
                cursor: 'pointer',
                transform: 'translate(-50%, -50%)',
                zIndex: selectedLocation?.id === location.id ? 10 : 1
              }}
              onClick={() => handleLocationClick(location)}
            >
              <Box
                sx={{
                  width: selectedLocation?.id === location.id ? 24 : 16,
                  height: selectedLocation?.id === location.id ? 24 : 16,
                  borderRadius: '50%',
                  backgroundColor: getAQIColor(location.aqi),
                  border: '2px solid white',
                  boxShadow: theme.shadows[3],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: selectedLocation?.id === location.id ? '0.7rem' : '0.6rem',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.2)',
                    boxShadow: theme.shadows[6]
                  }
                }}
              >
                {location.aqi}
              </Box>
              
              {/* Tooltip com informações */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -40,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: 'white',
                  padding: '4px 8px',
                  borderRadius: 1,
                  boxShadow: theme.shadows[2],
                  fontSize: '0.7rem',
                  whiteSpace: 'nowrap',
                  opacity: selectedLocation?.id === location.id ? 1 : 0,
                  transition: 'opacity 0.3s ease',
                  pointerEvents: 'none'
                }}
              >
                {location.name || `Ponto ${index + 1}`}
                <br />
                IQA: {location.aqi}
              </Box>
            </Box>
          ))}

          {/* Localização do usuário */}
          {userLocation && (
            <Box
              sx={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 5
              }}
            >
              <LocationOn sx={{ color: '#2196F3', fontSize: 24 }} />
            </Box>
          )}

          {/* Controles de zoom */}
          {showControls && (
            <Box
              sx={{
                position: 'absolute',
                top: 10,
                right: 10,
                display: 'flex',
                flexDirection: 'column',
                gap: 1
              }}
            >
              <IconButton
                size="small"
                sx={{ backgroundColor: 'white', '&:hover': { backgroundColor: '#f5f5f5' } }}
                onClick={() => setZoom(Math.min(zoom + 1, 18))}
              >
                <ZoomIn fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                sx={{ backgroundColor: 'white', '&:hover': { backgroundColor: '#f5f5f5' } }}
                onClick={() => setZoom(Math.max(zoom - 1, 1))}
              >
                <ZoomOut fontSize="small" />
              </IconButton>
            </Box>
          )}
        </Box>

        {/* Informações da localização selecionada */}
        {selectedLocation && (
          <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              {selectedLocation.name || 'Localização Selecionada'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label={`IQA: ${selectedLocation.aqi}`}
                size="small"
                sx={{ backgroundColor: getAQIColor(selectedLocation.aqi), color: 'white' }}
              />
              {selectedLocation.mainPollutant && (
                <Chip
                  label={`Principal: ${selectedLocation.mainPollutant}`}
                  size="small"
                  variant="outlined"
                />
              )}
              {selectedLocation.lastUpdate && (
                <Chip
                  label={`Atualizado: ${new Date(selectedLocation.lastUpdate).toLocaleTimeString('pt-BR')}`}
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
        )}

        {/* Legenda */}
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
          {[
            { range: '0-50', label: 'Boa', color: '#4CAF50' },
            { range: '51-100', label: 'Moderada', color: '#FFEB3B' },
            { range: '101-150', label: 'Insalubre', color: '#FF9800' },
            { range: '151+', label: 'Perigosa', color: '#F44336' },
          ].map((item) => (
            <Box key={item.range} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  backgroundColor: item.color,
                  borderRadius: '50%',
                  border: '1px solid white'
                }}
              />
              <Typography variant="caption" color="textSecondary">
                {item.range}
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default MapView;