const express = require('express');
const router = express.Router();
const NASAService = require('../services/nasaService');

const nasaService = new NASAService();

// Cache for dataset information (5 minutes)
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000;

// Helper function to get cached data
function getCachedData(key) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

// Helper function to set cached data
function setCachedData(key, data) {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
}

// Get available datasets from NASA Earthdata
router.get('/datasets', async (req, res) => {
  try {
    const cacheKey = 'earthdata-datasets';
    const cached = getCachedData(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }

    // Mock data for development - replace with actual Earthdata API calls
    const datasets = {
      success: true,
      data: {
        atmospheric: [
          {
            id: 'TEMPO_NO2_L2',
            name: 'TEMPO Nitrogen Dioxide (NO2)',
            description: 'Tropospheric NO2 vertical column density from TEMPO',
            temporal_coverage: '2023-present',
            spatial_resolution: '2.1 x 4.4 km',
            update_frequency: 'Hourly',
            data_format: 'NetCDF-4',
            access_url: 'https://asdc.larc.nasa.gov/data/TEMPO/',
            documentation: 'https://tempo.si.edu/data-products.html'
          },
          {
            id: 'MERRA2_400',
            name: 'MERRA-2 Atmospheric Composition',
            description: 'Modern-Era Retrospective analysis for Research and Applications, Version 2',
            temporal_coverage: '1980-present',
            spatial_resolution: '0.5° x 0.625°',
            update_frequency: 'Daily',
            data_format: 'NetCDF-4',
            access_url: 'https://disc.gsfc.nasa.gov/datasets/M2T1NXAER_5.12.4/',
            documentation: 'https://gmao.gsfc.nasa.gov/reanalysis/MERRA-2/'
          },
          {
            id: 'OMI_AURA_L2',
            name: 'OMI/Aura Ozone and Air Quality',
            description: 'Ozone Monitoring Instrument Level 2 data products',
            temporal_coverage: '2004-present',
            spatial_resolution: '13 x 24 km',
            update_frequency: 'Daily',
            data_format: 'HDF-EOS',
            access_url: 'https://disc.gsfc.nasa.gov/datasets/OMNO2_003/',
            documentation: 'https://aura.gsfc.nasa.gov/omi.html'
          }
        ],
        climate: [
          {
            id: 'GISS_TEMP',
            name: 'GISS Surface Temperature Analysis',
            description: 'Global surface temperature anomalies',
            temporal_coverage: '1880-present',
            spatial_resolution: '2° x 2°',
            update_frequency: 'Monthly',
            data_format: 'NetCDF',
            access_url: 'https://data.giss.nasa.gov/gistemp/',
            documentation: 'https://data.giss.nasa.gov/gistemp/sources_v4/'
          },
          {
            id: 'GRACE_MASCON',
            name: 'GRACE Mass Concentration Blocks',
            description: 'Gravity Recovery and Climate Experiment mass change data',
            temporal_coverage: '2002-2017, 2018-present',
            spatial_resolution: '3° equal-area',
            update_frequency: 'Monthly',
            data_format: 'NetCDF',
            access_url: 'https://podaac.jpl.nasa.gov/dataset/TELLUS_GRAC-GRFO_MASCON_CRI_GRID_RL06_V2',
            documentation: 'https://grace.jpl.nasa.gov/'
          }
        ],
        earth_observation: [
          {
            id: 'MODIS_TERRA',
            name: 'MODIS/Terra Surface Reflectance',
            description: 'Moderate Resolution Imaging Spectroradiometer data',
            temporal_coverage: '2000-present',
            spatial_resolution: '250m, 500m, 1km',
            update_frequency: 'Daily',
            data_format: 'HDF-EOS',
            access_url: 'https://lpdaac.usgs.gov/products/mod09gav006/',
            documentation: 'https://modis.gsfc.nasa.gov/'
          },
          {
            id: 'LANDSAT_8_9',
            name: 'Landsat 8-9 Collection 2',
            description: 'Landsat surface reflectance and thermal data',
            temporal_coverage: '2013-present',
            spatial_resolution: '15-100m',
            update_frequency: '16-day revisit',
            data_format: 'GeoTIFF',
            access_url: 'https://earthexplorer.usgs.gov/',
            documentation: 'https://www.usgs.gov/landsat-missions'
          }
        ]
      },
      metadata: {
        total_datasets: 7,
        categories: ['atmospheric', 'climate', 'earth_observation'],
        last_updated: new Date().toISOString(),
        authentication_required: true,
        access_methods: ['Direct Download', 'OPeNDAP', 'Web Services']
      }
    };

    setCachedData(cacheKey, datasets);
    res.json(datasets);

  } catch (error) {
    console.error('Error fetching Earthdata datasets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch datasets',
      message: error.message
    });
  }
});

