import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Link,
  Divider,
  IconButton,
  Chip
} from '@mui/material';
import {
  GitHub,
  LinkedIn,
  Email,
  Science,
  CloudQueue,
  Favorite
} from '@mui/icons-material';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'primary.main',
        color: 'white',
        py: 4,
        mt: 'auto',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Project Info */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CloudQueue sx={{ mr: 1, fontSize: 28 }} />
              <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                Air Sentinel
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
              Monitoring air quality for a healthier future. Real-time atmospheric data 
              and intelligent predictions to help communities make informed decisions.
            </Typography>
            <Chip
              icon={<Science />}
              label="NASA Space Apps Challenge 2025"
              variant="outlined"
              sx={{
                color: 'white',
                borderColor: 'rgba(255, 255, 255, 0.5)',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            />
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link
                href="/"
                color="inherit"
                underline="hover"
                sx={{ opacity: 0.9, '&:hover': { opacity: 1 } }}
              >
                Dashboard
              </Link>
              <Link
                href="/about-team"
                color="inherit"
                underline="hover"
                sx={{ opacity: 0.9, '&:hover': { opacity: 1 } }}
              >
                About Team
              </Link>
              <Link
                href="https://www.spaceappschallenge.org/2025/find-a-team/cafe-codigo-amp-coragem/"
                target="_blank"
                rel="noopener noreferrer"
                color="inherit"
                underline="hover"
                sx={{ opacity: 0.9, '&:hover': { opacity: 1 } }}
              >
                NASA Space Apps Challenge
              </Link>
            </Box>
          </Grid>

          {/* Team & Contact */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Team Café, Código & Coragem
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
              A passionate team of developers and data scientists working together 
              to create innovative solutions for environmental monitoring.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                color="inherit"
                sx={{
                  opacity: 0.8,
                  '&:hover': {
                    opacity: 1,
                    bgcolor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                <GitHub />
              </IconButton>
              <IconButton
                color="inherit"
                sx={{
                  opacity: 0.8,
                  '&:hover': {
                    opacity: 1,
                    bgcolor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                <LinkedIn />
              </IconButton>
              <IconButton
                color="inherit"
                sx={{
                  opacity: 0.8,
                  '&:hover': {
                    opacity: 1,
                    bgcolor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                <Email />
              </IconButton>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.2)' }} />

        {/* Copyright */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            © {currentYear} Air Sentinel - Team Café, Código & Coragem. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              Made with
            </Typography>
            <Favorite sx={{ fontSize: 16, color: '#ff4757' }} />
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              for a better world
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;