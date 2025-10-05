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

  // Get today's data for New York
  const todayData = useMemo(() => {
    return getTodayDataForCity(csvData, 'Nova Iorque') ||
           getTodayDataForCity(csvData, 'New York') ||
           getTodayDataForCity(csvData, 'Sedona'); // Fallback
  }, [csvData]);

  if (!todayData) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          No data available for today
        </Typography>
      </Box>
    );
  }

  const aqi = todayData.AQI_Final || '0';
  const pollutant = todayData.Poluente_Dominante || 'N/A';
  const city = todayData.Cidade || 'New York';
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
              {/* Location icon */}
              <Box sx={{ mb: 2 }}>
                <LocationOn sx={{ fontSize: 32, color: color, mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  {city}
                </Typography>
              </Box>

              {/* Main AQI - Large number */}
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

              {/* AQI Category */}
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

              {/* Dominant pollutant information */}
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
                  Main pollutant today: <strong>{pollutant}</strong>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Additional information cards */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            {/* Temperature */}
            {todayData.Temperatura_C && (
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ textAlign: 'center', py: 2 }}>
                  <CardContent>
                    <Typography variant="h4" color="primary" sx={{ fontWeight: 600 }}>
                      {todayData.Temperatura_C}°C
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Temperature
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Precipitation */}
            {todayData.Precipitacao_mm && (
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ textAlign: 'center', py: 2 }}>
                  <CardContent>
                    <Typography variant="h4" color="primary" sx={{ fontWeight: 600 }}>
                      {todayData.Precipitacao_mm}mm
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Precipitation
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* PM2.5 Concentration */}
            {todayData['Concentracao_PM2.5_Solo'] && (
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ textAlign: 'center', py: 2 }}>
                  <CardContent>
                    <Typography variant="h4" color="primary" sx={{ fontWeight: 600 }}>
                      {parseFloat(todayData['Concentracao_PM2.5_Solo']) || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      PM2.5 μg/m³
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Date */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: 'center', py: 2 }}>
                <CardContent>
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                    {todayData.Data || 'Today'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Reference Date
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