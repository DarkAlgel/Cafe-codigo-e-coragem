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
  LinearProgress
} from '@mui/material';
import {
  Science,
  CloudQueue,
  Visibility,
  ThermostatAuto,
  Refresh,
  Info,
  Warning
} from '@mui/icons-material';
import { openaqService } from '../../services/externalApis';

const AtmosphericComposition = ({ location, refreshTrigger }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    if (location?.latitude && location?.longitude) {
      fetchAtmosphericData();
    }
  }, [location, refreshTrigger]);

  const fetchAtmosphericData = async () => {
    if (!location?.latitude || !location?.longitude) return;

    setLoading(true);
    setError(null);

    try {
      const result = await openaqService.getLatest(location.latitude, location.longitude);
      
      // Check if we're using fallback data
      const isFallback = result.isFallback || false;
      
      // Transform OpenAQ data to match the expected format
      const transformedData = {
        ozoneColumn: result.data?.measurements?.find(m => m.parameter === 'o3')?.value || null,
        no2Column: result.data?.measurements?.find(m => m.parameter === 'no2')?.value || null,
        waterVapor: null, // Not available in OpenAQ
        aerosolOpticalDepth: null, // Not available in OpenAQ
        instrumentType: isFallback ? 'Simulated Air Quality Monitor' : 'Air Quality Monitor',
        measurementTime: result.data?.measurements?.[0]?.lastUpdated || 'Real-time',
        dataQuality: isFallback ? 'Simulated Data' : 'Level 2',
        solarZenithAngle: null,
        isFallback: isFallback,
        fallbackReason: result.fallbackReason
      };
      
      setData(transformedData);
      setLastUpdated(new Date());
      
      // Show info message if using fallback data
      if (isFallback) {
        console.info('Using fallback data due to API connectivity issues:', result.fallbackReason);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getQualityColor = (value, thresholds) => {
    if (value <= thresholds.good) return '#4CAF50';
    if (value <= thresholds.moderate) return '#FF9800';
    if (value <= thresholds.unhealthy) return '#F44336';
    return '#9C27B0';
  };

  const getQualityLabel = (value, thresholds) => {
    if (value <= thresholds.good) return 'Good';
    if (value <= thresholds.moderate) return 'Moderate';
    if (value <= thresholds.unhealthy) return 'Unhealthy';
    return 'Hazardous';
  };

  const formatValue = (value, unit, decimals = 2) => {
    if (value === null || value === undefined) return 'N/A';
    return `${Number(value).toFixed(decimals)} ${unit}`;
  };

  const renderCompositionCard = (title, value, unit, icon, description, thresholds) => {
    const qualityColor = thresholds ? getQualityColor(value, thresholds) : '#2196F3';
    const qualityLabel = thresholds ? getQualityLabel(value, thresholds) : null;

    return (
      <Card sx={{ height: '100%', border: `2px solid ${qualityColor}` }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            {icon}
            <Typography variant="h6" sx={{ ml: 1, flexGrow: 1 }}>
              {title}
            </Typography>
            {qualityLabel && (
              <Chip
                label={qualityLabel}
                size="small"
                sx={{
                  bgcolor: qualityColor,
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
            )}
          </Box>
          
          <Typography variant="h4" sx={{ color: qualityColor, fontWeight: 'bold', mb: 1 }}>
            {formatValue(value, unit)}
          </Typography>
          
          <Typography variant="body2" color="textSecondary">
            {description}
          </Typography>
          
          {thresholds && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress
                variant="determinate"
                value={Math.min((value / thresholds.unhealthy) * 100, 100)}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: 'grey.200',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: qualityColor,
                    borderRadius: 4,
                  },
                }}
              />
              <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block' }}>
                Scale: 0-{thresholds.unhealthy} {unit}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Science sx={{ color: '#2196F3', mr: 1 }} />
            <Typography variant="h6">Atmospheric Composition</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Loading atmospheric data...</Typography>
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
            <Science sx={{ color: '#2196F3', mr: 1 }} />
            <Typography variant="h6">Atmospheric Composition</Typography>
            <Box sx={{ flexGrow: 1 }} />
            <IconButton onClick={fetchAtmosphericData} size="small">
              <Refresh />
            </IconButton>
          </Box>
          <Alert severity="error" action={
            <IconButton onClick={fetchAtmosphericData} size="small">
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
            <Science sx={{ color: '#2196F3', mr: 1 }} />
            <Typography variant="h6">Atmospheric Composition</Typography>
          </Box>
          <Alert severity="info">
            Set a location to view atmospheric composition data
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Science sx={{ color: '#2196F3', mr: 1 }} />
          <Typography variant="h6">Atmospheric Composition</Typography>
          <Tooltip title="Data from OpenAQ Air Quality Network">
            <IconButton size="small" sx={{ ml: 1 }}>
              <Info fontSize="small" />
            </IconButton>
          </Tooltip>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton onClick={fetchAtmosphericData} size="small">
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
            <strong>Data Source:</strong> {data?.isFallback ? 'Simulated Data (API Unavailable)' : 'OpenAQ Air Quality Network'}
            {data?.isFallback && (
              <>
                <br />
                <strong>Fallback Reason:</strong> {data.fallbackReason}
              </>
            )}
          </Typography>
          {data?.isFallback && (
            <Alert severity="info" sx={{ mt: 1 }}>
              Using simulated data due to API connectivity issues. Data shown is for demonstration purposes.
            </Alert>
          )}
        </Box>

        <Grid container spacing={3}>
          {/* Ozone Column */}
          <Grid item xs={12} sm={6} md={3}>
            {renderCompositionCard(
              'Ozone Column',
              data.ozoneColumn,
              'DU',
              <CloudQueue sx={{ color: '#4CAF50' }} />,
              'Total atmospheric ozone column density',
              { good: 300, moderate: 400, unhealthy: 500 }
            )}
          </Grid>

          {/* NO2 Column */}
          <Grid item xs={12} sm={6} md={3}>
            {renderCompositionCard(
              'NO₂ Column',
              data.no2Column,
              '×10¹⁵ molec/cm²',
              <Warning sx={{ color: '#FF9800' }} />,
              'Nitrogen dioxide column density',
              { good: 2, moderate: 5, unhealthy: 10 }
            )}
          </Grid>

          {/* Water Vapor */}
          <Grid item xs={12} sm={6} md={3}>
            {renderCompositionCard(
              'Water Vapor',
              data.waterVapor,
              'g/cm²',
              <Visibility sx={{ color: '#2196F3' }} />,
              'Precipitable water vapor content',
              { good: 2, moderate: 4, unhealthy: 6 }
            )}
          </Grid>

          {/* Aerosol Optical Depth */}
          <Grid item xs={12} sm={6} md={3}>
            {renderCompositionCard(
              'Aerosol Optical Depth',
              data.aerosolOpticalDepth,
              'AOD',
              <ThermostatAuto sx={{ color: '#9C27B0' }} />,
              'Atmospheric aerosol loading',
              { good: 0.1, moderate: 0.3, unhealthy: 0.5 }
            )}
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Additional Information */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Measurement Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="textSecondary">
                <strong>Instrument Type:</strong> {data.instrumentType || 'Air Quality Monitor'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <strong>Measurement Time:</strong> {data.measurementTime || 'Real-time'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="textSecondary">
                <strong>Data Quality:</strong> {data.dataQuality || 'Level 2'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                <strong>Solar Zenith Angle:</strong> {formatValue(data.solarZenithAngle, '°')}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Data Interpretation */}
        <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
          <Typography variant="body2" sx={{ color: 'info.contrastText' }}>
            <strong>Data Interpretation:</strong> These measurements provide insights into air quality 
            and atmospheric conditions. Higher values may indicate pollution, industrial activity, or 
            seasonal variations. Ozone (O₃) can be beneficial in the upper atmosphere but harmful at 
            ground level. NO₂ indicates combustion and industrial activity. Data is sourced from the 
            OpenAQ global air quality network, providing real-time monitoring from various sensors worldwide.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AtmosphericComposition;