import React, { useState, useEffect } from 'react';
import { 
  User, 
  Settings, 
  Bell, 
  Shield, 
  MapPin, 
  Palette, 
  Globe, 
  Download, 
  Upload,
  Camera,
  Edit3,
  Save,
  X,
  Check,
  Mail,
  Phone,
  Calendar,
  Heart,
  Activity,
  AlertTriangle,
  Moon,
  Sun,
  Smartphone,
  Monitor,
  Volume2,
  VolumeX,
  Database,
  Trash2,
  RefreshCw,
  Cloud,
  HardDrive,
  Wifi,
  WifiOff,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Key,
  CreditCard,
  Star,
  Award,
  Target,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import './UserProfile.css';

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  
  const [profileData, setProfileData] = useState({
    name: 'João Silva',
    email: 'joao.silva@email.com',
    phone: '+55 11 99999-9999',
    birthDate: '1990-05-15',
    location: 'São Paulo, SP',
    avatar: null,
    bio: 'Entusiasta da qualidade do ar e sustentabilidade ambiental.',
    occupation: 'Engenheiro Ambiental',
    company: 'EcoTech Solutions',
    website: 'https://joaosilva.dev',
    timezone: 'America/Sao_Paulo'
  });

  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'pt-BR',
    units: 'metric',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    currency: 'BRL',
    notifications: {
      push: true,
      email: true,
      sms: false,
      sound: true,
      desktop: true,
      frequency: 'immediate'
    },
    privacy: {
      shareLocation: true,
      shareData: false,
      publicProfile: false,
      analyticsOptIn: true,
      marketingEmails: false
    },
    display: {
      showWeather: true,
      showRecommendations: true,
      compactView: false,
      autoRefresh: true,
      refreshInterval: 300,
      showAnimations: true,
      highContrast: false
    },
    accessibility: {
      screenReader: false,
      largeText: false,
      reducedMotion: false,
      keyboardNavigation: true
    }
  });

  const [healthProfile, setHealthProfile] = useState({
    conditions: ['asthma'],
    medications: ['Broncodilatador'],
    allergies: ['Pólen', 'Poeira'],
    activityLevel: 'moderate',
    sensitivityLevel: 'high',
    age: 33,
    smokingStatus: 'never',
    exerciseFrequency: 'regular',
    outdoorActivities: ['caminhada', 'ciclismo']
  });

  const [dataManagement, setDataManagement] = useState({
    storageUsed: 45.2,
    storageLimit: 100,
    lastBackup: '2024-01-15T10:30:00Z',
    autoBackup: true,
    dataRetention: 365,
    exportFormat: 'json'
  });

  const [accountStats, setAccountStats] = useState({
    memberSince: '2023-06-15',
    totalAlerts: 127,
    dataPointsCollected: 15420,
    locationsTracked: 8,
    averageAQI: 68,
    bestAQIDay: { date: '2024-01-10', aqi: 25 },
    worstAQIDay: { date: '2023-12-05', aqi: 156 }
  });

  const handleProfileSave = () => {
    setIsEditing(false);
    // Aqui seria feita a chamada para a API para salvar os dados
    console.log('Perfil salvo:', profileData);
  };

  const handlePreferenceChange = (category, key, value) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleHealthProfileChange = (key, value) => {
    setHealthProfile(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const exportData = () => {
    const data = {
      profile: profileData,
      preferences,
      healthProfile,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'meu-perfil-qualidade-ar.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'preferences', label: 'Preferências', icon: Settings },
    { id: 'health', label: 'Saúde', icon: Heart },
    { id: 'privacy', label: 'Privacidade', icon: Shield },
    { id: 'data', label: 'Dados', icon: Download },
    { id: 'stats', label: 'Estatísticas', icon: BarChart3 }
  ];

  return (
    <div className="user-profile">
      <div className="profile-header">
        <h1>Meu Perfil</h1>
        <p>Gerencie suas configurações e preferências</p>
      </div>

      <div className="profile-container">
        <div className="profile-sidebar">
          <nav className="profile-nav">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={20} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="profile-content">
          {activeTab === 'profile' && (
            <div className="profile-section">
              <div className="section-header">
                <h2>Informações Pessoais</h2>
                <button
                  className={`edit-btn ${isEditing ? 'save' : ''}`}
                  onClick={isEditing ? handleProfileSave : () => setIsEditing(true)}
                >
                  {isEditing ? <Save size={16} /> : <Edit3 size={16} />}
                  {isEditing ? 'Salvar' : 'Editar'}
                </button>
              </div>

              <div className="profile-avatar">
                <div className="avatar-container">
                  {profileData.avatar ? (
                    <img src={profileData.avatar} alt="Avatar" />
                  ) : (
                    <div className="avatar-placeholder">
                      <User size={40} />
                    </div>
                  )}
                  {isEditing && (
                    <button className="avatar-edit">
                      <Camera size={16} />
                    </button>
                  )}
                </div>
              </div>

              <div className="profile-form">
                <div className="form-group">
                  <label>Nome Completo</label>
                  <input
                    type="text"
                    value={profileData.name}
                    disabled={!isEditing}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <div className="input-with-icon">
                    <Mail size={16} />
                    <input
                      type="email"
                      value={profileData.email}
                      disabled={!isEditing}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Telefone</label>
                  <div className="input-with-icon">
                    <Phone size={16} />
                    <input
                      type="tel"
                      value={profileData.phone}
                      disabled={!isEditing}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Data de Nascimento</label>
                  <div className="input-with-icon">
                    <Calendar size={16} />
                    <input
                      type="date"
                      value={profileData.birthDate}
                      disabled={!isEditing}
                      onChange={(e) => setProfileData(prev => ({ ...prev, birthDate: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Localização</label>
                  <div className="input-with-icon">
                    <MapPin size={16} />
                    <input
                      type="text"
                      value={profileData.location}
                      disabled={!isEditing}
                      onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Bio</label>
                  <textarea
                    value={profileData.bio}
                    disabled={!isEditing}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label>Profissão</label>
                  <input
                    type="text"
                    value={profileData.occupation}
                    disabled={!isEditing}
                    onChange={(e) => setProfileData(prev => ({ ...prev, occupation: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label>Empresa</label>
                  <input
                    type="text"
                    value={profileData.company}
                    disabled={!isEditing}
                    onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label>Website</label>
                  <input
                    type="url"
                    value={profileData.website}
                    disabled={!isEditing}
                    onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label>Fuso Horário</label>
                  <select
                    value={profileData.timezone}
                    disabled={!isEditing}
                    onChange={(e) => setProfileData(prev => ({ ...prev, timezone: e.target.value }))}
                  >
                    <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
                    <option value="America/New_York">New York (GMT-5)</option>
                    <option value="Europe/London">London (GMT+0)</option>
                    <option value="Asia/Tokyo">Tokyo (GMT+9)</option>
                  </select>
                </div>
              </div>

              <div className="preference-group">
                <h3><Eye size={20} /> Acessibilidade</h3>
                <div className="preference-item">
                  <label>Suporte a Leitor de Tela</label>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={preferences.accessibility.screenReader}
                      onChange={(e) => handlePreferenceChange('accessibility', 'screenReader', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </div>
                </div>
                <div className="preference-item">
                  <label>Texto Grande</label>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={preferences.accessibility.largeText}
                      onChange={(e) => handlePreferenceChange('accessibility', 'largeText', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </div>
                </div>
                <div className="preference-item">
                  <label>Movimento Reduzido</label>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={preferences.accessibility.reducedMotion}
                      onChange={(e) => handlePreferenceChange('accessibility', 'reducedMotion', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </div>
                </div>
                <div className="preference-item">
                  <label>Navegação por Teclado</label>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={preferences.accessibility.keyboardNavigation}
                      onChange={(e) => handlePreferenceChange('accessibility', 'keyboardNavigation', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="preferences-section">
              <h2>Preferências do Sistema</h2>

              <div className="preference-group">
                <h3><Palette size={20} /> Aparência</h3>
                <div className="preference-item">
                  <label>Tema</label>
                  <div className="theme-selector">
                    <button
                      className={`theme-option ${preferences.theme === 'light' ? 'active' : ''}`}
                      onClick={() => handlePreferenceChange('theme', 'theme', 'light')}
                    >
                      <Sun size={16} />
                      Claro
                    </button>
                    <button
                      className={`theme-option ${preferences.theme === 'dark' ? 'active' : ''}`}
                      onClick={() => handlePreferenceChange('theme', 'theme', 'dark')}
                    >
                      <Moon size={16} />
                      Escuro
                    </button>
                    <button
                      className={`theme-option ${preferences.theme === 'auto' ? 'active' : ''}`}
                      onClick={() => handlePreferenceChange('theme', 'theme', 'auto')}
                    >
                      <Monitor size={16} />
                      Auto
                    </button>
                  </div>
                </div>
              </div>

              <div className="preference-group">
                <h3><Globe size={20} /> Idioma e Região</h3>
                <div className="preference-item">
                  <label>Idioma</label>
                  <select
                    value={preferences.language}
                    onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
                  >
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en-US">English (US)</option>
                    <option value="es-ES">Español</option>
                  </select>
                </div>
                <div className="preference-item">
                  <label>Unidades</label>
                  <select
                    value={preferences.units}
                    onChange={(e) => setPreferences(prev => ({ ...prev, units: e.target.value }))}
                  >
                    <option value="metric">Métrico (°C, km/h)</option>
                    <option value="imperial">Imperial (°F, mph)</option>
                  </select>
                </div>
              </div>

              <div className="preference-group">
                <h3><Bell size={20} /> Notificações</h3>
                <div className="preference-item">
                  <label>Notificações Push</label>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={preferences.notifications.push}
                      onChange={(e) => handlePreferenceChange('notifications', 'push', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </div>
                </div>
                <div className="preference-item">
                  <label>Notificações por Email</label>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={preferences.notifications.email}
                      onChange={(e) => handlePreferenceChange('notifications', 'email', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </div>
                </div>
                <div className="preference-item">
                  <label>SMS</label>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={preferences.notifications.sms}
                      onChange={(e) => handlePreferenceChange('notifications', 'sms', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </div>
                </div>
                <div className="preference-item">
                  <label>Som das Notificações</label>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={preferences.notifications.sound}
                      onChange={(e) => handlePreferenceChange('notifications', 'sound', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </div>
                </div>
                <div className="preference-item">
                  <label>Notificações Desktop</label>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={preferences.notifications.desktop}
                      onChange={(e) => handlePreferenceChange('notifications', 'desktop', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </div>
                </div>
                <div className="preference-item">
                  <label>Frequência das Notificações</label>
                  <select
                    value={preferences.notifications.frequency}
                    onChange={(e) => handlePreferenceChange('notifications', 'frequency', e.target.value)}
                  >
                    <option value="immediate">Imediata</option>
                    <option value="hourly">A cada hora</option>
                    <option value="daily">Diária</option>
                    <option value="weekly">Semanal</option>
                  </select>
                </div>
              </div>

              <div className="preference-group">
                <h3><Activity size={20} /> Exibição</h3>
                <div className="preference-item">
                  <label>Mostrar Informações Meteorológicas</label>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={preferences.display.showWeather}
                      onChange={(e) => handlePreferenceChange('display', 'showWeather', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </div>
                </div>
                <div className="preference-item">
                  <label>Mostrar Recomendações</label>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={preferences.display.showRecommendations}
                      onChange={(e) => handlePreferenceChange('display', 'showRecommendations', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </div>
                </div>
                <div className="preference-item">
                  <label>Visualização Compacta</label>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={preferences.display.compactView}
                      onChange={(e) => handlePreferenceChange('display', 'compactView', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </div>
                </div>
                <div className="preference-item">
                  <label>Atualização Automática</label>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={preferences.display.autoRefresh}
                      onChange={(e) => handlePreferenceChange('display', 'autoRefresh', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </div>
                </div>
                <div className="preference-item">
                  <label>Intervalo de Atualização (segundos)</label>
                  <select
                    value={preferences.display.refreshInterval}
                    onChange={(e) => handlePreferenceChange('display', 'refreshInterval', parseInt(e.target.value))}
                  >
                    <option value={60}>1 minuto</option>
                    <option value={300}>5 minutos</option>
                    <option value={600}>10 minutos</option>
                    <option value={1800}>30 minutos</option>
                  </select>
                </div>
                <div className="preference-item">
                  <label>Mostrar Animações</label>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={preferences.display.showAnimations}
                      onChange={(e) => handlePreferenceChange('display', 'showAnimations', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </div>
                </div>
                <div className="preference-item">
                  <label>Alto Contraste</label>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={preferences.display.highContrast}
                      onChange={(e) => handlePreferenceChange('display', 'highContrast', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'health' && (
            <div className="health-section">
              <h2>Perfil de Saúde</h2>
              <p className="health-disclaimer">
                <AlertTriangle size={16} />
                Essas informações ajudam a personalizar as recomendações. Consulte sempre um médico.
              </p>

              <div className="health-group">
                <h3>Condições de Saúde</h3>
                <div className="health-conditions">
                  {['asthma', 'copd', 'heart_disease', 'diabetes', 'allergies'].map(condition => (
                    <label key={condition} className="condition-checkbox">
                      <input
                        type="checkbox"
                        checked={healthProfile.conditions.includes(condition)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleHealthProfileChange('conditions', [...healthProfile.conditions, condition]);
                          } else {
                            handleHealthProfileChange('conditions', healthProfile.conditions.filter(c => c !== condition));
                          }
                        }}
                      />
                      <span>{condition === 'asthma' ? 'Asma' : 
                             condition === 'copd' ? 'DPOC' :
                             condition === 'heart_disease' ? 'Doença Cardíaca' :
                             condition === 'diabetes' ? 'Diabetes' : 'Alergias'}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="health-group">
                <h3>Medicamentos</h3>
                <textarea
                  value={healthProfile.medications.join(', ')}
                  onChange={(e) => handleHealthProfileChange('medications', e.target.value.split(', '))}
                  placeholder="Liste seus medicamentos separados por vírgula"
                  rows={3}
                />
              </div>

              <div className="health-group">
                <h3>Alergias</h3>
                <textarea
                  value={healthProfile.allergies.join(', ')}
                  onChange={(e) => handleHealthProfileChange('allergies', e.target.value.split(', '))}
                  placeholder="Liste suas alergias separadas por vírgula"
                  rows={2}
                />
              </div>

              <div className="health-group">
                <h3>Nível de Atividade</h3>
                <select
                  value={healthProfile.activityLevel}
                  onChange={(e) => handleHealthProfileChange('activityLevel', e.target.value)}
                >
                  <option value="low">Baixo - Sedentário</option>
                  <option value="moderate">Moderado - Exercícios ocasionais</option>
                  <option value="high">Alto - Exercícios regulares</option>
                  <option value="athlete">Atleta - Treinamento intenso</option>
                </select>
              </div>

              <div className="health-group">
                <h3>Sensibilidade à Poluição</h3>
                <select
                  value={healthProfile.sensitivityLevel}
                  onChange={(e) => handleHealthProfileChange('sensitivityLevel', e.target.value)}
                >
                  <option value="low">Baixa</option>
                  <option value="moderate">Moderada</option>
                  <option value="high">Alta</option>
                  <option value="very_high">Muito Alta</option>
                </select>
              </div>

              <div className="health-group">
                <h3>Idade</h3>
                <input
                  type="number"
                  value={healthProfile.age}
                  onChange={(e) => handleHealthProfileChange('age', parseInt(e.target.value))}
                  min="1"
                  max="120"
                />
              </div>

              <div className="health-group">
                <h3>Status de Fumante</h3>
                <select
                  value={healthProfile.smokingStatus}
                  onChange={(e) => handleHealthProfileChange('smokingStatus', e.target.value)}
                >
                  <option value="never">Nunca fumou</option>
                  <option value="former">Ex-fumante</option>
                  <option value="current">Fumante atual</option>
                  <option value="occasional">Fumante ocasional</option>
                </select>
              </div>

              <div className="health-group">
                <h3>Frequência de Exercícios</h3>
                <select
                  value={healthProfile.exerciseFrequency}
                  onChange={(e) => handleHealthProfileChange('exerciseFrequency', e.target.value)}
                >
                  <option value="never">Nunca</option>
                  <option value="rarely">Raramente</option>
                  <option value="regular">Regular</option>
                  <option value="daily">Diário</option>
                </select>
              </div>

              <div className="health-group">
                <h3>Atividades ao Ar Livre</h3>
                <textarea
                  value={healthProfile.outdoorActivities.join(', ')}
                  onChange={(e) => handleHealthProfileChange('outdoorActivities', e.target.value.split(', '))}
                  placeholder="Liste suas atividades separadas por vírgula"
                  rows={2}
                />
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="privacy-section">
              <h2>Configurações de Privacidade</h2>

              <div className="privacy-group">
                <h3>Compartilhamento de Dados</h3>
                <div className="privacy-item">
                  <div className="privacy-info">
                    <label>Compartilhar Localização</label>
                    <p>Permite que o app acesse sua localização para dados precisos</p>
                  </div>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={preferences.privacy.shareLocation}
                      onChange={(e) => handlePreferenceChange('privacy', 'shareLocation', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </div>
                </div>
                <div className="privacy-item">
                  <div className="privacy-info">
                    <label>Compartilhar Dados Anônimos</label>
                    <p>Ajuda a melhorar o serviço compartilhando dados anônimos</p>
                  </div>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={preferences.privacy.shareData}
                      onChange={(e) => handlePreferenceChange('privacy', 'shareData', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </div>
                </div>
                <div className="privacy-item">
                  <div className="privacy-info">
                    <label>Perfil Público</label>
                    <p>Torna seu perfil visível para outros usuários</p>
                  </div>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={preferences.privacy.publicProfile}
                      onChange={(e) => handlePreferenceChange('privacy', 'publicProfile', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </div>
                </div>
                <div className="privacy-item">
                  <div className="privacy-info">
                    <label>Participar de Analytics</label>
                    <p>Permite coleta de dados de uso para melhorar o serviço</p>
                  </div>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={preferences.privacy.analyticsOptIn}
                      onChange={(e) => handlePreferenceChange('privacy', 'analyticsOptIn', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </div>
                </div>
                <div className="privacy-item">
                  <div className="privacy-info">
                    <label>Emails de Marketing</label>
                    <p>Receber emails promocionais e novidades</p>
                  </div>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={preferences.privacy.marketingEmails}
                      onChange={(e) => handlePreferenceChange('privacy', 'marketingEmails', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </div>
                </div>
              </div>

              <div className="privacy-actions">
                <button className="privacy-btn secondary">
                  Ver Política de Privacidade
                </button>
                <button className="privacy-btn secondary">
                  Gerenciar Cookies
                </button>
                <button className="privacy-btn danger">
                  Excluir Conta
                </button>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="data-section">
              <h2>Gerenciamento de Dados</h2>

              <div className="data-group">
                <h3>Exportar Dados</h3>
                <p>Baixe uma cópia de todos os seus dados</p>
                <button className="data-btn primary" onClick={exportData}>
                  <Download size={16} />
                  Exportar Dados
                </button>
              </div>

              <div className="data-group">
                <h3>Importar Configurações</h3>
                <p>Restaure suas configurações de um backup</p>
                <button className="data-btn secondary">
                  <Upload size={16} />
                  Importar Configurações
                </button>
              </div>

              <div className="data-group">
                <h3>Backup Automático</h3>
                <div className="backup-info">
                  <p>Último backup: {new Date(dataManagement.lastBackup).toLocaleDateString('pt-BR')}</p>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={dataManagement.autoBackup}
                      onChange={(e) => setDataManagement(prev => ({ ...prev, autoBackup: e.target.checked }))}
                    />
                    <span className="slider"></span>
                  </div>
                </div>
                <button className="data-btn secondary">
                  <Cloud size={16} />
                  Fazer Backup Agora
                </button>
              </div>

              <div className="data-group">
                <h3>Armazenamento</h3>
                <div className="storage-info">
                  <div className="storage-bar">
                    <div 
                      className="storage-used" 
                      style={{ width: `${(dataManagement.storageUsed / dataManagement.storageLimit) * 100}%` }}
                    ></div>
                  </div>
                  <p>{dataManagement.storageUsed}MB de {dataManagement.storageLimit}MB utilizados</p>
                </div>
              </div>

              <div className="data-group">
                <h3>Retenção de Dados</h3>
                <select
                  value={dataManagement.dataRetention}
                  onChange={(e) => setDataManagement(prev => ({ ...prev, dataRetention: parseInt(e.target.value) }))}
                >
                  <option value={30}>30 dias</option>
                  <option value={90}>90 dias</option>
                  <option value={365}>1 ano</option>
                  <option value={-1}>Indefinido</option>
                </select>
              </div>

              <div className="data-group">
                <h3>Limpar Cache</h3>
                <p>Remove dados temporários para liberar espaço</p>
                <button className="data-btn secondary">
                  <RefreshCw size={16} />
                  Limpar Cache
                </button>
              </div>

              <div className="data-group danger">
                <h3>Zona de Perigo</h3>
                <p>Ações irreversíveis que afetam seus dados</p>
                <button className="data-btn danger">
                  <RefreshCw size={16} />
                  Resetar Todas as Configurações
                </button>
                <button className="data-btn danger">
                  <Trash2 size={16} />
                  Excluir Todos os Dados
                </button>
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="stats-section">
              <h2>Estatísticas da Conta</h2>

              <div className="stats-overview">
                <div className="stat-card">
                  <div className="stat-icon">
                    <Calendar size={24} />
                  </div>
                  <div className="stat-info">
                    <h3>Membro desde</h3>
                    <p>{new Date(accountStats.memberSince).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <Bell size={24} />
                  </div>
                  <div className="stat-info">
                    <h3>Total de Alertas</h3>
                    <p>{accountStats.totalAlerts.toLocaleString('pt-BR')}</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <Database size={24} />
                  </div>
                  <div className="stat-info">
                    <h3>Dados Coletados</h3>
                    <p>{accountStats.dataPointsCollected.toLocaleString('pt-BR')}</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <MapPin size={24} />
                  </div>
                  <div className="stat-info">
                    <h3>Locais Monitorados</h3>
                    <p>{accountStats.locationsTracked}</p>
                  </div>
                </div>
              </div>

              <div className="stats-details">
                <div className="stats-group">
                  <h3>Qualidade do Ar</h3>
                  <div className="aqi-stats">
                    <div className="aqi-average">
                      <h4>IQA Médio</h4>
                      <div className={`aqi-value ${accountStats.averageAQI <= 50 ? 'good' : accountStats.averageAQI <= 100 ? 'moderate' : 'unhealthy'}`}>
                        {accountStats.averageAQI}
                      </div>
                    </div>
                    <div className="aqi-extremes">
                      <div className="aqi-best">
                        <h5>Melhor Dia</h5>
                        <p>{new Date(accountStats.bestAQIDay.date).toLocaleDateString('pt-BR')}</p>
                        <span className="aqi-value good">{accountStats.bestAQIDay.aqi}</span>
                      </div>
                      <div className="aqi-worst">
                        <h5>Pior Dia</h5>
                        <p>{new Date(accountStats.worstAQIDay.date).toLocaleDateString('pt-BR')}</p>
                        <span className="aqi-value unhealthy">{accountStats.worstAQIDay.aqi}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="stats-group">
                  <h3>Conquistas</h3>
                  <div className="achievements">
                    <div className="achievement">
                      <Award size={20} />
                      <span>Monitor Dedicado</span>
                      <p>30 dias consecutivos de monitoramento</p>
                    </div>
                    <div className="achievement">
                      <Target size={20} />
                      <span>Explorador Urbano</span>
                      <p>Monitorou 5+ localizações diferentes</p>
                    </div>
                    <div className="achievement">
                      <TrendingUp size={20} />
                      <span>Analista de Dados</span>
                      <p>Coletou 10.000+ pontos de dados</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;