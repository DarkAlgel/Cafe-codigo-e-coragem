import React from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Chip,
  Alert
} from '@mui/material';
import {
  HealthAndSafety,
  DirectionsRun,
  Masks,
  Home,
  FamilyRestroom,
  MonitorHeart,
  Shield,
  Air,
  Eco,
  Warning
} from '@mui/icons-material';

const HealthPage = () => {
  const badAirActions = [
    {
      icon: <Home sx={{ color: '#4CAF50', fontSize: 28 }} />,
      title: 'Permaneça em Ambientes Fechados',
      description: 'Limite atividades ao ar livre, especialmente exercícios vigorosos, quando a qualidade do ar estiver ruim.'
    },
    {
      icon: <Masks sx={{ color: '#2196F3', fontSize: 28 }} />,
      title: 'Use Máscaras N95 ou KN95',
      description: 'Feche janelas e use purificadores de ar HEPA em ambientes internos.'
    }
  ];

  const sensitiveGroups = [
    {
      icon: <FamilyRestroom sx={{ color: '#FF9800', fontSize: 28 }} />,
      title: 'Crianças, Idosos e Gestantes',
      description: 'Tome precauções extras, evite completamente a exposição ao ar livre em dias de má qualidade.'
    },
    {
      icon: <MonitorHeart sx={{ color: '#F44336', fontSize: 28 }} />,
      title: 'Pessoas com Condições Respiratórias/Cardíacas',
      description: 'Consulte seu médico para um plano de ação pessoal e mantenha medicamentos à mão.'
    }
  ];

  const longTermStrategies = [
    {
      icon: <Air sx={{ color: '#4CAF50', fontSize: 28 }} />,
      title: 'Monitore a Qualidade do Ar Regularmente',
      description: 'Use o Air Sentinel para se manter informado sobre as condições locais.'
    },
    {
      icon: <Eco sx={{ color: '#4CAF50', fontSize: 28 }} />,
      title: 'Promova o Ar Limpo',
      description: 'Apoie iniciativas locais para ar mais limpo e reduza sua pegada de poluição pessoal.'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <HealthAndSafety sx={{ color: '#4CAF50', fontSize: 48, mr: 2 }} />
          <Typography 
            variant="h3" 
            component="h1" 
            sx={{ 
              fontWeight: 'bold',
              color: '#333',
              background: 'linear-gradient(45deg, #4CAF50, #2196F3)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Protegendo Sua Saúde da Poluição do Ar
          </Typography>
        </Box>
        <Typography variant="h6" color="textSecondary" sx={{ maxWidth: 800, mx: 'auto' }}>
          Informações essenciais e recomendações práticas para proteger você e sua família dos efeitos da poluição do ar
        </Typography>
      </Box>

      {/* Actions for Bad Air Days */}
      <Card sx={{ mb: 4, borderLeft: '4px solid #4CAF50' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Eco sx={{ color: '#4CAF50', fontSize: 32, mr: 2 }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
              Ações para Dias de Má Qualidade do Ar
            </Typography>
          </Box>
          
          <Grid container spacing={3}>
            {badAirActions.map((action, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Paper 
                  sx={{ 
                    p: 3, 
                    height: '100%',
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 4px 16px rgba(76, 175, 80, 0.15)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ mr: 2, mt: 0.5 }}>
                      {action.icon}
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#333' }}>
                        {action.title}
                      </Typography>
                      <Typography variant="body1" color="textSecondary" sx={{ lineHeight: 1.6 }}>
                        {action.description}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Alert severity="warning" sx={{ mt: 3 }}>
            <Typography variant="body2">
              <strong>Dica Importante:</strong> Mantenha-se informado sobre a qualidade do ar local através do Air Sentinel 
              e planeje suas atividades de acordo com as condições atuais.
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      {/* Recommendations for Sensitive Groups */}
      <Card sx={{ mb: 4, borderLeft: '4px solid #FF9800' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <FamilyRestroom sx={{ color: '#FF9800', fontSize: 32, mr: 2 }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#FF9800' }}>
              Recomendações para Grupos Sensíveis
            </Typography>
          </Box>
          
          <Grid container spacing={3}>
            {sensitiveGroups.map((group, index) => (
              <Grid item xs={12} key={index}>
                <Paper 
                  sx={{ 
                    p: 3,
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 4px 16px rgba(255, 152, 0, 0.15)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <Box sx={{ mr: 3, mt: 0.5 }}>
                      {group.icon}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#333' }}>
                        {group.title}
                      </Typography>
                      <Typography variant="body1" color="textSecondary" sx={{ lineHeight: 1.6 }}>
                        {group.description}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body2">
              <strong>Atenção Especial:</strong> Pessoas com asma, DPOC, doenças cardíacas, crianças, idosos e gestantes 
              devem ser especialmente cuidadosas durante períodos de má qualidade do ar.
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      {/* Long-Term Health Strategies */}
      <Card sx={{ mb: 4, borderLeft: '4px solid #2196F3' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Shield sx={{ color: '#2196F3', fontSize: 32, mr: 2 }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2196F3' }}>
              Estratégias de Saúde a Longo Prazo
            </Typography>
          </Box>
          
          <Grid container spacing={3}>
            {longTermStrategies.map((strategy, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Paper 
                  sx={{ 
                    p: 3, 
                    height: '100%',
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 4px 16px rgba(33, 150, 243, 0.15)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ mr: 2, mt: 0.5 }}>
                      {strategy.icon}
                    </Box>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#333' }}>
                        {strategy.title}
                      </Typography>
                      <Typography variant="body1" color="textSecondary" sx={{ lineHeight: 1.6 }}>
                        {strategy.description}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Alert severity="success" sx={{ mt: 3 }}>
            <Typography variant="body2">
              <strong>Benefício a Longo Prazo:</strong> Ao fornecer previsões de qualidade do ar, o Air Sentinel permite 
              que você planeje atividades adequadamente - atletas podem agendar treinos e pessoas com condições respiratórias 
              podem tomar precauções.
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      {/* Additional Health Tips */}
      <Card sx={{ borderLeft: '4px solid #4CAF50' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Warning sx={{ color: '#4CAF50', fontSize: 32, mr: 2 }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
              Dicas Adicionais de Saúde
            </Typography>
          </Box>
          
          <List>
            <ListItem>
              <ListItemIcon>
                <DirectionsRun sx={{ color: '#4CAF50' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Exercite-se em Horários Adequados"
                secondary="Prefira exercitar-se pela manhã cedo ou à noite, quando os níveis de poluição tendem a ser menores."
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <Home sx={{ color: '#2196F3' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Mantenha Ambientes Internos Limpos"
                secondary="Use purificadores de ar, mantenha plantas que filtram o ar e evite fumar em ambientes fechados."
              />
            </ListItem>
            
            <ListItem>
              <ListItemIcon>
                <MonitorHeart sx={{ color: '#FF9800' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Monitore Sua Saúde"
                secondary="Fique atento a sintomas como tosse, falta de ar ou irritação nos olhos, especialmente em dias de má qualidade do ar."
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </Container>
  );
};

export default HealthPage;