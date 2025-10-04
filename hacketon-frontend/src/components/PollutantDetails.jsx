import React, { useState } from 'react';
import { Activity, AlertTriangle, Info, Thermometer, Droplets, Wind, Eye } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import './PollutantDetails.css';

const PollutantDetails = () => {
  const [selectedPollutant, setSelectedPollutant] = useState('pm25');

  const pollutantData = {
    pm25: {
      name: 'PM2.5',
      fullName: 'Material Particulado 2.5',
      currentValue: 35,
      unit: 'µg/m³',
      limit: 25,
      status: 'moderate',
      description: 'Partículas finas com diâmetro menor que 2,5 micrômetros. Podem penetrar profundamente nos pulmões e na corrente sanguínea.',
      healthEffects: [
        'Irritação dos olhos, nariz e garganta',
        'Agravamento de asma e doenças cardíacas',
        'Redução da função pulmonar',
        'Aumento do risco de infecções respiratórias'
      ],
      precautions: [
        'Evite exercícios ao ar livre',
        'Use máscara N95 quando necessário',
        'Mantenha janelas fechadas',
        'Use purificador de ar em casa'
      ],
      sources: ['Veículos', 'Indústrias', 'Queimadas', 'Construção civil']
    },
    pm10: {
      name: 'PM10',
      fullName: 'Material Particulado 10',
      currentValue: 45,
      unit: 'µg/m³',
      limit: 50,
      status: 'good',
      description: 'Partículas com diâmetro menor que 10 micrômetros. Podem ser inaladas e causar problemas respiratórios.',
      healthEffects: [
        'Irritação das vias respiratórias',
        'Tosse e espirros',
        'Agravamento de alergias',
        'Redução da capacidade pulmonar'
      ],
      precautions: [
        'Evite áreas com muito tráfego',
        'Use máscara em dias poluídos',
        'Pratique exercícios em locais fechados',
        'Mantenha ambientes limpos'
      ],
      sources: ['Poeira', 'Pólen', 'Veículos', 'Indústrias']
    },
    o3: {
      name: 'O₃',
      fullName: 'Ozônio',
      currentValue: 120,
      unit: 'µg/m³',
      limit: 100,
      status: 'moderate',
      description: 'Gás formado pela reação de poluentes com a luz solar. Mais concentrado durante o dia.',
      healthEffects: [
        'Irritação dos pulmões',
        'Dificuldade para respirar',
        'Agravamento de asma',
        'Redução da função pulmonar'
      ],
      precautions: [
        'Evite exercícios ao ar livre no meio do dia',
        'Fique em ambientes com ar condicionado',
        'Limite atividades externas',
        'Monitore sintomas respiratórios'
      ],
      sources: ['Reação fotoquímica', 'Veículos', 'Indústrias', 'Solventes']
    },
    no2: {
      name: 'NO₂',
      fullName: 'Dióxido de Nitrogênio',
      currentValue: 25,
      unit: 'µg/m³',
      limit: 40,
      status: 'good',
      description: 'Gás marrom-avermelhado com odor forte. Principal poluente do tráfego urbano.',
      healthEffects: [
        'Irritação das vias respiratórias',
        'Aumento da susceptibilidade a infecções',
        'Agravamento de asma',
        'Redução da função pulmonar'
      ],
      precautions: [
        'Evite ruas com tráfego intenso',
        'Ventile bem os ambientes',
        'Use transporte público',
        'Pratique exercícios longe do tráfego'
      ],
      sources: ['Veículos', 'Usinas termelétricas', 'Indústrias', 'Aquecedores']
    }
  };

  const weatherData = {
    temperature: 24,
    humidity: 65,
    windSpeed: 12,
    windDirection: 'NE',
    visibility: 8,
    pressure: 1013,
    uvIndex: 6
  };

  const historicalData = [
    { time: '00:00', pm25: 28, pm10: 38, o3: 85, no2: 20 },
    { time: '04:00', pm25: 32, pm10: 42, o3: 75, no2: 22 },
    { time: '08:00', pm25: 45, pm10: 55, o3: 95, no2: 35 },
    { time: '12:00', pm25: 38, pm10: 48, o3: 125, no2: 28 },
    { time: '16:00', pm25: 35, pm10: 45, o3: 120, no2: 25 },
    { time: '20:00', pm25: 30, pm10: 40, o3: 100, no2: 23 }
  ];

  const currentPollutant = pollutantData[selectedPollutant];

  const getStatusColor = (status) => {
    switch (status) {
      case 'good': return '#4CAF50';
      case 'moderate': return '#FF9800';
      case 'unhealthy': return '#f44336';
      default: return '#666';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'good': return 'Bom';
      case 'moderate': return 'Moderado';
      case 'unhealthy': return 'Insalubre';
      default: return 'Desconhecido';
    }
  };

  return (
    <div className="pollutant-details">
      <div className="page-header">
        <h1>Detalhes dos Poluentes</h1>
        <p>Informações detalhadas sobre poluentes e condições climáticas</p>
      </div>

      <div className="pollutant-selector">
        {Object.entries(pollutantData).map(([key, pollutant]) => (
          <button
            key={key}
            className={`pollutant-tab ${selectedPollutant === key ? 'active' : ''}`}
            onClick={() => setSelectedPollutant(key)}
            style={{
              borderColor: selectedPollutant === key ? getStatusColor(pollutant.status) : 'transparent'
            }}
          >
            <span className="tab-name">{pollutant.name}</span>
            <span className="tab-value" style={{ color: getStatusColor(pollutant.status) }}>
              {pollutant.currentValue} {pollutant.unit}
            </span>
          </button>
        ))}
      </div>

      <div className="details-grid">
        {/* Informações do Poluente Selecionado */}
        <div className="card pollutant-info">
          <div className="pollutant-header">
            <Activity size={24} />
            <div>
              <h2>{currentPollutant.fullName}</h2>
              <p>{currentPollutant.description}</p>
            </div>
          </div>

          <div className="current-level">
            <div className="level-display">
              <span className="level-value" style={{ color: getStatusColor(currentPollutant.status) }}>
                {currentPollutant.currentValue}
              </span>
              <span className="level-unit">{currentPollutant.unit}</span>
            </div>
            <div className="level-status">
              <span 
                className="status-badge"
                style={{ backgroundColor: getStatusColor(currentPollutant.status) }}
              >
                {getStatusLabel(currentPollutant.status)}
              </span>
              <span className="level-limit">
                Limite: {currentPollutant.limit} {currentPollutant.unit}
              </span>
            </div>
          </div>

          <div className="level-bar">
            <div 
              className="level-progress"
              style={{ 
                width: `${Math.min((currentPollutant.currentValue / currentPollutant.limit) * 100, 100)}%`,
                backgroundColor: getStatusColor(currentPollutant.status)
              }}
            />
          </div>
        </div>

        {/* Gráfico Histórico */}
        <div className="card historical-chart">
          <h3>Variação nas Últimas 24 Horas</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} ${currentPollutant.unit}`, currentPollutant.name]} />
                <Line 
                  type="monotone" 
                  dataKey={selectedPollutant} 
                  stroke={getStatusColor(currentPollutant.status)}
                  strokeWidth={3}
                  dot={{ fill: getStatusColor(currentPollutant.status), strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Condições Climáticas */}
        <div className="card weather-conditions">
          <h3>Condições Climáticas</h3>
          <div className="weather-grid">
            <div className="weather-item">
              <Thermometer className="weather-icon" />
              <div>
                <span className="weather-value">{weatherData.temperature}°C</span>
                <span className="weather-label">Temperatura</span>
              </div>
            </div>
            <div className="weather-item">
              <Droplets className="weather-icon" />
              <div>
                <span className="weather-value">{weatherData.humidity}%</span>
                <span className="weather-label">Umidade</span>
              </div>
            </div>
            <div className="weather-item">
              <Wind className="weather-icon" />
              <div>
                <span className="weather-value">{weatherData.windSpeed} km/h</span>
                <span className="weather-label">Vento {weatherData.windDirection}</span>
              </div>
            </div>
            <div className="weather-item">
              <Eye className="weather-icon" />
              <div>
                <span className="weather-value">{weatherData.visibility} km</span>
                <span className="weather-label">Visibilidade</span>
              </div>
            </div>
          </div>
        </div>

        {/* Efeitos na Saúde */}
        <div className="card health-effects">
          <h3>
            <AlertTriangle size={20} />
            Efeitos na Saúde
          </h3>
          <ul className="effects-list">
            {currentPollutant.healthEffects.map((effect, index) => (
              <li key={index}>{effect}</li>
            ))}
          </ul>
        </div>

        {/* Precauções */}
        <div className="card precautions">
          <h3>
            <Info size={20} />
            Precauções Recomendadas
          </h3>
          <ul className="precautions-list">
            {currentPollutant.precautions.map((precaution, index) => (
              <li key={index}>{precaution}</li>
            ))}
          </ul>
        </div>

        {/* Principais Fontes */}
        <div className="card sources">
          <h3>Principais Fontes</h3>
          <div className="sources-grid">
            {currentPollutant.sources.map((source, index) => (
              <div key={index} className="source-item">
                {source}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PollutantDetails;