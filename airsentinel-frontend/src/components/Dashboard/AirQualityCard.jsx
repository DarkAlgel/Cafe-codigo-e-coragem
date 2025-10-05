import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Chip,
  useTheme
} from '@mui/material';
import { TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material';

const AirQualityCard = ({ 
  data, 
  loading = false, 
  error = null,
  showTrend = true,
  compact = false 
}) => {
  const theme = useTheme();

  if (loading) {
    return (
      <Card sx={{ height: compact ? 280 : 380, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ height: compact ? 280 : 380, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="error">Error loading data</Typography>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card sx={{ height: compact ? 280 : 380, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="textSecondary">Data not available</Typography>
      </Card>
    );
  }

  const getAQIColor = (aqi) => {
    if (aqi <= 50) return '#4CAF50'; // Good - Green
    if (aqi <= 100) return '#FFEB3B'; // Moderate - Yellow
    if (aqi <= 150) return '#FF9800'; // Unhealthy for sensitive groups - Orange
    if (aqi <= 200) return '#F44336'; // Unhealthy - Red
    if (aqi <= 300) return '#9C27B0'; // Very unhealthy - Purple
    return '#8D6E63'; // Hazardous - Brown
  };

  const getAQILabel = (aqi) => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) return <TrendingUp sx={{ color: '#F44336' }} />;
    if (trend < 0) return <TrendingDown sx={{ color: '#4CAF50' }} />;
    return <TrendingFlat sx={{ color: '#757575' }} />;
  };

  const aqiColor = getAQIColor(data.aqi);
  const aqiLabel = getAQILabel(data.aqi);

  return (
    <Card 
      sx={{ 
        height: compact ? 280 : 380,
        background: `linear-gradient(135deg, ${aqiColor}15 0%, ${aqiColor}05 100%)`,
        border: `2px solid ${aqiColor}30`,
        position: 'relative',
        overflow: 'visible'
      }}
    >
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: compact ? 2 : 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant={compact ? "subtitle1" : "h6"} fontWeight="bold" color="textPrimary">
            {data.location || 'Air Quality'}
          </Typography>
          {showTrend && data.trend !== undefined && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {getTrendIcon(data.trend)}
              <Typography variant="caption" color="textSecondary">
                {Math.abs(data.trend)}%
              </Typography>
            </Box>
          )}
        </Box>

        {/* Main AQI */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box
            sx={{
              width: compact ? 80 : 100,
              height: compact ? 80 : 100,
              borderRadius: '50%',
              backgroundColor: aqiColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: compact ? '1.8rem' : '2.4rem',
              boxShadow: `0 4px 12px ${aqiColor}40`
            }}
          >
            {data.aqi}
          </Box>
          <Box>
            <Typography variant={compact ? "body2" : "body1"} color="textSecondary">
              AQI
            </Typography>
            <Chip
              label={aqiLabel}
              size={compact ? "small" : "medium"}
              sx={{
                backgroundColor: aqiColor,
                color: 'white',
                fontWeight: 'bold',
                mt: 0.5
              }}
            />
          </Box>
        </Box>

        {/* Pollutant details */}
        {!compact && data.pollutants && (
          <Box sx={{ mt: 'auto' }}>
            <Typography variant="caption" color="textSecondary" sx={{ mb: 1, display: 'block' }}>
              Main pollutants:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {Object.entries(data.pollutants).slice(0, 3).map(([key, value]) => (
                <Chip
                  key={key}
                  label={`${key.toUpperCase()}: ${value}`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem' }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Timestamp */}
        {data.timestamp && (
          <Typography 
            variant="caption" 
            color="textSecondary" 
            sx={{ 
              mt: compact ? 1 : 2, 
              textAlign: 'right',
              fontSize: '0.7rem'
            }}
          >
            Updated: {new Date(data.timestamp).toLocaleTimeString('en-US')}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default AirQualityCard;