const express = require('express');
const router = express.Router();
const NASAService = require('../services/nasaService');

const nasaService = new NASAService();

// Cache for API responses (5 minutes)
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000;

// Middleware to check cache
const checkCache = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

// Middleware to set cache
const setCache = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

// Validate pollutant parameter
const validatePollutant = (req, res, next) => {
  const validPollutants = ['NO2', 'HCHO', 'AI', 'PM', 'O3'];
  const { pollutant } = req.params;
  
  if (pollutant && !validPollutants.includes(pollutant.toUpperCase())) {
    return res.status(400).json({
      error: 'Invalid pollutant',
      validPollutants,
      received: pollutant
    });
  }
  
  req.pollutant = pollutant?.toUpperCase();
  next();
};

// Get TEMPO data for a specific pollutant
router.get('/data/:pollutant', validatePollutant, async (req, res) => {
  try {
    const { pollutant } = req;
    const { lat, lon, date } = req.query;
    
    const cacheKey = `tempo-${pollutant}-${lat}-${lon}-${date}`;
    const cachedData = checkCache(cacheKey);
    
    if (cachedData) {
      return res.json(cachedData);
    }

    const data = await nasaService.getTEMPOData(pollutant, { lat, lon, date });
    
    // Add health advisory and recommendations
    const response = {
      ...data,
      healthAdvisory: getHealthAdvisory(data.quality),
      recommendations: getRecommendations(data.quality),
      aqi: calculateAQI(pollutant, data.value)
    };
    
    setCache(cacheKey, response);
    res.json(response);
  } catch (error) {
    console.error('Error fetching TEMPO data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch TEMPO data',
      message: error.message 
    });
  }
});

// Get TEMPO data for multiple pollutants
router.get('/data', async (req, res) => {
  try {
    const { lat, lon, date, pollutants } = req.query;
    const requestedPollutants = pollutants ? pollutants.split(',') : ['NO2', 'HCHO', 'AI', 'PM', 'O3'];
    
    const cacheKey = `tempo-multi-${lat}-${lon}-${date}-${requestedPollutants.join(',')}`;
    const cachedData = checkCache(cacheKey);
    
    if (cachedData) {
      return res.json(cachedData);
    }

    const pollutantData = {};
    
    for (const pollutant of requestedPollutants) {
      try {
        const data = await nasaService.getTEMPOData(pollutant.toUpperCase(), { lat, lon, date });
        pollutantData[pollutant.toUpperCase()] = {
          ...data,
          healthAdvisory: getHealthAdvisory(data.quality),
          recommendations: getRecommendations(data.quality),
          aqi: calculateAQI(pollutant.toUpperCase(), data.value)
        };
      } catch (error) {
        console.error(`Error fetching ${pollutant} data:`, error);
        pollutantData[pollutant.toUpperCase()] = {
          error: `Failed to fetch ${pollutant} data`,
          quality: 'unknown'
        };
      }
    }
    
    const response = {
      location: { lat: parseFloat(lat), lon: parseFloat(lon) },
      timestamp: new Date().toISOString(),
      pollutants: pollutantData,
      overallQuality: calculateOverallQuality(pollutantData)
    };
    
    setCache(cacheKey, response);
    res.json(response);
  } catch (error) {
    console.error('Error fetching multi-pollutant TEMPO data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch TEMPO data',
      message: error.message 
    });
  }
});

// Get MERRA-2 historical data
router.get('/merra2/data', async (req, res) => {
  try {
    const { lat, lon, startDate, endDate, variables } = req.query;
    const requestedVariables = variables ? variables.split(',') : ['CO2', 'temperature', 'humidity', 'wind'];
    
    const cacheKey = `merra2-${lat}-${lon}-${startDate}-${endDate}-${requestedVariables.join(',')}`;
    const cachedData = checkCache(cacheKey);
    
    if (cachedData) {
      return res.json(cachedData);
    }

    const data = await nasaService.getMERRA2Data({
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      startDate,
      endDate,
      variables: requestedVariables
    });
    
    setCache(cacheKey, data);
    res.json(data);
  } catch (error) {
    console.error('Error fetching MERRA-2 data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch MERRA-2 data',
      message: error.message 
    });
  }
});

// Get dataset information
router.get('/dataset-info', async (req, res) => {
  try {
    const cacheKey = 'tempo-dataset-info';
    const cachedData = checkCache(cacheKey);
    
    if (cachedData) {
      return res.json(cachedData);
    }

    const info = await nasaService.getDatasetInfo('TEMPO');
    setCache(cacheKey, info);
    res.json(info);
  } catch (error) {
    console.error('Error fetching dataset info:', error);
    res.status(500).json({ 
      error: 'Failed to fetch dataset information',
      message: error.message 
    });
  }
});

