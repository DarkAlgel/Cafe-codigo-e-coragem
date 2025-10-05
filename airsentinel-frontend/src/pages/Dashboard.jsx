import React from 'react';
import { Box } from '@mui/material';
import TabsDashboard from '../components/Dashboard/TabsDashboard';

const Dashboard = () => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <TabsDashboard />
    </Box>
  );
};

export default Dashboard;