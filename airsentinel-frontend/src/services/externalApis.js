import axios from 'axios';

// OpenAQ API Configuration
const OPENAQ_BASE_URL = import.meta.env.DEV ? '/api/openaq/v3' : 'https://api.openaq.org/v3';
const OPENAQ_API_KEY = '488037f32133ffcbcd7c7043cfb49d25d3203142a75275e356e3813168293b7a';

// Default location: New York City
export const DEFAULT_LOCATION = {
  latitude: 40.7128,
  longitude: -74.0060,
  name: 'New York City, NY, USA'
};

// Enhanced error handling and retry logic
const handleApiError = (error, apiName, useFallback = true) => {
  console.error(`${apiName} API Error:`, error);
  
  // If fallback is disabled, throw the error immediately
  if (!useFallback) {
    if (error.code === 'NETWORK_ERROR') {
      throw new Error(`Network connection failed. Please check your internet connection and try again.`);
    }
    
    if (error.response) {
      const status = error.response.status;
      switch (status) {
        case 400:
          throw new Error(`Invalid request to ${apiName}. Please check your coordinates and try again.`);
        case 401:
          throw new Error(`Authentication failed for ${apiName}. API key may be invalid.`);
        case 403:
          throw new Error(`Access denied to ${apiName}. You may have exceeded rate limits.`);
        case 404:
          throw new Error(`No data found for this location in ${apiName}.`);
        case 429:
          throw new Error(`Too many requests to ${apiName}. Please wait a moment and try again.`);
        case 500:
          throw new Error(`${apiName} server error. Please try again later.`);
        case 503:
          throw new Error(`${apiName} service is temporarily unavailable. Please try again later.`);
        default:
          throw new Error(`${apiName} returned an error (${status}). Please try again later.`);
      }
    }
    
    if (error.request) {
      throw new Error(`No response from ${apiName}. The service may be temporarily unavailable.`);
    }
    
    throw new Error(`Unexpected error with ${apiName}: ${error.message}`);
  }
  
  // Return null to indicate fallback should be used
  console.warn(`${apiName} API failed, using fallback data`);
  return null;
};