// Get health standards and guidelines
router.get('/health-standards', (req, res) => {
  try {
    const standards = {
      NO2: {
        who: { annual: 40, hourly: 200, unit: 'μg/m³' },
        epa: { annual: 53, hourly: 100, unit: 'ppb' },
        description: 'Nitrogen Dioxide - respiratory irritant, contributes to smog formation'
      },
      O3: {
        who: { peak: 100, unit: 'μg/m³' },
        epa: { 8hour: 70, unit: 'ppb' },
        description: 'Ground-level Ozone - respiratory health effects, especially for sensitive groups'
      },
      PM: {
        who: { annual: 15, daily: 45, unit: 'μg/m³' },
        epa: { annual: 12, daily: 35, unit: 'μg/m³' },
        description: 'Particulate Matter - cardiovascular and respiratory health impacts'
      },
      HCHO: {
        who: { indoor: 100, unit: 'μg/m³' },
        description: 'Formaldehyde - carcinogenic, respiratory and eye irritation'
      },
      AI: {
        description: 'Aerosol Index - indicates presence of UV-absorbing particles like dust and smoke'
      }
    };
    
    res.json(standards);
  } catch (error) {
    console.error('Error fetching health standards:', error);
    res.status(500).json({ 
      error: 'Failed to fetch health standards',
      message: error.message 
    });
  }
});

// Helper functions
function getHealthAdvisory(quality) {
  const advisories = {
    good: 'Air quality is satisfactory. Enjoy outdoor activities.',
    moderate: 'Air quality is acceptable for most people. Sensitive individuals should consider limiting prolonged outdoor exertion.',
    unhealthy_sensitive: 'Members of sensitive groups may experience health effects. Limit prolonged outdoor exertion.',
    unhealthy: 'Everyone may begin to experience health effects. Avoid prolonged outdoor exertion.',
    very_unhealthy: 'Health alert: everyone may experience serious health effects. Avoid outdoor activities.',
    hazardous: 'Health emergency: everyone should avoid all outdoor exertion.'
  };
  
  return advisories[quality] || 'Air quality information not available.';
}

function getRecommendations(quality) {
  const recommendations = {
    good: ['Enjoy outdoor activities', 'Windows can be opened for fresh air'],
    moderate: ['Sensitive individuals should monitor symptoms', 'Consider indoor exercise if sensitive'],
    unhealthy_sensitive: ['Limit outdoor time if sensitive', 'Keep windows closed', 'Use air purifier if available'],
    unhealthy: ['Limit outdoor activities', 'Keep windows closed', 'Use air purifier', 'Wear mask if going outside'],
    very_unhealthy: ['Avoid outdoor activities', 'Keep windows closed', 'Use air purifier', 'Wear N95 mask if must go outside'],
    hazardous: ['Stay indoors', 'Seal windows and doors', 'Use air purifier on high', 'Avoid all outdoor exposure']
  };
  
  return recommendations[quality] || ['Monitor air quality updates'];
}

function calculateAQI(pollutant, value) {
  // Simplified AQI calculation - in production, use official EPA breakpoints
  const breakpoints = {
    NO2: [0, 53, 100, 360, 649, 1249],
    O3: [0, 54, 70, 85, 105, 200],
    PM: [0, 12, 35.4, 55.4, 150.4, 250.4]
  };
  
  const aqiRanges = [0, 50, 100, 150, 200, 300];
  const pollutantBreakpoints = breakpoints[pollutant];
  
  if (!pollutantBreakpoints || !value) return null;
  
  for (let i = 0; i < pollutantBreakpoints.length - 1; i++) {
    if (value <= pollutantBreakpoints[i + 1]) {
      const aqiLow = aqiRanges[i];
      const aqiHigh = aqiRanges[i + 1];
      const concLow = pollutantBreakpoints[i];
      const concHigh = pollutantBreakpoints[i + 1];
      
      return Math.round(((aqiHigh - aqiLow) / (concHigh - concLow)) * (value - concLow) + aqiLow);
    }
  }
  
  return 300; // Hazardous
}

function calculateOverallQuality(pollutantData) {
  const qualities = Object.values(pollutantData)
    .filter(data => data.quality && data.quality !== 'unknown')
    .map(data => data.quality);
  
  if (qualities.length === 0) return 'unknown';
  
  const qualityOrder = ['good', 'moderate', 'unhealthy_sensitive', 'unhealthy', 'very_unhealthy', 'hazardous'];
  
  // Return the worst quality level
  for (let i = qualityOrder.length - 1; i >= 0; i--) {
    if (qualities.includes(qualityOrder[i])) {
      return qualityOrder[i];
    }
  }
  
  return 'moderate';
}

module.exports = router;