import React, { useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  useTheme,
  IconButton,
  Slider,
  Tooltip
} from '@mui/material';
import { 
  LocationOn, 
  Close, 
  Thermostat, 
  ZoomIn, 
  ZoomOut, 
  MyLocation,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { getTodayDataForCity, getAQICategory } from '../../utils/csvLoader';

const MapaInterativo = ({ csvData }) => {
  const theme = useTheme();
  const [selectedCity, setSelectedCity] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [mapCenter, setMapCenter] = useState({ x: 0, y: 0 });
  const [showLabels, setShowLabels] = useState(true);

  // Enhanced city data with more New York area locations
  const cities = useMemo(() => {
    const newYork = getTodayDataForCity(csvData, 'Nova Iorque') || 
                    getTodayDataForCity(csvData, 'New York');
    const sedona = getTodayDataForCity(csvData, 'Sedona');

    return [
      {
        name: 'New York City',
        displayName: 'NYC',
        data: newYork,
        coordinates: { lat: 40.7128, lng: -74.0060 },
        position: { top: '40%', left: '60%' },
        type: 'major'
      },
      {
        name: 'Manhattan',
        displayName: 'Manhattan',
        data: newYork, // Using same data for demo
        coordinates: { lat: 40.7831, lng: -73.9712 },
        position: { top: '38%', left: '61%' },
        type: 'district'
      },
      {
        name: 'Brooklyn',
        displayName: 'Brooklyn',
        data: newYork,
        coordinates: { lat: 40.6782, lng: -73.9442 },
        position: { top: '43%', left: '63%' },
        type: 'district'
      },
      {
        name: 'Queens',
        displayName: 'Queens',
        data: newYork,
        coordinates: { lat: 40.7282, lng: -73.7949 },
        position: { top: '41%', left: '65%' },
        type: 'district'
      },
      {
        name: 'Bronx',
        displayName: 'Bronx',
        data: newYork,
        coordinates: { lat: 40.8448, lng: -73.8648 },
        position: { top: '35%', left: '62%' },
        type: 'district'
      },
      {
        name: 'Sedona',
        displayName: 'Sedona, AZ',
        data: sedona,
        coordinates: { lat: 34.8697, lng: -111.7610 },
        position: { top: '65%', left: '25%' },
        type: 'reference'
      }
    ].filter(city => city.data);
  }, [csvData]);

  const handleCityClick = (city) => {
    setSelectedCity(city);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedCity(null);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleResetView = () => {
    setZoomLevel(1);
    setMapCenter({ x: 0, y: 0 });
  };

  const toggleLabels = () => {
    setShowLabels(prev => !prev);
  };

  const CityPin = ({ city }) => {
    const aqi = city.data?.AQI_Final || '0';
    const { color } = getAQICategory(aqi);
    
    const pinSize = city.type === 'major' ? 45 : city.type === 'district' ? 35 : 30;
    const chipSize = city.type === 'major' ? 'medium' : 'small';

    return (
      <Box
        sx={{
          position: 'absolute',
          top: city.position.top,
          left: city.position.left,
          transform: `translate(-50%, -50%) scale(${zoomLevel})`,
          cursor: 'pointer',
          zIndex: city.type === 'major' ? 3 : 2,
          '&:hover': {
            transform: `translate(-50%, -50%) scale(${zoomLevel * 1.1})`,
          },
          transition: 'transform 0.2s ease'
        }}
        onClick={() => handleCityClick(city)}
      >
        <Tooltip title={`${city.name} - AQI: ${aqi}`} arrow>
          <Box
            sx={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            {/* Enhanced map pin */}
            <LocationOn
              sx={{
                fontSize: pinSize,
                color: color,
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                mb: 0.5
              }}
            />
            
            {/* City label with visibility toggle */}
            {showLabels && (
              <Chip
                label={`${city.displayName}: ${aqi}`}
                size={chipSize}
                sx={{
                  backgroundColor: color,
                  color: 'white',
                  fontWeight: 600,
                  fontSize: city.type === 'major' ? '0.8rem' : '0.7rem',
                  '& .MuiChip-label': {
                    px: 1
                  },
                  opacity: 0.9
                }}
              />
            )}
          </Box>
        </Tooltip>
      </Box>
    );
  };

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
        Interactive Air Quality Map - New York Region
      </Typography>

      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} lg={10}>
          <Card sx={{ position: 'relative', minHeight: 600 }}>
            {/* Map Controls */}
            <Box
              sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                gap: 1
              }}
            >
              <Card sx={{ p: 1, backgroundColor: 'rgba(255,255,255,0.95)' }}>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                  Map Controls
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Zoom In">
                      <IconButton size="small" onClick={handleZoomIn} disabled={zoomLevel >= 2}>
                        <ZoomIn />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Zoom Out">
                      <IconButton size="small" onClick={handleZoomOut} disabled={zoomLevel <= 0.5}>
                        <ZoomOut />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Reset View">
                      <IconButton size="small" onClick={handleResetView}>
                        <MyLocation />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Tooltip title={showLabels ? "Hide Labels" : "Show Labels"}>
                      <IconButton size="small" onClick={toggleLabels}>
                        {showLabels ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </Tooltip>
                    <Typography variant="caption">
                      Labels
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 120 }}>
                    <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                      Zoom: {zoomLevel.toFixed(1)}x
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Box>

            <CardContent sx={{ p: 0, position: 'relative' }}>
              {/* Enhanced map base focused on New York region */}
              <Box
                sx={{
                  width: '100%',
                  height: 600,
                  background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 30%, #90caf9 70%, #64b5f6 100%)',
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: 1,
                  transform: `scale(${zoomLevel}) translate(${mapCenter.x}px, ${mapCenter.y}px)`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.3s ease'
                }}
              >
                {/* New York State landmass */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: '15%',
                    left: '45%',
                    width: '35%',
                    height: '50%',
                    background: 'linear-gradient(45deg, #c8e6c9 0%, #a5d6a7 30%, #81c784 70%, #66bb6a 100%)',
                    borderRadius: '30px 20px 40px 25px',
                    opacity: 0.8,
                    transform: 'rotate(-5deg)'
                  }}
                />

                {/* Manhattan island detail */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: '35%',
                    left: '58%',
                    width: '3%',
                    height: '12%',
                    background: 'linear-gradient(0deg, #4caf50 0%, #66bb6a 100%)',
                    borderRadius: '2px',
                    opacity: 0.9,
                    transform: 'rotate(15deg)'
                  }}
                />

                {/* Long Island */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: '42%',
                    left: '62%',
                    width: '20%',
                    height: '8%',
                    background: 'linear-gradient(90deg, #81c784 0%, #a5d6a7 100%)',
                    borderRadius: '15px 5px 5px 15px',
                    opacity: 0.8
                  }}
                />

                {/* Hudson River */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: '20%',
                    left: '57%',
                    width: '2%',
                    height: '35%',
                    background: 'linear-gradient(0deg, #1976d2 0%, #42a5f5 50%, #64b5f6 100%)',
                    borderRadius: '10px',
                    opacity: 0.7,
                    transform: 'rotate(10deg)'
                  }}
                />

                {/* Atlantic Ocean */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '60%',
                    height: '40%',
                    background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 30%, #0d47a1 100%)',
                    opacity: 0.6,
                    borderRadius: '50px 0 0 0'
                  }}
                />

                {/* New Jersey */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: '30%',
                    left: '40%',
                    width: '18%',
                    height: '35%',
                    background: 'linear-gradient(45deg, #a5d6a7 0%, #c8e6c9 100%)',
                    borderRadius: '20px 10px 30px 20px',
                    opacity: 0.7,
                    transform: 'rotate(-10deg)'
                  }}
                />

                {/* City pins with enhanced positioning */}
                {cities.map((city, index) => (
                  <CityPin key={index} city={city} />
                ))}

                {/* Enhanced AQI Legend */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    borderRadius: 2,
                    p: 2,
                    minWidth: 220,
                    backdropFilter: 'blur(5px)'
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                    Air Quality Index (AQI)
                  </Typography>
                  {[
                    { range: '0-50', label: 'Good', color: '#4CAF50' },
                    { range: '51-100', label: 'Moderate', color: '#FFEB3B' },
                    { range: '101-150', label: 'Unhealthy for Sensitive', color: '#FF9800' },
                    { range: '151-200', label: 'Unhealthy', color: '#F44336' },
                    { range: '201+', label: 'Very Unhealthy', color: '#9C27B0' }
                  ].map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 0.8 }}>
                      <Box
                        sx={{
                          width: 14,
                          height: 14,
                          backgroundColor: item.color,
                          borderRadius: '50%',
                          mr: 1.5,
                          border: '1px solid rgba(0,0,0,0.1)'
                        }}
                      />
                      <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                        <strong>{item.range}:</strong> {item.label}
                      </Typography>
                    </Box>
                  ))}
                  
                  <Box sx={{ mt: 2, pt: 1, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                    <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                      Click on any location for detailed information
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Enhanced dialog with detailed city information */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedCity && (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
              <LocationOn color="primary" />
              <Box>
                <Typography variant="h6">{selectedCity.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedCity.type === 'major' ? 'Major City' : 
                   selectedCity.type === 'district' ? 'District/Borough' : 'Reference Location'}
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                {/* Main AQI Display */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ 
                    backgroundColor: `${getAQICategory(selectedCity.data.AQI_Final).color}20`,
                    border: `2px solid ${getAQICategory(selectedCity.data.AQI_Final).color}`,
                    textAlign: 'center'
                  }}>
                    <CardContent>
                      <Typography variant="h2" sx={{ 
                        fontWeight: 700,
                        color: getAQICategory(selectedCity.data.AQI_Final).color,
                        mb: 1
                      }}>
                        {selectedCity.data.AQI_Final}
                      </Typography>
                      <Typography variant="h5" sx={{ 
                        color: getAQICategory(selectedCity.data.AQI_Final).color,
                        fontWeight: 600,
                        mb: 1
                      }}>
                        {getAQICategory(selectedCity.data.AQI_Final).category}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Air Quality Index
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Coordinates and Location Info */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Location Details
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Coordinates
                          </Typography>
                          <Typography variant="body1">
                            {selectedCity.coordinates.lat.toFixed(4)}°N, {Math.abs(selectedCity.coordinates.lng).toFixed(4)}°W
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Region Type
                          </Typography>
                          <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                            {selectedCity.type === 'major' ? 'Major Metropolitan Area' : 
                             selectedCity.type === 'district' ? 'Urban District' : 'Reference Point'}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Environmental Data */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Environmental Measurements
                  </Typography>
                  <Grid container spacing={2}>
                    {selectedCity.data.Temperatura_C && (
                      <Grid item xs={12} sm={6} md={3}>
                        <Card>
                          <CardContent sx={{ textAlign: 'center' }}>
                            <Thermostat color="primary" sx={{ fontSize: 32, mb: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                              Temperature
                            </Typography>
                            <Typography variant="h6">
                              {selectedCity.data.Temperatura_C}°C
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ({(parseFloat(selectedCity.data.Temperatura_C) * 9/5 + 32).toFixed(1)}°F)
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    )}

                    <Grid item xs={12} sm={6} md={3}>
                      <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                          <Box sx={{ fontSize: 32, mb: 1, color: 'primary.main' }}>🏭</Box>
                          <Typography variant="body2" color="text.secondary">
                            Dominant Pollutant
                          </Typography>
                          <Typography variant="h6">
                            {selectedCity.data.Poluente_Dominante || 'N/A'}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>

                    {selectedCity.data.Precipitacao_mm && (
                      <Grid item xs={12} sm={6} md={3}>
                        <Card>
                          <CardContent sx={{ textAlign: 'center' }}>
                            <Box sx={{ fontSize: 32, mb: 1, color: 'primary.main' }}>🌧️</Box>
                            <Typography variant="body2" color="text.secondary">
                              Precipitation
                            </Typography>
                            <Typography variant="h6">
                              {selectedCity.data.Precipitacao_mm}mm
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ({(parseFloat(selectedCity.data.Precipitacao_mm) * 0.0394).toFixed(2)} in)
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    )}

                    {selectedCity.data['Concentracao_PM2.5_Solo'] && (
                      <Grid item xs={12} sm={6} md={3}>
                        <Card>
                          <CardContent sx={{ textAlign: 'center' }}>
                            <Box sx={{ fontSize: 32, mb: 1, color: 'warning.main' }}>⚫</Box>
                            <Typography variant="body2" color="text.secondary">
                              PM2.5 Level
                            </Typography>
                            <Typography variant="h6">
                              {parseFloat(selectedCity.data['Concentracao_PM2.5_Solo'] || 0).toFixed(1)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              μg/m³
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    )}
                  </Grid>
                </Grid>

                {/* Data Source and Timestamp */}
                <Grid item xs={12}>
                  <Card sx={{ backgroundColor: 'grey.50' }}>
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>
                        Data Information
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Measurement Date
                          </Typography>
                          <Typography variant="body1">
                            {selectedCity.data.Data || 'Current'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Data Source
                          </Typography>
                          <Typography variant="body1">
                            NASA Air Quality Monitoring
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={handleCloseDialog} startIcon={<Close />} variant="outlined">
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default MapaInterativo;