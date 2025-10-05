import React, { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
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
  ReferenceLine
} from 'recharts';
import { TrendingUp } from '@mui/icons-material';
import { getNextDaysData, getAQICategory } from '../../utils/csvLoader';

const PrevisaoQualidadeAr = ({ csvData }) => {
  const theme = useTheme();

  // Obter dados dos próximos 3 dias para Nova Iorque
  const previsaoData = useMemo(() => {
    const rawData = getNextDaysData(csvData, 'Nova Iorque', 3) ||
                    getNextDaysData(csvData, 'New York', 3) ||
                    getNextDaysData(csvData, 'Sedona', 3); // Fallback

    if (!rawData || rawData.length === 0) return [];

    return rawData.map((item, index) => {
      const labels = ['Hoje', 'Amanhã', 'Depois de Amanhã'];
      return {
        day: labels[index] || `Dia ${index + 1}`,
        aqi: parseInt(item.AQI_Final) || 0,
        data: item.Data || `Dia ${index + 1}`,
        poluente: item.Poluente_Dominante || 'N/A',
        temperatura: item.Temperatura_C || null,
        cidade: item.Cidade || 'Nova Iorque'
      };
    });
  }, [csvData]);

  // Tooltip customizado
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const { category, color } = getAQICategory(data.aqi);
      
      return (
        <Card sx={{ minWidth: 200 }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              {label}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {data.data}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  backgroundColor: color,
                  borderRadius: '50%'
                }}
              />
              <Typography variant="h6" sx={{ color: color, fontWeight: 600 }}>
                AQI: {data.aqi}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: color, fontWeight: 500 }}>
              {category}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Poluente: {data.poluente}
            </Typography>
            {data.temperatura && (
              <Typography variant="body2" color="text.secondary">
                Temperatura: {data.temperatura}°C
              </Typography>
            )}
          </CardContent>
        </Card>
      );
    }
    return null;
  };

  if (!previsaoData || previsaoData.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          Dados de previsão não disponíveis
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <TrendingUp sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
        <Typography variant="h4" gutterBottom>
          Previsão de Qualidade do Ar
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Próximos 3 dias - {previsaoData[0]?.cidade}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Gráfico principal */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                Evolução do AQI
              </Typography>
              
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={previsaoData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis 
                    dataKey="day" 
                    stroke={theme.palette.text.secondary}
                    fontSize={12}
                  />
                  <YAxis 
                    stroke={theme.palette.text.secondary}
                    fontSize={12}
                    label={{ value: 'AQI', angle: -90, position: 'insideLeft' }}
                  />
                  
                  {/* Linhas de referência para categorias AQI */}
                  <ReferenceLine y={50} stroke="#4CAF50" strokeDasharray="2 2" />
                  <ReferenceLine y={100} stroke="#FFEB3B" strokeDasharray="2 2" />
                  <ReferenceLine y={150} stroke="#FF9800" strokeDasharray="2 2" />
                  <ReferenceLine y={200} stroke="#F44336" strokeDasharray="2 2" />
                  
                  <Tooltip content={<CustomTooltip />} />
                  
                  <Line
                    type="monotone"
                    dataKey="aqi"
                    stroke={theme.palette.primary.main}
                    strokeWidth={3}
                    dot={{ fill: theme.palette.primary.main, strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: theme.palette.primary.main, strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Cards de resumo para cada dia */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            {previsaoData.map((item, index) => {
              const { category, color } = getAQICategory(item.aqi);
              
              return (
                <Grid item xs={12} sm={4} key={index}>
                  <Card
                    sx={{
                      border: `2px solid ${color}`,
                      backgroundColor: `${color}10`
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {item.day}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {item.data}
                      </Typography>
                      
                      <Typography
                        variant="h3"
                        sx={{
                          color: color,
                          fontWeight: 700,
                          mb: 1
                        }}
                      >
                        {item.aqi}
                      </Typography>
                      
                      <Typography
                        variant="body1"
                        sx={{
                          color: color,
                          fontWeight: 600,
                          mb: 2
                        }}
                      >
                        {category}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary">
                        Poluente: {item.poluente}
                      </Typography>
                      
                      {item.temperatura && (
                        <Typography variant="body2" color="text.secondary">
                          Temp: {item.temperatura}°C
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Grid>

        {/* Legenda das categorias */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Categorias AQI
              </Typography>
              <Grid container spacing={2}>
                {[
                  { range: '0-50', label: 'Bom', color: '#4CAF50' },
                  { range: '51-100', label: 'Moderado', color: '#FFEB3B' },
                  { range: '101-150', label: 'Insalubre p/ grupos sensíveis', color: '#FF9800' },
                  { range: '151-200', label: 'Insalubre', color: '#F44336' },
                  { range: '201-300', label: 'Muito insalubre', color: '#9C27B0' },
                  { range: '301+', label: 'Perigoso', color: '#800020' }
                ].map((item, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          backgroundColor: item.color,
                          borderRadius: '50%'
                        }}
                      />
                      <Typography variant="body2">
                        <strong>{item.range}:</strong> {item.label}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PrevisaoQualidadeAr;