import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import MapView from './components/MapView';
import PollutantDetails from './components/PollutantDetails';
import AlertSettings from './components/AlertSettings';
import HealthTips from './components/HealthTips';
import HistoryTrends from './components/HistoryTrends';
import UserProfile from './components/UserProfile';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/pollutants" element={<PollutantDetails />} />
            <Route path="/alerts" element={<AlertSettings />} />
            <Route path="/health" element={<HealthTips />} />
            <Route path="/history" element={<HistoryTrends />} />
            <Route path="/profile" element={<UserProfile />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
