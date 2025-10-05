import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Container,
  Alert,
  useTheme
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Map as MapIcon,
  TrendingUp,
  Analytics,
  Satellite,
  HealthAndSafety
} from '@mui/icons-material';

// Importar componentes das abas
import TelaPrincipal from './TelaPrincipal';
import MapaInterativo from './MapaInterativo';
import AirQualityForecast from './PrevisaoQualidadeAr';
import ValidationScreen from './TelaValidacao';
import AlertasSaude from './AlertasSaude';
import CitySearchBar from './CitySearchBar';

// Utilitário para carregar dados CSV
import { loadCSVData } from '../../utils/csvLoader';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `dashboard-tab-${index}`,
    'aria-controls': `dashboard-tabpanel-${index}`,
  };
}

const TabsDashboard = () => {
  const theme = useTheme();
  const [value, setValue] = useState(0);
  const [csvData, setCsvData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCity, setSelectedCity] = useState('New York');

  // Carregar dados CSV na inicialização
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await loadCSVData();
        setCsvData(data);
      } catch (err) {
        console.error('Erro ao carregar dados CSV:', err);
        setError('Erro ao carregar dados do CSV');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleCityChange = (newCity) => {
    setSelectedCity(newCity);
    // Here you could add logic to reload data for the new city
    console.log('City changed to:', newCity);
  };

  // Dashboard tabs definition with English labels
  const tabs = [
    {
      label: 'Dashboard',
      icon: <DashboardIcon />,
      component: TelaPrincipal
    },
    {
      label: 'Interactive Map',
      icon: <MapIcon />,
      component: MapaInterativo
    },
    {
      label: 'Air Quality Forecast',
      icon: <TrendingUp />,
      component: AirQualityForecast
    },
    {
      label: 'Validation Screen (Satellite vs. Ground)',
      icon: <Satellite />,
      component: ValidationScreen
    }
  ];

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading data...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      py: 2
    }}>
      <Box sx={{ 
        width: '100%', 
        maxWidth: '1400px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {/* Alertas de Saúde - Banner no topo */}
        <Box sx={{ width: '100%', mb: 2 }}>
          <AlertasSaude csvData={csvData} />
        </Box>
        
        {/* City Search Bar - Above function tabs */}
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Box sx={{ width: '100%', maxWidth: '800px' }}>
            <CitySearchBar 
              selectedCity={selectedCity}
              onCityChange={handleCityChange}
            />
          </Box>
        </Box>
        
        {/* Navegação por abas */}
        <Box sx={{ 
          width: '100%', 
          borderBottom: 1, 
          borderColor: 'divider', 
          mb: 2,
          display: 'flex',
          justifyContent: 'center'
        }}>
          <Tabs
            value={value}
            onChange={handleChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="Dashboard tabs"
            sx={{
              '& .MuiTab-root': {
                minHeight: 72,
                textTransform: 'none',
                fontSize: '0.9rem',
                fontWeight: 500,
              }
            }}
          >
            {tabs.map((tab, index) => (
              <Tab
                key={index}
                icon={tab.icon}
                label={tab.label}
                {...a11yProps(index)}
                sx={{
                  '& .MuiTab-iconWrapper': {
                    marginBottom: 1
                  }
                }}
              />
            ))}
          </Tabs>
        </Box>

        {/* Conteúdo das abas */}
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          {tabs.map((tab, index) => {
            const Component = tab.component;
            return (
              <TabPanel key={index} value={value} index={index}>
                <Box sx={{ 
                  width: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  px: { xs: 1, sm: 2 }
                }}>
                  <Component csvData={csvData} />
                </Box>
              </TabPanel>
            );
          })}
        </Box>
      </Box>
    </Container>
  );
};

export default TabsDashboard;