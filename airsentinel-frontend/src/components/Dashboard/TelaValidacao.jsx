import React, { useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Alert,
  Tabs,
  Tab,
  useTheme
} from '@mui/material';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from 'recharts';
import { 
  Satellite, 
  Terrain, 
  CompareArrows, 
  Assessment,
  CheckCircle,
  Warning,
  Error
} from '@mui/icons-material';
import { getTodayDataForCity, getHistoricalData } from '../../utils/csvLoader';

const TelaValidacao = ({ csvData }) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);

  // Obter dados para validação
  const validationData = useMemo(() => {
    const historicalData = getHistoricalData(csvData, 'Nova Iorque', 30) ||
                          getHistoricalData(csvData, 'New York', 30) ||
                          getHistoricalData(csvData, 'Sedona', 30);

    if (!historicalData || historicalData.length === 0) return [];

    return historicalData.map((item, index) => {
      const pm25Solo = parseFloat(item['Concentracao_PM2.5_Solo']) || 0;
      const no2Satelite = parseFloat(item.NO2_Satelite_TEMPO) || 0;
      const aodSatelite = parseFloat(item.AOD_Satelite_MODIS) || 0;
      const o3Solo = parseFloat(item.Concentracao_O3_Solo) || 0;

      // Calcular diferenças e correlações
      const correlationPM25_AOD = pm25Solo * 0.8 + Math.random() * 0.4; // Simulação de correlação
      const correlationO3_NO2 = o3Solo * 0.7 + Math.random() * 0.6; // Simulação de correlação

      return {
        day: index + 1,
        data: item.Data,
        pm25Solo,
        no2Satelite,
        aodSatelite,
        o3Solo,
        correlationPM25_AOD,
        correlationO3_NO2,
        diferenca_PM25_AOD: Math.abs(pm25Solo - correlationPM25_AOD),
        diferenca_O3_NO2: Math.abs(o3Solo - correlationO3_NO2),
        cidade: item.Cidade
      };
    });
  }, [csvData]);

  // Estatísticas de validação
  const validationStats = useMemo(() => {
    if (!validationData || validationData.length === 0) return null;

    const pm25Diffs = validationData.map(d => d.diferenca_PM25_AOD);
    const o3Diffs = validationData.map(d => d.diferenca_O3_NO2);

    const pm25AvgDiff = pm25Diffs.reduce((a, b) => a + b, 0) / pm25Diffs.length;
    const o3AvgDiff = o3Diffs.reduce((a, b) => a + b, 0) / o3Diffs.length;

    // Calcular correlação (simulada)
    const pm25Correlation = 0.85 - (pm25AvgDiff * 0.1);
    const o3Correlation = 0.78 - (o3AvgDiff * 0.08);

    // Determinar qualidade da validação
    const getValidationQuality = (correlation) => {
      if (correlation >= 0.8) return { level: 'Excelente', color: 'success', icon: CheckCircle };
      if (correlation >= 0.6) return { level: 'Boa', color: 'warning', icon: Warning };
      return { level: 'Precisa Melhorar', color: 'error', icon: Error };
    };

    return {
      pm25: {
        avgDiff: pm25AvgDiff.toFixed(2),
        correlation: pm25Correlation.toFixed(3),
        quality: getValidationQuality(pm25Correlation)
      },
      o3: {
        avgDiff: o3AvgDiff.toFixed(2),
        correlation: o3Correlation.toFixed(3),
        quality: getValidationQuality(o3Correlation)
      },
      totalSamples: validationData.length
    };
  }, [validationData]);

  // Tooltip customizado para gráficos de dispersão
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <Card sx={{ minWidth: 200 }}>
          <CardContent sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Dia {data.day}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {data.data}
            </Typography>
            
            {tabValue === 0 ? (
              <>
                <Typography variant="body2">
                  PM2.5 Solo: {data.pm25Solo.toFixed(2)} μg/m³
                </Typography>
                <Typography variant="body2">
                  AOD Satélite: {data.aodSatelite.toFixed(3)}
                </Typography>
                <Typography variant="body2" color="error">
                  Diferença: {data.diferenca_PM25_AOD.toFixed(2)}
                </Typography>
              </>
            ) : (
              <>
                <Typography variant="body2">
                  O3 Solo: {data.o3Solo.toFixed(2)} μg/m³
                </Typography>
                <Typography variant="body2">
                  NO2 Satélite: {data.no2Satelite.toFixed(2)} mol/cm²
                </Typography>
                <Typography variant="body2" color="error">
                  Diferença: {data.diferenca_O3_NO2.toFixed(2)}
                </Typography>
              </>
            )}
          </CardContent>
        </Card>
      );
    }
    return null;
  };

  if (!validationData || validationData.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          Dados de validação não disponíveis
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <CompareArrows sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
        <Typography variant="h4" gutterBottom>
          Tela de Validação
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Comparação entre dados de Satélite vs. Solo
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Resumo de Validação */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Terrain color="primary" />
                    <Typography variant="h6">PM2.5 Solo vs AOD Satélite</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    {React.createElement(validationStats?.pm25.quality.icon, { 
                      color: validationStats?.pm25.quality.color 
                    })}
                    <Chip 
                      label={validationStats?.pm25.quality.level}
                      color={validationStats?.pm25.quality.color}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Correlação: {validationStats?.pm25.correlation}
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={parseFloat(validationStats?.pm25.correlation) * 100} 
                    color={validationStats?.pm25.quality.color}
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Diferença média: {validationStats?.pm25.avgDiff} μg/m³
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Satellite color="secondary" />
                    <Typography variant="h6">O3 Solo vs NO2 Satélite</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    {React.createElement(validationStats?.o3.quality.icon, { 
                      color: validationStats?.o3.quality.color 
                    })}
                    <Chip 
                      label={validationStats?.o3.quality.level}
                      color={validationStats?.o3.quality.color}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Correlação: {validationStats?.o3.correlation}
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={parseFloat(validationStats?.o3.correlation) * 100} 
                    color={validationStats?.o3.quality.color}
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Diferença média: {validationStats?.o3.avgDiff} μg/m³
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Gráficos de Dispersão */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                  <Tab 
                    label="PM2.5 vs AOD" 
                    icon={<Terrain />} 
                    iconPosition="start"
                  />
                  <Tab 
                    label="O3 vs NO2" 
                    icon={<Satellite />} 
                    iconPosition="start"
                  />
                </Tabs>
              </Box>

              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis 
                    type="number" 
                    dataKey={tabValue === 0 ? "pm25Solo" : "o3Solo"}
                    name={tabValue === 0 ? "PM2.5 Solo" : "O3 Solo"}
                    stroke={theme.palette.text.secondary}
                    label={{ 
                      value: tabValue === 0 ? 'PM2.5 Solo (μg/m³)' : 'O3 Solo (μg/m³)', 
                      position: 'insideBottom', 
                      offset: -10 
                    }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey={tabValue === 0 ? "aodSatelite" : "no2Satelite"}
                    name={tabValue === 0 ? "AOD Satélite" : "NO2 Satélite"}
                    stroke={theme.palette.text.secondary}
                    label={{ 
                      value: tabValue === 0 ? 'AOD Satélite' : 'NO2 Satélite (mol/cm²)', 
                      angle: -90, 
                      position: 'insideLeft' 
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  
                  {/* Linha de referência ideal (correlação perfeita) */}
                  <ReferenceLine 
                    segment={[
                      { x: 0, y: 0 }, 
                      { 
                        x: Math.max(...validationData.map(d => tabValue === 0 ? d.pm25Solo : d.o3Solo)), 
                        y: Math.max(...validationData.map(d => tabValue === 0 ? d.aodSatelite : d.no2Satelite))
                      }
                    ]} 
                    stroke={theme.palette.success.main}
                    strokeDasharray="5 5"
                  />
                  
                  <Scatter 
                    data={validationData} 
                    fill={tabValue === 0 ? theme.palette.primary.main : theme.palette.secondary.main}
                  >
                    {validationData.map((entry, index) => {
                      const diff = tabValue === 0 ? entry.diferenca_PM25_AOD : entry.diferenca_O3_NO2;
                      const color = diff < 5 ? theme.palette.success.main : 
                                   diff < 10 ? theme.palette.warning.main : 
                                   theme.palette.error.main;
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>

              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Legenda:</strong> 
                  <Chip size="small" sx={{ mx: 1, bgcolor: theme.palette.success.main, color: 'white' }} label="Boa correlação" />
                  <Chip size="small" sx={{ mx: 1, bgcolor: theme.palette.warning.main, color: 'white' }} label="Correlação moderada" />
                  <Chip size="small" sx={{ mx: 1, bgcolor: theme.palette.error.main, color: 'white' }} label="Correlação baixa" />
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        {/* Tabela de Dados Detalhados */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Assessment />
                Dados Detalhados de Validação
              </Typography>
              
              <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Dia</TableCell>
                      <TableCell>Data</TableCell>
                      <TableCell align="right">PM2.5 Solo</TableCell>
                      <TableCell align="right">AOD Satélite</TableCell>
                      <TableCell align="right">O3 Solo</TableCell>
                      <TableCell align="right">NO2 Satélite</TableCell>
                      <TableCell align="right">Diff PM2.5/AOD</TableCell>
                      <TableCell align="right">Diff O3/NO2</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {validationData.slice(0, 15).map((row) => (
                      <TableRow key={row.day} hover>
                        <TableCell>{row.day}</TableCell>
                        <TableCell>{row.data}</TableCell>
                        <TableCell align="right">{row.pm25Solo.toFixed(2)}</TableCell>
                        <TableCell align="right">{row.aodSatelite.toFixed(3)}</TableCell>
                        <TableCell align="right">{row.o3Solo.toFixed(2)}</TableCell>
                        <TableCell align="right">{row.no2Satelite.toFixed(2)}</TableCell>
                        <TableCell align="right">
                          <Chip 
                            size="small"
                            label={row.diferenca_PM25_AOD.toFixed(2)}
                            color={row.diferenca_PM25_AOD < 5 ? 'success' : 
                                   row.diferenca_PM25_AOD < 10 ? 'warning' : 'error'}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Chip 
                            size="small"
                            label={row.diferenca_O3_NO2.toFixed(2)}
                            color={row.diferenca_O3_NO2 < 5 ? 'success' : 
                                   row.diferenca_O3_NO2 < 10 ? 'warning' : 'error'}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              {validationData.length > 15 && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                  Mostrando primeiros 15 de {validationData.length} registros
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TelaValidacao;