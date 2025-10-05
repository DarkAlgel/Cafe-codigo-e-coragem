import React from 'react';
import { Box } from '@mui/material';
import TabsDashboard from '../components/Dashboard/TabsDashboard';

const Dashboard = () => {
  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'background.default',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <TabsDashboard />
    </Box>
  );
};

export default Dashboard;