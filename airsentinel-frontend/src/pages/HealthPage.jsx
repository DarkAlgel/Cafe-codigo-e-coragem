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
  Nature,
  Warning
} from '@mui/icons-material';

const HealthPage = () => {
  const badAirActions = [
    {
      icon: <Home sx={{ color: '#4CAF50', fontSize: 28 }} />,
      title: 'Stay Indoors',
      description: 'Limit outdoor activities, especially vigorous exercise, when air quality is poor.'
    },
    {
      icon: <Masks sx={{ color: '#2196F3', fontSize: 28 }} />,
      title: 'Use N95 or KN95 Masks',
      description: 'Close windows and use HEPA air purifiers indoors.'
    }
  ];

  const sensitiveGroups = [
    {
      icon: <FamilyRestroom sx={{ color: '#FF9800', fontSize: 28 }} />,
      title: 'Children, Elderly & Pregnant Individuals',
      description: 'Take extra precautions, avoid outdoor exposure completely on poor air quality days.'
    },
    {
      icon: <MonitorHeart sx={{ color: '#F44336', fontSize: 28 }} />,
      title: 'Individuals with Respiratory/Heart Conditions',
      description: 'Consult your doctor for a personal action plan and keep medication handy.'
    }
  ];

  const longTermStrategies = [
    {
      icon: <Air sx={{ color: '#4CAF50', fontSize: 28 }} />,
      title: 'Monitor Air Quality Regularly',
      description: 'Use Air Sentinel to stay informed about local conditions.'
    },
    {
      icon: <Nature sx={{ color: '#4CAF50', fontSize: 28 }} />,
      title: 'Promote Clean Air',
      description: 'Support local initiatives for cleaner air and reduce your personal pollution footprint.'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      {/* Header */}
      <Box sx={{ mb: 2, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
          <HealthAndSafety sx={{ color: '#4CAF50', fontSize: 36, mr: 1.5 }} />
          <Typography 
            variant="h4" 
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
            Protecting Your Health from Air Pollution
          </Typography>
        </Box>
        <Typography variant="body1" color="textSecondary" sx={{ maxWidth: 800, mx: 'auto' }}>
          Essential information and practical recommendations to protect you and your family from the effects of air pollution
        </Typography>
      </Box>

      {/* Actions for Bad Air Days */}
      <Card sx={{ mb: 2, borderLeft: '4px solid #4CAF50' }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Nature sx={{ color: '#4CAF50', fontSize: 24, mr: 1.5 }} />
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
              Actions to Take on Bad Air Days
            </Typography>
          </Box>
          
          <Grid container spacing={2}>
            {badAirActions.map((action, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Paper 
                  sx={{ 
                    p: 2, 
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
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ mr: 1.5, mt: 0.5 }}>
                      {action.icon}
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 0.5, color: '#333' }}>
                        {action.title}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ lineHeight: 1.5 }}>
                        {action.description}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Important Tip:</strong> Stay informed about local air quality through Air Sentinel 
              and plan your activities according to current conditions.
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      {/* Recommendations for Sensitive Groups */}
      <Card sx={{ mb: 2, borderLeft: '4px solid #FF9800' }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FamilyRestroom sx={{ color: '#FF9800', fontSize: 24, mr: 1.5 }} />
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#FF9800' }}>
              Recommendations for Sensitive Groups
            </Typography>
          </Box>
          
          <Grid container spacing={2}>
            {sensitiveGroups.map((group, index) => (
              <Grid item xs={12} key={index}>
                <Paper 
                  sx={{ 
                    p: 2,
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
                    <Box sx={{ mr: 2, mt: 0.5 }}>
                      {group.icon}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 0.5, color: '#333' }}>
                        {group.title}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ lineHeight: 1.5 }}>
                        {group.description}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Special Attention:</strong> People with asthma, COPD, heart disease, children, elderly and pregnant women 
              should be especially careful during periods of poor air quality.
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      {/* Long-Term Health Strategies */}
      <Card sx={{ mb: 2, borderLeft: '4px solid #2196F3' }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Shield sx={{ color: '#2196F3', fontSize: 24, mr: 1.5 }} />
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2196F3' }}>
              Long-Term Health Strategies
            </Typography>
          </Box>
          
          <Grid container spacing={2}>
            {longTermStrategies.map((strategy, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Paper 
                  sx={{ 
                    p: 2, 
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
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ mr: 1.5, mt: 0.5 }}>
                      {strategy.icon}
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 0.5, color: '#333' }}>
                        {strategy.title}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ lineHeight: 1.5 }}>
                        {strategy.description}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Alert severity="success" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Long-Term Benefit:</strong> By providing air quality forecasts, Air Sentinel enables 
              you to plan activities accordingly - athletes can schedule workouts and people with respiratory conditions 
              can take precautions.
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      {/* Additional Health Tips */}
      <Card sx={{ borderLeft: '4px solid #4CAF50' }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Warning sx={{ color: '#4CAF50', fontSize: 24, mr: 1.5 }} />
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#4CAF50' }}>
              Additional Health Tips
            </Typography>
          </Box>
          
          <List sx={{ py: 0 }}>
            <ListItem sx={{ py: 1 }}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <DirectionsRun sx={{ color: '#4CAF50', fontSize: 20 }} />
              </ListItemIcon>
              <ListItemText 
                primary={
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    Exercise at Appropriate Times
                  </Typography>
                }
                secondary={
                  <Typography variant="body2" color="textSecondary">
                    Prefer exercising early in the morning or evening, when pollution levels tend to be lower.
                  </Typography>
                }
              />
            </ListItem>
            
            <ListItem sx={{ py: 1 }}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Home sx={{ color: '#2196F3', fontSize: 20 }} />
              </ListItemIcon>
              <ListItemText 
                primary={
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    Keep Indoor Environments Clean
                  </Typography>
                }
                secondary={
                  <Typography variant="body2" color="textSecondary">
                    Use air purifiers, maintain air-filtering plants and avoid smoking in enclosed spaces.
                  </Typography>
                }
              />
            </ListItem>
            
            <ListItem sx={{ py: 1 }}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <MonitorHeart sx={{ color: '#FF9800', fontSize: 20 }} />
              </ListItemIcon>
              <ListItemText 
                primary={
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    Monitor Your Health
                  </Typography>
                }
                secondary={
                  <Typography variant="body2" color="textSecondary">
                    Watch for symptoms like coughing, shortness of breath or eye irritation, especially on poor air quality days.
                  </Typography>
                }
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </Container>
  );
};

export default HealthPage;