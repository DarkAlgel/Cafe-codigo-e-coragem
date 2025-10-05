import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  IconButton,
  Divider,
  useTheme
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  HealthAndSafety,
  Warning,
  CheckCircle,
  Info,
  ChildCare,
  Elderly,
  FitnessCenter,
  LocalHospital,
  Masks,
  DirectionsRun,
  Home,
  Schedule
} from '@mui/icons-material';

const HealthRecommendations = ({ 
  recommendations = [], 
  userProfile = null,
  currentAQI = 0,
  loading = false 
}) => {
  const theme = useTheme();
  const [expandedGroups, setExpandedGroups] = useState({});

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const getRiskGroupIcon = (group) => {
    const iconMap = {
      'children': <ChildCare />,
      'elderly': <Elderly />,
      'athletes': <FitnessCenter />,
      'respiratory': <LocalHospital />
    };
    return iconMap[group] || <Info />;
  };

  const getRiskGroupColor = (group) => {
    const colorMap = {
      'children': '#FF9800',
      'elderly': '#9C27B0',
      'athletes': '#2196F3',
      'respiratory': '#F44336',
      'cardiac': '#E91E63',
      'general': '#4CAF50'
    };
    return colorMap[group] || '#4CAF50';
  };

  const getRiskGroupLabel = (group) => {
    const labelMap = {
      'children': 'Crianças',
      'elderly': 'Idosos',
      'athletes': 'Atletas',
      'respiratory': 'Problemas Respiratórios',
      'cardiac': 'Problemas Cardíacos',
      'general': 'População Geral'
    };
    return labelMap[group] || group;
  };

  const getRecommendationIcon = (type) => {
    const iconMap = {
      'mask': <Masks />,
      'exercise': <DirectionsRun />,
      'indoor': <Home />,
      'time': <Schedule />,
      'warning': <Warning />,
      'info': <Info />
    };
    return iconMap[type] || <Info />;
  };

  const getSeverityColor = (severity) => {
    const colorMap = {
      'high': '#F44336',
      'medium': '#FF9800',
      'low': '#4CAF50',
      'info': '#2196F3'
    };
    return colorMap[severity] || '#2196F3';
  };

  // Agrupar recomendações por grupo de risco
  const groupedRecommendations = recommendations.reduce((acc, rec) => {
    const group = rec.riskGroup || 'general';
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(rec);
    return acc;
  }, {});

  // Recomendações padrão baseadas no IQA atual
  const getDefaultRecommendations = (aqi) => {
    if (aqi <= 50) {
      return [
        {
          id: 'good-1',
          type: 'info',
          severity: 'info',
          title: 'Qualidade do ar excelente',
          description: 'Condições ideais para atividades ao ar livre.',
          riskGroup: 'general'
        }
      ];
    } else if (aqi <= 100) {
      return [
        {
          id: 'moderate-1',
          type: 'info',
          severity: 'low',
          title: 'Qualidade do ar moderada',
          description: 'Pessoas sensíveis devem considerar reduzir atividades prolongadas ao ar livre.',
          riskGroup: 'respiratory'
        }
      ];
    } else if (aqi <= 150) {
      return [
        {
          id: 'unhealthy-sensitive-1',
          type: 'warning',
          severity: 'medium',
          title: 'Insalubre para grupos sensíveis',
          description: 'Crianças, idosos e pessoas com problemas respiratórios devem evitar atividades ao ar livre.',
          riskGroup: 'children'
        },
        {
          id: 'unhealthy-sensitive-2',
          type: 'mask',
          severity: 'medium',
          title: 'Use máscara ao sair',
          description: 'Recomendado o uso de máscaras N95 ou PFF2 ao ar livre.',
          riskGroup: 'general'
        }
      ];
    } else {
      return [
        {
          id: 'unhealthy-1',
          type: 'warning',
          severity: 'high',
          title: 'Qualidade do ar perigosa',
          description: 'Evite atividades ao ar livre. Mantenha janelas fechadas.',
          riskGroup: 'general'
        },
        {
          id: 'unhealthy-2',
          type: 'indoor',
          severity: 'high',
          title: 'Permaneça em ambientes fechados',
          description: 'Use purificadores de ar se disponível.',
          riskGroup: 'general'
        }
      ];
    }
  };

  const displayRecommendations = Object.keys(groupedRecommendations).length > 0 
    ? groupedRecommendations 
    : { general: getDefaultRecommendations(currentAQI) };

  if (loading) {
    return (
      <Card>
        <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
          <Typography>Carregando recomendações...</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <HealthAndSafety sx={{ color: '#4CAF50' }} />
          <Typography variant="h6">
            Recomendações de Saúde
          </Typography>
        </Box>

        {/* Perfil do usuário */}
        {userProfile && (
          <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Seu Perfil:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {userProfile.riskGroups?.map((group) => (
                <Chip
                  key={group}
                  icon={getRiskGroupIcon(group)}
                  label={getRiskGroupLabel(group)}
                  size="small"
                  sx={{ 
                    backgroundColor: getRiskGroupColor(group),
                    color: 'white'
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Recomendações por grupo */}
        {Object.entries(displayRecommendations).map(([groupId, groupRecs]) => (
          <Box key={groupId} sx={{ mb: 2 }}>
            <Button
              fullWidth
              onClick={() => toggleGroup(groupId)}
              sx={{
                justifyContent: 'space-between',
                textTransform: 'none',
                p: 2,
                backgroundColor: `${getRiskGroupColor(groupId)}15`,
                border: `1px solid ${getRiskGroupColor(groupId)}30`,
                borderRadius: 1,
                mb: 1
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar
                  sx={{
                    backgroundColor: getRiskGroupColor(groupId),
                    width: 32,
                    height: 32
                  }}
                >
                  {getRiskGroupIcon(groupId)}
                </Avatar>
                <Typography variant="subtitle1" fontWeight="bold">
                  {getRiskGroupLabel(groupId)}
                </Typography>
                <Chip
                  label={`${groupRecs.length} recomendação${groupRecs.length > 1 ? 'ões' : ''}`}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Box>
              {expandedGroups[groupId] ? <ExpandLess /> : <ExpandMore />}
            </Button>

            <Collapse in={expandedGroups[groupId]} timeout="auto" unmountOnExit>
              <List sx={{ pl: 2 }}>
                {groupRecs.map((rec, index) => (
                  <React.Fragment key={rec.id || index}>
                    <ListItem
                      sx={{
                        backgroundColor: 'white',
                        borderRadius: 1,
                        mb: 1,
                        border: `1px solid ${getSeverityColor(rec.severity)}30`
                      }}
                    >
                      <ListItemIcon>
                        <Avatar
                          sx={{
                            backgroundColor: getSeverityColor(rec.severity),
                            width: 32,
                            height: 32
                          }}
                        >
                          {getRecommendationIcon(rec.type)}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" fontWeight="bold">
                            {rec.title}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                              {rec.description}
                            </Typography>
                            {rec.tips && rec.tips.length > 0 && (
                              <Box sx={{ mt: 1 }}>
                                <Typography variant="caption" color="textSecondary">
                                  Dicas:
                                </Typography>
                                <List dense sx={{ pl: 2 }}>
                                  {rec.tips.map((tip, tipIndex) => (
                                    <ListItem key={tipIndex} sx={{ py: 0.25 }}>
                                      <ListItemIcon sx={{ minWidth: 20 }}>
                                        <CheckCircle sx={{ fontSize: 12, color: '#4CAF50' }} />
                                      </ListItemIcon>
                                      <ListItemText
                                        primary={
                                          <Typography variant="caption">
                                            {tip}
                                          </Typography>
                                        }
                                      />
                                    </ListItem>
                                  ))}
                                </List>
                              </Box>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < groupRecs.length - 1 && <Divider sx={{ my: 1 }} />}
                  </React.Fragment>
                ))}
              </List>
            </Collapse>
          </Box>
        ))}

        {/* Rodapé com informações gerais */}
        <Box sx={{ mt: 3, p: 2, backgroundColor: '#e3f2fd', borderRadius: 1 }}>
          <Typography variant="caption" color="textSecondary">
            💡 As recomendações são baseadas no IQA atual ({currentAQI}) e seu perfil de saúde.
            Consulte sempre um profissional de saúde para orientações específicas.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default HealthRecommendations;