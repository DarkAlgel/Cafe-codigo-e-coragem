import React, { useState, useEffect, useCallback } from 'react';
import {
  Grid,
  Box,
  Typography,
  Alert,
  Snackbar,
  useTheme,
  useMediaQuery,
  Fab,
  Zoom,
  Divider
} from '@mui/material';
import { Refresh, Science, Air } from '@mui/icons-material';
import AirQualityCard from '../components/Dashboard/AirQualityCard';
import PredictionChart from '../components/Dashboard/PredictionChart';
import MapView from '../components/Dashboard/MapView';
import HealthRecommendations from '../components/Dashboard/HealthRecommendations';
import LocationInput from '../components/Location/LocationInput';
import AtmosphericComposition from '../components/AtmosphericData/AtmosphericComposition';
import OpenAQData from '../components/AirQuality/OpenAQData';
import { airQualityService, predictionsService, healthService } from '../services/api';
import { DEFAULT_LOCATION } from '../services/externalApis';

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Estados para dados
  const [currentAirQuality, setCurrentAirQuality] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [mapData, setMapData] = useState([]);
  const [healthRecommendations, setHealthRecommendations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  
  // Estados para localização e dados atmosféricos
  const [currentLocation, setCurrentLocation] = useState(DEFAULT_LOCATION);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  
  // Estados de controle
  const [loading, setLoading] = useState({
    airQuality: true,
    predictions: true,
    map: true,
    health: true
  });
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Carregar dados iniciais
  useEffect(() => {
    loadAllData();
  }, []);

  // Atualizar dados quando a localização mudar
  useEffect(() => {
    if (currentLocation?.latitude && currentLocation?.longitude) {
      loadAllData();
    }
  }, [currentLocation]);

  const handleLocationChange = useCallback((newLocation) => {
    setCurrentLocation(newLocation);
    setNotification({
      open: true,
      message: `Localização atualizada para ${newLocation.name || `${newLocation.latitude}, ${newLocation.longitude}`}`,
      severity: 'success'
    });
    // Trigger refresh of all data components
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const loadAllData = async () => {
    try {
      await Promise.all([
        loadCurrentAirQuality(),
        loadPredictions(),
        loadMapData(),
        loadHealthRecommendations()
      ]);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados do dashboard');
    }
  };

  const loadCurrentAirQuality = async () => {
    try {
      setLoading(prev => ({ ...prev, airQuality: true }));
      
      // Dados simulados para demonstração
      const mockData = {
        aqi: 85,
        location: 'New York, USA',
        timestamp: new Date().toISOString(),
        trend: -5,
        pollutants: {
          pm25: '35 μg/m³',
          pm10: '45 μg/m³',
          o3: '120 μg/m³',
          no2: '25 μg/m³'
        }
      };
      
      setCurrentAirQuality(mockData);
    } catch (err) {
      console.error('Erro ao carregar qualidade do ar:', err);
    } finally {
      setLoading(prev => ({ ...prev, airQuality: false }));
    }
  };

  const loadPredictions = async () => {
    try {
      setLoading(prev => ({ ...prev, predictions: true }));
      
      // Dados simulados de previsão para as próximas 24 horas
      const mockPredictions = Array.from({ length: 24 }, (_, i) => {
        const baseAqi = 85;
        const variation = Math.sin(i / 4) * 20 + Math.random() * 10 - 5;
        return {
          timestamp: new Date(Date.now() + i * 60 * 60 * 1000).toISOString(),
          aqi: Math.max(0, Math.round(baseAqi + variation)),
          confidence: 0.8 + Math.random() * 0.15,
          mainPollutant: i % 3 === 0 ? 'PM2.5' : i % 3 === 1 ? 'O3' : 'PM10'
        };
      });
      
      setPredictions(mockPredictions);
    } catch (err) {
      console.error('Erro ao carregar previsões:', err);
    } finally {
      setLoading(prev => ({ ...prev, predictions: false }));
    }
  };

  const loadMapData = async () => {
    try {
      setLoading(prev => ({ ...prev, map: true }));
      
      // Dados simulados de estações de monitoramento
      const mockMapData = [
        {
          id: 1,
          name: 'Centro - São Paulo',
          lat: -23.5505,
          lng: -46.6333,
          aqi: 95,
          mainPollutant: 'PM2.5',
          lastUpdate: new Date().toISOString()
        },
        {
          id: 2,
          name: 'Vila Madalena',
          lat: -23.5489,
          lng: -46.6388,
          aqi: 78,
          mainPollutant: 'O3',
          lastUpdate: new Date().toISOString()
        },
        {
          id: 3,
          name: 'Ibirapuera',
          lat: -23.5873,
          lng: -46.6573,
          aqi: 65,
          mainPollutant: 'PM10',
          lastUpdate: new Date().toISOString()
        },
        {
          id: 4,
          name: 'Paulista',
          lat: -23.5629,
          lng: -46.6544,
          aqi: 110,
          mainPollutant: 'NO2',
          lastUpdate: new Date().toISOString()
        }
      ];
      
      setMapData(mockMapData);
      setSelectedLocation(mockMapData[0]); // Selecionar primeira localização por padrão
    } catch (err) {
      console.error('Erro ao carregar dados do mapa:', err);
    } finally {
      setLoading(prev => ({ ...prev, map: false }));
    }
  };

  const loadHealthRecommendations = async () => {
    try {
      setLoading(prev => ({ ...prev, health: true }));
      
      // Dados simulados de recomendações baseadas no IQA atual
      const mockRecommendations = [
        {
          id: 1,
          type: 'warning',
          severity: 'medium',
          title: 'Evite exercícios ao ar livre',
          description: 'Com IQA de 85, recomenda-se evitar atividades físicas intensas ao ar livre.',
          riskGroup: 'athletes',
          tips: [
            'Prefira exercícios em ambientes fechados',
            'Se necessário sair, use máscara PFF2',
            'Evite horários de pico de poluição (7h-9h e 17h-19h)'
          ]
        },
        {
          id: 2,
          type: 'mask',
          severity: 'medium',
          title: 'Use proteção respiratória',
          description: 'Grupos sensíveis devem usar máscaras ao sair.',
          riskGroup: 'respiratory',
          tips: [
            'Use máscaras N95 ou PFF2',
            'Troque a máscara a cada 4 horas',
            'Mantenha janelas fechadas em casa'
          ]
        },
        {
          id: 3,
          type: 'time',
          severity: 'low',
          title: 'Limite o tempo ao ar livre',
          description: 'Crianças devem ter tempo limitado de brincadeiras externas.',
          riskGroup: 'children',
          tips: [
            'Máximo 2 horas de atividades externas',
            'Prefira parques com mais vegetação',
            'Observe sinais de irritação nos olhos ou garganta'
          ]
        }
      ];
      
      setHealthRecommendations(mockRecommendations);
    } catch (err) {
      console.error('Erro ao carregar recomendações:', err);
    } finally {
      setLoading(prev => ({ ...prev, health: false }));
    }
  };

  const handleRefresh = async () => {
    setLastUpdate(new Date());
    setRefreshTrigger(prev => prev + 1);
    setNotification({
      open: true,
      message: 'Atualizando todos os dados...',
      severity: 'info'
    });
    await loadAllData();
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
  };

  const handleCloseError = () => {
    setError(null);
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header com seleção de localização */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard de Qualidade do Ar
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Última atualização: {lastUpdate.toLocaleTimeString()}
        </Typography>
        
        {/* Componente de seleção de localização */}
        <LocationInput 
          onLocationChange={handleLocationChange}
          currentLocation={currentLocation}
        />
      </Box>

      <Divider sx={{ mb: 3 }} />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Primeira linha - Dados principais */}
        <Grid item xs={12} md={6}>
          <AirQualityCard 
            data={currentAirQuality} 
            loading={loading.airQuality}
            location={currentLocation}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <PredictionChart 
            data={predictions} 
            loading={loading.predictions}
            location={currentLocation}
          />
        </Grid>

        {/* Segunda linha - Dados atmosféricos */}
        <Grid item xs={12} md={6}>
          <Box sx={{ 
            p: 2, 
            border: '1px solid', 
            borderColor: 'divider', 
            borderRadius: 2,
            bgcolor: 'background.paper'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Science sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">
                Composição Atmosférica
              </Typography>
            </Box>
            <AtmosphericComposition 
              location={currentLocation}
              refreshTrigger={refreshTrigger}
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box sx={{ 
            p: 2, 
            border: '1px solid', 
            borderColor: 'divider', 
            borderRadius: 2,
            bgcolor: 'background.paper'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Air sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">
                Dados OpenAQ
              </Typography>
            </Box>
            <OpenAQData 
              location={currentLocation}
              refreshTrigger={refreshTrigger}
            />
          </Box>
        </Grid>

        {/* Terceira linha - Mapa e recomendações */}
        <Grid item xs={12} md={8}>
          <MapView 
            data={mapData} 
            loading={loading.map}
            selectedLocation={selectedLocation}
            onLocationSelect={setSelectedLocation}
            currentLocation={currentLocation}
          />
        </Grid>
        
        <Grid item xs={12} md={4}>
          <HealthRecommendations 
            data={healthRecommendations} 
            loading={loading.health}
            airQuality={currentAirQuality}
            location={currentLocation}
          />
        </Grid>
      </Grid>

      {/* Botão de atualização */}
      <Zoom in={!isMobile}>
        <Fab
          color="primary"
          aria-label="refresh"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
          }}
          onClick={handleRefresh}
        >
          <Refresh />
        </Fab>
      </Zoom>

      {/* Notificações */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;