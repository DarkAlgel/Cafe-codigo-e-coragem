import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Grid,
  InputAdornment
} from '@mui/material';
import {
  LocationOn,
  MyLocation,
  Search,
  Clear,
  Info
} from '@mui/icons-material';
import { DEFAULT_LOCATION, validateCoordinates } from '../../services/externalApis';

const LocationInput = ({ onLocationChange, currentLocation }) => {
  const [latitude, setLatitude] = useState(currentLocation?.latitude || DEFAULT_LOCATION.latitude);
  const [longitude, setLongitude] = useState(currentLocation?.longitude || DEFAULT_LOCATION.longitude);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [locationName, setLocationName] = useState(currentLocation?.name || DEFAULT_LOCATION.name);

  useEffect(() => {
    if (currentLocation) {
      setLatitude(currentLocation.latitude);
      setLongitude(currentLocation.longitude);
      setLocationName(currentLocation.name || '');
    }
  }, [currentLocation]);

  const handleCoordinateChange = (field, value) => {
    setError('');
    if (field === 'latitude') {
      setLatitude(value);
    } else {
      setLongitude(value);
    }
  };

  const validateAndApplyLocation = () => {
    try {
      const validatedCoords = validateCoordinates(latitude, longitude);
      const newLocation = {
        ...validatedCoords,
        name: locationName || `${validatedCoords.latitude}, ${validatedCoords.longitude}`
      };
      
      onLocationChange(newLocation);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          name: 'Current Location'
        };
        
        setLatitude(newLocation.latitude);
        setLongitude(newLocation.longitude);
        setLocationName(newLocation.name);
        onLocationChange(newLocation);
        setError('');
        setIsLoading(false);
      },
      (error) => {
        setError(`Location access denied: ${error.message}`);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const resetToDefault = () => {
    setLatitude(DEFAULT_LOCATION.latitude);
    setLongitude(DEFAULT_LOCATION.longitude);
    setLocationName(DEFAULT_LOCATION.name);
    onLocationChange(DEFAULT_LOCATION);
    setError('');
  };

  const clearInputs = () => {
    setLatitude('');
    setLongitude('');
    setLocationName('');
    setError('');
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LocationOn sx={{ color: '#4CAF50', mr: 1 }} />
          <Typography variant="h6" component="h2">
            Location Settings
          </Typography>
          <Tooltip title="Set coordinates to get atmospheric and air quality data for your location">
            <IconButton size="small" sx={{ ml: 1 }}>
              <Info fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Current Location Display */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Current Location:
          </Typography>
          <Chip
            icon={<LocationOn />}
            label={locationName || 'No location set'}
            color="primary"
            variant="outlined"
            sx={{ maxWidth: '100%' }}
          />
        </Box>

        {/* Coordinate Inputs */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Latitude"
              type="number"
              value={latitude}
              onChange={(e) => handleCoordinateChange('latitude', e.target.value)}
              placeholder="40.7128"
              helperText="Range: -90 to 90"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Typography variant="body2" color="textSecondary">
                      °N
                    </Typography>
                  </InputAdornment>
                ),
              }}
              inputProps={{
                step: 0.0001,
                min: -90,
                max: 90
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Longitude"
              type="number"
              value={longitude}
              onChange={(e) => handleCoordinateChange('longitude', e.target.value)}
              placeholder="-74.0060"
              helperText="Range: -180 to 180"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Typography variant="body2" color="textSecondary">
                      °E
                    </Typography>
                  </InputAdornment>
                ),
              }}
              inputProps={{
                step: 0.0001,
                min: -180,
                max: 180
              }}
            />
          </Grid>
        </Grid>

        {/* Location Name Input */}
        <TextField
          fullWidth
          label="Location Name (Optional)"
          value={locationName}
          onChange={(e) => setLocationName(e.target.value)}
          placeholder="e.g., New York City, NY, USA"
          sx={{ mb: 2 }}
          InputProps={{
            endAdornment: locationName && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setLocationName('')}
                  edge="end"
                >
                  <Clear />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<Search />}
            onClick={validateAndApplyLocation}
            disabled={!latitude || !longitude}
          >
            Apply Location
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<MyLocation />}
            onClick={useCurrentLocation}
            disabled={isLoading}
          >
            {isLoading ? 'Getting Location...' : 'Use Current Location'}
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<LocationOn />}
            onClick={resetToDefault}
          >
            Default (NYC)
          </Button>
          
          <Button
            variant="text"
            startIcon={<Clear />}
            onClick={clearInputs}
            size="small"
          >
            Clear
          </Button>
        </Box>

        {/* Coordinate Info */}
        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="caption" color="textSecondary">
            <strong>Default Location:</strong> New York City ({DEFAULT_LOCATION.latitude}, {DEFAULT_LOCATION.longitude})
            <br />
            <strong>Coordinate Format:</strong> Decimal degrees (e.g., 40.7128, -74.0060)
            <br />
            <strong>Data Sources:</strong> OpenAQ (air quality monitoring)
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default LocationInput;