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

const GraficosTendencias = ({ csvData }) => {
  const theme = useTheme();
  const [showPrecipitacao, setShowPrecipitacao] = useState(false);
  const [showTemperatura, setShowTemperatura] = useState(false);

  // Obter dados históricos dos últimos 30 dias
  const historicalData = useMemo(() => {
    const rawData = getHistoricalData(csvData, 'Nova Iorque', 30) ||
                    getHistoricalData(csvData, 'New York', 30) ||
                    getHistoricalData(csvData, 'Sedona', 30); // Fallback

    if (!rawData || rawData.length === 0) return [];

    return rawData.map((item, index) => ({
      day: `Dia ${index + 1}`,
      data: item.Data || `Dia ${index + 1}`,
      aqi: parseInt(item.AQI_Final) || 0,
      precipitacao: parseFloat(item.Precipitacao_mm) || 0,
      temperatura: parseFloat(item.Temperatura_C) || 0,
      poluente: item.Poluente_Dominante || 'N/A',
      cidade: item.Cidade || 'Nova Iorque'
    }));
  }, [csvData]);

  // Tooltip customizado
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
              {data.data}
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
                   entry.dataKey === 'temperatura' ? '°C' : 
                   entry.dataKey === 'precipitacao' ? 'mm' : ''}
                </Typography>
              </Box>
            ))}
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Poluente: {data.poluente}
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
          Dados históricos não disponíveis
        </Typography>
      </Box>
    );
  }

  // Estatísticas básicas
  const stats = useMemo(() => {
    const aqiValues = historicalData.map(d => d.aqi);
    const precipValues = historicalData.map(d => d.precipitacao);
    const tempValues = historicalData.map(d => d.temperatura);

    return {
      aqi: {
        avg: (aqiValues.reduce((a, b) => a + b, 0) / aqiValues.length).toFixed(1),
        max: Math.max(...aqiValues),
        min: Math.min(...aqiValues)
      },
      precipitacao: {
        total: precipValues.reduce((a, b) => a + b, 0).toFixed(1),
        max: Math.max(...precipValues),
        avg: (precipValues.reduce((a, b) => a + b, 0) / precipValues.length).toFixed(1)
      },
      temperatura: {
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
          Gráficos de Tendências Históricas
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Últimos {historicalData.length} dias - {historicalData[0]?.cidade}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Controles para séries adicionais */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Séries de Dados
              </Typography>
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <Chip
                  icon={<Analytics />}
                  label="AQI (sempre visível)"
                  color="primary"
                  variant="filled"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={showPrecipitacao}
                      onChange={(e) => setShowPrecipitacao(e.target.checked)}
                      color="info"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WaterDrop color="info" />
                      Precipitação (mm)
                    </Box>
                  }
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={showTemperatura}
                      onChange={(e) => setShowTemperatura(e.target.checked)}
                      color="warning"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Thermostat color="warning" />
                      Temperatura (°C)
                    </Box>
                  }
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Gráfico principal */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                Evolução Temporal
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
                  {(showPrecipitacao || showTemperatura) && (
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      stroke={theme.palette.text.secondary}
                      fontSize={12}
                      label={{ value: showTemperatura ? '°C / mm' : 'mm', angle: 90, position: 'insideRight' }}
                    />
                  )}
                  
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  
                  {/* Linha principal do AQI */}
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="aqi"
                    stroke={theme.palette.primary.main}
                    strokeWidth={3}
                    dot={{ fill: theme.palette.primary.main, strokeWidth: 2, r: 4 }}
                    name="AQI"
                  />
                  
                  {/* Linha de precipitação (condicional) */}
                  {showPrecipitacao && (
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="precipitacao"
                      stroke={theme.palette.info.main}
                      strokeWidth={2}
                      dot={{ fill: theme.palette.info.main, strokeWidth: 1, r: 3 }}
                      strokeDasharray="5 5"
                      name="Precipitação (mm)"
                    />
                  )}
                  
                  {/* Linha de temperatura (condicional) */}
                  {showTemperatura && (
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="temperatura"
                      stroke={theme.palette.warning.main}
                      strokeWidth={2}
                      dot={{ fill: theme.palette.warning.main, strokeWidth: 1, r: 3 }}
                      strokeDasharray="10 5"
                      name="Temperatura (°C)"
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Estatísticas resumidas */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            {/* Estatísticas AQI */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Analytics color="primary" />
                    <Typography variant="h6">AQI</Typography>
                  </Box>
                  <Grid container spacing={1}>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">Média</Typography>
                      <Typography variant="h6" color="primary">{stats.aqi.avg}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">Máximo</Typography>
                      <Typography variant="h6" color="error">{stats.aqi.max}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">Mínimo</Typography>
                      <Typography variant="h6" color="success">{stats.aqi.min}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Estatísticas Precipitação */}
            <Grid item xs={12} md={4}>
              <Card sx={{ opacity: showPrecipitacao ? 1 : 0.6 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <WaterDrop color="info" />
                    <Typography variant="h6">Precipitação</Typography>
                  </Box>
                  <Grid container spacing={1}>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">Total</Typography>
                      <Typography variant="h6" color="info">{stats.precipitacao.total}mm</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">Máximo</Typography>
                      <Typography variant="h6" color="info">{stats.precipitacao.max}mm</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">Média</Typography>
                      <Typography variant="h6" color="info">{stats.precipitacao.avg}mm</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Estatísticas Temperatura */}
            <Grid item xs={12} md={4}>
              <Card sx={{ opacity: showTemperatura ? 1 : 0.6 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Thermostat color="warning" />
                    <Typography variant="h6">Temperatura</Typography>
                  </Box>
                  <Grid container spacing={1}>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">Média</Typography>
                      <Typography variant="h6" color="warning">{stats.temperatura.avg}°C</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">Máximo</Typography>
                      <Typography variant="h6" color="error">{stats.temperatura.max}°C</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">Mínimo</Typography>
                      <Typography variant="h6" color="info">{stats.temperatura.min}°C</Typography>
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

export default GraficosTendencias;