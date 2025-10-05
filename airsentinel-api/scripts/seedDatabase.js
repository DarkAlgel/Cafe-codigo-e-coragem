const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Importar modelos
const User = require('../models/User');
const AirQuality = require('../models/AirQuality');
const Alert = require('../models/Alert');
const Prediction = require('../models/Prediction');
const HealthRecommendation = require('../models/HealthRecommendation');

// Conectar ao banco
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/airsentinel', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Dados de usuários iniciais
const initialUsers = [
  {
    username: 'admin',
    email: 'admin@airsentinel.com',
    password: 'admin123',
    role: 'admin',
    profile: {
      name: 'Administrador',
      age: 35,
      riskGroup: 'normal',
      healthConditions: [],
      location: {
        city: 'São Paulo',
        state: 'SP',
        country: 'Brasil',
        coordinates: { lat: -23.5505, lng: -46.6333 }
      },
      preferences: {
        notifications: {
          email: true,
          push: true,
          sms: false
        },
        alertThresholds: {
          aqi: 100,
          pm25: 35,
          pm10: 50
        }
      }
    },
    permissions: ['ml_training', 'user_management', 'system_config']
  },
  {
    username: 'joao_silva',
    email: 'joao@email.com',
    password: 'senha123',
    role: 'user',
    profile: {
      name: 'João Silva',
      age: 45,
      riskGroup: 'normal',
      healthConditions: [],
      location: {
        city: 'São Paulo',
        state: 'SP',
        country: 'Brasil',
        coordinates: { lat: -23.5505, lng: -46.6333 }
      },
      preferences: {
        notifications: {
          email: true,
          push: true,
          sms: false
        },
        alertThresholds: {
          aqi: 80,
          pm25: 25,
          pm10: 40
        }
      }
    }
  },
  {
    username: 'maria_santos',
    email: 'maria@email.com',
    password: 'senha123',
    role: 'user',
    profile: {
      name: 'Maria Santos',
      age: 28,
      riskGroup: 'atletas',
      healthConditions: [],
      location: {
        city: 'Rio de Janeiro',
        state: 'RJ',
        country: 'Brasil',
        coordinates: { lat: -22.9068, lng: -43.1729 }
      },
      preferences: {
        notifications: {
          email: true,
          push: true,
          sms: true
        },
        alertThresholds: {
          aqi: 70,
          pm25: 20,
          pm10: 35
        }
      }
    }
  },
  {
    username: 'carlos_oliveira',
    email: 'carlos@email.com',
    password: 'senha123',
    role: 'user',
    profile: {
      name: 'Carlos Oliveira',
      age: 68,
      riskGroup: 'idosos',
      healthConditions: ['hipertensao'],
      location: {
        city: 'Belo Horizonte',
        state: 'MG',
        country: 'Brasil',
        coordinates: { lat: -19.9167, lng: -43.9345 }
      },
      preferences: {
        notifications: {
          email: true,
          push: true,
          sms: true
        },
        alertThresholds: {
          aqi: 60,
          pm25: 15,
          pm10: 25
        }
      }
    }
  },
  {
    username: 'ana_costa',
    email: 'ana@email.com',
    password: 'senha123',
    role: 'user',
    profile: {
      name: 'Ana Costa',
      age: 32,
      riskGroup: 'asmaticos',
      healthConditions: ['asma', 'rinite'],
      location: {
        city: 'Porto Alegre',
        state: 'RS',
        country: 'Brasil',
        coordinates: { lat: -30.0346, lng: -51.2177 }
      },
      preferences: {
        notifications: {
          email: true,
          push: true,
          sms: true
        },
        alertThresholds: {
          aqi: 50,
          pm25: 12,
          pm10: 20
        }
      }
    }
  }
];

// Dados de qualidade do ar históricos (últimos 7 dias)
function generateHistoricalAirQualityData() {
  const cities = [
    { name: 'São Paulo', lat: -23.5505, lng: -46.6333, baseAQI: 85 },
    { name: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729, baseAQI: 75 },
    { name: 'Belo Horizonte', lat: -19.9167, lng: -43.9345, baseAQI: 65 },
    { name: 'Porto Alegre', lat: -30.0346, lng: -51.2177, baseAQI: 55 },
    { name: 'Brasília', lat: -15.8267, lng: -47.9218, baseAQI: 45 }
  ];

  const data = [];
  const now = new Date();

  for (let day = 7; day >= 0; day--) {
    for (let hour = 0; hour < 24; hour++) {
      const timestamp = new Date(now);
      timestamp.setDate(timestamp.getDate() - day);
      timestamp.setHours(hour, 0, 0, 0);

      cities.forEach(city => {
        // Variação aleatória baseada na hora do dia
        const hourVariation = Math.sin((hour - 6) * Math.PI / 12) * 20; // Pior no meio do dia
        const randomVariation = (Math.random() - 0.5) * 30;
        const aqi = Math.max(10, Math.min(300, city.baseAQI + hourVariation + randomVariation));

        // Calcular poluentes baseados no AQI
        const pm25 = Math.max(5, aqi * 0.4 + (Math.random() - 0.5) * 10);
        const pm10 = Math.max(10, pm25 * 1.5 + (Math.random() - 0.5) * 15);
        const no2 = Math.max(5, aqi * 0.3 + (Math.random() - 0.5) * 8);
        const so2 = Math.max(2, aqi * 0.2 + (Math.random() - 0.5) * 5);
        const co = Math.max(0.5, aqi * 0.1 + (Math.random() - 0.5) * 2);
        const o3 = Math.max(10, aqi * 0.5 + (Math.random() - 0.5) * 12);

        data.push({
          location: {
            city: city.name,
            coordinates: { lat: city.lat, lng: city.lng }
          },
          aqi: {
            value: Math.round(aqi),
            category: getAQICategory(aqi)
          },
          pollutants: {
            pm25: Math.round(pm25 * 10) / 10,
            pm10: Math.round(pm10 * 10) / 10,
            no2: Math.round(no2 * 10) / 10,
            so2: Math.round(so2 * 10) / 10,
            co: Math.round(co * 10) / 10,
            o3: Math.round(o3 * 10) / 10
          },
          weather: {
            temperature: 20 + Math.sin((hour - 6) * Math.PI / 12) * 8 + (Math.random() - 0.5) * 4,
            humidity: 50 + (Math.random() - 0.5) * 30,
            windSpeed: 5 + Math.random() * 15,
            windDirection: Math.random() * 360,
            pressure: 1013 + (Math.random() - 0.5) * 20
          },
          timestamp,
          source: 'synthetic_data',
          metadata: {
            dataQuality: 'good',
            lastUpdated: timestamp
          }
        });
      });
    }
  }

  return data;
}

