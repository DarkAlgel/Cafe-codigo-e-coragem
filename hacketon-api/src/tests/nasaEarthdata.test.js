/**
 * Testes para integração NASA Earthdata API
 * Inclui testes de autenticação, endpoints e processamento de dados
 */

import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
import request from 'supertest';
import app from '../../server.js';
import nasaEarthdataService from '../services/nasaEarthdataService.js';
import nasaDataProcessor from '../utils/nasaDataProcessor.js';

// Mock do serviço NASA para testes
jest.mock('../services/nasaEarthdataService.js');

describe('NASA Earthdata API Integration', () => {
  let authToken;
  let testUser;

  beforeAll(async () => {
    // Setup do usuário de teste e token de autenticação
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'testpassword123'
      });
    
    if (loginResponse.status === 200) {
      authToken = loginResponse.body.token;
    }
  });

  afterAll(async () => {
    // Cleanup após os testes
    jest.clearAllMocks();
  });

  describe('Health Check', () => {
    it('should return service status', async () => {
      nasaEarthdataService.checkServiceHealth.mockResolvedValue({
        status: 'healthy',
        response_time: 150,
        last_check: new Date().toISOString()
      });

      const response = await request(app)
        .get('/api/nasa-earthdata/health');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('healthy');
    });

    it('should handle service unavailable', async () => {
      nasaEarthdataService.checkServiceHealth.mockRejectedValue(
        new Error('Service unavailable')
      );

      const response = await request(app)
        .get('/api/nasa-earthdata/health');

      expect(response.status).toBe(503);
      expect(response.body.success).toBe(false);
    });
  });

  describe('M2IMNPASM Data Endpoints', () => {
    const validParams = {
      latitude: -20.3155,
      longitude: -40.3128,
      startDate: '2023-01-01',
      endDate: '2023-01-02',
      variables: 'T2M,PS,QV2M'
    };

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/nasa-earthdata/m2imnpasm')
        .query(validParams);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should validate required parameters', async () => {
      const response = await request(app)
        .get('/api/nasa-earthdata/m2imnpasm')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          latitude: -20.3155,
          // longitude missing
          startDate: '2023-01-01',
          endDate: '2023-01-02'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('longitude');
    });

    it('should validate coordinate ranges', async () => {
      const response = await request(app)
        .get('/api/nasa-earthdata/m2imnpasm')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          ...validParams,
          latitude: 95, // Invalid latitude
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should validate date format and range', async () => {
      const response = await request(app)
        .get('/api/nasa-earthdata/m2imnpasm')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          ...validParams,
          startDate: '2023-01-02',
          endDate: '2023-01-01' // End before start
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should validate variables parameter', async () => {
      const response = await request(app)
        .get('/api/nasa-earthdata/m2imnpasm')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          ...validParams,
          variables: 'INVALID_VAR,T2M'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('INVALID_VAR');
    });

    it('should successfully fetch M2IMNPASM data', async () => {
      const mockData = {
        granules: [{
          id: 'test-granule-id',
          title: 'Test M2IMNPASM Granule',
          time_start: '2023-01-01T00:00:00Z',
          time_end: '2023-01-01T23:59:59Z',
          boxes: [{
            north: 90,
            south: -90,
            east: 180,
            west: -180
          }]
        }]
      };

      nasaEarthdataService.searchM2IMNPASMData.mockResolvedValue(mockData);

      const response = await request(app)
        .get('/api/nasa-earthdata/m2imnpasm')
        .set('Authorization', `Bearer ${authToken}`)
        .query(validParams);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should handle NASA API errors gracefully', async () => {
      nasaEarthdataService.searchM2IMNPASMData.mockRejectedValue(
        new Error('NASA API rate limit exceeded')
      );

      const response = await request(app)
        .get('/api/nasa-earthdata/m2imnpasm')
        .set('Authorization', `Bearer ${authToken}`)
        .query(validParams);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Variables Information', () => {
    it('should return M2IMNPASM variables info', async () => {
      const response = await request(app)
        .get('/api/nasa-earthdata/m2imnpasm/variables');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.variables).toBeDefined();
      expect(response.body.data.variables.T2M).toBeDefined();
      expect(response.body.data.variables.PS).toBeDefined();
    });
  });

  describe('Products Catalog', () => {
    it('should require authentication for products list', async () => {
      const response = await request(app)
        .get('/api/nasa-earthdata/products');

      expect(response.status).toBe(401);
    });

    it('should return available products', async () => {
      const mockProducts = {
        hits: 150,
        items: [{
          concept_id: 'C1276812863-GES_DISC',
          title: 'MERRA-2 M2I1NXASM',
          short_name: 'M2I1NXASM',
          version_id: '5.12.4'
        }]
      };

      nasaEarthdataService.searchProducts.mockResolvedValue(mockProducts);

      const response = await request(app)
        .get('/api/nasa-earthdata/products')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.products).toBeDefined();
    });

    it('should validate limit parameter', async () => {
      const response = await request(app)
        .get('/api/nasa-earthdata/products')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ limit: 150 }); // Above maximum

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Product Details', () => {
    it('should validate concept ID format', async () => {
      const response = await request(app)
        .get('/api/nasa-earthdata/products/invalid-concept-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return product information', async () => {
      const mockProduct = {
        concept_id: 'C1276812863-GES_DISC',
        title: 'MERRA-2 M2I1NXASM',
        abstract: 'MERRA-2 instantaneous 2-dimensional data',
        data_center: 'GES_DISC'
      };

      nasaEarthdataService.getProductDetails.mockResolvedValue(mockProduct);

      const response = await request(app)
        .get('/api/nasa-earthdata/products/C1276812863-GES_DISC')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.concept_id).toBe('C1276812863-GES_DISC');
    });
  });

  describe('Usage Statistics', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/nasa-earthdata/stats');

      expect(response.status).toBe(401);
    });

    it('should return usage statistics', async () => {
      const response = await request(app)
        .get('/api/nasa-earthdata/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.total_requests).toBeDefined();
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      // Simular múltiplas requisições rápidas
      const requests = Array(105).fill().map(() => 
        request(app)
          .get('/api/nasa-earthdata/health')
      );

      const responses = await Promise.all(requests);
      const rateLimitedResponses = responses.filter(r => r.status === 429);
      
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });
});