// Retry mechanism with exponential backoff
const retryRequest = async (requestFn, maxRetries = 3, baseDelay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Don't retry on client errors (4xx)
      if (error.response && error.response.status >= 400 && error.response.status < 500) {
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.warn(`Request failed (attempt ${attempt}/${maxRetries}). Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Create axios instance for OpenAQ API
const openaqApi = axios.create({
  baseURL: OPENAQ_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    ...(import.meta.env.PROD && { 'X-API-Key': OPENAQ_API_KEY }),
  },
});

// Location validation utility
export const validateCoordinates = (latitude, longitude) => {
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  
  if (isNaN(lat) || isNaN(lng)) {
    throw new Error('Invalid coordinates: must be valid numbers');
  }
  
  if (lat < -90 || lat > 90) {
    throw new Error('Invalid latitude: must be between -90 and 90 degrees');
  }
  
  if (lng < -180 || lng > 180) {
    throw new Error('Invalid longitude: must be between -180 and 180 degrees');
  }
  
  return { latitude: lat, longitude: lng };
};

// OpenAQ API service with enhanced error handling
export const fetchOpenAQData = async (latitude, longitude) => {
  try {
    const validatedCoords = validateCoordinates(latitude, longitude);
    
    return await retryRequest(async () => {
      try {
        // In a real implementation, this would make an actual API call
        // const response = await openaqApi.get(`/measurements?coordinates=${validatedCoords.latitude},${validatedCoords.longitude}&radius=25000`);
        
        // Mock data with realistic air quality values
        await new Promise(resolve => setTimeout(resolve, 1200)); // Simulate API delay
        
        // Simulate occasional API failures for testing error handling
        if (Math.random() < 0.08) { // 8% chance of simulated failure
          const error = new Error('Simulated API failure');
          error.response = { status: 429 };
          throw error;
        }
        
        const baseAQI = 50 + Math.random() * 100;
        
        return {
          overallAQI: Math.round(baseAQI),
          healthRecommendation: getHealthRecommendation(baseAQI),
          healthAdvisory: getHealthAdvisory(baseAQI),
          pollutants: [
            {
              parameter: 'pm25',
              value: 8 + Math.random() * 25,
              unit: 'µg/m³',
              status: 'Normal',
              lastUpdated: new Date(Date.now() - Math.random() * 3600000).toISOString()
            },
            {
              parameter: 'pm10',
              value: 15 + Math.random() * 40,
              unit: 'µg/m³',
              status: 'Normal',
              lastUpdated: new Date(Date.now() - Math.random() * 3600000).toISOString()
            },
            {
              parameter: 'o3',
              value: 40 + Math.random() * 30,
              unit: 'µg/m³',
              status: 'Normal',
              lastUpdated: new Date(Date.now() - Math.random() * 3600000).toISOString()
            },
            {
              parameter: 'no2',
              value: 20 + Math.random() * 40,
              unit: 'µg/m³',
              status: 'Normal',
              lastUpdated: new Date(Date.now() - Math.random() * 3600000).toISOString()
            },
            {
              parameter: 'so2',
              value: 5 + Math.random() * 20,
              unit: 'µg/m³',
              status: 'Normal',
              lastUpdated: new Date(Date.now() - Math.random() * 3600000).toISOString()
            },
            {
              parameter: 'co',
              value: 0.5 + Math.random() * 2,
              unit: 'mg/m³',
              status: 'Normal',
              lastUpdated: new Date(Date.now() - Math.random() * 3600000).toISOString()
            }
          ],
          stations: generateMockStations(validatedCoords.latitude, validatedCoords.longitude),
          location: {
            latitude: validatedCoords.latitude,
            longitude: validatedCoords.longitude
          },
          lastUpdated: new Date().toISOString()
        };
      } catch (error) {
        handleApiError(error, 'OpenAQ');
      }
    });
  } catch (error) {
    console.error('OpenAQ API Error:', error);
    throw error;
  }
};

// Helper functions for OpenAQ data
const getHealthRecommendation = (aqi) => {
  if (aqi <= 50) return 'Air quality is good. Ideal for outdoor activities.';
  if (aqi <= 100) return 'Air quality is acceptable. Sensitive individuals should consider limiting prolonged outdoor exertion.';
  if (aqi <= 150) return 'Unhealthy for sensitive groups. Children, elderly, and people with respiratory conditions should limit outdoor activities.';
  if (aqi <= 200) return 'Unhealthy air quality. Everyone should limit outdoor exertion.';
  if (aqi <= 300) return 'Very unhealthy air quality. Avoid outdoor activities.';
  return 'Hazardous air quality. Stay indoors and avoid all outdoor activities.';
};

const getHealthAdvisory = (aqi) => {
  if (aqi <= 50) return 'Enjoy outdoor activities! Air quality poses little or no risk.';
  if (aqi <= 100) return 'Air quality is acceptable for most people. Unusually sensitive individuals may experience minor symptoms.';
  if (aqi <= 150) return 'Members of sensitive groups may experience health effects. The general public is less likely to be affected.';
  if (aqi <= 200) return 'Some members of the general public may experience health effects; sensitive groups may experience more serious effects.';
  if (aqi <= 300) return 'Health alert: The risk of health effects is increased for everyone.';
  return 'Health warning of emergency conditions: everyone is more likely to be affected.';
};

// Enhanced mock data for fallback scenarios
const generateFallbackData = (latitude, longitude) => {
  const baseTime = new Date();
  const locations = [
    {
      id: Math.floor(Math.random() * 10000),
      name: `Air Quality Station ${Math.floor(Math.random() * 100)}`,
      locality: 'Mock Location',
      timezone: 'UTC',
      country: { id: 1, code: 'US', name: 'United States' },
      coordinates: {
        latitude: latitude + (Math.random() - 0.5) * 0.1,
        longitude: longitude + (Math.random() - 0.5) * 0.1
      },
      distance: Math.floor(Math.random() * 25000),
      parameters: [
        {
          id: 2,
          name: 'pm25',
          displayName: 'PM2.5',
          description: 'Particulate matter less than 2.5 micrometers in diameter',
          preferredUnit: 'µg/m³'
        },
        {
          id: 1,
          name: 'pm10',
          displayName: 'PM10',
          description: 'Particulate matter less than 10 micrometers in diameter',
          preferredUnit: 'µg/m³'
        },
        {
          id: 3,
          name: 'o3',
          displayName: 'O₃',
          description: 'Ozone',
          preferredUnit: 'µg/m³'
        },
        {
          id: 4,
          name: 'no2',
          displayName: 'NO₂',
          description: 'Nitrogen dioxide',
          preferredUnit: 'µg/m³'
        }
      ]
    }
  ];

  const measurements = [
    {
      parameter: { id: 2, name: 'pm25', displayName: 'PM2.5', units: 'µg/m³' },
      value: Math.floor(Math.random() * 50) + 10,
      lastUpdated: baseTime.toISOString(),
      coordinates: { latitude, longitude },
      country: 'US',
      city: 'Mock City',
      location: 'Mock Station',
      sourceName: 'OpenAQ Fallback Data',
      sourceType: 'government',
      mobile: false
    },
    {
      parameter: { id: 1, name: 'pm10', displayName: 'PM10', units: 'µg/m³' },
      value: Math.floor(Math.random() * 80) + 20,
      lastUpdated: baseTime.toISOString(),
      coordinates: { latitude, longitude },
      country: 'US',
      city: 'Mock City',
      location: 'Mock Station',
      sourceName: 'OpenAQ Fallback Data',
      sourceType: 'government',
      mobile: false
    },
    {
      parameter: { id: 3, name: 'o3', displayName: 'O₃', units: 'µg/m³' },
      value: Math.floor(Math.random() * 120) + 30,
      lastUpdated: baseTime.toISOString(),
      coordinates: { latitude, longitude },
      country: 'US',
      city: 'Mock City',
      location: 'Mock Station',
      sourceName: 'OpenAQ Fallback Data',
      sourceType: 'government',
      mobile: false
    },
    {
      parameter: { id: 4, name: 'no2', displayName: 'NO₂', units: 'µg/m³' },
      value: Math.floor(Math.random() * 60) + 15,
      lastUpdated: baseTime.toISOString(),
      coordinates: { latitude, longitude },
      country: 'US',
      city: 'Mock City',
      location: 'Mock Station',
      sourceName: 'OpenAQ Fallback Data',
      sourceType: 'government',
      mobile: false
    }
  ];

  return { locations, measurements };
};

const generateMockStations = (lat, lon) => {
  const stations = [];
  const stationCount = Math.floor(Math.random() * 5) + 2; // 2-6 stations
  
  for (let i = 0; i < stationCount; i++) {
    const distance = Math.random() * 20 + 1; // 1-21 km
    stations.push({
      name: `Station ${String.fromCharCode(65 + i)}${Math.floor(Math.random() * 100)}`,
      distance: distance.toFixed(1),
      parameters: ['PM2.5', 'PM10', 'O3', 'NO2'].slice(0, Math.floor(Math.random() * 4) + 1),
      isActive: Math.random() > 0.1, // 90% chance of being active
      latitude: lat + (Math.random() - 0.5) * 0.2,
      longitude: lon + (Math.random() - 0.5) * 0.2
    });
  }
  
  return stations.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
};

// OpenAQ Service
export const openaqService = {
  // Get air quality measurements for a specific location using v3 API
  getMeasurements: async (latitude = DEFAULT_LOCATION.latitude, longitude = DEFAULT_LOCATION.longitude, radius = 25000) => {
    try {
      validateCoordinates(latitude, longitude);
      
      const response = await retryRequest(async () => {
        // Using v3 locations endpoint to find nearby locations first, then get latest measurements
        return await openaqApi.get('/locations', {
          params: {
            coordinates: `${latitude},${longitude}`,
            radius: radius,
            limit: 100
          }
        });
      });

      if (response.data && response.data.results) {
        // Get latest measurements for the found locations
        const locations = response.data.results;
        const measurements = [];
        
        // Get latest data for first few locations to avoid too many requests
        for (const location of locations.slice(0, 5)) {
          try {
            const latestResponse = await openaqApi.get(`/locations/${location.id}/latest`);
            if (latestResponse.data && latestResponse.data.results) {
              measurements.push(...latestResponse.data.results.map(measurement => ({
                ...measurement,
                locationName: location.name,
                country: location.country,
                city: location.city
              })));
            }
          } catch (locationError) {
            console.warn(`Failed to get latest data for location ${location.id}:`, locationError);
          }
        }
        
        return {
          success: true,
          data: measurements,
          meta: response.data.meta || {},
          location: { latitude, longitude }
        };
      } else {
        throw new Error('Invalid response format from OpenAQ API');
      }
    } catch (error) {
      console.error('OpenAQ API Error:', error);
      handleApiError(error, 'OpenAQ');
      
      const fallbackData = generateFallbackData(latitude, longitude);
      
      return {
        success: true,
        data: fallbackData.measurements,
        meta: {
          found: fallbackData.measurements.length,
          limit: 100,
          page: 1,
          pages: 1
        },
        location: { latitude, longitude },
        isFallback: true,
        fallbackReason: error.message
      };
    }
  },

  // Get sensor measurements with different aggregations (measurements, hours, days, years)
  getSensorMeasurements: async (sensorId, aggregation = 'measurements', options = {}) => {
    try {
      if (!sensorId) {
        throw new Error('Sensor ID is required');
      }

      const validAggregations = ['measurements', 'hours', 'days', 'years'];
      if (!validAggregations.includes(aggregation)) {
        throw new Error(`Invalid aggregation. Must be one of: ${validAggregations.join(', ')}`);
      }

      const params = {
        limit: options.limit || 100,
        ...options.dateFrom && { date_from: options.dateFrom },
        ...options.dateTo && { date_to: options.dateTo },
        ...options.parameter && { parameter: options.parameter }
      };

      const response = await retryRequest(async () => {
        return await openaqApi.get(`/sensors/${sensorId}/${aggregation}`, { params });
      });

      if (response.data && response.data.results) {
        return {
          success: true,
          data: response.data.results,
          meta: response.data.meta || {},
          sensorId,
          aggregation
        };
      } else {
        throw new Error('Invalid response format from OpenAQ API');
      }
    } catch (error) {
      console.error('OpenAQ Sensor Measurements Error:', error);
      handleApiError(error, 'OpenAQ');
      
      return {
        success: false,
        error: error.message,
        mockData: {
          sensorId,
          aggregation,
          measurements: [
            {
              datetime: {
                utc: new Date().toISOString(),
                local: new Date().toLocaleString()
              },
              value: 15.2,
              parameter: 'pm25',
              unit: 'µg/m³'
            }
          ]
        }
      };
    }
  },

  // Get locations/stations near coordinates using v3 API with advanced filters
  getLocations: async (latitude = DEFAULT_LOCATION.latitude, longitude = DEFAULT_LOCATION.longitude, options = {}) => {
    try {
      validateCoordinates(latitude, longitude);
      
      const params = {
        limit: options.limit || 50,
        ...options.radius && { radius: options.radius },
        ...options.bbox && { bbox: options.bbox },
        ...options.country && { country: options.country },
        ...options.parameter && { parameter: options.parameter },
        ...options.provider && { provider: options.provider }
      };

      // Use either coordinates+radius or bbox, not both
      if (options.bbox) {
        delete params.radius;
      } else {
        params.coordinates = `${latitude},${longitude}`;
        params.radius = options.radius || 25000;
      }
      
      const response = await retryRequest(async () => {
        return await openaqApi.get('/locations', { params });
      });
      
      if (response.data && response.data.results) {
        return {
          success: true,
          data: response.data.results,
          meta: response.data.meta || {},
          location: { latitude, longitude }
        };
      } else {
        throw new Error('Invalid response format from OpenAQ API');
      }
    } catch (error) {
      console.error('OpenAQ Locations Error:', error);
      handleApiError(error, 'OpenAQ');
      
      const fallbackData = generateFallbackData(latitude, longitude);
      
      return {
        success: true,
        data: generateMockStations(latitude, longitude),
        meta: {
          found: 2,
          limit: options.limit || 50,
          page: 1,
          pages: 1
        },
        location: { latitude, longitude },
        isFallback: true,
        fallbackReason: error.message
      };
    }
  },

  // Get latest measurements for a specific location or nearby locations
  getLatest: async (latitude = DEFAULT_LOCATION.latitude, longitude = DEFAULT_LOCATION.longitude, options = {}) => {
    try {
      // Validate coordinates
      if (!validateCoordinates(latitude, longitude)) {
        throw new Error('Invalid coordinates provided');
      }

      // First, get nearby locations
      const locationsResponse = await retryRequest(async () => {
        const params = {
          coordinates: `${longitude},${latitude}`,
          radius: options.radius || 25000,
          limit: options.limit || 5
        };
        return await openaqApi.get('/locations', { params });
      });

      if (!locationsResponse.data || !locationsResponse.data.results || locationsResponse.data.results.length === 0) {
        throw new Error('No locations found near the specified coordinates');
      }

      // Get latest data for the first location found
      const firstLocation = locationsResponse.data.results[0];
      const latestResponse = await retryRequest(async () => {
        return await openaqApi.get(`/locations/${firstLocation.id}/latest`);
      });

      if (latestResponse.data && latestResponse.data.results) {
        return {
          success: true,
          data: latestResponse.data.results,
          meta: {
            ...latestResponse.data.meta,
            location: firstLocation
          }
        };
      } else {
        throw new Error('Invalid response format from OpenAQ API');
      }
    } catch (error) {
      console.error('OpenAQ Latest Error:', error);
      const fallbackResult = handleApiError(error, 'OpenAQ', true);
      
      if (fallbackResult === null) {
        // Use enhanced fallback data
        const fallbackData = generateFallbackData(latitude, longitude);
        return {
          success: true,
          data: fallbackData.measurements,
          meta: {
            found: fallbackData.measurements.length,
            limit: options.limit || 5,
            page: 1,
            fallback: true,
            message: 'Using fallback data due to API connectivity issues'
          }
        };
      }
      
      return {
        success: false,
        error: error.message,
        mockData: {
          measurements: [
            {
              datetime: {
                utc: new Date().toISOString(),
                local: new Date().toLocaleString()
              },
              value: 15.2,
              coordinates: { latitude, longitude },
              parameter: 'pm25',
              unit: 'µg/m³',
              sensorsId: 12345,
              locationsId: 1
            }
          ]
        }
      };
    }
  },

  // Get latest measurements by parameter across all sensors
  getLatestByParameter: async (parameter, latitude = DEFAULT_LOCATION.latitude, longitude = DEFAULT_LOCATION.longitude, options = {}) => {
    try {
      if (!parameter) {
        throw new Error('Parameter is required');
      }

      // First get parameter ID
      const parametersResponse = await retryRequest(async () => {
        return await openaqApi.get('/parameters');
      });

      let parameterId = null;
      if (parametersResponse.data && parametersResponse.data.results) {
        const parameterObj = parametersResponse.data.results.find(p => 
          p.name.toLowerCase() === parameter.toLowerCase() || 
          p.displayName?.toLowerCase() === parameter.toLowerCase()
        );
        parameterId = parameterObj?.id;
      }

      if (!parameterId) {
        throw new Error(`Parameter '${parameter}' not found`);
      }

      // Get latest data for the parameter
      const response = await retryRequest(async () => {
        const params = {
          limit: options.limit || 100,
          ...options.bbox && { bbox: options.bbox },
          ...options.country && { country: options.country }
        };
        return await openaqApi.get(`/parameters/${parameterId}/latest`, { params });
      });

      if (response.data && response.data.results) {
        return {
          success: true,
          data: response.data.results,
          meta: response.data.meta || {}
        };
      } else {
        throw new Error('Invalid response format from OpenAQ API');
      }
    } catch (error) {
      console.error('OpenAQ Latest by Parameter Error:', error);
      handleApiError(error, 'OpenAQ');
      
      return {
        success: false,
        error: error.message,
        mockData: {
          measurements: [
            {
              datetime: {
                utc: new Date().toISOString(),
                local: new Date().toLocaleString()
              },
              value: 12.5,
              coordinates: { latitude, longitude },
              parameter: parameter,
              unit: 'µg/m³',
              sensorsId: 12345,
              locationsId: 1
            }
          ]
        }
      };
    }
  },

  // Get detailed information about a specific location/station
  getLocationDetails: async (locationId) => {
    try {
      if (!locationId) {
        throw new Error('Location ID is required');
      }

      const response = await retryRequest(async () => {
        return await openaqApi.get(`/locations/${locationId}`);
      });

      if (response.data && response.data.results) {
        return {
          success: true,
          data: response.data.results[0] || response.data.results,
          meta: response.data.meta || {}
        };
      } else {
        throw new Error('Invalid response format from OpenAQ API');
      }
    } catch (error) {
      console.error('OpenAQ Location Details Error:', error);
      handleApiError(error, 'OpenAQ');
      
      return {
        success: false,
        error: error.message,
        mockData: {
          id: locationId,
          name: 'Sample Air Quality Station',
          coordinates: { latitude: 40.7128, longitude: -74.0060 },
          country: 'US',
          city: 'Sample City',
          timezone: 'America/New_York',
          parameters: ['pm25', 'pm10', 'no2', 'o3', 'so2', 'co'],
          sensors: [
            {
              id: 1,
              parameter: 'pm25',
              unit: 'µg/m³',
              manufacturer: 'Sample Manufacturer',
              model: 'Sample Model'
            }
          ],
          provider: 'Sample Environmental Agency',
          owner: 'Sample Owner',
          license: 'CC BY 4.0',
          firstUpdated: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          lastUpdated: new Date().toISOString()
        }
      };
    }
  },

  // Get information about sensors
  getSensors: async (options = {}) => {
    try {
      const params = {
        limit: options.limit || 100,
        ...options.parameter && { parameter: options.parameter },
        ...options.location && { location: options.location },
        ...options.country && { country: options.country }
      };

      const response = await retryRequest(async () => {
        return await openaqApi.get('/sensors', { params });
      });

      if (response.data && response.data.results) {
        return {
          success: true,
          data: response.data.results,
          meta: response.data.meta || {}
        };
      } else {
        throw new Error('Invalid response format from OpenAQ API');
      }
    } catch (error) {
      console.error('OpenAQ Sensors Error:', error);
      handleApiError(error, 'OpenAQ');
      
      return {
        success: false,
        error: error.message,
        mockData: {
          sensors: [
            {
              id: 1,
              parameter: 'pm25',
              unit: 'µg/m³',
              manufacturer: 'Sample Manufacturer',
              model: 'Sample Model',
              locationId: 1,
              firstUpdated: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
              lastUpdated: new Date().toISOString()
            }
          ]
        }
      };
    }
  },

  // Get information about parameters
  getParameters: async () => {
    try {
      const response = await retryRequest(async () => {
        return await openaqApi.get('/parameters');
      });

      if (response.data && response.data.results) {
        return {
          success: true,
          data: response.data.results,
          meta: response.data.meta || {}
        };
      } else {
        throw new Error('Invalid response format from OpenAQ API');
      }
    } catch (error) {
      console.error('OpenAQ Parameters Error:', error);
      handleApiError(error, 'OpenAQ');
      
      return {
        success: false,
        error: error.message,
        mockData: {
          parameters: [
            { id: 'pm25', name: 'PM2.5', units: 'µg/m³', description: 'Particulate matter less than 2.5 micrometers' },
            { id: 'pm10', name: 'PM10', units: 'µg/m³', description: 'Particulate matter less than 10 micrometers' },
            { id: 'o3', name: 'Ozone', units: 'µg/m³', description: 'Ground-level ozone' },
            { id: 'no2', name: 'Nitrogen Dioxide', units: 'µg/m³', description: 'Nitrogen dioxide' },
            { id: 'so2', name: 'Sulfur Dioxide', units: 'µg/m³', description: 'Sulfur dioxide' },
            { id: 'co', name: 'Carbon Monoxide', units: 'mg/m³', description: 'Carbon monoxide' }
          ]
        }
      };
    }
  },

  // Get information about providers
  getProviders: async (options = {}) => {
    try {
      const params = {
        limit: options.limit || 100,
        ...options.country && { country: options.country }
      };

      const response = await retryRequest(async () => {
        return await openaqApi.get('/providers', { params });
      });

      if (response.data && response.data.results) {
        return {
          success: true,
          data: response.data.results,
          meta: response.data.meta || {}
        };
      } else {
        throw new Error('Invalid response format from OpenAQ API');
      }
    } catch (error) {
      console.error('OpenAQ Providers Error:', error);
      handleApiError(error, 'OpenAQ');
      
      return {
        success: false,
        error: error.message,
        mockData: {
          providers: [
            {
              id: 1,
              name: 'Sample Environmental Agency',
              parameters: ['pm25', 'pm10', 'no2', 'o3'],
              firstUpdated: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
              lastUpdated: new Date().toISOString(),
              locationsCount: 150
            }
          ]
        }
      };
    }
  },

  // Get countries information
  getCountries: async () => {
    try {
      const response = await retryRequest(async () => {
        return await openaqApi.get('/countries');
      });

      if (response.data && response.data.results) {
        return {
          success: true,
          data: response.data.results,
          meta: response.data.meta || {}
        };
      } else {
        throw new Error('Invalid response format from OpenAQ API');
      }
    } catch (error) {
      console.error('OpenAQ Countries Error:', error);
      handleApiError(error, 'OpenAQ');
      
      return {
        success: false,
        error: error.message,
        mockData: {
          countries: [
            { code: 'US', name: 'United States' },
            { code: 'BR', name: 'Brazil' },
            { code: 'IN', name: 'India' },
            { code: 'CN', name: 'China' },
            { code: 'GB', name: 'United Kingdom' }
          ]
        }
      };
    }
  },

  // Get manufacturers information (new in v3)
  getManufacturers: async (options = {}) => {
    try {
      const params = {
        limit: options.limit || 100
      };

      const response = await retryRequest(async () => {
        return await openaqApi.get('/manufacturers', { params });
      });

      if (response.data && response.data.results) {
        return {
          success: true,
          data: response.data.results,
          meta: response.data.meta || {}
        };
      } else {
        throw new Error('Invalid response format from OpenAQ API');
      }
    } catch (error) {
      console.error('OpenAQ Manufacturers Error:', error);
      handleApiError(error, 'OpenAQ');
      
      return {
        success: false,
        error: error.message,
        mockData: {
          manufacturers: [
            {
              id: 1,
              name: 'Sample Manufacturer',
              instrumentsCount: 25
            }
          ]
        }
      };
    }
  },

  // Get instruments information (new in v3)
  getInstruments: async (options = {}) => {
    try {
      const params = {
        limit: options.limit || 100,
        ...options.manufacturer && { manufacturer: options.manufacturer }
      };

      const response = await retryRequest(async () => {
        return await openaqApi.get('/instruments', { params });
      });

      if (response.data && response.data.results) {
        return {
          success: true,
          data: response.data.results,
          meta: response.data.meta || {}
        };
      } else {
        throw new Error('Invalid response format from OpenAQ API');
      }
    } catch (error) {
      console.error('OpenAQ Instruments Error:', error);
      handleApiError(error, 'OpenAQ');
      
      return {
        success: false,
        error: error.message,
        mockData: {
          instruments: [
            {
              id: 1,
              name: 'Sample Instrument Model',
              manufacturer: 'Sample Manufacturer',
              parameters: ['pm25', 'pm10']
            }
          ]
        }
      };
    }
  },

  // Get licenses information (new in v3)
  getLicenses: async () => {
    try {
      const response = await retryRequest(async () => {
        return await openaqApi.get('/licenses');
      });

      if (response.data && response.data.results) {
        return {
          success: true,
          data: response.data.results,
          meta: response.data.meta || {}
        };
      } else {
        throw new Error('Invalid response format from OpenAQ API');
      }
    } catch (error) {
      console.error('OpenAQ Licenses Error:', error);
      handleApiError(error, 'OpenAQ');
      
      return {
        success: false,
        error: error.message,
        mockData: {
          licenses: [
            {
              id: 1,
              name: 'CC BY 4.0',
              description: 'Creative Commons Attribution 4.0 International',
              url: 'https://creativecommons.org/licenses/by/4.0/'
            }
          ]
        }
      };
    }
  }
};

// Combined service to get air quality data (atmospheric composition removed)
export const atmosphericDataService = {
  getCombinedData: async (latitude = DEFAULT_LOCATION.latitude, longitude = DEFAULT_LOCATION.longitude) => {
    try {
      validateCoordinates(latitude, longitude);
      
      const openaqData = await openaqService.getLatest(latitude, longitude);
      
      return {
        location: { latitude, longitude },
        timestamp: new Date().toISOString(),
        airQuality: openaqData
      };
    } catch (error) {
      console.error('Combined Data Error:', error);
      return {
        success: false,
        error: error.message,
        location: { latitude, longitude }
      };
    }
  }
};

export default {
  openaqService,
  atmosphericDataService,
  validateCoordinates,
  DEFAULT_LOCATION
};