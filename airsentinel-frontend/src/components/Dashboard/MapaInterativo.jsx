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
  useTheme
} from '@mui/material';
import { LocationOn, Close, Thermostat } from '@mui/icons-material';
import { getTodayDataForCity, getAQICategory } from '../../utils/csvLoader';

const MapaInterativo = ({ csvData }) => {
  const theme = useTheme();
  const [selectedCity, setSelectedCity] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Dados das cidades
  const cities = useMemo(() => {
    const novaIorque = getTodayDataForCity(csvData, 'Nova Iorque') || 
                      getTodayDataForCity(csvData, 'New York');
    const sedona = getTodayDataForCity(csvData, 'Sedona');

    return [
      {
        name: 'Nova Iorque',
        data: novaIorque,
        coordinates: { lat: 40.7128, lng: -74.0060 },
        position: { top: '35%', left: '25%' }
      },
      {
        name: 'Sedona',
        data: sedona,
        coordinates: { lat: 34.8697, lng: -111.7610 },
        position: { top: '45%', left: '15%' }
      }
    ].filter(city => city.data); // Filtrar apenas cidades com dados
  }, [csvData]);

  const handleCityClick = (city) => {
    setSelectedCity(city);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedCity(null);
  };

  const CityPin = ({ city }) => {
    const aqi = city.data?.AQI_Final || '0';
    const { color } = getAQICategory(aqi);

    return (
      <Box
        sx={{
          position: 'absolute',
          ...city.position,
          transform: 'translate(-50%, -50%)',
          cursor: 'pointer',
          zIndex: 2,
          '&:hover': {
            transform: 'translate(-50%, -50%) scale(1.1)',
          },
          transition: 'transform 0.2s ease'
        }}
        onClick={() => handleCityClick(city)}
      >
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          {/* Pino do mapa */}
          <LocationOn
            sx={{
              fontSize: 40,
              color: color,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
              mb: 0.5
            }}
          />
          
          {/* Label da cidade */}
          <Chip
            label={`${city.name}: ${aqi}`}
            size="small"
            sx={{
              backgroundColor: color,
              color: 'white',
              fontWeight: 600,
              fontSize: '0.75rem',
              '& .MuiChip-label': {
                px: 1
              }
            }}
          />
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
        Mapa Interativo - Qualidade do Ar
      </Typography>

      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} lg={10}>
          <Card sx={{ position: 'relative', minHeight: 500 }}>
            <CardContent sx={{ p: 0, position: 'relative' }}>
              {/* Mapa base simulado */}
              <Box
                sx={{
                  width: '100%',
                  height: 500,
                  background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%)',
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: 1
                }}
              >
                {/* Elementos decorativos do mapa */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: '20%',
                    left: '10%',
                    width: '80%',
                    height: '60%',
                    background: 'linear-gradient(45deg, #c8e6c9 0%, #a5d6a7 50%, #81c784 100%)',
                    borderRadius: '20px',
                    opacity: 0.7
                  }}
                />
                
                {/* Simulação de oceano */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: '30%',
                    background: 'linear-gradient(0deg, #1976d2 0%, #42a5f5 100%)',
                    opacity: 0.6
                  }}
                />

                {/* Pinos das cidades */}
                {cities.map((city, index) => (
                  <CityPin key={index} city={city} />
                ))}

                {/* Legenda */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    borderRadius: 2,
                    p: 2,
                    minWidth: 200
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Legenda AQI
                  </Typography>
                  {[
                    { range: '0-50', label: 'Bom', color: '#4CAF50' },
                    { range: '51-100', label: 'Moderado', color: '#FFEB3B' },
                    { range: '101-150', label: 'Insalubre p/ sensíveis', color: '#FF9800' },
                    { range: '151-200', label: 'Insalubre', color: '#F44336' },
                    { range: '201+', label: 'Muito insalubre', color: '#9C27B0' }
                  ].map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          backgroundColor: item.color,
                          borderRadius: '50%',
                          mr: 1
                        }}
                      />
                      <Typography variant="caption">
                        {item.range}: {item.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog com informações da cidade */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        {selectedCity && (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOn color="primary" />
              {selectedCity.name}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Card sx={{ 
                    backgroundColor: `${getAQICategory(selectedCity.data.AQI_Final).color}20`,
                    border: `1px solid ${getAQICategory(selectedCity.data.AQI_Final).color}`
                  }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h3" sx={{ 
                        fontWeight: 700,
                        color: getAQICategory(selectedCity.data.AQI_Final).color,
                        mb: 1
                      }}>
                        {selectedCity.data.AQI_Final}
                      </Typography>
                      <Typography variant="h6" sx={{ 
                        color: getAQICategory(selectedCity.data.AQI_Final).color,
                        fontWeight: 600
                      }}>
                        {getAQICategory(selectedCity.data.AQI_Final).category}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {selectedCity.data.Temperatura_C && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Thermostat color="primary" />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Temperatura
                        </Typography>
                        <Typography variant="h6">
                          {selectedCity.data.Temperatura_C}°C
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}

                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Poluente Dominante
                    </Typography>
                    <Typography variant="h6">
                      {selectedCity.data.Poluente_Dominante || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>

                {selectedCity.data.Precipitacao_mm && (
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Precipitação
                      </Typography>
                      <Typography variant="h6">
                        {selectedCity.data.Precipitacao_mm}mm
                      </Typography>
                    </Box>
                  </Grid>
                )}

                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Data
                    </Typography>
                    <Typography variant="h6">
                      {selectedCity.data.Data || 'Hoje'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} startIcon={<Close />}>
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