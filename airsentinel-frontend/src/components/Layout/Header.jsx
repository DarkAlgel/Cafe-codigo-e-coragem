import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Menu, 
  MenuItem, 
  Box,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Dashboard,
  TrendingUp,
  HealthAndSafety,
  Notifications,
  Settings,
  Logout,
  Air,
  Group
} from '@mui/icons-material';
import { authService } from '../../services/api';

const Header = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
    handleClose();
  };

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/' },
    { text: 'Predictions', icon: <TrendingUp />, path: '/predictions' },
    { text: 'Health', icon: <HealthAndSafety />, path: '/health' },
    { text: 'Alerts', icon: <Notifications />, path: '/alerts' },
    { text: 'About Team', icon: <Group />, path: '/about-team' },
  ];

  const drawer = (
    <Box sx={{ width: 250 }}>
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Air sx={{ color: '#4CAF50', fontSize: 32 }} />
          <Typography variant="h6" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
            Air Sentinel
          </Typography>
        </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem 
            key={item.text}
            component={Link}
            to={item.path}
            selected={location.pathname === item.path}
            onClick={() => setMobileOpen(false)}
            sx={{
              cursor: 'pointer',
              '&.Mui-selected': {
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                '& .MuiListItemIcon-root': {
                  color: '#4CAF50',
                },
                '& .MuiListItemText-primary': {
                  color: '#4CAF50',
                  fontWeight: 'bold',
                },
              },
              '&:hover': {
                backgroundColor: 'rgba(76, 175, 80, 0.05)',
              },
            }}
          >
            <ListItemIcon>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar 
        position="fixed" 
        sx={{ 
          backgroundColor: 'white',
          color: 'black',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          zIndex: theme.zIndex.drawer + 1
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: isMobile ? 1 : 0 }}>
            <Air sx={{ color: '#4CAF50', fontSize: 32 }} />
            <Typography 
              variant="h6" 
              component={Link}
              to="/"
              sx={{ 
                color: '#4CAF50', 
                fontWeight: 'bold',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'none'
                }
              }}
            >
              Air Sentinel
            </Typography>
          </Box>

          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 2, ml: 4, flexGrow: 1 }}>
              {menuItems.map((item) => (
                <Button
                  key={item.text}
                  component={Link}
                  to={item.path}
                  startIcon={item.icon}
                  sx={{
                    color: location.pathname === item.path ? '#4CAF50' : 'inherit',
                    fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                    '&:hover': {
                      backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    },
                  }}
                >
                  {item.text}
                </Button>
              ))}
            </Box>
          )}

          <Box sx={{ ml: 'auto' }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={() => { navigate('/profile'); handleClose(); }}>
                <Settings sx={{ mr: 1 }} />
                Perfil
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <Logout sx={{ mr: 1 }} />
                Sair
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: 250 
            },
          }}
        >
          {drawer}
        </Drawer>
      )}
    </>
  );
};

export default Header;