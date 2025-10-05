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
    <Paper 
      elevation={2} 
      sx={{ 
        p: 3, 
        mb: 3, 
        background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.secondary.main}10)`,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <LocationOn sx={{ color: theme.palette.primary.main, fontSize: 28 }} />
        <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
          City Selection
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Autocomplete
          value={selectedCity}
          onChange={handleCitySelect}
          inputValue={inputValue}
          onInputChange={(event, newInputValue) => {
            setInputValue(newInputValue);
          }}
          options={cities}
          sx={{ 
            minWidth: 300,
            flexGrow: 1,
            maxWidth: 500
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
                  <Search sx={{ color: theme.palette.text.secondary, mr: 1 }} />
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: theme.palette.background.paper,
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.primary.main,
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.primary.main,
                  }
                }
              }}
            />
          )}
          renderOption={(props, option) => (
            <Box component="li" {...props}>
              <LocationOn sx={{ mr: 1, color: theme.palette.text.secondary }} />
              {option}
            </Box>
          )}
          filterOptions={(options, { inputValue }) => {
            return options.filter(option =>
              option.toLowerCase().includes(inputValue.toLowerCase())
            );
          }}
        />
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Current:
          </Typography>
          <Chip
            icon={<LocationOn />}
            label={selectedCity}
            color="primary"
            variant="filled"
            sx={{ 
              fontWeight: 600,
              '& .MuiChip-icon': {
                color: 'inherit'
              }
            }}
          />
        </Box>
      </Box>
      
      <Typography 
        variant="body2" 
        color="text.secondary" 
        sx={{ mt: 2, fontStyle: 'italic' }}
      >
        Select a city to view air quality data and forecasts for that location
      </Typography>
    </Paper>
  );
};

export default CitySearchBar;