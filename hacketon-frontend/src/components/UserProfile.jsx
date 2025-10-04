import React, { useState } from 'react';
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
  VolumeX
} from 'lucide-react';
import './UserProfile.css';

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'João Silva',
    email: 'joao.silva@email.com',
    phone: '+55 11 99999-9999',
    birthDate: '1990-05-15',
    location: 'São Paulo, SP',
    avatar: null,
    bio: 'Entusiasta da qualidade do ar e sustentabilidade ambiental.'
  });

  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'pt-BR',
    units: 'metric',
    notifications: {
      push: true,
      email: true,
      sms: false,
      sound: true
    },
    privacy: {
      shareLocation: true,
      shareData: false,
      publicProfile: false
    },
    display: {
      showWeather: true,
      showRecommendations: true,
      compactView: false,
      autoRefresh: true
    }
  });

  const [healthProfile, setHealthProfile] = useState({
    conditions: ['asthma'],
    medications: ['Broncodilatador'],
    allergies: ['Pólen', 'Poeira'],
    activityLevel: 'moderate',
    sensitivityLevel: 'high'
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
    { id: 'data', label: 'Dados', icon: Download }
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
                <h3>Limpar Cache</h3>
                <p>Remove dados temporários para liberar espaço</p>
                <button className="data-btn secondary">
                  Limpar Cache
                </button>
              </div>

              <div className="data-group danger">
                <h3>Zona de Perigo</h3>
                <p>Ações irreversíveis que afetam seus dados</p>
                <button className="data-btn danger">
                  Resetar Todas as Configurações
                </button>
                <button className="data-btn danger">
                  Excluir Todos os Dados
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;