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
import PrevisaoQualidadeAr from './PrevisaoQualidadeAr';
import GraficosTendencias from './GraficosTendencias';
import TelaValidacao from './TelaValidacao';
import AlertasSaude from './AlertasSaude';

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

  // Definição das abas conforme especificação
  const tabs = [
    {
      label: 'Tela Principal (Painel de Controle)',
      icon: <DashboardIcon />,
      component: TelaPrincipal
    },
    {
      label: 'Mapa Interativo',
      icon: <MapIcon />,
      component: MapaInterativo
    },
    {
      label: 'Previsão de Qualidade do Ar',
      icon: <TrendingUp />,
      component: PrevisaoQualidadeAr
    },
    {
      label: 'Gráficos de Tendências Históricas',
      icon: <Analytics />,
      component: GraficosTendencias
    },
    {
      label: 'Tela de Validação (Satélite vs. Solo)',
      icon: <Satellite />,
      component: TelaValidacao
    },
    {
      label: 'Alertas de Saúde',
      icon: <HealthAndSafety />,
      component: AlertasSaude
    }
  ];

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <Typography>Carregando dados...</Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ py: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ width: '100%' }}>
        {/* Alertas de Saúde - Banner no topo */}
        <AlertasSaude csvData={csvData} />
        
        {/* Navegação por abas */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
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
        {tabs.map((tab, index) => {
          const Component = tab.component;
          return (
            <TabPanel key={index} value={value} index={index}>
              <Component csvData={csvData} />
            </TabPanel>
          );
        })}
      </Box>
    </Container>
  );
};

export default TabsDashboard;