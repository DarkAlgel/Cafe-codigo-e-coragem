import React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip,
  Divider,
  Paper,
  Button
} from '@mui/material';
import {
  Group,
  Science,
  Analytics,
  CloudQueue,
  TrendingUp,
  Launch
} from '@mui/icons-material';

const AboutTeam = () => {
  const teamMembers = [
    {
      name: 'Luan Soares Barco',
      initials: 'LSB',
      color: '#1976d2'
    },
    {
      name: 'Leonardo Moreira Trento Pinge',
      initials: 'LMTP',
      color: '#388e3c'
    },
    {
      name: 'Gabriel Passolongo Cardozo',
      initials: 'GPC',
      color: '#f57c00'
    },
    {
      name: 'Fernando Datorre',
      initials: 'FD',
      color: '#7b1fa2'
    }
  ];

  const features = [
    {
      icon: <Science sx={{ fontSize: 40, color: '#1976d2' }} />,
      title: 'NASA Data Integration',
      description: 'Combines satellite and ground-station data from NASA missions'
    },
    {
      icon: <Analytics sx={{ fontSize: 40, color: '#388e3c' }} />,
      title: 'Machine Learning',
      description: 'Advanced ML models for air quality forecasting and predictions'
    },
    {
      icon: <CloudQueue sx={{ fontSize: 40, color: '#f57c00' }} />,
      title: 'Real-time Monitoring',
      description: 'Live air quality monitoring with AQI and pollutant levels'
    },
    {
      icon: <TrendingUp sx={{ fontSize: 40, color: '#7b1fa2' }} />,
      title: 'Predictive Alerts',
      description: 'Proactive alerts for air quality deterioration'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <Group sx={{ fontSize: 48, color: '#1976d2', mr: 2 }} />
          <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
            About Team
          </Typography>
        </Box>
        <Typography variant="h6" color="textSecondary" sx={{ maxWidth: 800, mx: 'auto' }}>
          Meet the team behind Air Sentinel - dedicated to improving air quality monitoring through innovative technology
        </Typography>
      </Box>

      {/* Team Section */}
      <Card sx={{ mb: 6, boxShadow: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Group sx={{ mr: 2, color: '#1976d2' }} />
            Team
          </Typography>
          
          <Grid container spacing={3}>
            {teamMembers.map((member, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: member.color,
                      fontSize: '1.2rem',
                      fontWeight: 'bold',
                      mx: 'auto',
                      mb: 2,
                      boxShadow: 2
                    }}
                  >
                    {member.initials}
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {member.name}
                  </Typography>
                  <Chip
                    label="Developer"
                    size="small"
                    sx={{
                      bgcolor: member.color,
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Summary Section */}
      <Card sx={{ mb: 6, boxShadow: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Science sx={{ mr: 2, color: '#1976d2' }} />
            Summary
          </Typography>
          
          <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8, mb: 3 }}>
            Air Sentinel is an application that combines NASA satellite and ground-station data with Machine Learning models to monitor and forecast local air quality. The system sends alerts to users about current poor air quality or when the Machine Learning model predicts significant worsening of conditions.
          </Typography>
          
          <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8, mb: 3 }}>
            The application displays dashboards with detailed data including Air Quality Index (AQI), pollutant levels, and weather conditions (humidity and wind speed), along with practical prevention recommendations to help preserve users' health.
          </Typography>
          
          <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
            By providing air quality forecasts, the application enables users to plan activities accordingly - athletes can schedule workouts, and individuals with respiratory conditions can take precautions. This planning and protection capability demonstrates the system's value to the community.
          </Typography>
        </CardContent>
      </Card>

      {/* Project Details Section */}
      <Card sx={{ mb: 6, boxShadow: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Analytics sx={{ mr: 2, color: '#1976d2' }} />
            Project Details
          </Typography>
          
          <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.8, mb: 4 }}>
            Air Sentinel processes large volumes of data from NASA's missions and instruments to train its Machine Learning model. Based on historical data, the model generates Air Quality Index (AQI) forecasts, delivered to users in a simple and accessible format.
          </Typography>

          {/* Features Grid */}
          <Grid container spacing={3}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Paper sx={{ p: 3, height: '100%', textAlign: 'center', boxShadow: 2 }}>
                  <Box sx={{ mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {feature.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Footer */}
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Divider sx={{ mb: 3 }} />
        
        {/* NASA Space Apps Challenge Link */}
        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<Launch />}
            href="https://www.spaceappschallenge.org/2025/find-a-team/cafe-codigo-amp-coragem/"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              bgcolor: '#1976d2',
              color: 'white',
              fontWeight: 'bold',
              px: 4,
              py: 1.5,
              borderRadius: 3,
              boxShadow: 3,
              '&:hover': {
                bgcolor: '#1565c0',
                boxShadow: 6,
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease'
            }}
          >
            Visit Our NASA Space Apps Challenge Team Page
          </Button>
        </Box>
        
        <Typography variant="body2" color="textSecondary">
          Air Sentinel - Monitoring air quality for a healthier future
        </Typography>
      </Box>
    </Container>
  );
};

export default AboutTeam;