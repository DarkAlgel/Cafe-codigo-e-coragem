import React, { useState } from 'react';
import { Bell, Settings, MapPin, Clock, Smartphone, Mail, MessageSquare, Save, Plus, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import './AlertSettings.css';

const AlertSettings = () => {
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      name: 'Alerta de Qualidade do Ar Ruim',
      type: 'aqi',
      threshold: 100,
      location: 'Localização Atual',
      enabled: true,
      notifications: ['push', 'email']
    },
    {
      id: 2,
      name: 'Alerta de Ozônio Alto',
      type: 'pollutant',
      pollutant: 'O3',
      threshold: 120,
      location: 'São Paulo, SP',
      enabled: true,
      notifications: ['push']
    }
  ]);

  const [newAlert, setNewAlert] = useState({
    name: '',
    type: 'aqi',
    threshold: 50,
    pollutant: 'PM2.5',
    location: 'Localização Atual',
    enabled: true,
    notifications: ['push']
  });

  const [showAddForm, setShowAddForm] = useState(false);

  const pollutantOptions = [
    { value: 'PM2.5', label: 'PM2.5', unit: 'μg/m³' },
    { value: 'PM10', label: 'PM10', unit: 'μg/m³' },
    { value: 'O3', label: 'Ozônio (O3)', unit: 'μg/m³' },
    { value: 'NO2', label: 'Dióxido de Nitrogênio (NO2)', unit: 'μg/m³' },
    { value: 'SO2', label: 'Dióxido de Enxofre (SO2)', unit: 'μg/m³' },
    { value: 'CO', label: 'Monóxido de Carbono (CO)', unit: 'mg/m³' }
  ];

  const getAQIColor = (value) => {
    if (value <= 50) return '#4CAF50';
    if (value <= 100) return '#FFEB3B';
    if (value <= 150) return '#FF9800';
    if (value <= 200) return '#F44336';
    if (value <= 300) return '#9C27B0';
    return '#8D6E63';
  };

  const getAQILabel = (value) => {
    if (value <= 50) return 'Bom';
    if (value <= 100) return 'Moderado';
    if (value <= 150) return 'Insalubre para Grupos Sensíveis';
    if (value <= 200) return 'Insalubre';
    if (value <= 300) return 'Muito Insalubre';
    return 'Perigoso';
  };

  const handleToggleAlert = (id) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, enabled: !alert.enabled } : alert
    ));
  };

  const handleDeleteAlert = (id) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  const handleAddAlert = () => {
    if (newAlert.name.trim()) {
      const alert = {
        ...newAlert,
        id: Date.now(),
      };
      setAlerts([...alerts, alert]);
      setNewAlert({
        name: '',
        type: 'aqi',
        threshold: 50,
        pollutant: 'PM2.5',
        location: 'Localização Atual',
        enabled: true,
        notifications: ['push']
      });
      setShowAddForm(false);
    }
  };

  const handleNotificationToggle = (alertId, notificationType) => {
    setAlerts(alerts.map(alert => {
      if (alert.id === alertId) {
        const notifications = alert.notifications.includes(notificationType)
          ? alert.notifications.filter(n => n !== notificationType)
          : [...alert.notifications, notificationType];
        return { ...alert, notifications };
      }
      return alert;
    }));
  };

  const handleNewAlertNotificationToggle = (notificationType) => {
    const notifications = newAlert.notifications.includes(notificationType)
      ? newAlert.notifications.filter(n => n !== notificationType)
      : [...newAlert.notifications, notificationType];
    setNewAlert({ ...newAlert, notifications });
  };

  return (
    <div className="alert-settings">
      <div className="container">
        <div className="page-header">
          <h1><Bell className="header-icon" />Configurações de Alertas</h1>
          <p>Configure alertas personalizados para monitorar a qualidade do ar</p>
        </div>

        <div className="settings-grid">
          <div className="alerts-section">
            <div className="section-header">
              <h2>Seus Alertas</h2>
              <button 
                className="add-alert-btn"
                onClick={() => setShowAddForm(true)}
              >
                <Plus size={20} />
                Novo Alerta
              </button>
            </div>

            <div className="alerts-list">
              {alerts.map(alert => (
                <div key={alert.id} className={`alert-card ${!alert.enabled ? 'disabled' : ''}`}>
                  <div className="alert-header">
                    <div className="alert-info">
                      <h3>{alert.name}</h3>
                      <div className="alert-details">
                        <span className="alert-type">
                          {alert.type === 'aqi' ? 'Índice AQI' : `Poluente: ${alert.pollutant}`}
                        </span>
                        <span className="alert-threshold">
                          Limite: {alert.threshold}
                          {alert.type === 'aqi' ? '' : ` ${pollutantOptions.find(p => p.value === alert.pollutant)?.unit}`}
                        </span>
                        <span className="alert-location">
                          <MapPin size={14} />
                          {alert.location}
                        </span>
                      </div>
                    </div>
                    <div className="alert-actions">
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={alert.enabled}
                          onChange={() => handleToggleAlert(alert.id)}
                        />
                        <span className="slider"></span>
                      </label>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteAlert(alert.id)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {alert.type === 'aqi' && (
                    <div className="threshold-preview">
                      <div className="threshold-bar">
                        <div 
                          className="threshold-indicator"
                          style={{ 
                            left: `${Math.min(alert.threshold / 3, 100)}%`,
                            backgroundColor: getAQIColor(alert.threshold)
                          }}
                        />
                      </div>
                      <span className="threshold-label" style={{ color: getAQIColor(alert.threshold) }}>
                        {getAQILabel(alert.threshold)}
                      </span>
                    </div>
                  )}

                  <div className="notification-methods">
                    <span className="methods-label">Notificações:</span>
                    <div className="methods-list">
                      <button
                        className={`method-btn ${alert.notifications.includes('push') ? 'active' : ''}`}
                        onClick={() => handleNotificationToggle(alert.id, 'push')}
                      >
                        <Smartphone size={16} />
                        Push
                      </button>
                      <button
                        className={`method-btn ${alert.notifications.includes('email') ? 'active' : ''}`}
                        onClick={() => handleNotificationToggle(alert.id, 'email')}
                      >
                        <Mail size={16} />
                        Email
                      </button>
                      <button
                        className={`method-btn ${alert.notifications.includes('sms') ? 'active' : ''}`}
                        onClick={() => handleNotificationToggle(alert.id, 'sms')}
                      >
                        <MessageSquare size={16} />
                        SMS
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="settings-panel">
            <div className="panel-section">
              <h3><Settings size={20} />Configurações Gerais</h3>
              <div className="setting-item">
                <label>
                  <input type="checkbox" defaultChecked />
                  <span>Receber notificações push</span>
                </label>
              </div>
              <div className="setting-item">
                <label>
                  <input type="checkbox" defaultChecked />
                  <span>Receber emails diários</span>
                </label>
              </div>
              <div className="setting-item">
                <label>
                  <input type="checkbox" />
                  <span>Modo silencioso noturno (22h - 7h)</span>
                </label>
              </div>
            </div>

            <div className="panel-section">
              <h3><Clock size={20} />Frequência de Verificação</h3>
              <select className="frequency-select">
                <option value="5">A cada 5 minutos</option>
                <option value="15" defaultValue>A cada 15 minutos</option>
                <option value="30">A cada 30 minutos</option>
                <option value="60">A cada hora</option>
              </select>
            </div>

            <div className="panel-section">
              <h3><AlertTriangle size={20} />Status do Sistema</h3>
              <div className="status-item">
                <CheckCircle size={16} className="status-icon success" />
                <span>Serviço de alertas ativo</span>
              </div>
              <div className="status-item">
                <CheckCircle size={16} className="status-icon success" />
                <span>Conexão com sensores OK</span>
              </div>
              <div className="status-item">
                <CheckCircle size={16} className="status-icon success" />
                <span>Notificações habilitadas</span>
              </div>
            </div>
          </div>
        </div>

        {showAddForm && (
          <div className="modal-overlay">
            <div className="add-alert-modal">
              <div className="modal-header">
                <h3>Criar Novo Alerta</h3>
                <button 
                  className="close-btn"
                  onClick={() => setShowAddForm(false)}
                >
                  ×
                </button>
              </div>

              <div className="modal-content">
                <div className="form-group">
                  <label>Nome do Alerta</label>
                  <input
                    type="text"
                    value={newAlert.name}
                    onChange={(e) => setNewAlert({ ...newAlert, name: e.target.value })}
                    placeholder="Ex: Alerta de PM2.5 Alto"
                  />
                </div>

                <div className="form-group">
                  <label>Tipo de Alerta</label>
                  <select
                    value={newAlert.type}
                    onChange={(e) => setNewAlert({ ...newAlert, type: e.target.value })}
                  >
                    <option value="aqi">Índice de Qualidade do Ar (AQI)</option>
                    <option value="pollutant">Poluente Específico</option>
                  </select>
                </div>

                {newAlert.type === 'pollutant' && (
                  <div className="form-group">
                    <label>Poluente</label>
                    <select
                      value={newAlert.pollutant}
                      onChange={(e) => setNewAlert({ ...newAlert, pollutant: e.target.value })}
                    >
                      {pollutantOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label>
                    Limite de Alerta: {newAlert.threshold}
                    {newAlert.type === 'pollutant' 
                      ? ` ${pollutantOptions.find(p => p.value === newAlert.pollutant)?.unit}`
                      : ''
                    }
                  </label>
                  <input
                    type="range"
                    min={newAlert.type === 'aqi' ? 0 : 0}
                    max={newAlert.type === 'aqi' ? 300 : 500}
                    value={newAlert.threshold}
                    onChange={(e) => setNewAlert({ ...newAlert, threshold: parseInt(e.target.value) })}
                    className="threshold-slider"
                  />
                </div>

                <div className="form-group">
                  <label>Localização</label>
                  <select
                    value={newAlert.location}
                    onChange={(e) => setNewAlert({ ...newAlert, location: e.target.value })}
                  >
                    <option value="Localização Atual">Localização Atual</option>
                    <option value="São Paulo, SP">São Paulo, SP</option>
                    <option value="Rio de Janeiro, RJ">Rio de Janeiro, RJ</option>
                    <option value="Belo Horizonte, MG">Belo Horizonte, MG</option>
                    <option value="Brasília, DF">Brasília, DF</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Métodos de Notificação</label>
                  <div className="notification-options">
                    <button
                      type="button"
                      className={`method-btn ${newAlert.notifications.includes('push') ? 'active' : ''}`}
                      onClick={() => handleNewAlertNotificationToggle('push')}
                    >
                      <Smartphone size={16} />
                      Push
                    </button>
                    <button
                      type="button"
                      className={`method-btn ${newAlert.notifications.includes('email') ? 'active' : ''}`}
                      onClick={() => handleNewAlertNotificationToggle('email')}
                    >
                      <Mail size={16} />
                      Email
                    </button>
                    <button
                      type="button"
                      className={`method-btn ${newAlert.notifications.includes('sms') ? 'active' : ''}`}
                      onClick={() => handleNewAlertNotificationToggle('sms')}
                    >
                      <MessageSquare size={16} />
                      SMS
                    </button>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancelar
                </button>
                <button 
                  className="save-btn"
                  onClick={handleAddAlert}
                  disabled={!newAlert.name.trim()}
                >
                  <Save size={16} />
                  Criar Alerta
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertSettings;