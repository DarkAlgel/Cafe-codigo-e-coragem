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
  Wind
} from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Início' },
    { path: '/map', icon: Map, label: 'Mapa' },
    { path: '/pollutants', icon: Activity, label: 'Poluentes' },
    { path: '/alerts', icon: Bell, label: 'Alertas' },
    { path: '/health', icon: Heart, label: 'Saúde' },
    { path: '/history', icon: TrendingUp, label: 'Histórico' },
    { path: '/profile', icon: User, label: 'Perfil' }
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Wind className="brand-icon" />
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