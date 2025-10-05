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
  Paper,
  Link
} from '@mui/material';
import {
  Group,
  Science,
  Analytics,
  CloudQueue,
  TrendingUp,
  Assignment
} from '@mui/icons-material';
import styles from './AboutTeam.module.css';

// Team member photos
import luanPhoto from '../assets/photos/QczdFQGY0uINjS74.jpg';
import leonardoPhoto from '../assets/photos/47FGP4SJF3zQ2d8P.jpg';
import gabrielPhoto from '../assets/photos/B8kR9gQNcj1ja7xM.jpeg';
import fernandoPhoto from '../assets/photos/f7O9KheJPJ4BLVEo.jpeg';

const AboutTeam = () => {
  const teamMembers = [
    {
      id: 'luan-soares-barco',
      name: 'Luan Soares Barco',
      initials: 'LSB',
      color: '#1976d2',
      photo: luanPhoto
    },
    {
      id: 'leonardo-moreira-trento-pinge',
      name: 'Leonardo Moreira Trento Pinge',
      initials: 'LMTP',
      color: '#388e3c',
      photo: leonardoPhoto
    },
    {
      id: 'gabriel-passolongo-cardozo',
      name: 'Gabriel Passolongo Cardozo',
      initials: 'GPC',
      color: '#f57c00',
      photo: gabrielPhoto
    },
    {
      id: 'fernando-datorre',
      name: 'Fernando Datorre',
      initials: 'FD',
      color: '#7b1fa2',
      photo: fernandoPhoto
    }
  ];

  const features = [
    {
      icon: <Science className={styles.featureIconScience} />,
      title: 'NASA Data Integration',
      description: 'Combines satellite and ground-station data from NASA missions'
    },
    {
      icon: <Analytics className={styles.featureIconAnalytics} />,
      title: 'Machine Learning',
      description: 'Advanced ML models for air quality forecasting and predictions'
    },
    {
      icon: <CloudQueue className={styles.featureIconCloud} />,
      title: 'Real-time Monitoring',
      description: 'Live air quality monitoring with AQI and pollutant levels'
    },
    {
      icon: <TrendingUp className={styles.featureIconTrending} />,
      title: 'Predictive Alerts',
      description: 'Proactive alerts for air quality deterioration'
    }
  ];

  return (
    <>
    <Container maxWidth="lg" className={styles.container}>
      {/* Header */}
      <Box className={styles.header}>
        <Box className={styles.headerBox}>
          <Group className={styles.headerIcon} />
          <Typography variant="h3" component="h1" className={styles.headerTitle}>
            About Team
          </Typography>
        </Box>
        <Typography variant="h6" color="textSecondary" className={styles.headerSubtitle}>
          Meet the team behind Air Sentinel - dedicated to improving air quality monitoring through innovative technology
        </Typography>
      </Box>

      {/* Team Section */}
      <Card className={styles.card}>
        <CardContent className={styles.cardContent}>
          <Typography variant="h4" gutterBottom className={styles.sectionTitle}>
            <Group className={styles.sectionIcon} />
            Team
          </Typography>
          
          <Grid container spacing={3}>
            {teamMembers.map((member, index) => (
              <Grid item xs={12} sm={6} md={3} key={member.id}>
                <Box className={styles.teamMemberBox}>
                  <Avatar
                    src={member.photo}
                    alt={member.name}
                    className={`${styles.avatar} ${styles[`avatar${member.name.split(' ')[0]}`]}`}
                  >
                    {member.initials}
                  </Avatar>
                  <Typography variant="h6" className={styles.memberName}>
                    {member.name}
                  </Typography>
                  <Chip
                    label="Developer"
                    size="small"
                    className={styles[`chip${member.name.split(' ')[0]}`]}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Summary Section */}
      <Card className={styles.card}>
        <CardContent className={styles.cardContent}>
          <Typography variant="h4" gutterBottom className={styles.sectionTitle}>
            <Science className={styles.sectionIcon} />
            Summary
          </Typography>
          
          <Typography variant="body1" className={styles.summaryText}>
            Air Sentinel is an application that combines NASA satellite and ground-station data with Machine Learning models to monitor and forecast local air quality. The system sends alerts to users about current poor air quality or when the Machine Learning model predicts significant worsening of conditions.
          </Typography>
          
          <Typography variant="body1" className={styles.summaryText}>
            The application displays dashboards with detailed data including Air Quality Index (AQI), pollutant levels, and weather conditions (humidity and wind speed), along with practical prevention recommendations to help preserve users' health.
          </Typography>
          
          <Typography variant="body1" className={styles.summaryTextLast}>
            By providing air quality forecasts, the application enables users to plan activities accordingly - athletes can schedule workouts, and individuals with respiratory conditions can take precautions. This planning and protection capability demonstrates the system's value to the community.
          </Typography>
        </CardContent>
      </Card>

      {/* Features Section */}
      <Card className={styles.card}>
        <CardContent className={styles.cardContent}>
          <Typography variant="h4" gutterBottom className={styles.sectionTitle}>
            <Analytics className={styles.sectionIcon} />
            Features
          </Typography>
          
          <Typography variant="body1" className={styles.featuresDescription}>
            Air Sentinel processes large volumes of data from NASA's missions and instruments to train its Machine Learning model. Based on historical data, the model generates Air Quality Index (AQI) forecasts, delivered to users in a simple and accessible format.
          </Typography>

          {/* Features Grid */}
          <Grid container spacing={3}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Paper className={styles.featurePaper}>
                  <Box className={styles.featureIconBox}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" className={styles.featureTitle}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" className={styles.featureDescription}>
                    {feature.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Container>

    {/* Footer */}
    <Box className={styles.footer}>
      <Container maxWidth="lg">
        <Typography variant="body2" className={styles.footerText}>
          <Link 
            href="https://www.spaceappschallenge.org/" 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.footerLink}
          >
            NASA Space Apps Challenge 2024
          </Link>
        </Typography>
        <Typography variant="body2" className={styles.footerText}>
          Air Sentinel - Monitoring air quality with NASA data and Machine Learning
        </Typography>
      </Container>
    </Box>
    </>
  );
};

export default AboutTeam;