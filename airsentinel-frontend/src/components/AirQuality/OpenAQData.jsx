import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Tooltip,
  IconButton,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import {
  Air,
  Refresh,
  Info,
  Warning,
  CheckCircle,
  Error,
  LocationOn
} from '@mui/icons-material';
import { openaqService } from '../../services/externalApis';

const OpenAQData = ({ location, refreshTrigger }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    if (location?.latitude && location?.longitude) {
      fetchAirQualityData();
    }
  }, [location, refreshTrigger]);

  const fetchAirQualityData = async () => {
    if (!location?.latitude || !location?.longitude) return;

    setLoading(true);
    setError(null);

    try {
      const result = await fetchOpenAQData(location.latitude, location.longitude);
      setData(result);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getAQIColor = (aqi) => {
    if (aqi <= 50) return '#4CAF50';
    if (aqi <= 100) return '#FFEB3B';
    if (aqi <= 150) return '#FF9800';
    if (aqi <= 200) return '#F44336';
    if (aqi <= 300) return '#9C27B0';
    return '#8D6E63';
  };

  const getAQILabel = (aqi) => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  };

  const getAQIIcon = (aqi) => {
    if (aqi <= 50) return <CheckCircle sx={{ color: '#4CAF50' }} />;
    if (aqi <= 100) return <Info sx={{ color: '#FFEB3B' }} />;
    if (aqi <= 150) return <Warning sx={{ color: '#FF9800' }} />;
    return <Error sx={{ color: '#F44336' }} />;
  };

  const getPollutantColor = (parameter, value) => {
    const thresholds = {
      'pm25': { good: 12, moderate: 35, unhealthy: 55 },
      'pm10': { good: 54, moderate: 154, unhealthy: 254 },
      'o3': { good: 54, moderate: 70, unhealthy: 85 },
      'no2': { good: 53, moderate: 100, unhealthy: 360 },
      'so2': { good: 35, moderate: 75, unhealthy: 185 },
      'co': { good: 4.4, moderate: 9.4, unhealthy: 12.4 }
    };

    const threshold = thresholds[parameter];
    if (!threshold) return '#2196F3';

    if (value <= threshold.good) return '#4CAF50';
    if (value <= threshold.moderate) return '#FF9800';
    return '#F44336';
  };

  const formatPollutantName = (parameter) => {
    const names = {
      'pm25': 'PM2.5',
      'pm10': 'PM10',
      'o3': 'Ozone (O₃)',
      'no2': 'Nitrogen Dioxide (NO₂)',
      'so2': 'Sulfur Dioxide (SO₂)',
      'co': 'Carbon Monoxide (CO)'
    };
    return names[parameter] || parameter.toUpperCase();
  };

  const formatValue = (value, unit) => {
    if (value === null || value === undefined) return 'N/A';
    return `${Number(value).toFixed(1)} ${unit}`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Air sx={{ color: '#2196F3', mr: 1 }} />
            <Typography variant="h6">Air Quality Data (OpenAQ)</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Loading air quality data...</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Air sx={{ color: '#2196F3', mr: 1 }} />
            <Typography variant="h6">Air Quality Data (OpenAQ)</Typography>
            <Box sx={{ flexGrow: 1 }} />
            <IconButton onClick={fetchAirQualityData} size="small">
              <Refresh />
            </IconButton>
          </Box>
          <Alert severity="error" action={
            <IconButton onClick={fetchAirQualityData} size="small">
              <Refresh />
            </IconButton>
          }>
            {error}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Air sx={{ color: '#2196F3', mr: 1 }} />
            <Typography variant="h6">Air Quality Data (OpenAQ)</Typography>
          </Box>
          <Alert severity="info">
            Set a location to view air quality data from OpenAQ
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Air sx={{ color: '#2196F3', mr: 1 }} />
          <Typography variant="h6">Air Quality Data (OpenAQ)</Typography>
          <Tooltip title="Real-time air quality data from OpenAQ global network">
            <IconButton size="small" sx={{ ml: 1 }}>
              <Info fontSize="small" />
            </IconButton>
          </Tooltip>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton onClick={fetchAirQualityData} size="small">
            <Refresh />
          </IconButton>
        </Box>

        {/* Location and Update Info */}
        <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="body2" color="textSecondary">
            <strong>Location:</strong> {location?.name || `${location?.latitude}, ${location?.longitude}`}
            <br />
            <strong>Last Updated:</strong> {lastUpdated ? lastUpdated.toLocaleString() : 'Never'}
            <br />
            <strong>Data Source:</strong> OpenAQ Global Air Quality Network (Mock Data)
            <br />
            <strong>Stations Found:</strong> {data.stations?.length || 0} nearby monitoring stations
          </Typography>
        </Box>

        {/* Overall AQI */}
        <Card sx={{ mb: 3, border: `2px solid ${getAQIColor(data.overallAQI)}` }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              {getAQIIcon(data.overallAQI)}
              <Typography variant="h6" sx={{ ml: 1, flexGrow: 1 }}>
                Overall Air Quality Index
              </Typography>
              <Chip
                label={getAQILabel(data.overallAQI)}
                sx={{
                  bgcolor: getAQIColor(data.overallAQI),
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
            </Box>
            
            <Typography variant="h3" sx={{ color: getAQIColor(data.overallAQI), fontWeight: 'bold', mb: 1 }}>
              {data.overallAQI}
            </Typography>
            
            <LinearProgress
              variant="determinate"
              value={Math.min((data.overallAQI / 300) * 100, 100)}
              sx={{
                height: 12,
                borderRadius: 6,
                bgcolor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  bgcolor: getAQIColor(data.overallAQI),
                  borderRadius: 6,
                },
              }}
            />
            
            <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              {data.healthRecommendation || 'Air quality is acceptable for most people.'}
            </Typography>
          </CardContent>
        </Card>

        {/* Pollutant Details */}
        <Typography variant="h6" gutterBottom>
          Pollutant Concentrations
        </Typography>
        
        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Pollutant</strong></TableCell>
                <TableCell align="right"><strong>Concentration</strong></TableCell>
                <TableCell align="right"><strong>Status</strong></TableCell>
                <TableCell align="right"><strong>Last Updated</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.pollutants?.map((pollutant) => (
                <TableRow key={pollutant.parameter}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {formatPollutantName(pollutant.parameter)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography 
                      variant="body2" 
                      sx={{ color: getPollutantColor(pollutant.parameter, pollutant.value) }}
                      fontWeight="medium"
                    >
                      {formatValue(pollutant.value, pollutant.unit)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      size="small"
                      label={pollutant.status || 'Normal'}
                      sx={{
                        bgcolor: getPollutantColor(pollutant.parameter, pollutant.value),
                        color: 'white',
                        fontSize: '0.75rem'
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="caption" color="textSecondary">
                      {pollutant.lastUpdated || 'Recent'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Monitoring Stations */}
        {data.stations && data.stations.length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>
              Nearby Monitoring Stations
            </Typography>
            <Grid container spacing={2}>
              {data.stations.slice(0, 3).map((station, index) => (
                <Grid item xs={12} sm={4} key={index}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationOn sx={{ color: '#4CAF50', mr: 1 }} fontSize="small" />
                        <Typography variant="subtitle2" noWrap>
                          {station.name}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="textSecondary">
                        Distance: {station.distance} km
                        <br />
                        Parameters: {station.parameters?.join(', ') || 'Multiple'}
                        <br />
                        Status: {station.isActive ? 'Active' : 'Inactive'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}

        {/* Health Advisory */}
        <Box sx={{ mt: 3, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
          <Typography variant="body2" sx={{ color: 'warning.contrastText' }}>
            <strong>Health Advisory:</strong> {data.healthAdvisory || 
            'Air quality data helps you make informed decisions about outdoor activities. ' +
            'Sensitive individuals should consider reducing prolonged outdoor exertion when AQI exceeds 100. ' +
            'Check local health advisories for specific recommendations.'}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default OpenAQData;