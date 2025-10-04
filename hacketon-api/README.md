# Hacketon API - Dados de CO2 e Qualidade do Ar

API Node.js para fornecer dados de concentração de CO2 atmosférico baseada em simulações dos datasets da NASA.

## 🚀 Início Rápido

### Pré-requisitos
- Node.js 16+ 
- npm ou yarn

### Instalação

1. Clone o repositório e navegue até a pasta da API:
```bash
cd hacketon-api
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. Inicie o servidor:
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

A API estará disponível em `http://localhost:3001`

## 📡 Endpoints

### Health Check
- **GET** `/api/health` - Status básico da API
- **GET** `/api/health/detailed` - Status detalhado com métricas do sistema

### Dados de CO2
- **GET** `/api/co2_data` - Dados de concentração de CO2
- **GET** `/api/co2_info` - Informações sobre o dataset
- **GET** `/api/co2_stats` - Estatísticas de cache e performance

### Parâmetros de Query para `/api/co2_data`
- `lat` (opcional): Latitude da localização
- `lon` (opcional): Longitude da localização  
- `location` (opcional): Nome da localização (padrão: "Nova Iorque")

### Exemplo de Resposta - CO2 Data
```json
{
  "value": 425.67,
  "units": "ppm",
  "location": "Nova Iorque",
  "source": "NASA/MERRA-2 (Simulado)",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "coordinates": {
    "lat": 40.7128,
    "lon": -74.0060
  },
  "quality": "moderate",
  "context": {
    "description": "Concentração de CO2 atmosférico obtida via simulação baseada em dados MERRA-2",
    "interpretation": {
      "level": "Elevado",
      "description": "Níveis de CO2 acima da média, típico de áreas urbanas",
      "color": "#FF9800"
    },
    "recommendations": [
      "Evite atividades físicas intensas ao ar livre",
      "Considere usar transporte público ou bicicleta"
    ]
  },
  "metadata": {
    "measurement_type": "atmospheric_co2_concentration",
    "dataset": "MERRA-2_CO2_Simulation",
    "spatial_resolution": "0.5° x 0.625°",
    "temporal_resolution": "hourly"
  },
  "cached": false
}
```

## 🔧 Configuração

### Variáveis de Ambiente
```env
PORT=3001                           # Porta do servidor
NODE_ENV=development               # Ambiente (development/production)
CORS_ORIGIN=http://localhost:3000  # Origem permitida para CORS
CACHE_DURATION=300                 # Duração do cache em segundos
```

## 🏗️ Arquitetura

```
hacketon-api/
├── server.js              # Servidor principal
├── routes/
│   ├── co2Routes.js       # Rotas para dados de CO2
│   └── healthRoutes.js    # Rotas de health check
├── package.json           # Dependências e scripts
├── .env.example          # Exemplo de configuração
└── README.md             # Esta documentação
```

## 🔄 Cache

A API implementa um sistema de cache simples:
- **Duração**: 5 minutos por padrão
- **Escopo**: Dados de CO2 são cacheados globalmente
- **Invalidação**: Automática após expiração

## 🛡️ Segurança

- **Helmet**: Headers de segurança HTTP
- **CORS**: Configurado para permitir apenas origens específicas
- **Rate Limiting**: Planejado para implementação futura
- **Validação**: Validação básica de parâmetros de entrada

## 📊 Monitoramento

### Health Check
```bash
curl http://localhost:3001/api/health
```

### Métricas Detalhadas
```bash
curl http://localhost:3001/api/health/detailed
```

### Estatísticas de Cache
```bash
curl http://localhost:3001/api/co2_stats
```

## 🧪 Testes

```bash
# Executar testes
npm test

# Executar testes em modo watch
npm run test:watch
```

## 🚀 Deploy

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm start
```

## 🤝 Integração com Frontend

### Exemplo de uso no React:
```javascript
const fetchCO2Data = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/co2_data?location=São Paulo');
    const data = await response.json();
    console.log('CO2 Level:', data.value, data.units);
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
  }
};
```

## 📝 Notas de Desenvolvimento

- **Simulação**: Atualmente a API simula dados baseados em padrões realistas
- **NASA Integration**: Preparada para integração futura com APIs reais da NASA
- **Escalabilidade**: Arquitetura preparada para adicionar novos endpoints
- **Logging**: Sistema de logs implementado com Morgan

## 🔮 Roadmap

- [ ] Integração real com APIs da NASA Earthdata
- [ ] Implementação de rate limiting
- [ ] Adição de mais poluentes (NO2, PM2.5, etc.)
- [ ] Sistema de alertas
- [ ] Autenticação e autorização
- [ ] Métricas avançadas e dashboards

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.