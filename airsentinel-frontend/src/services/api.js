import axios from 'axios';

// Configuração base da API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Criar instância do axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Retornar erro formatado
    const errorMessage = error.response?.data?.error || error.message || 'Erro desconhecido';
    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data
    });
  }
);

// Serviços de autenticação
export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.success && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response;
  },

  register: async (userData) => {
    return await api.post('/auth/register', userData);
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

// Serviços de qualidade do ar
export const airQualityService = {
  getCurrent: async (params = {}) => {
    return await api.get('/air-quality/current', { params });
  },

  getHistorical: async (params = {}) => {
    return await api.get('/air-quality/historical', { params });
  },

  getCities: async () => {
    return await api.get('/air-quality/cities');
  },

  getByLocation: async (lat, lng) => {
    return await api.get('/air-quality/location', { 
      params: { lat, lng } 
    });
  }
};

// Serviços de previsões
export const predictionsService = {
  getHourly: async (params = {}) => {
    return await api.get('/predictions', { params });
  },

  getDaily: async (params = {}) => {
    return await api.get('/predictions/daily', { params });
  },

  getDetailed: async (params = {}) => {
    return await api.get('/predictions/detailed', { params });
  },

  getCitiesPredictions: async (params = {}) => {
    return await api.get('/predictions/cities', { params });
  },

  generatePrediction: async (params = {}) => {
    return await api.post('/predictions/generate', params);
  },

  getModelStatus: async () => {
    return await api.get('/predictions/model/status');
  },

  trainModel: async (params = {}) => {
    return await api.post('/predictions/train', params);
  },

  validatePredictions: async (params = {}) => {
    return await api.get('/predictions/validation', { params });
  }
};

// Serviços de recomendações de saúde
export const healthService = {
  getRecommendations: async () => {
    return await api.get('/health/recommendations');
  },

  getRecommendationsByGroup: async (riskGroup, params = {}) => {
    return await api.get(`/health/recommendations/${riskGroup}`, { params });
  },

  getActivityRecommendations: async (params = {}) => {
    return await api.get('/health/activities', { params });
  },

  submitFeedback: async (recommendationId, feedback) => {
    return await api.post(`/health/recommendations/${recommendationId}/feedback`, feedback);
  },

  getHealthStats: async () => {
    return await api.get('/health/stats');
  }
};

// Serviços de alertas
export const alertsService = {
  getActive: async (params = {}) => {
    return await api.get('/alerts', { params });
  },

  getHistory: async (params = {}) => {
    return await api.get('/alerts/history', { params });
  },

  markAsRead: async (alertId) => {
    return await api.patch(`/alerts/${alertId}/read`);
  },

  subscribe: async (subscriptionData) => {
    return await api.post('/alerts/subscribe', subscriptionData);
  },

  unsubscribe: async (subscriptionId) => {
    return await api.delete(`/alerts/subscribe/${subscriptionId}`);
  }
};

// Serviços de usuário
export const userService = {
  getProfile: async () => {
    return await api.get('/users/profile');
  },

  updateProfile: async (profileData) => {
    return await api.put('/users/profile', profileData);
  },

  updatePreferences: async (preferences) => {
    return await api.put('/users/preferences', preferences);
  },

  getStats: async () => {
    return await api.get('/users/stats');
  },

  changePassword: async (passwordData) => {
    return await api.put('/users/password', passwordData);
  }
};

// Serviços utilitários
export const utilsService = {
  healthCheck: async () => {
    return await api.get('/health-check');
  },

  getApiInfo: async () => {
    return await api.get('/');
  }
};

// Hook personalizado para gerenciar estado de loading
import { useState } from 'react';

export const useApiCall = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async (apiCall) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, execute };
};

export default api;