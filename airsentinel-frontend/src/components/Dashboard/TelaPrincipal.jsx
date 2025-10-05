import React, { useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  useTheme,
  useMediaQuery,
  FormControlLabel,
  Switch,
  Chip
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Air, LocationOn, Analytics, WaterDrop, Thermostat } from '@mui/icons-material';
import { getTodayDataForCity, getAQICategory, getHistoricalData } from '../../utils/csvLoader';

const TelaPrincipal = ({ csvData }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [showPrecipitation, setShowPrecipitation] = useState(false);
  const [showTemperature, setShowTemperature] = useState(false);

  // Get today's data for New York
  const todayData = useMemo(() => {
    return getTodayDataForCity(csvData, 'Nova Iorque') ||
           getTodayDataForCity(csvData, 'New York') ||
           getTodayDataForCity(csvData, 'Sedona'); // Fallback
  }, [csvData]);

  // Get historical data for the last 30 days
  const historicalData = useMemo(() => {
    const rawData = getHistoricalData(csvData, 'Nova Iorque', 30) ||
                    getHistoricalData(csvData, 'New York', 30) ||
                    getHistoricalData(csvData, 'Sedona', 30); // Fallback

    if (!rawData || rawData.length === 0) return [];

    return rawData.map((item, index) => ({
      day: `Day ${index + 1}`,
      date: item.Data || `Day ${index + 1}`,
      aqi: parseInt(item.AQI_Final) || 0,
      precipitation: parseFloat(item.Precipitacao_mm) || 0,
      temperature: parseFloat(item.Temperatura_C) || 0,
      pollutant: item.Poluente_Dominante || 'N/A',
      city: item.Cidade || 'New York'
    }));
  }, [csvData]);

  // Basic statistics for historical data
  const stats = useMemo(() => {
    if (!historicalData || historicalData.length === 0) return null;
    
    const aqiValues = historicalData.map(d => d.aqi);
    const precipValues = historicalData.map(d => d.precipitation);
    const tempValues = historicalData.map(d => d.temperature);

    return {
      aqi: {
        avg: (aqiValues.reduce((a, b) => a + b, 0) / aqiValues.length).toFixed(1),
        max: Math.max(...aqiValues),
        min: Math.min(...aqiValues)
      },
      precipitation: {
        total: precipValues.reduce((a, b) => a + b, 0).toFixed(1),
        max: Math.max(...precipValues),
        avg: (precipValues.reduce((a, b) => a + b, 0) / precipValues.length).toFixed(1)
      },
      temperature: {
        avg: (tempValues.reduce((a, b) => a + b, 0) / tempValues.length).toFixed(1),
        max: Math.max(...tempValues),
        min: Math.min(...tempValues)
      }
    };
  }, [historicalData]);

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <Card sx={{ minWidth: 200 }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              {label}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {data.date}
            </Typography>
            
            {payload.map((entry, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    backgroundColor: entry.color,
                    borderRadius: '50%'
                  }}
                />
                <Typography variant="body2">
                  {entry.name}: {entry.value}
                  {entry.dataKey === 'aqi' ? '' : 
                   entry.dataKey === 'temperature' ? '°C' : 
                   entry.dataKey === 'precipitation' ? 'mm' : ''}
                </Typography>
              </Box>
            ))}
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Pollutant: {data.pollutant}
            </Typography>
          </CardContent>
        </Card>
      );
    }
    return null;
  };

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
    <Box sx={{ 
      py: 2,
      display: 'flex',
      justifyContent: 'center',
      width: '100%'
    }}>
      <Box sx={{
        width: '80%',
        maxWidth: '90%',
        minWidth: '320px'
      }}>
        <Grid container spacing={3} justifyContent="center">
        {/* Card Principal do AQI */}
        <Grid item xs={12} md={10} lg={8} xl={6}>
          <Card
            sx={{
              background: `linear-gradient(135deg, ${color}20, ${color}10)`,
              border: `2px solid ${color}`,
              borderRadius: 3,
              textAlign: 'center',
              minHeight: isMobile ? 280 : 320,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
              mx: 'auto',
              maxWidth: '100%',
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
          <Grid container spacing={2} justifyContent="center">
            {/* Temperature */}
            {todayData.Temperatura_C && (
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <Card sx={{ 
                  textAlign: 'center', 
                  py: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
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
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <Card sx={{ 
                  textAlign: 'center', 
                  py: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
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
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <Card sx={{ 
                  textAlign: 'center', 
                  py: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
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
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Card sx={{ 
                textAlign: 'center', 
                py: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
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

        {/* Historical Trends Section - Unified Component */}
        {historicalData && historicalData.length > 0 && (
          <Grid item xs={12} sx={{ mt: 6 }}>
            <Box sx={{ 
              width: '100%',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2,
              p: 3,
              backgroundColor: theme.palette.background.paper
            }}>
              {/* Section Header */}
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Analytics sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                  Historical Trends
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Last {historicalData.length} days - {historicalData[0]?.city}
                </Typography>
              </Box>

              {/* Controls and Chart Section */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  {/* Controls Section */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom>
                      Data Series
                    </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 3, 
                      flexWrap: 'wrap',
                      justifyContent: 'flex-start',
                      alignItems: 'center'
                    }}>
                      <Chip
                        icon={<Analytics />}
                        label="AQI (always visible)"
                        color="primary"
                        variant="filled"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={showPrecipitation}
                            onChange={(e) => setShowPrecipitation(e.target.checked)}
                            color="info"
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <WaterDrop color="info" />
                            Precipitation (mm)
                          </Box>
                        }
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={showTemperature}
                            onChange={(e) => setShowTemperature(e.target.checked)}
                            color="warning"
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Thermostat color="warning" />
                            Temperature (°C)
                          </Box>
                        }
                      />
                    </Box>
                  </Box>

                  {/* Chart Section */}
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                      Temporal Evolution
                    </Typography>
                    
                    <Box sx={{ 
                      width: '100%',
                      height: 400,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 1,
                      p: 2,
                      backgroundColor: theme.palette.background.default
                    }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart 
                          data={historicalData} 
                          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                          <XAxis 
                            dataKey="day" 
                            stroke={theme.palette.text.secondary}
                            fontSize={12}
                            interval="preserveStartEnd"
                          />
                          <YAxis 
                            yAxisId="left"
                            stroke={theme.palette.text.secondary}
                            fontSize={12}
                            label={{ value: 'AQI', angle: -90, position: 'insideLeft' }}
                          />
                          {(showPrecipitation || showTemperature) && (
                            <YAxis 
                              yAxisId="right"
                              orientation="right"
                              stroke={theme.palette.text.secondary}
                              fontSize={12}
                              label={{ value: showTemperature ? '°C / mm' : 'mm', angle: 90, position: 'insideRight' }}
                            />
                          )}
                          
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          
                          {/* Main AQI line */}
                          <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="aqi"
                            stroke={theme.palette.primary.main}
                            strokeWidth={3}
                            dot={{ fill: theme.palette.primary.main, strokeWidth: 2, r: 4 }}
                            name="AQI"
                          />
                          
                          {/* Precipitation line (conditional) */}
                          {showPrecipitation && (
                            <Line
                              yAxisId="right"
                              type="monotone"
                              dataKey="precipitation"
                              stroke={theme.palette.info.main}
                              strokeWidth={2}
                              dot={{ fill: theme.palette.info.main, strokeWidth: 1, r: 3 }}
                              strokeDasharray="5 5"
                              name="Precipitation (mm)"
                            />
                          )}
                          
                          {/* Temperature line (conditional) */}
                          {showTemperature && (
                            <Line
                              yAxisId="right"
                              type="monotone"
                              dataKey="temperature"
                              stroke={theme.palette.warning.main}
                              strokeWidth={2}
                              dot={{ fill: theme.palette.warning.main, strokeWidth: 1, r: 3 }}
                              strokeDasharray="10 5"
                              name="Temperature (°C)"
                            />
                          )}
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Summary Statistics */}
              {stats && (
                <Grid container spacing={2}>
                  {/* AQI statistics */}
                  <Grid item xs={12} md={4}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <Analytics color="primary" />
                          <Typography variant="h6">AQI</Typography>
                        </Box>
                        <Grid container spacing={1}>
                          <Grid item xs={4}>
                            <Typography variant="body2" color="text.secondary">Average</Typography>
                            <Typography variant="h6" color="primary">{stats.aqi.avg}</Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="body2" color="text.secondary">Maximum</Typography>
                            <Typography variant="h6" color="error">{stats.aqi.max}</Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="body2" color="text.secondary">Minimum</Typography>
                            <Typography variant="h6" color="success">{stats.aqi.min}</Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Precipitation statistics */}
                  <Grid item xs={12} md={4}>
                    <Card sx={{ opacity: showPrecipitation ? 1 : 0.6 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <WaterDrop color="info" />
                          <Typography variant="h6">Precipitation</Typography>
                        </Box>
                        <Grid container spacing={1}>
                          <Grid item xs={4}>
                            <Typography variant="body2" color="text.secondary">Total</Typography>
                            <Typography variant="h6" color="info">{stats.precipitation.total}mm</Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="body2" color="text.secondary">Maximum</Typography>
                            <Typography variant="h6" color="info">{stats.precipitation.max}mm</Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="body2" color="text.secondary">Average</Typography>
                            <Typography variant="h6" color="info">{stats.precipitation.avg}mm</Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Temperature statistics */}
                  <Grid item xs={12} md={4}>
                    <Card sx={{ opacity: showTemperature ? 1 : 0.6 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <Thermostat color="warning" />
                          <Typography variant="h6">Temperature</Typography>
                        </Box>
                        <Grid container spacing={1}>
                          <Grid item xs={4}>
                            <Typography variant="body2" color="text.secondary">Average</Typography>
                            <Typography variant="h6" color="warning">{stats.temperature.avg}°C</Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="body2" color="text.secondary">Maximum</Typography>
                            <Typography variant="h6" color="error">{stats.temperature.max}°C</Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Typography variant="body2" color="text.secondary">Minimum</Typography>
                            <Typography variant="h6" color="info">{stats.temperature.min}°C</Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}
            </Box>
          </Grid>
        )}
      </Grid>
      </Box>
    </Box>
  );
};

export default TelaPrincipal;