import React, { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Air, LocationOn } from '@mui/icons-material';
import { getTodayDataForCity, getAQICategory } from '../../utils/csvLoader';

const TelaPrincipal = ({ csvData }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Obter dados de "hoje" para Nova Iorque
  const todayData = useMemo(() => {
    return getTodayDataForCity(csvData, 'Nova Iorque') || 
           getTodayDataForCity(csvData, 'New York') ||
           getTodayDataForCity(csvData, 'Sedona'); // Fallback
  }, [csvData]);

  if (!todayData) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          Dados não disponíveis
        </Typography>
      </Box>
    );
  }

  const aqi = todayData.AQI_Final || '0';
  const poluente = todayData.Poluente_Dominante || 'N/A';
  const cidade = todayData.Cidade || 'Nova Iorque';
  const { category, color } = getAQICategory(aqi);

  return (
    <Box sx={{ py: 2 }}>
      <Grid container spacing={3} justifyContent="center">
        {/* Card Principal do AQI */}
        <Grid item xs={12} md={8} lg={6}>
          <Card
            sx={{
              background: `linear-gradient(135deg, ${color}20, ${color}10)`,
              border: `2px solid ${color}`,
              borderRadius: 3,
              textAlign: 'center',
              minHeight: 300,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `radial-gradient(circle at center, ${color}15, transparent 70%)`,
                zIndex: 0
              }
            }}
          >
            <CardContent sx={{ position: 'relative', zIndex: 1, py: 4 }}>
              {/* Ícone de localização */}
              <Box sx={{ mb: 2 }}>
                <LocationOn sx={{ fontSize: 32, color: color, mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  {cidade}
                </Typography>
              </Box>

              {/* AQI Principal - Número grande */}
              <Typography
                variant="h1"
                sx={{
                  fontSize: isMobile ? '4rem' : '6rem',
                  fontWeight: 700,
                  color: color,
                  lineHeight: 1,
                  mb: 1,
                  textShadow: `0 2px 4px ${color}30`
                }}
              >
                {aqi}
              </Typography>

              {/* Categoria do AQI */}
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  color: color,
                  mb: 3,
                  fontSize: isMobile ? '1.2rem' : '1.5rem'
                }}
              >
                {category}
              </Typography>

              {/* Informação do poluente dominante */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  borderRadius: 2,
                  py: 1.5,
                  px: 3,
                  mx: 'auto',
                  maxWidth: 'fit-content'
                }}
              >
                <Air sx={{ color: color }} />
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 500,
                    color: 'text.primary',
                    fontSize: isMobile ? '0.9rem' : '1rem'
                  }}
                >
                  Poluente principal hoje: <strong>{poluente}</strong>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Cards informativos adicionais */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            {/* Temperatura */}
            {todayData.Temperatura_C && (
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ textAlign: 'center', py: 2 }}>
                  <CardContent>
                    <Typography variant="h4" color="primary" sx={{ fontWeight: 600 }}>
                      {todayData.Temperatura_C}°C
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Temperatura
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Precipitação */}
            {todayData.Precipitacao_mm && (
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ textAlign: 'center', py: 2 }}>
                  <CardContent>
                    <Typography variant="h4" color="primary" sx={{ fontWeight: 600 }}>
                      {todayData.Precipitacao_mm}mm
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Precipitação
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* PM2.5 */}
            {todayData['Concentracao_PM2.5_Solo'] && (
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ textAlign: 'center', py: 2 }}>
                  <CardContent>
                    <Typography variant="h4" color="primary" sx={{ fontWeight: 600 }}>
                      {parseFloat(todayData['Concentracao_PM2.5_Solo']) || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      PM2.5 (µg/m³)
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Data */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: 'center', py: 2 }}>
                <CardContent>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                    {todayData.Data || 'Hoje'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Data de referência
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TelaPrincipal;