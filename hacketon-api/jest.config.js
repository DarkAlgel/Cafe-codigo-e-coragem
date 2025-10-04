export default {
  // Ambiente de teste
  testEnvironment: 'node',
  
  // Suporte a módulos ES
  preset: null,
  transform: {},
  extensionsToTreatAsEsm: ['.js'],
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
  
  // Padrões de arquivos de teste
  testMatch: [
    '**/src/tests/**/*.test.js',
    '**/src/**/__tests__/**/*.js',
    '**/src/**/?(*.)+(spec|test).js'
  ],
  
  // Arquivos a serem ignorados
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/'
  ],
  
  // Setup de teste
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.js'],
  
  // Cobertura de código
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/tests/**',
    '!src/**/*.test.js',
    '!src/**/*.spec.js'
  ],
  
  // Timeout para testes assíncronos
  testTimeout: 30000,
  
  // Configurações de mock
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  
  // Output verbose
  verbose: true,
  
  // Detectar handles abertos
  detectOpenHandles: true,
  forceExit: true,
  
  // Configurações de ambiente
  setupFiles: ['<rootDir>/src/tests/setup.js']
};