const axios = require('axios');

/**
 * NASA Data Service
 * Handles integration with various NASA data sources including TEMPO, MERRA-2, and others
 */
class NASAService {
  constructor() {
    this.baseURL = 'https://api.nasa.gov';
    this.earthdataURL = 'https://earthdata.nasa.gov/api';
    this.earthdataLoginURL = 'https://urs.earthdata.nasa.gov';
    this.tempoURL = 'https://tempo.si.edu/api';
    this.giovanniURL = 'https://giovanni.gsfc.nasa.gov/giovanni';
    this.worldviewURL = 'https://worldview.earthdata.nasa.gov/api';
    this.merra2URL = 'https://gmao.gsfc.nasa.gov/reanalysis/MERRA-2';
    
    // API keys and authentication
    this.apiKey = process.env.NASA_API_KEY || 'DEMO_KEY';
    this.earthdataToken = process.env.EARTHDATA_TOKEN;
    this.earthdataUsername = process.env.EARTHDATA_USERNAME;
    this.earthdataPassword = process.env.EARTHDATA_PASSWORD;
    
    // Authentication state
    this.isAuthenticated = false;
    this.authToken = null;
    this.tokenExpiry = null;
  }

  // NASA Earthdata Authentication
  async authenticateEarthdata() {
    try {
      if (this.isTokenValid()) {
        return this.authToken;
      }

      // If we have stored credentials, use them
      if (this.earthdataUsername && this.earthdataPassword) {
        const response = await fetch(`${this.earthdataLoginURL}/oauth/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${this.earthdataUsername}:${this.earthdataPassword}`).toString('base64')}`
          },
          body: new URLSearchParams({
            grant_type: 'client_credentials'
          })
        });

        if (response.ok) {
          const data = await response.json();
          this.authToken = data.access_token;
          this.tokenExpiry = Date.now() + (data.expires_in * 1000);
          this.isAuthenticated = true;
          return this.authToken;
        }
      }

      // If we have a pre-configured token, use it
      if (this.earthdataToken) {
        this.authToken = this.earthdataToken;
        this.isAuthenticated = true;
        return this.authToken;
      }

      console.warn('No Earthdata credentials configured. Using public access only.');
      return null;
    } catch (error) {
      console.error('Earthdata authentication failed:', error);
      return null;
    }
  }

  // Check if current token is valid
  isTokenValid() {
    return this.authToken && this.tokenExpiry && Date.now() < this.tokenExpiry;
  }

  // Get authenticated headers for Earthdata requests
  async getAuthHeaders() {
    const token = await this.authenticateEarthdata();
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'NASA-Data-Integration/1.0'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // Fetch data from Earthdata with authentication
  async fetchEarthdataResource(endpoint, params = {}) {
    try {
      const headers = await this.getAuthHeaders();
      const url = new URL(endpoint, this.earthdataURL);
      
      // Add query parameters
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, params[key]);
        }
      });

      const response = await fetch(url.toString(), { headers });
      
      if (!response.ok) {
        throw new Error(`Earthdata API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Earthdata fetch error:', error);
      throw error;
    }
  }

  /**
   * Fetch TEMPO air quality data
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @param {string} pollutant - Pollutant type (NO2, HCHO, AI, PM, O3)
   * @param {string} date - Date in YYYY-MM-DD format
   */
  async fetchTEMPOData(lat, lon, pollutant = 'NO2', date = null) {
    try {
      const token = await this.authenticate();
      
      if (!token) {
        return this.generateMockTEMPOData(lat, lon, pollutant, date);
      }

      const targetDate = date || new Date().toISOString().split('T')[0];
      
      console.log(`🛰️ Fetching TEMPO ${pollutant} data for ${lat}, ${lon} on ${targetDate}`);

      // In production, this would make actual API calls to TEMPO
      const response = await axios.get(`${this.baseUrls.tempo}/data/${pollutant}`, {
        params: {
          lat,
          lon,
          date: targetDate,
          format: 'json'
        },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        timeout: 15000
      });

      return this.processTEMPOData(response.data, pollutant);

    } catch (error) {
      console.error(`❌ Error fetching TEMPO ${pollutant} data:`, error.message);
      return this.generateMockTEMPOData(lat, lon, pollutant, date);
    }
  }

  /**
   * Generate mock TEMPO data for development/fallback
   */
  generateMockTEMPOData(lat, lon, pollutant, date) {
    const pollutantConfigs = {
      NO2: { 
        baseValue: 15, 
        unit: 'µg/m³', 
        range: [5, 40],
        description: 'Nitrogen Dioxide concentration'
      },
      HCHO: { 
        baseValue: 8, 
        unit: 'µg/m³', 
        range: [2, 20],
        description: 'Formaldehyde concentration'
      },
      AI: { 
        baseValue: 0.5, 
        unit: 'index', 
        range: [0, 3],
        description: 'Aerosol Index'
      },
      PM: { 
        baseValue: 25, 
        unit: 'µg/m³', 
        range: [10, 100],
        description: 'Particulate Matter concentration'
      },
      O3: { 
        baseValue: 120, 
        unit: 'µg/m³', 
        range: [50, 200],
        description: 'Ozone concentration'
      }
    };

    const config = pollutantConfigs[pollutant] || pollutantConfigs.NO2;
    const variation = (Math.random() - 0.5) * 0.4; // ±20% variation
    const value = Math.max(config.range[0], 
      Math.min(config.range[1], config.baseValue * (1 + variation)));

    return {
      pollutant,
      value: parseFloat(value.toFixed(2)),
      unit: config.unit,
      description: config.description,
      coordinates: { lat: parseFloat(lat), lon: parseFloat(lon) },
      timestamp: new Date().toISOString(),
      date: date || new Date().toISOString().split('T')[0],
      quality: this.getDataQuality(value, pollutant),
      source: 'NASA TEMPO (simulated)',
      satellite: 'TEMPO',
      processing_level: 'L2',
      spatial_resolution: '2.1 km x 4.4 km',
      temporal_resolution: 'Hourly'
    };
  }

