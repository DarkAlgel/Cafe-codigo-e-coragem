import React, { useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControlLabel,
  Switch,
  Chip,
  useTheme
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
import { Analytics, WaterDrop, Thermostat } from '@mui/icons-material';
import { getHistoricalData } from '../../utils/csvLoader';

const HistoricalTrendsCharts = ({ csvData }) => {
  const theme = useTheme();
  const [showPrecipitation, setShowPrecipitation] = useState(false);
  const [showTemperature, setShowTemperature] = useState(false);

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

  // Custom tooltip
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

  if (!historicalData || historicalData.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          Historical data not available
        </Typography>
      </Box>
    );
  }

  // Basic statistics
  const stats = useMemo(() => {
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

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Analytics sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
        <Typography variant="h4" gutterBottom>
          Historical Trends Charts
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Last {historicalData.length} days - {historicalData[0]?.city}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Controls for additional series */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Data Series
              </Typography>
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
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
            </CardContent>
          </Card>
        </Grid>

        {/* Main chart */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                Temporal Evolution
              </Typography>
              
              <ResponsiveContainer width="100%" height={500}>
                <LineChart data={historicalData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
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
            </CardContent>
          </Card>
        </Grid>

        {/* Summary statistics */}
        <Grid item xs={12}>
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
        </Grid>
      </Grid>
    </Box>
  );
};

export default HistoricalTrendsCharts;