describe('NASA Data Processor', () => {
  describe('Data Processing', () => {
    const mockGranuleData = {
      id: 'test-granule',
      title: 'Test Granule',
      time_start: '2023-01-01T00:00:00Z',
      time_end: '2023-01-01T23:59:59Z',
      boxes: [{
        north: 90,
        south: -90,
        east: 180,
        west: -180
      }]
    };

    it('should process M2IMNPASM data correctly', () => {
      const result = nasaDataProcessor.processM2IMNPASMData(
        mockGranuleData,
        ['T2M', 'PS'],
        { latitude: -20.3155, longitude: -40.3128 }
      );

      expect(result.metadata).toBeDefined();
      expect(result.temporal_coverage).toBeDefined();
      expect(result.spatial_coverage).toBeDefined();
      expect(result.variables.T2M).toBeDefined();
      expect(result.variables.PS).toBeDefined();
      expect(result.processing_info).toBeDefined();
    });

    it('should validate input data', () => {
      const validation = nasaDataProcessor.validateData(null);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should calculate statistics', () => {
      const processedData = nasaDataProcessor.processM2IMNPASMData(
        mockGranuleData,
        ['T2M', 'PS']
      );
      
      const stats = nasaDataProcessor.calculateStatistics(processedData);
      
      expect(stats.total_variables).toBe(2);
      expect(stats.temporal_span).toBeDefined();
      expect(stats.spatial_coverage).toBeDefined();
    });

    it('should convert to different formats', () => {
      const processedData = nasaDataProcessor.processM2IMNPASMData(
        mockGranuleData,
        ['T2M']
      );

      const csvData = nasaDataProcessor.convertToFormat(processedData, 'csv');
      const geoJsonData = nasaDataProcessor.convertToFormat(processedData, 'geojson');

      expect(typeof csvData).toBe('string');
      expect(csvData).toContain('timestamp,latitude,longitude');
      
      expect(geoJsonData.type).toBe('FeatureCollection');
      expect(Array.isArray(geoJsonData.features)).toBe(true);
    });

    it('should handle unsupported formats', () => {
      const processedData = nasaDataProcessor.processM2IMNPASMData(mockGranuleData);
      
      expect(() => {
        nasaDataProcessor.convertToFormat(processedData, 'xml');
      }).toThrow('Formato não suportado: xml');
    });
  });

  describe('Variable Information', () => {
    it('should provide correct variable metadata', () => {
      const variables = nasaDataProcessor.m2imnpasmVariables;
      
      expect(variables.T2M.name).toBe('Temperature at 2m');
      expect(variables.T2M.unit).toBe('K');
      expect(variables.PS.name).toBe('Surface Pressure');
      expect(variables.PS.unit).toBe('Pa');
    });

    it('should provide valid ranges for variables', () => {
      const t2mRange = nasaDataProcessor.getValidRange('T2M');
      const psRange = nasaDataProcessor.getValidRange('PS');
      
      expect(Array.isArray(t2mRange)).toBe(true);
      expect(t2mRange.length).toBe(2);
      expect(t2mRange[0]).toBeLessThan(t2mRange[1]);
      
      expect(Array.isArray(psRange)).toBe(true);
      expect(psRange.length).toBe(2);
      expect(psRange[0]).toBeLessThan(psRange[1]);
    });
  });
});

describe('Error Handling', () => {
  it('should handle malformed JSON requests', async () => {
    const response = await request(app)
      .post('/api/nasa-earthdata/test')
      .set('Content-Type', 'application/json')
      .send('{ invalid json }');

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('should handle large file uploads', async () => {
    const largeData = 'x'.repeat(15 * 1024 * 1024); // 15MB

    const response = await request(app)
      .post('/api/nasa-earthdata/test')
      .send({ data: largeData });

    expect(response.status).toBe(413);
    expect(response.body.success).toBe(false);
  });

  it('should provide appropriate error messages in development', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    nasaEarthdataService.checkServiceHealth.mockRejectedValue(
      new Error('Detailed error message')
    );

    const response = await request(app)
      .get('/api/nasa-earthdata/health');

    expect(response.body.error).toContain('Detailed error message');

    process.env.NODE_ENV = originalEnv;
  });
});