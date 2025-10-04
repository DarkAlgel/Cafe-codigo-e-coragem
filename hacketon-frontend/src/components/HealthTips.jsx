import React, { useState } from 'react';
import { Heart, Shield, Activity, Zap, Users, Baby, User, UserCheck, AlertTriangle, CheckCircle, Info, Wind, Sun, Droplets, Thermometer } from 'lucide-react';
import './HealthTips.css';

const HealthTips = () => {
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [currentAQI] = useState(85); // Simulando AQI atual

  const getAQIStatus = (aqi) => {
    if (aqi <= 50) return { label: 'Bom', color: '#4CAF50', level: 'good' };
    if (aqi <= 100) return { label: 'Moderado', color: '#FFEB3B', level: 'moderate' };
    if (aqi <= 150) return { label: 'Insalubre para Grupos Sensíveis', color: '#FF9800', level: 'sensitive' };
    if (aqi <= 200) return { label: 'Insalubre', color: '#F44336', level: 'unhealthy' };
    if (aqi <= 300) return { label: 'Muito Insalubre', color: '#9C27B0', level: 'very_unhealthy' };
    return { label: 'Perigoso', color: '#8D6E63', level: 'hazardous' };
  };

  const aqiStatus = getAQIStatus(currentAQI);

  const categories = [
    { id: 'general', name: 'Geral', icon: Heart },
    { id: 'children', name: 'Crianças', icon: Baby },
    { id: 'elderly', name: 'Idosos', icon: User },
    { id: 'athletes', name: 'Atletas', icon: Activity },
    { id: 'respiratory', name: 'Problemas Respiratórios', icon: Wind },
    { id: 'cardiovascular', name: 'Problemas Cardíacos', icon: Heart }
  ];

  const healthTips = {
    general: [
      {
        id: 1,
        title: 'Mantenha-se Hidratado',
        description: 'Beba bastante água para ajudar seu corpo a eliminar toxinas e manter as vias respiratórias úmidas.',
        priority: 'high',
        icon: Droplets,
        applicable: ['moderate', 'sensitive', 'unhealthy', 'very_unhealthy', 'hazardous']
      },
      {
        id: 2,
        title: 'Use Máscaras de Proteção',
        description: 'Utilize máscaras N95 ou PFF2 ao sair de casa em dias de alta poluição.',
        priority: 'high',
        icon: Shield,
        applicable: ['sensitive', 'unhealthy', 'very_unhealthy', 'hazardous']
      },
      {
        id: 3,
        title: 'Evite Atividades ao Ar Livre',
        description: 'Reduza exercícios e atividades externas durante picos de poluição.',
        priority: 'medium',
        icon: Activity,
        applicable: ['sensitive', 'unhealthy', 'very_unhealthy', 'hazardous']
      },
      {
        id: 4,
        title: 'Mantenha Janelas Fechadas',
        description: 'Feche janelas e use purificadores de ar para manter o ambiente interno limpo.',
        priority: 'medium',
        icon: Wind,
        applicable: ['moderate', 'sensitive', 'unhealthy', 'very_unhealthy', 'hazardous']
      },
      {
        id: 5,
        title: 'Consuma Alimentos Antioxidantes',
        description: 'Inclua frutas e vegetais ricos em vitaminas C e E para fortalecer o sistema imunológico.',
        priority: 'low',
        icon: Heart,
        applicable: ['good', 'moderate', 'sensitive', 'unhealthy', 'very_unhealthy', 'hazardous']
      }
    ],
    children: [
      {
        id: 6,
        title: 'Limite Brincadeiras ao Ar Livre',
        description: 'Crianças são mais sensíveis à poluição. Prefira atividades internas em dias de má qualidade do ar.',
        priority: 'high',
        icon: Baby,
        applicable: ['moderate', 'sensitive', 'unhealthy', 'very_unhealthy', 'hazardous']
      },
      {
        id: 7,
        title: 'Observe Sintomas Respiratórios',
        description: 'Fique atento a tosse, chiado no peito ou dificuldade para respirar.',
        priority: 'high',
        icon: AlertTriangle,
        applicable: ['sensitive', 'unhealthy', 'very_unhealthy', 'hazardous']
      },
      {
        id: 8,
        title: 'Mantenha Medicamentos à Mão',
        description: 'Se a criança tem asma, certifique-se de que os medicamentos estejam sempre disponíveis.',
        priority: 'high',
        icon: Shield,
        applicable: ['moderate', 'sensitive', 'unhealthy', 'very_unhealthy', 'hazardous']
      }
    ],
    elderly: [
      {
        id: 9,
        title: 'Evite Sair nos Horários de Pico',
        description: 'Idosos devem evitar sair entre 6h-10h e 17h-20h quando a poluição é maior.',
        priority: 'high',
        icon: User,
        applicable: ['moderate', 'sensitive', 'unhealthy', 'very_unhealthy', 'hazardous']
      },
      {
        id: 10,
        title: 'Monitore Condições Crônicas',
        description: 'Acompanhe de perto diabetes, hipertensão e outras condições que podem ser agravadas.',
        priority: 'high',
        icon: Heart,
        applicable: ['sensitive', 'unhealthy', 'very_unhealthy', 'hazardous']
      },
      {
        id: 11,
        title: 'Mantenha Consultas Médicas em Dia',
        description: 'Consulte regularmente seu médico para ajustar medicamentos se necessário.',
        priority: 'medium',
        icon: UserCheck,
        applicable: ['moderate', 'sensitive', 'unhealthy', 'very_unhealthy', 'hazardous']
      }
    ],
    athletes: [
      {
        id: 12,
        title: 'Ajuste Intensidade dos Treinos',
        description: 'Reduza a intensidade dos exercícios em 50% quando o AQI estiver acima de 100.',
        priority: 'high',
        icon: Activity,
        applicable: ['moderate', 'sensitive', 'unhealthy', 'very_unhealthy', 'hazardous']
      },
      {
        id: 13,
        title: 'Prefira Exercícios Internos',
        description: 'Mude para academia ou atividades indoor durante picos de poluição.',
        priority: 'high',
        icon: Shield,
        applicable: ['sensitive', 'unhealthy', 'very_unhealthy', 'hazardous']
      },
      {
        id: 14,
        title: 'Hidrate-se Mais que o Normal',
        description: 'Aumente a ingestão de água antes, durante e após os exercícios.',
        priority: 'medium',
        icon: Droplets,
        applicable: ['moderate', 'sensitive', 'unhealthy', 'very_unhealthy', 'hazardous']
      }
    ],
    respiratory: [
      {
        id: 15,
        title: 'Use Medicação Preventiva',
        description: 'Tome medicamentos prescritos mesmo sem sintomas em dias de alta poluição.',
        priority: 'high',
        icon: Shield,
        applicable: ['moderate', 'sensitive', 'unhealthy', 'very_unhealthy', 'hazardous']
      },
      {
        id: 16,
        title: 'Evite Irritantes Adicionais',
        description: 'Não fume e evite produtos de limpeza com odores fortes.',
        priority: 'high',
        icon: Wind,
        applicable: ['good', 'moderate', 'sensitive', 'unhealthy', 'very_unhealthy', 'hazardous']
      },
      {
        id: 17,
        title: 'Pratique Respiração Profunda',
        description: 'Faça exercícios de respiração para fortalecer os pulmões.',
        priority: 'low',
        icon: Activity,
        applicable: ['good', 'moderate']
      }
    ],
    cardiovascular: [
      {
        id: 18,
        title: 'Monitore Pressão Arterial',
        description: 'A poluição pode afetar a pressão. Monitore mais frequentemente.',
        priority: 'high',
        icon: Heart,
        applicable: ['moderate', 'sensitive', 'unhealthy', 'very_unhealthy', 'hazardous']
      },
      {
        id: 19,
        title: 'Evite Esforços Físicos Intensos',
        description: 'Reduza atividades que aumentem muito a frequência cardíaca.',
        priority: 'high',
        icon: Activity,
        applicable: ['sensitive', 'unhealthy', 'very_unhealthy', 'hazardous']
      },
      {
        id: 20,
        title: 'Mantenha Medicamentos Cardíacos',
        description: 'Tenha sempre à mão medicamentos para emergências cardíacas.',
        priority: 'high',
        icon: Shield,
        applicable: ['moderate', 'sensitive', 'unhealthy', 'very_unhealthy', 'hazardous']
      }
    ]
  };

  const weatherTips = [
    {
      condition: 'high_humidity',
      title: 'Alta Umidade',
      description: 'Use desumidificador e evite atividades externas prolongadas.',
      icon: Droplets
    },
    {
      condition: 'high_temperature',
      title: 'Temperatura Elevada',
      description: 'Mantenha-se hidratado e procure ambientes climatizados.',
      icon: Thermometer
    },
    {
      condition: 'low_wind',
      title: 'Pouco Vento',
      description: 'Poluentes tendem a se acumular. Evite áreas de tráfego intenso.',
      icon: Wind
    },
    {
      condition: 'sunny',
      title: 'Dia Ensolarado',
      description: 'Ozônio pode aumentar. Evite exercícios ao ar livre no meio do dia.',
      icon: Sun
    }
  ];

  const getCurrentTips = () => {
    const tips = healthTips[selectedCategory] || [];
    return tips.filter(tip => tip.applicable.includes(aqiStatus.level));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#F44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#666';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'high': return 'Alta Prioridade';
      case 'medium': return 'Prioridade Média';
      case 'low': return 'Baixa Prioridade';
      default: return '';
    }
  };

  return (
    <div className="health-tips">
      <div className="container">
        <div className="page-header">
          <h1><Heart className="header-icon" />Conselhos de Saúde</h1>
          <p>Dicas personalizadas baseadas na qualidade do ar atual</p>
        </div>

        <div className="current-status">
          <div className="status-card">
            <div className="status-info">
              <h3>Qualidade do Ar Atual</h3>
              <div className="aqi-display">
                <span className="aqi-value" style={{ color: aqiStatus.color }}>
                  {currentAQI}
                </span>
                <span className="aqi-label" style={{ color: aqiStatus.color }}>
                  {aqiStatus.label}
                </span>
              </div>
            </div>
            <div className="status-icon">
              {aqiStatus.level === 'good' ? (
                <CheckCircle size={48} style={{ color: aqiStatus.color }} />
              ) : (
                <AlertTriangle size={48} style={{ color: aqiStatus.color }} />
              )}
            </div>
          </div>
        </div>

        <div className="content-grid">
          <div className="categories-section">
            <h2>Categorias</h2>
            <div className="categories-list">
              {categories.map(category => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.id}
                    className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <IconComponent size={20} />
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="tips-section">
            <h2>Recomendações para {categories.find(c => c.id === selectedCategory)?.name}</h2>
            <div className="tips-list">
              {getCurrentTips().map(tip => {
                const IconComponent = tip.icon;
                return (
                  <div key={tip.id} className="tip-card">
                    <div className="tip-header">
                      <div className="tip-icon">
                        <IconComponent size={24} />
                      </div>
                      <div className="tip-title">
                        <h3>{tip.title}</h3>
                        <span 
                          className="priority-badge"
                          style={{ 
                            backgroundColor: getPriorityColor(tip.priority),
                            color: 'white'
                          }}
                        >
                          {getPriorityLabel(tip.priority)}
                        </span>
                      </div>
                    </div>
                    <p className="tip-description">{tip.description}</p>
                  </div>
                );
              })}
            </div>

            {getCurrentTips().length === 0 && (
              <div className="no-tips">
                <Info size={48} />
                <h3>Nenhuma recomendação específica</h3>
                <p>Com a qualidade do ar atual, não há recomendações especiais para esta categoria.</p>
              </div>
            )}
          </div>

          <div className="weather-section">
            <h2>Condições Climáticas</h2>
            <div className="weather-tips">
              {weatherTips.map((tip, index) => {
                const IconComponent = tip.icon;
                return (
                  <div key={index} className="weather-tip">
                    <div className="weather-icon">
                      <IconComponent size={20} />
                    </div>
                    <div className="weather-content">
                      <h4>{tip.title}</h4>
                      <p>{tip.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="emergency-info">
              <h3><AlertTriangle size={20} />Em Caso de Emergência</h3>
              <div className="emergency-tips">
                <div className="emergency-tip">
                  <strong>Sintomas Respiratórios Graves:</strong>
                  <p>Procure atendimento médico imediatamente se sentir dificuldade extrema para respirar.</p>
                </div>
                <div className="emergency-tip">
                  <strong>Dor no Peito:</strong>
                  <p>Pode indicar problemas cardíacos relacionados à poluição. Busque ajuda médica.</p>
                </div>
                <div className="emergency-tip">
                  <strong>Telefones de Emergência:</strong>
                  <p>SAMU: 192 | Bombeiros: 193 | Polícia: 190</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="general-recommendations">
          <h2><Shield size={24} />Recomendações Gerais</h2>
          <div className="recommendations-grid">
            <div className="recommendation-card">
              <Wind size={32} />
              <h3>Purificação do Ar</h3>
              <p>Use purificadores de ar com filtros HEPA em casa e no trabalho.</p>
            </div>
            <div className="recommendation-card">
              <Droplets size={32} />
              <h3>Hidratação</h3>
              <p>Beba pelo menos 2-3 litros de água por dia para ajudar na eliminação de toxinas.</p>
            </div>
            <div className="recommendation-card">
              <Heart size={32} />
              <h3>Alimentação</h3>
              <p>Consuma alimentos ricos em antioxidantes como frutas vermelhas e vegetais verdes.</p>
            </div>
            <div className="recommendation-card">
              <Activity size={32} />
              <h3>Exercícios</h3>
              <p>Pratique exercícios respiratórios e yoga para fortalecer os pulmões.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthTips;