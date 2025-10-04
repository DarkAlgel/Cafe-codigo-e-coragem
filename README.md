# 🌬️ Air Sentinel

## Sistema de Monitoramento de Qualidade do Ar em Tempo Real

![Air Sentinel](https://img.shields.io/badge/Air%20Sentinel-v1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-19.1.1-61DAFB.svg)
![Node.js](https://img.shields.io/badge/Node.js-Express-green.svg)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

**Air Sentinel** é uma aplicação web completa para monitoramento da qualidade do ar em tempo real, desenvolvida para fornecer informações precisas sobre poluentes atmosféricos, condições meteorológicas e alertas personalizados para diferentes grupos de usuários.

## 📋 Índice

- [Características](#-características)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Uso](#-uso)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Dependências](#-dependências)
- [API Endpoints](#-api-endpoints)
- [Exemplos de Código](#-exemplos-de-código)
- [Contribuição](#-contribuição)
- [Licença](#-licença)
- [Contato](#-contato)

## ✨ Características

### 🎯 **Funcionalidades Principais**
- **Monitoramento em Tempo Real**: Acompanhamento contínuo da qualidade do ar
- **Múltiplos Poluentes**: PM2.5, PM10, O3, NO2, SO2, CO
- **Dados Meteorológicos**: Temperatura, umidade, velocidade do vento, visibilidade
- **Mapa Interativo**: Visualização geográfica das estações de monitoramento
- **Alertas Personalizados**: Notificações inteligentes por grupos de risco
- **Perfis de Usuário**: Configurações personalizadas por condições de saúde
- **Histórico e Tendências**: Análise temporal dos dados de qualidade do ar
- **Dicas de Saúde**: Recomendações específicas por grupo (crianças, idosos, atletas)

### 👥 **Grupos de Usuários Suportados**
- Público geral
- Crianças (0-12 anos)
- Idosos (65+ anos)
- Pessoas com problemas respiratórios
- Pessoas com problemas cardíacos
- Atletas e pessoas ativas

## 🔧 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 18.0 ou superior)
- **npm** (versão 8.0 ou superior)
- **MongoDB** (versão 5.0 ou superior)
- **Git** (para clonagem do repositório)

### Verificação dos Pré-requisitos

```bash
# Verificar versão do Node.js
node --version

# Verificar versão do npm
npm --version

# Verificar se o MongoDB está rodando
mongosh --eval "db.runCommand('ping')"
```

## 🚀 Instalação

### 1. Clone o Repositório

```bash
git clone https://github.com//DarkAlgel/Cafe-codigo-e-coragem
cd Cafe-codigo-e-coragem
```

### 2. Instalar Dependências do Backend

```bash
cd hacketon-api
npm install
```

### 3. Instalar Dependências do Frontend

```bash
cd ../hacketon-frontend
npm install
```

## ⚙️ Configuração

### 1. Configuração do Backend

#### Criar arquivo de ambiente:
```bash
cd hacketon-api
cp .env.example .env
```

#### Editar o arquivo `.env`:
```env
# Configurações do Servidor
PORT=3001
NODE_ENV=development

# Banco de Dados MongoDB
MONGODB_URI=mongodb://localhost:27017/hacketon-db

# JWT Secret (gere uma chave segura)
JWT_SECRET=sua-chave-jwt-super-secreta-aqui
JWT_EXPIRES_IN=7d

# APIs Externas (obtenha suas chaves)
OPENWEATHER_API_KEY=sua-chave-openweather
AIRNOW_API_KEY=sua-chave-airnow
WAQI_API_KEY=sua-chave-waqi

# Configurações de Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app

# Configurações de SMS (Twilio)
TWILIO_ACCOUNT_SID=seu-twilio-account-sid
TWILIO_AUTH_TOKEN=seu-twilio-auth-token
TWILIO_PHONE_NUMBER=seu-numero-twilio

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://localhost:5173
```

### 2. Configuração do Banco de Dados

#### Iniciar MongoDB:
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

#### Criar banco de dados (opcional):
```bash
mongosh
use hacketon-db
```

### 3. Obter Chaves de API

#### OpenWeatherMap:
1. Acesse [OpenWeatherMap](https://openweathermap.org/api)
2. Crie uma conta gratuita
3. Obtenha sua API key

#### AirNow (EPA):
1. Acesse [AirNow API](https://docs.airnowapi.org/)
2. Registre-se para obter acesso
3. Obtenha sua API key

#### World Air Quality Index:
1. Acesse [WAQI](https://aqicn.org/api/)
2. Registre-se para obter token
3. Configure no arquivo .env

## 🎮 Uso

### 1. Iniciar o Backend

```bash
cd hacketon-api

# Modo desenvolvimento
npm run dev

# Modo produção
npm start
```

O servidor estará disponível em: `http://localhost:3001`

### 2. Iniciar o Frontend

```bash
cd hacketon-frontend

# Modo desenvolvimento
npm run dev

# Build para produção
npm run build
npm run preview
```

A aplicação estará disponível em: `http://localhost:5173`

### 3. Verificar Funcionamento

#### Health Check da API:
```bash
curl http://localhost:3001/health
```

#### Resposta esperada:
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 120.5,
  "environment": "development"
}
```

## 📁 Estrutura do Projeto

```
air-sentinel/
├── 📄 README.md                    # Documentação principal
├── 📄 Dados.txt                    # Dados de referência da NASA
├── 📄 criações.txt                 # Especificações do projeto
├── 🗂️ hacketon-api/               # Backend (Node.js + Express)
│   ├── 📄 server.js                # Servidor principal
│   ├── 📄 package.json             # Dependências do backend
│   ├── 📄 .env.example             # Exemplo de variáveis de ambiente
│   └── 🗂️ src/
│       ├── 🗂️ config/              # Configurações (DB, etc.)
│       ├── 🗂️ controllers/         # Controladores da API
│       ├── 🗂️ middleware/          # Middlewares (auth, error handling)
│       ├── 🗂️ models/              # Modelos do MongoDB
│       ├── 🗂️ routes/              # Rotas da API
│       ├── 🗂️ services/            # Serviços (APIs externas)
│       └── 🗂️ utils/               # Utilitários
└── 🗂️ hacketon-frontend/          # Frontend (React + Vite)
    ├── 📄 index.html               # HTML principal
    ├── 📄 package.json             # Dependências do frontend
    ├── 📄 vite.config.js           # Configuração do Vite
    ├── 🗂️ public/                 # Arquivos públicos
    └── 🗂️ src/
        ├── 📄 App.jsx              # Componente principal
        ├── 📄 main.jsx             # Ponto de entrada
        ├── 🗂️ components/          # Componentes React
        │   ├── 📄 Dashboard.jsx    # Painel principal
        │   ├── 📄 MapView.jsx      # Mapa interativo
        │   ├── 📄 AlertSettings.jsx # Configurações de alertas
        │   ├── 📄 UserProfile.jsx  # Perfil do usuário
        │   ├── 📄 HealthTips.jsx   # Dicas de saúde
        │   └── 📄 PollutantDetails.jsx # Detalhes dos poluentes
        └── 🗂️ assets/             # Recursos estáticos
```

## 📦 Dependências

### Backend (Node.js)

#### Dependências Principais:
```json
{
  "express": "^5.1.0",           // Framework web
  "mongoose": "^8.19.0",         // ODM para MongoDB
  "cors": "^2.8.5",              // Cross-Origin Resource Sharing
  "helmet": "^8.1.0",            // Segurança HTTP
  "bcryptjs": "^3.0.2",          // Hash de senhas
  "jsonwebtoken": "^9.0.2",      // Autenticação JWT
  "dotenv": "^17.2.3",           // Variáveis de ambiente
  "express-rate-limit": "^8.1.0", // Rate limiting
  "express-validator": "^7.2.1",  // Validação de dados
  "morgan": "^1.10.1"            // Logger HTTP
}
```

#### Dependências de Desenvolvimento:
```json
{
  "nodemon": "^3.1.10",          // Auto-restart do servidor
  "concurrently": "^9.2.1"       // Execução paralela de comandos
}
```

### Frontend (React)

#### Dependências Principais:
```json
{
  "react": "^19.1.1",            // Biblioteca React
  "react-dom": "^19.1.1",        // React DOM
  "react-router-dom": "^7.9.3",  // Roteamento
  "leaflet": "^1.9.4",           // Mapas interativos
  "react-leaflet": "^5.0.0",     // Integração React + Leaflet
  "recharts": "^3.2.1",          // Gráficos e visualizações
  "lucide-react": "^0.544.0"     // Ícones
}
```

#### Dependências de Desenvolvimento:
```json
{
  "vite": "^7.1.7",              // Build tool
  "@vitejs/plugin-react": "^5.0.4", // Plugin React para Vite
  "eslint": "^9.36.0"            // Linter JavaScript
}
```

## 🔌 API Endpoints

### Autenticação
```http
POST   /api/auth/register        # Registrar usuário
POST   /api/auth/login           # Login
POST   /api/auth/logout          # Logout
GET    /api/auth/me              # Perfil do usuário
```

### Qualidade do Ar
```http
GET    /api/air-quality/current  # Dados atuais
GET    /api/air-quality/history  # Histórico
GET    /api/air-quality/forecast # Previsão
```

### Estações de Monitoramento
```http
GET    /api/stations             # Listar estações
GET    /api/stations/:id         # Detalhes da estação
POST   /api/stations             # Criar estação (admin)
```

### Alertas
```http
GET    /api/alerts               # Listar alertas do usuário
POST   /api/alerts               # Criar alerta
PUT    /api/alerts/:id           # Atualizar alerta
DELETE /api/alerts/:id           # Deletar alerta
```

### Usuários
```http
GET    /api/users/profile        # Perfil do usuário
PUT    /api/users/profile        # Atualizar perfil
PUT    /api/users/preferences    # Atualizar preferências
```

## 💻 Exemplos de Código

### 1. Consumir API de Qualidade do Ar

```javascript
// Obter dados atuais de qualidade do ar
const fetchAirQuality = async (latitude, longitude) => {
  try {
    const response = await fetch(`/api/air-quality/current?lat=${latitude}&lon=${longitude}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar dados de qualidade do ar:', error);
    throw error;
  }
};

// Exemplo de uso
const airData = await fetchAirQuality(-23.5505, -46.6333);
console.log('AQI atual:', airData.aqi);
```

### 2. Criar Alerta Personalizado

```javascript
// Criar um alerta para PM2.5
const createAlert = async (alertData) => {
  try {
    const response = await fetch('/api/alerts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Alerta PM2.5 Alto',
        type: 'pollutant',
        pollutant: 'PM2.5',
        threshold: 35,
        location: 'São Paulo, SP',
        notifications: ['push', 'email']
      })
    });
    
    return await response.json();
  } catch (error) {
    console.error('Erro ao criar alerta:', error);
    throw error;
  }
};
```

### 3. Componente React para Exibir AQI

```jsx
import React, { useState, useEffect } from 'react';

const AQIDisplay = ({ location }) => {
  const [aqiData, setAqiData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchAirQuality(location.lat, location.lon);
        setAqiData(data);
      } catch (error) {
        console.error('Erro:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location]);

  const getAQIColor = (aqi) => {
    if (aqi <= 50) return '#4CAF50';      // Bom
    if (aqi <= 100) return '#FFEB3B';     // Moderado
    if (aqi <= 150) return '#FF9800';     // Insalubre para grupos sensíveis
    if (aqi <= 200) return '#F44336';     // Insalubre
    if (aqi <= 300) return '#9C27B0';     // Muito insalubre
    return '#8D6E63';                     // Perigoso
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="aqi-display">
      <div 
        className="aqi-circle" 
        style={{ borderColor: getAQIColor(aqiData.aqi) }}
      >
        <span className="aqi-value">{aqiData.aqi}</span>
        <span className="aqi-label">AQI</span>
      </div>
      <h3 style={{ color: getAQIColor(aqiData.aqi) }}>
        {aqiData.status}
      </h3>
    </div>
  );
};

export default AQIDisplay;
```

### 4. Middleware de Autenticação (Backend)

```javascript
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        error: 'Token de acesso requerido' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ 
        error: 'Usuário não encontrado' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ 
      error: 'Token inválido' 
    });
  }
};
```

## 🤝 Contribuição

Contribuições são bem-vindas! Para contribuir:

1. **Fork** o projeto
2. Crie uma **branch** para sua feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. **Push** para a branch (`git push origin feature/AmazingFeature`)
5. Abra um **Pull Request**

### Diretrizes de Contribuição

- Siga os padrões de código existentes
- Adicione testes para novas funcionalidades
- Atualize a documentação quando necessário
- Use mensagens de commit descritivas

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

```
MIT License

Copyright (c) 2024 Air Sentinel Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 📞 Contato

### Equipe de Desenvolvimento

- **Email**: airsentinel@hacketon.com
- **Website**: [https://airsentinel.hacketon.com](https://airsentinel.hacketon.com)
- **GitHub**: [https://github.com/hacketon-team/air-sentinel](https://github.com/hacketon-team/air-sentinel)

### Suporte

- **Issues**: [GitHub Issues](https://github.com/hacketon-team/air-sentinel/issues)
- **Documentação**: [Wiki do Projeto](https://github.com/hacketon-team/air-sentinel/wiki)
- **Discussões**: [GitHub Discussions](https://github.com/hacketon-team/air-sentinel/discussions)

### Redes Sociais

- **Twitter**: [@AirSentinelApp](https://twitter.com/AirSentinelApp)
- **LinkedIn**: [Air Sentinel](https://linkedin.com/company/air-sentinel)

---

<div align="center">

**Desenvolvido com ❤️ pela equipe Hacketon**

[⬆ Voltar ao topo](#-air-sentinel)

</div>