// Get specific dataset information
router.get('/datasets/:datasetId', async (req, res) => {
  try {
    const { datasetId } = req.params;
    const cacheKey = `earthdata-dataset-${datasetId}`;
    const cached = getCachedData(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }

    // Mock detailed dataset information
    const datasetDetails = {
      success: true,
      data: {
        id: datasetId,
        name: `Dataset ${datasetId}`,
        description: `Detailed information for dataset ${datasetId}`,
        provider: 'NASA Goddard Space Flight Center',
        temporal_coverage: {
          start: '2000-01-01',
          end: 'present',
          resolution: 'daily'
        },
        spatial_coverage: {
          north: 90,
          south: -90,
          east: 180,
          west: -180,
          resolution: '1km'
        },
        variables: [
          {
            name: 'surface_temperature',
            units: 'Kelvin',
            description: 'Land surface temperature'
          },
          {
            name: 'aerosol_optical_depth',
            units: 'dimensionless',
            description: 'Aerosol optical depth at 550nm'
          }
        ],
        access_methods: [
          {
            type: 'Direct Download',
            url: `https://earthdata.nasa.gov/data/${datasetId}`,
            format: 'NetCDF-4'
          },
          {
            type: 'OPeNDAP',
            url: `https://opendap.earthdata.nasa.gov/${datasetId}`,
            format: 'DAP'
          }
        ],
        citation: `NASA Goddard Space Flight Center. ${new Date().getFullYear()}. ${datasetId} Dataset. Retrieved from https://earthdata.nasa.gov/`,
        doi: `10.5067/NASA/${datasetId}`,
        license: 'NASA Open Data Policy',
        contact: 'support@earthdata.nasa.gov'
      }
    };

    setCachedData(cacheKey, datasetDetails);
    res.json(datasetDetails);

  } catch (error) {
    console.error('Error fetching dataset details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dataset details',
      message: error.message
    });
  }
});

// Search datasets by parameters
router.get('/search', async (req, res) => {
  try {
    const { 
      keyword, 
      category, 
      temporal_start, 
      temporal_end, 
      bbox,
      limit = 10,
      offset = 0 
    } = req.query;

    const cacheKey = `earthdata-search-${JSON.stringify(req.query)}`;
    const cached = getCachedData(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }

    // Mock search results
    const searchResults = {
      success: true,
      data: {
        results: [
          {
            id: 'TEMPO_NO2_L2',
            name: 'TEMPO Nitrogen Dioxide (NO2)',
            description: 'Tropospheric NO2 vertical column density from TEMPO',
            category: 'atmospheric',
            relevance_score: 0.95,
            thumbnail: 'https://earthdata.nasa.gov/thumbnails/tempo_no2.png'
          },
          {
            id: 'MERRA2_400',
            name: 'MERRA-2 Atmospheric Composition',
            description: 'Modern-Era Retrospective analysis for Research and Applications',
            category: 'atmospheric',
            relevance_score: 0.87,
            thumbnail: 'https://earthdata.nasa.gov/thumbnails/merra2.png'
          }
        ],
        pagination: {
          total: 2,
          limit: parseInt(limit),
          offset: parseInt(offset),
          has_more: false
        },
        search_parameters: {
          keyword,
          category,
          temporal_start,
          temporal_end,
          bbox
        }
      }
    };

    setCachedData(cacheKey, searchResults);
    res.json(searchResults);

  } catch (error) {
    console.error('Error searching datasets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search datasets',
      message: error.message
    });
  }
});

// Get authentication status
router.get('/auth/status', async (req, res) => {
  try {
    const isAuthenticated = await nasaService.authenticateEarthdata();
    
    res.json({
      success: true,
      data: {
        authenticated: !!isAuthenticated,
        token_valid: nasaService.isTokenValid(),
        access_level: isAuthenticated ? 'full' : 'public',
        message: isAuthenticated ? 
          'Authenticated with NASA Earthdata' : 
          'Using public access - some datasets may be restricted'
      }
    });

  } catch (error) {
    console.error('Error checking auth status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check authentication status',
      message: error.message
    });
  }
});

// Get data access URLs for a dataset
router.get('/datasets/:datasetId/access', async (req, res) => {
  try {
    const { datasetId } = req.params;
    const { format = 'netcdf', temporal_start, temporal_end, bbox } = req.query;

    // Mock access URLs generation
    const accessInfo = {
      success: true,
      data: {
        dataset_id: datasetId,
        access_urls: [
          {
            type: 'Direct Download',
            url: `https://earthdata.nasa.gov/data/${datasetId}/download?format=${format}`,
            size_estimate: '125 MB',
            format: format.toUpperCase()
          },
          {
            type: 'OPeNDAP',
            url: `https://opendap.earthdata.nasa.gov/${datasetId}.nc`,
            size_estimate: 'Variable',
            format: 'DAP'
          },
          {
            type: 'Web Service',
            url: `https://earthdata.nasa.gov/api/v1/data/${datasetId}`,
            size_estimate: 'API Response',
            format: 'JSON'
          }
        ],
        parameters: {
          format,
          temporal_start,
          temporal_end,
          bbox
        },
        authentication_required: true,
        estimated_processing_time: '2-5 minutes',
        expiry_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      }
    };

    res.json(accessInfo);

  } catch (error) {
    console.error('Error generating access URLs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate access URLs',
      message: error.message
    });
  }
});

module.exports = router;