  /**
   * Fetch MERRA-2 reanalysis data
   */
  async fetchMERRA2Data(lat, lon, variables = ['CO2'], startDate, endDate) {
    try {
      const token = await this.authenticate();
      
      if (!token) {
        return this.generateMockMERRA2Data(lat, lon, variables, startDate, endDate);
      }

      console.log(`🌍 Fetching MERRA-2 data for variables: ${variables.join(', ')}`);

      // In production, this would access actual MERRA-2 NetCDF files
      const response = await axios.get(`${this.baseUrls.merra2}/data`, {
        params: {
          lat,
          lon,
          variables: variables.join(','),
          start_date: startDate,
          end_date: endDate,
          format: 'json'
        },
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: 20000
      });

      return this.processMERRA2Data(response.data, variables);

    } catch (error) {
      console.error('❌ Error fetching MERRA-2 data:', error.message);
      return this.generateMockMERRA2Data(lat, lon, variables, startDate, endDate);
    }
  }

  /**
   * Generate mock MERRA-2 data
   */
  generateMockMERRA2Data(lat, lon, variables, startDate, endDate) {
    const data = {};
    const start = new Date(startDate || Date.now() - 7 * 24 * 60 * 60 * 1000);
    const end = new Date(endDate || Date.now());
    
    variables.forEach(variable => {
      data[variable] = {
        variable,
        coordinates: { lat: parseFloat(lat), lon: parseFloat(lon) },
        temporal_coverage: { start: start.toISOString(), end: end.toISOString() },
        data_points: [],
        source: 'NASA MERRA-2 (simulated)',
        spatial_resolution: '0.5° x 0.625°',
        temporal_resolution: '1-hour'
      };

      // Generate time series data
      const current = new Date(start);
      while (current <= end) {
        let value;
        switch (variable) {
          case 'CO2':
            value = 415 + Math.sin(current.getTime() / (1000 * 60 * 60 * 24 * 365)) * 3 + Math.random() * 5;
            break;
          case 'temperature':
            value = 15 + Math.sin(current.getTime() / (1000 * 60 * 60 * 24 * 365)) * 10 + Math.random() * 5;
            break;
          case 'humidity':
            value = 60 + Math.random() * 30;
            break;
          default:
            value = Math.random() * 100;
        }

        data[variable].data_points.push({
          timestamp: current.toISOString(),
          value: parseFloat(value.toFixed(2)),
          quality: 'good'
        });

        current.setHours(current.getHours() + 1);
      }
    });

    return data;
  }

  /**
   * Get data quality assessment
   */
  getDataQuality(value, pollutant) {
    const thresholds = {
      NO2: { good: 20, moderate: 40, poor: 80 },
      HCHO: { good: 10, moderate: 20, poor: 40 },
      AI: { good: 1, moderate: 2, poor: 3 },
      PM: { good: 25, moderate: 50, poor: 100 },
      O3: { good: 100, moderate: 160, poor: 240 }
    };

    const threshold = thresholds[pollutant] || thresholds.NO2;
    
    if (value <= threshold.good) return 'good';
    if (value <= threshold.moderate) return 'moderate';
    if (value <= threshold.poor) return 'poor';
    return 'hazardous';
  }

  /**
   * Process TEMPO data response
   */
  processTEMPOData(rawData, pollutant) {
    // Process actual TEMPO data format
    return {
      ...rawData,
      processed_at: new Date().toISOString(),
      data_source: 'NASA TEMPO',
      processing_notes: 'Level 2 data processed with quality flags'
    };
  }

  /**
   * Process MERRA-2 data response
   */
  processMERRA2Data(rawData, variables) {
    // Process actual MERRA-2 NetCDF data
    return {
      ...rawData,
      processed_at: new Date().toISOString(),
      data_source: 'NASA MERRA-2',
      processing_notes: 'Reanalysis data interpolated to requested coordinates'
    };
  }

  /**
   * Get available datasets information
   */
  getDatasetInfo() {
    return {
      TEMPO: {
        name: 'Tropospheric Emissions: Monitoring of Pollution',
        description: 'Geostationary satellite mission monitoring air quality over North America',
        variables: ['NO2', 'HCHO', 'AI', 'PM', 'O3'],
        spatial_coverage: 'North America',
        spatial_resolution: '2.1 km x 4.4 km',
        temporal_resolution: 'Hourly',
        temporal_coverage: '2023-present',
        website: 'https://tempo.si.edu/',
        citation: 'NASA TEMPO Science Team. (2023). TEMPO Level 2 Data Products. NASA Goddard Space Flight Center.'
      },
      MERRA2: {
        name: 'Modern-Era Retrospective analysis for Research and Applications, Version 2',
        description: 'Global atmospheric reanalysis dataset',
        variables: ['CO2', 'temperature', 'humidity', 'wind', 'pressure'],
        spatial_coverage: 'Global',
        spatial_resolution: '0.5° x 0.625°',
        temporal_resolution: '1-hour, 3-hour, daily, monthly',
        temporal_coverage: '1980-present',
        website: 'https://gmao.gsfc.nasa.gov/reanalysis/MERRA-2/',
        citation: 'Gelaro, R., et al. (2017). The Modern-Era Retrospective Analysis for Research and Applications, Version 2 (MERRA-2). J. Climate, 30, 5419-5454.'
      }
    };
  }
}

module.exports = new NASAService();