// Função para determinar categoria do AQI
function getAQICategory(aqi) {
  if (aqi <= 50) return 'Bom';
  if (aqi <= 100) return 'Moderado';
  if (aqi <= 150) return 'Insalubre para Grupos Sensíveis';
  if (aqi <= 200) return 'Insalubre';
  if (aqi <= 300) return 'Muito Insalubre';
  return 'Perigoso';
}

// Função para gerar alertas de exemplo
function generateSampleAlerts() {
  return [
    {
      type: 'aqi_high',
      severity: 'medium',
      title: 'Qualidade do Ar Moderada',
      message: 'O IQA em São Paulo está em 85. Grupos sensíveis devem considerar reduzir atividades ao ar livre.',
      location: {
        city: 'São Paulo',
        coordinates: { lat: -23.5505, lng: -46.6333 }
      },
      triggerConditions: {
        aqi: { value: 85, threshold: 80 },
        duration: 60 // minutos
      },
      affectedGroups: ['asmaticos', 'idosos', 'criancas'],
      recommendations: [
        'Evite exercícios intensos ao ar livre',
        'Mantenha janelas fechadas',
        'Use purificador de ar se disponível'
      ],
      isActive: true,
      priority: 'medium'
    },
    {
      type: 'pm25_critical',
      severity: 'high',
      title: 'Alerta de PM2.5 Elevado',
      message: 'Concentração de PM2.5 atingiu níveis críticos no Rio de Janeiro.',
      location: {
        city: 'Rio de Janeiro',
        coordinates: { lat: -22.9068, lng: -43.1729 }
      },
      triggerConditions: {
        pm25: { value: 45, threshold: 35 },
        duration: 120
      },
      affectedGroups: ['todos'],
      recommendations: [
        'Evite atividades ao ar livre',
        'Use máscara N95 se precisar sair',
        'Procure ambientes com ar condicionado'
      ],
      isActive: true,
      priority: 'high'
    }
  ];
}

// Função principal para popular o banco
async function seedDatabase() {
  try {
    console.log('🌱 Iniciando população do banco de dados...');

    // Limpar dados existentes
    console.log('🧹 Limpando dados existentes...');
    await User.deleteMany({});
    await AirQuality.deleteMany({});
    await Alert.deleteMany({});
    await Prediction.deleteMany({});
    await HealthRecommendation.deleteMany({});

    // Criar usuários
    console.log('👥 Criando usuários...');
    const hashedUsers = await Promise.all(
      initialUsers.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10)
      }))
    );
    await User.insertMany(hashedUsers);
    console.log(`✅ ${hashedUsers.length} usuários criados`);

    // Criar dados de qualidade do ar
    console.log('🌬️ Gerando dados históricos de qualidade do ar...');
    const airQualityData = generateHistoricalAirQualityData();
    await AirQuality.insertMany(airQualityData);
    console.log(`✅ ${airQualityData.length} registros de qualidade do ar criados`);

    // Criar alertas
    console.log('🚨 Criando alertas de exemplo...');
    const alerts = generateSampleAlerts();
    await Alert.insertMany(alerts);
    console.log(`✅ ${alerts.length} alertas criados`);

    // Criar algumas recomendações de saúde
    console.log('🏥 Criando recomendações de saúde...');
    const users = await User.find({ role: 'user' });
    const healthRecommendations = [];

    for (const user of users.slice(0, 3)) {
      const currentAirQuality = airQualityData.find(
        aq => aq.location.city === user.profile.location.city
      );

      if (currentAirQuality) {
        const recommendation = await HealthRecommendation.generateForUser(
          user,
          currentAirQuality.aqi.value,
          user.profile.location
        );
        healthRecommendations.push(recommendation);
      }
    }

    await HealthRecommendation.insertMany(healthRecommendations);
    console.log(`✅ ${healthRecommendations.length} recomendações de saúde criadas`);

    console.log('🎉 Banco de dados populado com sucesso!');
    console.log('\n📊 Resumo:');
    console.log(`   👥 Usuários: ${hashedUsers.length}`);
    console.log(`   🌬️ Dados de qualidade do ar: ${airQualityData.length}`);
    console.log(`   🚨 Alertas: ${alerts.length}`);
    console.log(`   🏥 Recomendações: ${healthRecommendations.length}`);
    
    console.log('\n🔐 Credenciais de acesso:');
    console.log('   Admin: admin / admin123');
    console.log('   Usuário: joao_silva / senha123');
    console.log('   Atleta: maria_santos / senha123');
    console.log('   Idoso: carlos_oliveira / senha123');
    console.log('   Asmático: ana_costa / senha123');

  } catch (error) {
    console.error('❌ Erro ao popular banco de dados:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };