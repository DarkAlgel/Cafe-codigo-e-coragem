import React, { useMemo } from 'react';
import {
  Alert,
  Box,
  Typography,
  Collapse
} from '@mui/material';
import { Warning } from '@mui/icons-material';
import { getTodayDataForCity, getAQICategory, shouldShowHealthAlert } from '../../utils/csvLoader';

const AlertasSaude = ({ csvData }) => {
  // Get today's data for New York (current city)
  const todayData = useMemo(() => {
    return getTodayDataForCity(csvData, 'Nova Iorque') || 
           getTodayDataForCity(csvData, 'New York') ||
           getTodayDataForCity(csvData, 'Sedona'); // Fallback
  }, [csvData]);

  if (!todayData) {
    return null;
  }

  const aqi = todayData.AQI_Final || '0';
  const showAlert = shouldShowHealthAlert(aqi);
  const { color } = getAQICategory(aqi);

  if (!showAlert) {
    return null;
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Collapse in={showAlert}>
        <Alert
          severity="warning"
          icon={<Warning />}
          sx={{
            backgroundColor: `${color}20`,
            borderColor: color,
            border: `1px solid ${color}`,
            '& .MuiAlert-icon': {
              color: color
            },
            '& .MuiAlert-message': {
              width: '100%'
            }
          }}
        >
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: color,
                mb: 1
              }}
            >
              Health Alert
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'text.primary',
                lineHeight: 1.6
              }}
            >
              Today's air quality may be harmful to sensitive groups. 
              Consider limiting intense outdoor physical activities.
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                mt: 1,
                fontStyle: 'italic'
              }}
            >
              Current AQI: {aqi} - {getAQICategory(aqi).category}
            </Typography>
          </Box>
        </Alert>
      </Collapse>
    </Box>
  );
};

export default AlertasSaude;