import React, { useMemo, useState, useEffect } from 'react';
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
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Paper,
  Divider,
  useMediaQuery
} from '@mui/material';
import { 
  LocationOn, 
  Close, 
  Thermostat, 
  ZoomIn, 
  ZoomOut, 
  MyLocation,
  Visibility,
  VisibilityOff,
  FilterList,
  Layers,
  TuneRounded,
  AirRounded,
  WaterDropRounded
} from '@mui/icons-material';
import { getTodayDataForCity, getAQICategory } from '../../utils/csvLoader';
import MapImage from '../../assets/data/Map.png';

const MapaInterativo = ({ csvData }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Estados principais
  const [selectedCity, setSelectedCity] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [mapCenter, setMapCenter] = useState({ x: 0, y: 0 });
  const [showLabels, setShowLabels] = useState(true);

  // Estados para filtros dinâmicos
  const [filters, setFilters] = useState({
    aqiRange: [0, 500],
    temperatureRange: [-10, 50],
    showGood: true,
    showModerate: true,
    showUnhealthy: true,
    showHazardous: true,
    showTemperature: true,
    showPM25: true,
    layerOpacity: 0.8
  });
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Cidades filtradas baseadas nos filtros ativos
  const filteredCities = useMemo(() => {
    const newYork = getTodayDataForCity(csvData, 'Nova Iorque') || 
                    getTodayDataForCity(csvData, 'New York');
    const sedona = getTodayDataForCity(csvData, 'Sedona');

    const cityData = [
      {
        name: 'Manhattan',
        displayName: 'Manhattan',
        data: newYork,
        coordinates: { lat: 40.7831, lng: -73.9712 },
        position: { top: '38%', left: '58%' },
        type: 'major',
        aqi: newYork?.AQI_Final || 121
      },
      {
        name: 'Brooklyn',
        displayName: 'Brooklyn',
        data: newYork,
        coordinates: { lat: 40.6782, lng: -73.9442 },
        position: { top: '45%', left: '60%' },
        type: 'district',
        aqi: newYork?.AQI_Final || 96
      },
      {
        name: 'Queens',
        displayName: 'Queens',
        data: newYork,
        coordinates: { lat: 40.7282, lng: -73.7949 },
        position: { top: '40%', left: '65%' },
        type: 'district',
        aqi: newYork?.AQI_Final || 84
      },
      {
        name: 'Bronx',
        displayName: 'Bronx',
        data: newYork,
        coordinates: { lat: 40.8448, lng: -73.8648 },
        position: { top: '32%', left: '60%' },
        type: 'district',
        aqi: newYork?.AQI_Final || 89
      },
      {
        name: 'Staten Island',
        displayName: 'Staten Island',
        data: newYork,
        coordinates: { lat: 40.5795, lng: -74.1502 },
        position: { top: '52%', left: '52%' },
        type: 'district',
        aqi: newYork?.AQI_Final || 77
      },
      {
        name: 'Jersey City',
        displayName: 'Jersey City',
        data: newYork,
        coordinates: { lat: 40.7178, lng: -74.0431 },
        position: { top: '42%', left: '55%' },
        type: 'reference',
        aqi: newYork?.AQI_Final || 101
      },
      {
        name: 'Newark',
        displayName: 'Newark',
        data: newYork,
        coordinates: { lat: 40.7357, lng: -74.1724 },
        position: { top: '40%', left: '50%' },
        type: 'reference',
        aqi: newYork?.AQI_Final || 102
      },
      {
        name: 'Long Island',
        displayName: 'Long Island',
        data: newYork,
        coordinates: { lat: 40.7891, lng: -73.1350 },
        position: { top: '43%', left: '70%' },
        type: 'reference',
        aqi: newYork?.AQI_Final || 80
      },
      {
        name: 'Yonkers',
        displayName: 'Yonkers',
        data: newYork,
        coordinates: { lat: 40.9312, lng: -73.8988 },
        position: { top: '35%', left: '62%' },
        type: 'reference',
        aqi: newYork?.AQI_Final || 94
      }
    ];

    // Aplicar filtros
    return cityData.filter(city => {
      if (!city.data && !city.aqi) return false;
      
      const aqi = city.aqi || city.data?.AQI_Final || 0;
      const { category } = getAQICategory(aqi);
      
      // Filtro por faixa de AQI
      if (aqi < filters.aqiRange[0] || aqi > filters.aqiRange[1]) return false;
      
      // Filtro por categoria
      switch (category) {
        case 'Good':
          return filters.showGood;
        case 'Moderate':
          return filters.showModerate;
        case 'Unhealthy for Sensitive Groups':
        case 'Unhealthy':
          return filters.showUnhealthy;
        case 'Very Unhealthy':
        case 'Hazardous':
          return filters.showHazardous;
        default:
          return true;
      }
    });
  }, [csvData, filters]);

  // Funções de controle
  const handleCityClick = (city) => {
    setSelectedCity(city);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedCity(null);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 3));
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

  const toggleFilters = () => {
    setFiltersOpen(prev => !prev);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  // Componente CityPin
  const CityPin = ({ city }) => {
    const aqi = city.aqi || city.data?.AQI_Final || '0';
    const { color, category } = getAQICategory(aqi);
    
    const pinSize = city.type === 'major' ? 50 : city.type === 'district' ? 40 : 32;

    return (
      <Box
        sx={{
          position: 'absolute',
          top: city.position.top,
          left: city.position.left,
          transform: `translate(-50%, -50%) scale(${zoomLevel})`,
          cursor: 'pointer',
          zIndex: city.type === 'major' ? 5 : city.type === 'district' ? 4 : 3,
          '&:hover': {
            transform: `translate(-50%, -50%) scale(${zoomLevel * 1.15})`,
            zIndex: 10
          },
          transition: 'all 0.3s ease'
        }}
        onClick={() => handleCityClick(city)}
      >
        <Tooltip 
          title={
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {city.name}
              </Typography>
              <Typography variant="body2">
                AQI: {aqi} - {category}
              </Typography>
              {city.data?.Temperature && (
                <Typography variant="body2">
                  Temp: {city.data.Temperature}°C
                </Typography>
              )}
            </Box>
          } 
          arrow 
          placement="top"
        >
          <Box
            sx={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              animation: 'pulse 2s infinite'
            }}
          >
            {/* Pin principal */}
            <Box
              sx={{
                width: pinSize,
                height: pinSize,
                borderRadius: '50%',
                backgroundColor: color,
                border: '3px solid white',
                boxShadow: `0 4px 12px rgba(0,0,0,0.3), 0 0 0 4px ${color}40`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -8,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 0,
                  height: 0,
                  borderLeft: '8px solid transparent',
                  borderRight: '8px solid transparent',
                  borderTop: `12px solid ${color}`,
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                }
              }}
            >
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'white', 
                  fontWeight: 700,
                  fontSize: city.type === 'major' ? '0.8rem' : '0.7rem',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                }}
              >
                {aqi}
              </Typography>
            </Box>

            {/* Label da cidade */}
            {showLabels && (
              <Typography
                variant="caption"
                sx={{
                  mt: 2,
                  px: 1,
                  py: 0.5,
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  borderRadius: 1,
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: 'text.primary',
                  boxShadow: 1,
                  whiteSpace: 'nowrap'
                }}
              >
                {city.displayName}
              </Typography>
            )}
          </Box>
        </Tooltip>
      </Box>
    );
  };

  // Componente de filtros dinâmicos
  const FilterPanel = () => (
    <Paper
      sx={{
        position: 'absolute',
        top: 16,
        right: filtersOpen ? 16 : -320,
        width: 320,
        maxHeight: '80vh',
        overflow: 'auto',
        zIndex: 15,
        transition: 'right 0.3s ease',
        backgroundColor: 'rgba(255,255,255,0.98)',
        backdropFilter: 'blur(10px)',
        border: `1px solid ${theme.palette.divider}`
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TuneRounded />
            Filtros Avançados
          </Typography>
          <IconButton size="small" onClick={toggleFilters}>
            <Close />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Filtro de faixa AQI */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AirRounded fontSize="small" />
            Faixa de AQI
          </Typography>
          <Slider
            value={filters.aqiRange}
            onChange={(_, value) => handleFilterChange('aqiRange', value)}
            valueLabelDisplay="auto"
            min={0}
            max={500}
            step={10}
            marks={[
              { value: 0, label: '0' },
              { value: 50, label: '50' },
              { value: 100, label: '100' },
              { value: 150, label: '150' },
              { value: 200, label: '200' },
              { value: 500, label: '500' }
            ]}
            sx={{ mt: 2 }}
          />
          <Typography variant="caption" color="text.secondary">
            Mostrando AQI entre {filters.aqiRange[0]} e {filters.aqiRange[1]}
          </Typography>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Filtros por categoria */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Categorias de Qualidade do Ar
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={filters.showGood}
                  onChange={(e) => handleFilterChange('showGood', e.target.checked)}
                  size="small"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#4CAF50' }} />
                  Bom (0-50)
                </Box>
              }
            />
            <FormControlLabel
              control={
                <Switch
                  checked={filters.showModerate}
                  onChange={(e) => handleFilterChange('showModerate', e.target.checked)}
                  size="small"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#FFEB3B' }} />
                  Moderado (51-100)
                </Box>
              }
            />
            <FormControlLabel
              control={
                <Switch
                  checked={filters.showUnhealthy}
                  onChange={(e) => handleFilterChange('showUnhealthy', e.target.checked)}
                  size="small"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#FF9800' }} />
                  Insalubre (101-200)
                </Box>
              }
            />
            <FormControlLabel
              control={
                <Switch
                  checked={filters.showHazardous}
                  onChange={(e) => handleFilterChange('showHazardous', e.target.checked)}
                  size="small"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#9C27B0' }} />
                  Perigoso (201+)
                </Box>
              }
            />
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Controles de camada */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Layers fontSize="small" />
            Controles de Camada
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom>
              Opacidade das Camadas: {Math.round(filters.layerOpacity * 100)}%
            </Typography>
            <Slider
              value={filters.layerOpacity}
              onChange={(_, value) => handleFilterChange('layerOpacity', value)}
              min={0.1}
              max={1}
              step={0.1}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
            />
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Informações dos filtros */}
        <Box sx={{ p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            <strong>{filteredCities.length}</strong> localizações visíveis com os filtros atuais
          </Typography>
        </Box>
      </Box>
    </Paper>
  );

  return (
    <Box sx={{ py: 2, width: '100%' }}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 4, fontWeight: 600 }}>
        Mapa Interativo de Qualidade do Ar - Região de Nova York
      </Typography>

      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} lg={11} xl={10}>
          <Card sx={{ 
            position: 'relative', 
            minHeight: isMobile ? 500 : 700,
            overflow: 'hidden',
            boxShadow: theme.shadows[8],
            borderRadius: 2
          }}>
            
            {/* Controles do mapa */}
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
              <Card sx={{ p: 1, backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(5px)' }}>
                <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                  Controles do Mapa
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Ampliar">
                      <IconButton size="small" onClick={handleZoomIn} disabled={zoomLevel >= 3}>
                        <ZoomIn />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Reduzir">
                      <IconButton size="small" onClick={handleZoomOut} disabled={zoomLevel <= 0.5}>
                        <ZoomOut />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Resetar Visualização">
                      <IconButton size="small" onClick={handleResetView}>
                        <MyLocation />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Tooltip title={showLabels ? "Ocultar Rótulos" : "Mostrar Rótulos"}>
                      <IconButton size="small" onClick={toggleLabels}>
                        {showLabels ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </Tooltip>
                    <Typography variant="caption">
                      Rótulos
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Tooltip title="Filtros Avançados">
                      <IconButton size="small" onClick={toggleFilters} color={filtersOpen ? 'primary' : 'default'}>
                        <FilterList />
                      </IconButton>
                    </Tooltip>
                    <Typography variant="caption">
                      Filtros
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

            {/* Painel de filtros */}
            <FilterPanel />

            <CardContent sx={{ p: 0, position: 'relative' }}>
              {/* Mapa base com imagem */}
              <Box
                sx={{
                  width: '100%',
                  height: isMobile ? 500 : 700,
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: 1,
                  transform: `scale(${zoomLevel}) translate(${mapCenter.x}px, ${mapCenter.y}px)`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.3s ease',
                  backgroundImage: `url(${MapImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              >
                {/* Overlay para melhor contraste */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.1)',
                    zIndex: 1
                  }}
                />

                {/* Pontos das cidades */}
                {filteredCities.map((city, index) => (
                  <CityPin key={`${city.name}-${index}`} city={city} />
                ))}

                {/* Legenda AQI */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 16,
                    right: 16,
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    borderRadius: 2,
                    p: 2,
                    minWidth: 220,
                    backdropFilter: 'blur(5px)',
                    zIndex: 5
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                    Índice de Qualidade do Ar (AQI)
                  </Typography>
                  {[
                    { range: '0-50', label: 'Bom', color: '#4CAF50' },
                    { range: '51-100', label: 'Moderado', color: '#FFEB3B' },
                    { range: '101-150', label: 'Insalubre p/ Sensíveis', color: '#FF9800' },
                    { range: '151-200', label: 'Insalubre', color: '#F44336' },
                    { range: '201+', label: 'Muito Insalubre', color: '#9C27B0' }
                  ].map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          backgroundColor: item.color,
                          border: '2px solid white',
                          boxShadow: 1
                        }}
                      />
                      <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                        {item.range} - {item.label}
                      </Typography>
                    </Box>
                  ))}
                  <Box sx={{ mt: 2, pt: 1, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                    <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                      Clique em qualquer localização para informações detalhadas
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog com informações detalhadas da cidade */}
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
                  {selectedCity.type === 'major' ? 'Cidade Principal' : 
                   selectedCity.type === 'district' ? 'Distrito/Bairro' : 'Localização de Referência'}
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                {/* Display principal do AQI */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ 
                    backgroundColor: `${getAQICategory(selectedCity.aqi || selectedCity.data?.AQI_Final).color}20`,
                    border: `2px solid ${getAQICategory(selectedCity.aqi || selectedCity.data?.AQI_Final).color}`,
                    textAlign: 'center'
                  }}>
                    <CardContent>
                      <Typography variant="h2" sx={{ 
                        fontWeight: 700,
                        color: getAQICategory(selectedCity.aqi || selectedCity.data?.AQI_Final).color,
                        mb: 1
                      }}>
                        {selectedCity.aqi || selectedCity.data?.AQI_Final}
                      </Typography>
                      <Typography variant="h5" sx={{ 
                        color: getAQICategory(selectedCity.aqi || selectedCity.data?.AQI_Final).color,
                        fontWeight: 600,
                        mb: 1
                      }}>
                        {getAQICategory(selectedCity.aqi || selectedCity.data?.AQI_Final).category}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Índice de Qualidade do Ar
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Informações adicionais */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Informações Detalhadas
                  </Typography>
                  <Grid container spacing={2}>
                    {selectedCity.data?.Temperatura_C && (
                      <Grid item xs={12} sm={6} md={3}>
                        <Card>
                          <CardContent sx={{ textAlign: 'center', py: 2 }}>
                            <Thermostat color="primary" sx={{ fontSize: 32, mb: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                              Temperatura
                            </Typography>
                            <Typography variant="h6">
                              {selectedCity.data.Temperatura_C}°C
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    )}

                    <Grid item xs={12} sm={6} md={3}>
                      <Card>
                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Poluente Dominante
                          </Typography>
                          <Typography variant="h6">
                            {selectedCity.data?.Poluente_Dominante || 'N/A'}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Grid>

                {/* Informações do sistema */}
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Informações do Sistema
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Data da Medição
                          </Typography>
                          <Typography variant="body1">
                            {selectedCity.data?.Data || 'Atual'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            Fonte dos Dados
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
                Fechar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default MapaInterativo;