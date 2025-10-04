import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Baby, Heart, Activity } from 'lucide-react';
import './Health.css';

const Health = () => {
  const [selectedGroup, setSelectedGroup] = useState('Crianças');

  // Grupos de pessoas
  const groups = [
    { name: 'Crianças', icon: Baby, active: true },
    { name: 'Idosos', icon: Users, active: false },
    { name: 'Atletas', icon: Activity, active: false }
  ];

  // Recomendações por grupo
  const recommendations = {
    'Crianças': [
      'Monitore a IQA diariamente.',
      'Mantenha ambientes internos limpos e use purificador de ar.',
      'Evite atividades ao ar livre em dias de alta poluição.',
      'Use máscara N95 em dias de poluição elevada.',
      'Tenha sempre sua medicação de resgate em mãos e consulte seu médico regularmente.'
    ],
    'Idosos': [
      'Evite exercícios ao ar livre em dias poluídos.',
      'Use purificadores de ar em casa.',
      'Mantenha medicamentos sempre à mão.',
      'Consulte médico regularmente sobre qualidade do ar.',
      'Prefira atividades internas em dias de alta poluição.'
    ],
    'Atletas': [
      'Ajuste treinos conforme a qualidade do ar.',
      'Use máscara durante exercícios em ambientes poluídos.',
      'Hidrate-se mais em dias de poluição elevada.',
      'Prefira exercícios internos quando IQA estiver ruim.',
      'Monitore sintomas respiratórios durante atividades.'
    ]
  };

  return (
    <div className="health">
      <div className="health-container">
        {/* Card principal */}
        <div className="health-card">
          <div className="health-content">
            <h1>Recomendações de Saúde:</h1>
            
            {/* Seletor de grupos */}
            <div className="group-selector">
              {groups.map((group) => {
                const IconComponent = group.icon;
                return (
                  <button
                    key={group.name}
                    className={`group-btn ${selectedGroup === group.name ? 'active' : ''}`}
                    onClick={() => setSelectedGroup(group.name)}
                  >
                    <IconComponent size={20} />
                    <span>{group.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Título da seção */}
            <h2 className="recommendations-title">
              Recomendações Detalhadas - Pessoas com Asma
            </h2>

            {/* Lista de recomendações */}
            <div className="recommendations-list">
              {recommendations[selectedGroup].map((recommendation, index) => (
                <div key={index} className="recommendation-item">
                  <div className="recommendation-number">
                    {index + 1}
                  </div>
                  <p className="recommendation-text">
                    {recommendation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Health;