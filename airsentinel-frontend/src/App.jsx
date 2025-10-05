import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import AboutTeam from './pages/AboutTeam';
import { authService } from './services/api';

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

const HealthPage = () => (
  <Box sx={{ p: 3 }}>
    <h2>Saúde</h2>
    <p>Página de recomendações de saúde em desenvolvimento...</p>
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
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/predictions" element={
            <ProtectedRoute>
              <Layout>
                <PredictionsPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/health" element={
            <ProtectedRoute>
              <Layout>
                <HealthPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/alerts" element={
            <ProtectedRoute>
              <Layout>
                <AlertsPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <Layout>
                <ProfilePage />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/about-team" element={
            <ProtectedRoute>
              <Layout>
                <AboutTeam />
              </Layout>
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
