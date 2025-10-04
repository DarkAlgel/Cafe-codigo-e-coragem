/**
 * Setup global para testes
 * Configurações de ambiente e mocks necessários
 */

import dotenv from 'dotenv';
import { jest } from '@jest/globals';

// Carregar variáveis de ambiente de teste
dotenv.config({ path: '.env.test' });

// Configurações globais de teste
global.console = {
  ...console,
  // Silenciar logs durante os testes, exceto erros
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: console.error
};

// Mock das variáveis de ambiente necessárias
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.MONGODB_URI = 'mongodb://localhost:27017/hacketon-test-db';
process.env.NASA_EARTHDATA_USERNAME = 'test-username';
process.env.NASA_EARTHDATA_PASSWORD = 'test-password';
process.env.NASA_EARTHDATA_TOKEN = 'test-bearer-token';
process.env.NASA_EARTHDATA_BASE_URL = 'https://cmr.earthdata.nasa.gov';
process.env.RATE_LIMIT_WINDOW_MS = '900000';
process.env.RATE_LIMIT_MAX_REQUESTS = '100';

// Timeout global para operações assíncronas
jest.setTimeout(30000);

// Mock do axios para evitar chamadas reais à API durante os testes
jest.mock('axios', () => ({
  default: {
    create: jest.fn(() => ({
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() }
      }
    })),
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  }
}));

// Mock do MongoDB para testes
jest.mock('mongoose', () => ({
  connect: jest.fn().mockResolvedValue({}),
  connection: {
    readyState: 1,
    on: jest.fn(),
    once: jest.fn()
  },
  Schema: jest.fn().mockImplementation(() => ({
    pre: jest.fn(),
    post: jest.fn(),
    methods: {},
    statics: {}
  })),
  model: jest.fn().mockImplementation(() => ({
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
    save: jest.fn()
  }))
}));

// Configurações de cleanup após cada teste
afterEach(() => {
  jest.clearAllMocks();
});

// Configurações de cleanup após todos os testes
afterAll(async () => {
  // Fechar conexões de banco de dados se existirem
  if (global.mongoConnection) {
    await global.mongoConnection.close();
  }
  
  // Limpar timers
  jest.clearAllTimers();
  jest.useRealTimers();
});

// Utilitários de teste globais
global.testUtils = {
  // Gerar dados de teste para M2IMNPASM
  generateMockM2IMNPASMData: () => ({
    granules: [{
      id: 'MERRA2_400.inst1_2d_asm_Nx.20230101.nc4',
      title: 'MERRA-2 inst1_2d_asm_Nx: 2d,1-Hourly,Instantaneous,Single-Level,Assimilation,Single-Level Diagnostics',
      producer_granule_id: 'MERRA2_400.inst1_2d_asm_Nx.20230101.nc4',
      time_start: '2023-01-01T00:00:00.000Z',
      time_end: '2023-01-01T23:59:59.999Z',
      updated: '2023-01-02T12:00:00.000Z',
      dataset_id: 'MERRA-2 inst1_2d_asm_Nx: 2d,1-Hourly,Instantaneous,Single-Level,Assimilation,Single-Level Diagnostics V5.12.4',
      data_center: 'GES_DISC',
      title: 'MERRA2_400.inst1_2d_asm_Nx.20230101.nc4',
      coordinate_system: 'CARTESIAN',
      day_night_flag: 'UNSPECIFIED',
      time_start: '2023-01-01T00:00:00.000Z',
      time_end: '2023-01-01T23:59:59.999Z',
      boxes: [{
        north: 90,
        south: -90,
        east: 180,
        west: -180
      }],
      links: [{
        rel: 'http://esipfed.org/ns/fedsearch/1.1/data#',
        type: 'application/x-netcdf',
        title: 'Download MERRA2_400.inst1_2d_asm_Nx.20230101.nc4',
        href: 'https://goldsmr4.gesdisc.eosdis.nasa.gov/data/MERRA2/M2I1NXASM.5.12.4/2023/01/MERRA2_400.inst1_2d_asm_Nx.20230101.nc4'
      }]
    }]
  }),

  // Gerar token JWT de teste
  generateTestJWT: () => {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      { 
        userId: 'test-user-id',
        email: 'test@example.com',
        role: 'user'
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  },

  // Gerar dados de usuário de teste
  generateTestUser: () => ({
    _id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedpassword',
    role: 'user',
    healthProfile: {
      conditions: ['asthma'],
      ageGroup: 'adult',
      activityLevel: 'moderate'
    },
    preferences: {
      notifications: {
        email: true,
        sms: false,
        push: true
      },
      alertThresholds: {
        pm25: 35,
        pm10: 50,
        o3: 100
      }
    }
  }),

  // Simular delay para testes assíncronos
  delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  // Validar estrutura de resposta da API
  validateApiResponse: (response, expectedStatus = 200) => {
    expect(response.status).toBe(expectedStatus);
    expect(response.body).toHaveProperty('success');
    
    if (expectedStatus >= 200 && expectedStatus < 300) {
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('data');
    } else {
      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('message');
    }
  }
};

// Configurar mocks específicos para NASA Earthdata
global.nasaMocks = {
  healthyResponse: {
    status: 'healthy',
    response_time: 150,
    last_check: new Date().toISOString(),
    endpoints: {
      cmr: 'operational',
      earthdata_login: 'operational',
      ges_disc: 'operational'
    }
  },

  unhealthyResponse: {
    status: 'unhealthy',
    response_time: 5000,
    last_check: new Date().toISOString(),
    errors: ['Connection timeout', 'Service unavailable']
  },

  productsResponse: {
    hits: 150,
    took: 45,
    items: [{
      concept_id: 'C1276812863-GES_DISC',
      revision_id: 45,
      provider_id: 'GES_DISC',
      short_name: 'M2I1NXASM',
      version_id: '5.12.4',
      entry_title: 'MERRA-2 inst1_2d_asm_Nx: 2d,1-Hourly,Instantaneous,Single-Level,Assimilation,Single-Level Diagnostics V5.12.4',
      dataset_id: 'MERRA-2 inst1_2d_asm_Nx: 2d,1-Hourly,Instantaneous,Single-Level,Assimilation,Single-Level Diagnostics V5.12.4',
      processing_level_id: '3',
      collection_data_type: 'SCIENCE_QUALITY',
      data_center: 'GES_DISC'
    }]
  }
};

console.log('🧪 Setup de testes carregado com sucesso');