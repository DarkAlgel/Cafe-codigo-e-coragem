import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Bell, BellOff, Mail, MessageSquare, Smartphone, Clock, MapPin, Settings, Save, Trash2 } from 'lucide-react';

const AlertSettings = () => {
  const [searchParams] = useSearchParams();
  const locationId = searchParams.get('location');
  const [alerts, setAlerts] = useState([]);
  const [newAlert, setNewAlert] = useState({
    name: '',
    location: locationId || '',
    pollutant: 'aqi',
    threshold: 100,
    condition: 'above',
    notifications: {
      email: true,
      sms: false,
      push: true
    },
    schedule: {
      enabled: false,
      startTime: '08:00',
      endTime: '22:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    },
    active: true
  });
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock locations data
  const mockLocations = [
    { id: '1', name: 'São Paulo Downtown', coordinates: { lat: -23.5505, lng: -46.6333 } },
    { id: '2', name: 'Vila Madalena', coordinates: { lat: -23.5368, lng: -46.6918 } },
    { id: '3', name: 'Ibirapuera Park', coordinates: { lat: -23.5873, lng: -46.6573 } },
    { id: '4', name: 'Paulista Avenue', coordinates: { lat: -23.5613, lng: -46.6565 } },
    { id: '5', name: 'Morumbi', coordinates: { lat: -23.6033, lng: -46.7000 } }
  ];

  // Mock existing alerts
  const mockAlerts = [
    {
      id: '1',
      name: 'High AQI Alert - Downtown',
      location: '1',
      pollutant: 'aqi',
      threshold: 100,
      condition: 'above',
      notifications: { email: true, sms: false, push: true },
      schedule: { enabled: true, startTime: '07:00', endTime: '23:00', days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] },
      active: true,
      lastTriggered: '2024-01-15T14:30:00Z',
      triggerCount: 5
    },
    {
      id: '2',
      name: 'PM2.5 Warning - Home Area',
      location: '2',
      pollutant: 'pm25',
      threshold: 35,
      condition: 'above',
      notifications: { email: true, sms: true, push: true },
      schedule: { enabled: false, startTime: '08:00', endTime: '22:00', days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] },
      active: true,
      lastTriggered: null,
      triggerCount: 0
    }
  ];

  const pollutantOptions = [
    { value: 'aqi', label: 'Air Quality Index (AQI)', unit: '', max: 500 },
    { value: 'pm25', label: 'PM2.5', unit: 'μg/m³', max: 100 },
    { value: 'pm10', label: 'PM10', unit: 'μg/m³', max: 150 },
    { value: 'no2', label: 'NO₂', unit: 'μg/m³', max: 200 },
    { value: 'o3', label: 'O₃', unit: 'μg/m³', max: 240 },
    { value: 'co', label: 'CO', unit: 'mg/m³', max: 30 },
    { value: 'so2', label: 'SO₂', unit: 'μg/m³', max: 500 }
  ];

  const dayOptions = [
    { value: 'monday', label: 'Mon' },
    { value: 'tuesday', label: 'Tue' },
    { value: 'wednesday', label: 'Wed' },
    { value: 'thursday', label: 'Thu' },
    { value: 'friday', label: 'Fri' },
    { value: 'saturday', label: 'Sat' },
    { value: 'sunday', label: 'Sun' }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setLocations(mockLocations);
      setAlerts(mockAlerts);
      setLoading(false);
    }, 1000);
  }, []);

  const handleInputChange = (field, value) => {
    setNewAlert(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parent, field, value) => {
    setNewAlert(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handleDayToggle = (day) => {
    setNewAlert(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        days: prev.schedule.days.includes(day)
          ? prev.schedule.days.filter(d => d !== day)
          : [...prev.schedule.days, day]
      }
    }));
  };

  const handleSaveAlert = () => {
    if (!newAlert.name || !newAlert.location) {
      alert('Please fill in all required fields');
      return;
    }

    const alertToSave = {
      ...newAlert,
      id: Date.now().toString(),
      lastTriggered: null,
      triggerCount: 0
    };

    setAlerts(prev => [...prev, alertToSave]);
    
    // Reset form
    setNewAlert({
      name: '',
      location: locationId || '',
      pollutant: 'aqi',
      threshold: 100,
      condition: 'above',
      notifications: {
        email: true,
        sms: false,
        push: true
      },
      schedule: {
        enabled: false,
        startTime: '08:00',
        endTime: '22:00',
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
      },
      active: true
    });

    alert('Alert saved successfully!');
  };

  const handleDeleteAlert = (alertId) => {
    if (window.confirm('Are you sure you want to delete this alert?')) {
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    }
  };

  const toggleAlertStatus = (alertId) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, active: !alert.active } : alert
    ));
  };

  const getLocationName = (locationId) => {
    const location = locations.find(loc => loc.id === locationId);
    return location ? location.name : 'Unknown Location';
  };

  const getPollutantLabel = (pollutant) => {
    const option = pollutantOptions.find(opt => opt.value === pollutant);
    return option ? option.label : pollutant.toUpperCase();
  };

  const getThresholdColor = (pollutant, threshold) => {
    const option = pollutantOptions.find(opt => opt.value === pollutant);
    if (!option) return '#9E9E9E';
    
    const ratio = threshold / option.max;
    if (ratio <= 0.3) return '#4CAF50';
    if (ratio <= 0.6) return '#FF9800';
    if (ratio <= 0.8) return '#f44336';
    return '#9C27B0';
  };

  if (loading) {
    return (
      <div className="alert-settings">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading alert settings...</p>
        </div>
      </div>
    );
  };

  return (
    <div className="alert-settings">
      <div className="settings-header">
        <h1>Alert Configuration</h1>
        <p>Set up personalized air quality alerts to stay informed about pollution levels</p>
      </div>

      <div className="settings-content">
        {/* Create New Alert */}
        <div className="card new-alert-form">
          <div className="card-header">
            <Bell className="header-icon" />
            <h2>Create New Alert</h2>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="alert-name">Alert Name *</label>
              <input
                id="alert-name"
                type="text"
                value={newAlert.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., High AQI Alert - Home"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="alert-location">Location *</label>
              <select
                id="alert-location"
                value={newAlert.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="form-select"
              >
                <option value="">Select a location</option>
                {locations.map(location => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="alert-pollutant">Pollutant</label>
              <select
                id="alert-pollutant"
                value={newAlert.pollutant}
                onChange={(e) => handleInputChange('pollutant', e.target.value)}
                className="form-select"
              >
                {pollutantOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label} {option.unit && `(${option.unit})`}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="alert-condition">Condition</label>
              <select
                id="alert-condition"
                value={newAlert.condition}
                onChange={(e) => handleInputChange('condition', e.target.value)}
                className="form-select"
              >
                <option value="above">Above threshold</option>
                <option value="below">Below threshold</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="alert-threshold">
                Threshold Value
                {pollutantOptions.find(opt => opt.value === newAlert.pollutant)?.unit && 
                  ` (${pollutantOptions.find(opt => opt.value === newAlert.pollutant).unit})`
                }
              </label>
              <input
                id="alert-threshold"
                type="number"
                value={newAlert.threshold}
                onChange={(e) => handleInputChange('threshold', parseInt(e.target.value))}
                min="0"
                max={pollutantOptions.find(opt => opt.value === newAlert.pollutant)?.max || 500}
                className="form-input"
              />
            </div>
          </div>

          {/* Notification Methods */}
          <div className="notification-methods">
            <h3>Notification Methods</h3>
            <div className="notification-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={newAlert.notifications.email}
                  onChange={(e) => handleNestedInputChange('notifications', 'email', e.target.checked)}
                />
                <Mail className="notification-icon" />
                Email Notifications
              </label>
              
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={newAlert.notifications.sms}
                  onChange={(e) => handleNestedInputChange('notifications', 'sms', e.target.checked)}
                />
                <MessageSquare className="notification-icon" />
                SMS Notifications
              </label>
              
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={newAlert.notifications.push}
                  onChange={(e) => handleNestedInputChange('notifications', 'push', e.target.checked)}
                />
                <Smartphone className="notification-icon" />
                Push Notifications
              </label>
            </div>
          </div>

          {/* Schedule Settings */}
          <div className="schedule-settings">
            <div className="schedule-header">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={newAlert.schedule.enabled}
                  onChange={(e) => handleNestedInputChange('schedule', 'enabled', e.target.checked)}
                />
                <Clock className="notification-icon" />
                Enable Schedule
              </label>
            </div>

            {newAlert.schedule.enabled && (
              <div className="schedule-options">
                <div className="time-range">
                  <div className="form-group">
                    <label htmlFor="start-time">Start Time</label>
                    <input
                      id="start-time"
                      type="time"
                      value={newAlert.schedule.startTime}
                      onChange={(e) => handleNestedInputChange('schedule', 'startTime', e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="end-time">End Time</label>
                    <input
                      id="end-time"
                      type="time"
                      value={newAlert.schedule.endTime}
                      onChange={(e) => handleNestedInputChange('schedule', 'endTime', e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="days-selection">
                  <label>Active Days</label>
                  <div className="days-grid">
                    {dayOptions.map(day => (
                      <button
                        key={day.value}
                        type="button"
                        className={`day-button ${newAlert.schedule.days.includes(day.value) ? 'active' : ''}`}
                        onClick={() => handleDayToggle(day.value)}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button className="btn btn-primary" onClick={handleSaveAlert}>
              <Save className="btn-icon" />
              Save Alert
            </button>
          </div>
        </div>

        {/* Existing Alerts */}
        <div className="card existing-alerts">
          <div className="card-header">
            <Settings className="header-icon" />
            <h2>Your Alerts ({alerts.length})</h2>
          </div>

          {alerts.length === 0 ? (
            <div className="no-alerts">
              <BellOff className="no-alerts-icon" />
              <p>No alerts configured yet</p>
              <p>Create your first alert above to get started</p>
            </div>
          ) : (
            <div className="alerts-list">
              {alerts.map(alert => (
                <div key={alert.id} className={`alert-item ${!alert.active ? 'inactive' : ''}`}>
                  <div className="alert-info">
                    <div className="alert-header">
                      <h3>{alert.name}</h3>
                      <div className="alert-status">
                        <button
                          className={`status-toggle ${alert.active ? 'active' : 'inactive'}`}
                          onClick={() => toggleAlertStatus(alert.id)}
                        >
                          {alert.active ? <Bell size={16} /> : <BellOff size={16} />}
                          {alert.active ? 'Active' : 'Inactive'}
                        </button>
                      </div>
                    </div>

                    <div className="alert-details">
                      <div className="detail-item">
                        <MapPin className="detail-icon" />
                        <span>{getLocationName(alert.location)}</span>
                      </div>
                      
                      <div className="detail-item">
                        <span className="pollutant-badge" style={{ backgroundColor: getThresholdColor(alert.pollutant, alert.threshold) }}>
                          {getPollutantLabel(alert.pollutant)}
                        </span>
                        <span>
                          {alert.condition} {alert.threshold}
                          {pollutantOptions.find(opt => opt.value === alert.pollutant)?.unit && 
                            ` ${pollutantOptions.find(opt => opt.value === alert.pollutant).unit}`
                          }
                        </span>
                      </div>

                      <div className="notification-badges">
                        {alert.notifications.email && <Mail className="notification-badge" title="Email" />}
                        {alert.notifications.sms && <MessageSquare className="notification-badge" title="SMS" />}
                        {alert.notifications.push && <Smartphone className="notification-badge" title="Push" />}
                      </div>
                    </div>

                    <div className="alert-stats">
                      <div className="stat-item">
                        <span className="stat-label">Triggered:</span>
                        <span className="stat-value">{alert.triggerCount} times</span>
                      </div>
                      {alert.lastTriggered && (
                        <div className="stat-item">
                          <span className="stat-label">Last:</span>
                          <span className="stat-value">
                            {new Date(alert.lastTriggered).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="alert-actions">
                    <button
                      className="btn btn-danger btn-small"
                      onClick={() => handleDeleteAlert(alert.id)}
                      title="Delete Alert"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertSettings;