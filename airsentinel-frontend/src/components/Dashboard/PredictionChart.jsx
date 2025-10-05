import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const PredictionChart = ({ 
  data = [], 
  loading = false, 
  error = null,
  title = "Previsão de Qualidade do Ar",
  height = 300,
  showArea = true,
  showReferenceLine = true
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (loading) {
    return (
      <Card sx={{ height: height + 100 }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ height: height + 100 }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Typography color="error">Erro ao carregar previsões</Typography>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card sx={{ height: height + 100 }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Typography color="textSecondary">Dados de previsão não disponíveis</Typography>
        </CardContent>
      </Card>
    );
  }

  const getAQIColor = (aqi) => {
    if (aqi <= 50) return '#4CAF50';
    if (aqi <= 100) return '#FFEB3B';
    if (aqi <= 150) return '#FF9800';
    if (aqi <= 200) return '#F44336';
    if (aqi <= 300) return '#9C27B0';
    return '#8D6E63';
  };

  const formatTooltipLabel = (label) => {
    try {
      const date = new Date(label);
      return format(date, isMobile ? 'dd/MM HH:mm' : 'dd/MM/yyyy HH:mm', { locale: ptBR });
    } catch {
      return label;
    }
  };

  const formatXAxisLabel = (tickItem) => {
    try {
      const date = new Date(tickItem);
      return format(date, isMobile ? 'HH:mm' : 'dd/MM HH:mm', { locale: ptBR });
    } catch {
      return tickItem;
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box
          sx={{
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: 1,
            p: 2,
            boxShadow: theme.shadows[3]
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {formatTooltipLabel(label)}
          </Typography>
          <Typography variant="body2" sx={{ color: getAQIColor(data.aqi) }}>
            IQA: {data.aqi}
          </Typography>
          {data.confidence && (
            <Typography variant="caption" color="textSecondary">
              Confiança: {(data.confidence * 100).toFixed(1)}%
            </Typography>
          )}
          {data.mainPollutant && (
            <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
              Principal: {data.mainPollutant}
            </Typography>
          )}
        </Box>
      );
    }
    return null;
  };

  const ChartComponent = showArea ? AreaChart : LineChart;
  const DataComponent = showArea ? Area : Line;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        
        <Box sx={{ width: '100%', height }}>
          <ResponsiveContainer width="100%" height="100%">
            <ChartComponent data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="timestamp"
                tickFormatter={formatXAxisLabel}
                tick={{ fontSize: isMobile ? 10 : 12 }}
                interval={isMobile ? 'preserveStartEnd' : 0}
              />
              <YAxis 
                domain={[0, 'dataMax + 50']}
                tick={{ fontSize: isMobile ? 10 : 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {showReferenceLine && (
                <>
                  <ReferenceLine y={50} stroke="#4CAF50" strokeDasharray="5 5" />
                  <ReferenceLine y={100} stroke="#FFEB3B" strokeDasharray="5 5" />
                  <ReferenceLine y={150} stroke="#FF9800" strokeDasharray="5 5" />
                  <ReferenceLine y={200} stroke="#F44336" strokeDasharray="5 5" />
                </>
              )}
              
              <DataComponent
                type="monotone"
                dataKey="aqi"
                stroke="#2196F3"
                strokeWidth={2}
                fill={showArea ? "url(#colorAqi)" : undefined}
                dot={{ fill: '#2196F3', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#2196F3', strokeWidth: 2 }}
              />
              
              {showArea && (
                <defs>
                  <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2196F3" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2196F3" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
              )}
            </ChartComponent>
          </ResponsiveContainer>
        </Box>

        {/* Legenda */}
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
          {[
            { range: '0-50', label: 'Boa', color: '#4CAF50' },
            { range: '51-100', label: 'Moderada', color: '#FFEB3B' },
            { range: '101-150', label: 'Insalubre p/ sensíveis', color: '#FF9800' },
            { range: '151-200', label: 'Insalubre', color: '#F44336' },
          ].map((item) => (
            <Box key={item.range} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  backgroundColor: item.color,
                  borderRadius: '50%'
                }}
              />
              <Typography variant="caption" color="textSecondary">
                {item.range}: {item.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default PredictionChart;