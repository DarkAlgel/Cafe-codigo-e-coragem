import React, { useState } from 'react';
import {
  Box,
  TextField,
  Autocomplete,
  Paper,
  Typography,
  Chip,
  useTheme
} from '@mui/material';
import {
  LocationOn,
  Search
} from '@mui/icons-material';

const CitySearchBar = ({ 
  selectedCity = 'New York', 
  onCityChange = () => {},
  cities = [
    'New York',
    'Los Angeles', 
    'Chicago',
    'Houston',
    'Phoenix',
    'Philadelphia',
    'San Antonio',
    'San Diego',
    'Dallas',
    'San Jose',
    'Austin',
    'Jacksonville',
    'Fort Worth',
    'Columbus',
    'Charlotte',
    'San Francisco',
    'Indianapolis',
    'Seattle',
    'Denver',
    'Washington DC',
    'Boston',
    'El Paso',
    'Nashville',
    'Detroit',
    'Oklahoma City',
    'Portland',
    'Las Vegas',
    'Memphis',
    'Louisville',
    'Baltimore',
    'Milwaukee',
    'Albuquerque',
    'Tucson',
    'Fresno',
    'Sacramento',
    'Kansas City',
    'Mesa',
    'Atlanta',
    'Colorado Springs',
    'Omaha',
    'Raleigh',
    'Miami',
    'Long Beach',
    'Virginia Beach',
    'Oakland',
    'Minneapolis',
    'Tulsa',
    'Tampa',
    'Arlington',
    'New Orleans'
  ]
}) => {
  const theme = useTheme();
  const [inputValue, setInputValue] = useState('');

  const handleCitySelect = (event, newValue) => {
    if (newValue) {
      onCityChange(newValue);
    }
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 2, sm: 3 }, 
          background: `linear-gradient(135deg, ${theme.palette.primary.main}08, ${theme.palette.background.paper})`,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at top right, ${theme.palette.primary.main}12, transparent 50%)`,
            zIndex: 0
          }
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          {/* Header Section */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            mb: 3,
            pb: 2,
            borderBottom: `1px solid ${theme.palette.divider}`
          }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 48,
                height: 48,
                borderRadius: '50%',
                backgroundColor: `${theme.palette.primary.main}15`,
                border: `2px solid ${theme.palette.primary.main}30`
              }}
            >
              <LocationOn sx={{ 
                color: theme.palette.primary.main, 
                fontSize: 28 
              }} />
            </Box>
            <Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700, 
                  color: theme.palette.text.primary,
                  fontSize: { xs: '1.1rem', sm: '1.25rem' }
                }}
              >
                City Selection
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontSize: '0.875rem' }}
              >
                Choose your location for air quality monitoring
              </Typography>
            </Box>
          </Box>
          
          {/* Search and Current City Section */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: { xs: 'stretch', md: 'center' }, 
            gap: 3, 
            flexDirection: { xs: 'column', md: 'row' },
            mb: 2
          }}>
            <Autocomplete
              value={selectedCity}
              onChange={handleCitySelect}
              inputValue={inputValue}
              onInputChange={(event, newInputValue) => {
                setInputValue(newInputValue);
              }}
              options={cities}
              sx={{ 
                minWidth: { xs: '100%', md: 320 },
                flexGrow: 1,
                maxWidth: { xs: '100%', md: 500 }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search for a city"
                  placeholder="Type to search cities..."
                  variant="outlined"
                  size="medium"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <Search sx={{ 
                        color: theme.palette.text.secondary, 
                        mr: 1,
                        fontSize: 20
                      }} />
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: theme.palette.background.paper,
                      borderRadius: 2,
                      boxShadow: `0 2px 8px ${theme.palette.primary.main}10`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: `0 4px 12px ${theme.palette.primary.main}20`,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main,
                          borderWidth: 2
                        }
                      },
                      '&.Mui-focused': {
                        boxShadow: `0 4px 16px ${theme.palette.primary.main}25`,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main,
                          borderWidth: 2
                        }
                      }
                    },
                    '& .MuiInputLabel-root': {
                      fontWeight: 500
                    }
                  }}
                />
              )}
              renderOption={(props, option) => (
                <Box 
                  component="li" 
                  {...props}
                  sx={{
                    '&:hover': {
                      backgroundColor: `${theme.palette.primary.main}08`
                    }
                  }}
                >
                  <LocationOn sx={{ 
                    mr: 1.5, 
                    color: theme.palette.primary.main,
                    fontSize: 18
                  }} />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {option}
                  </Typography>
                </Box>
              )}
              filterOptions={(options, { inputValue }) => {
                return options.filter(option =>
                  option.toLowerCase().includes(inputValue.toLowerCase())
                );
              }}
            />
            
            {/* Current City Display */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1.5,
              backgroundColor: `${theme.palette.primary.main}08`,
              borderRadius: 2,
              px: 2.5,
              py: 1.5,
              border: `1px solid ${theme.palette.primary.main}20`,
              minWidth: 'fit-content'
            }}>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontWeight: 500, fontSize: '0.875rem' }}
              >
                Current:
              </Typography>
              <Chip
                icon={<LocationOn sx={{ fontSize: '18px !important' }} />}
                label={selectedCity}
                color="primary"
                variant="filled"
                sx={{ 
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  height: 32,
                  borderRadius: 2,
                  boxShadow: `0 2px 4px ${theme.palette.primary.main}20`,
                  '& .MuiChip-icon': {
                    color: 'inherit'
                  },
                  '& .MuiChip-label': {
                    px: 1
                  }
                }}
              />
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default CitySearchBar;