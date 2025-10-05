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
      <Card sx={{ height: compact ? 200 : 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ height: compact ? 200 : 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="error">Erro ao carregar dados</Typography>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card sx={{ height: compact ? 200 : 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="textSecondary">Dados não disponíveis</Typography>
      </Card>
    );
  }

  const getAQIColor = (aqi) => {
    if (aqi <= 50) return '#4CAF50'; // Bom - Verde
    if (aqi <= 100) return '#FFEB3B'; // Moderado - Amarelo
    if (aqi <= 150) return '#FF9800'; // Insalubre para grupos sensíveis - Laranja
    if (aqi <= 200) return '#F44336'; // Insalubre - Vermelho
    if (aqi <= 300) return '#9C27B0'; // Muito insalubre - Roxo
    return '#8D6E63'; // Perigoso - Marrom
  };

  const getAQILabel = (aqi) => {
    if (aqi <= 50) return 'Boa';
    if (aqi <= 100) return 'Moderada';
    if (aqi <= 150) return 'Insalubre para grupos sensíveis';
    if (aqi <= 200) return 'Insalubre';
    if (aqi <= 300) return 'Muito insalubre';
    return 'Perigosa';
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
        height: compact ? 200 : 280,
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
            {data.location || 'Qualidade do Ar'}
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

        {/* AQI Principal */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Box
            sx={{
              width: compact ? 60 : 80,
              height: compact ? 60 : 80,
              borderRadius: '50%',
              backgroundColor: aqiColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: compact ? '1.5rem' : '2rem',
              boxShadow: `0 4px 12px ${aqiColor}40`
            }}
          >
            {data.aqi}
          </Box>
          <Box>
            <Typography variant={compact ? "body2" : "body1"} color="textSecondary">
              IQA
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

        {/* Detalhes dos poluentes */}
        {!compact && data.pollutants && (
          <Box sx={{ mt: 'auto' }}>
            <Typography variant="caption" color="textSecondary" sx={{ mb: 1, display: 'block' }}>
              Principais poluentes:
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
            Atualizado: {new Date(data.timestamp).toLocaleTimeString('pt-BR')}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default AirQualityCard;