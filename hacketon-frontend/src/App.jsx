import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import CO2Dashboard from './components/CO2Dashboard';
import MapView from './components/MapView';
import PollutantDetails from './components/PollutantDetails';
import AlertSettings from './components/AlertSettings';
import HealthTips from './components/HealthTips';
import HistoryTrends from './components/HistoryTrends';
import HistoricalChart from './components/HistoricalChart';
import UserProfile from './components/UserProfile';
import NASADataViewer from './components/NASADataViewer';
import DataSourceInfo from './components/DataSourceInfo';
import LocationSelector from './components/LocationSelector';
import DatasetInfo from './components/DatasetInfo';
import About from './components/About';
import './App.css';

function App() {
  const [selectedLocation, setSelectedLocation] = useState({
    name: 'São Paulo, SP',
    lat: -23.5505,
    lng: -46.6333,
    country: 'Brasil'
  });
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/co2" element={<CO2Dashboard />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/pollutants" element={<PollutantDetails />} />
            <Route path="/alerts" element={<AlertSettings />} />
            <Route path="/health" element={<HealthTips />} />
            <Route path="/history" element={<HistoryTrends />} />
            <Route path="/historical" element={<HistoricalChart />} />
            <Route path="/user-profile" element={<UserProfile />} />
          <Route path="/nasa-data" element={<NASADataViewer selectedLocation={selectedLocation} />} />
          <Route path="/data-sources" element={<DataSourceInfo />} />
            <Route path="/location" element={<LocationSelector />} />
            <Route path="/dataset" element={<DatasetInfo />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
