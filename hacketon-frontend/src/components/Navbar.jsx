import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Map, 
  Activity, 
  Bell, 
  Heart, 
  TrendingUp, 
  User,
  Wind,
  Satellite,
  Database
} from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/poluentes', icon: Activity, label: 'Poluentes' },
    { path: '/saude', icon: Heart, label: 'Saúde' }
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <div className="brand-icon-container">
            <span className="brand-icon-text">A</span>
          </div>
          <span className="brand-text">Air Sentinel</span>
        </div>
        
        <div className="navbar-menu">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`navbar-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} />
                <span className="navbar-label">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;