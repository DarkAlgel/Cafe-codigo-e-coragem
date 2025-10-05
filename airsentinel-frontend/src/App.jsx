import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, Container, useTheme, useMediaQuery } from '@mui/material';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import Dashboard from './pages/Dashboard';
import AboutTeam from './pages/AboutTeam';
import HealthPage from './pages/HealthPage';
import './App.css';

// Tema personalizado do Air Sentinel
const theme = createTheme({
  palette: {
    primary: {
      main: '#4CAF50', // Verde principal
      light: '#81C784',
      dark: '#388E3C',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#2196F3', // Azul secundário
      light: '#64B5F6',
      dark: '#1976D2',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
      color: '#333333',
    },
    h6: {
      fontWeight: 600,
      color: '#333333',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          transition: 'box-shadow 0.3s ease',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
});

// Componente de layout principal
const MainLayout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      width: '100%'
    }}>
      <Navbar />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: { xs: 8, sm: 9 }, // Espaço para o header fixo
          pb: 2,
          backgroundColor: '#f5f5f5',
          width: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Container 
          maxWidth="xl" 
          sx={{ 
            px: { xs: 1, sm: 2, md: 3 },
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {children}
        </Container>
      </Box>
      
      <Footer />
    </Box>
  );
};

// Componente de rota protegida (placeholder)
const ProtectedRoute = ({ children }) => {
  // Por enquanto, sempre permite acesso para desenvolvimento
  // Em produção, verificaria authService.isAuthenticated()
  return children;
};

// Páginas placeholder para desenvolvimento
const PredictionsPage = () => (
  <Box sx={{ p: 3 }}>
    <h2>Previsões</h2>
    <p>Página de previsões em desenvolvimento...</p>
  </Box>
);



const AlertsPage = () => (
  <Box sx={{ p: 3 }}>
    <h2>Alertas</h2>
    <p>Página de alertas em desenvolvimento...</p>
  </Box>
);

const ProfilePage = () => (
  <Box sx={{ p: 3 }}>
    <h2>Perfil</h2>
    <p>Página de perfil do usuário em desenvolvimento...</p>
  </Box>
);

const LoginPage = () => (
  <Box sx={{ 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    minHeight: '100vh',
    backgroundColor: '#f5f5f5'
  }}>
    <Box sx={{ p: 4, backgroundColor: 'white', borderRadius: 2, boxShadow: 2 }}>
      <h2>Login</h2>
      <p>Página de login em desenvolvimento...</p>
      <p>Por enquanto, você será redirecionado automaticamente para o dashboard.</p>
    </Box>
  </Box>
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Rota de login */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Rotas protegidas com layout */}
          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/predictions" element={
            <ProtectedRoute>
              <MainLayout>
                <PredictionsPage />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/health" element={
            <ProtectedRoute>
              <MainLayout>
                <HealthPage />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/alerts" element={
            <ProtectedRoute>
              <MainLayout>
                <AlertsPage />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <MainLayout>
                <ProfilePage />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/about-team" element={
            <ProtectedRoute>
              <MainLayout>
                <AboutTeam />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          {/* Redirecionamento padrão */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
