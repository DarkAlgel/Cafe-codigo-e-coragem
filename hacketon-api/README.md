# Air Sentinel API - NASA Earthdata Integration

## 📋 Visão Geral

O Air Sentinel API é uma plataforma robusta para monitoramento da qualidade do ar que integra dados atmosféricos e meteorológicos da NASA Earthdata, especificamente do dataset MERRA-2 M2IMNPASM (Modern-Era Retrospective analysis for Research and Applications, version 2).

## 🚀 Funcionalidades

### API NASA Earthdata (MERRA-2)
- **Health Check**: Verificação do status da integração
- **Dados M2IMNPASM**: Acesso aos dados atmosféricos MERRA-2
- **Variáveis Disponíveis**: Lista de variáveis meteorológicas
- **Produtos**: Busca de produtos por conceito
- **Estatísticas**: Métricas de uso da API

### API TEMPO NO2 (Novo!)
- **Dados de NO2 Troposférico**: Medições de dióxido de nitrogênio em tempo quase real
- **Cobertura**: América do Norte (15°N a 70°N, 140°W a 40°W)
- **Resolução**: 2.1 km x 4.4 km, medições horárias durante o dia
- **Processamento NetCDF**: Extração e análise de dados multidimensionais
- **Análise de Qualidade**: Avaliação automática da qualidade dos dados
- **Estatísticas Temporais**: Padrões diários e análise de picos de poluição

### NASA Earthdata Integration
- **Dataset M2IMNPASM**: Dados instantâneos de 3 em 3 horas de assimilação atmosférica
- **Variáveis Disponíveis**: Pressão, temperatura, umidade, vento, precipitação, radiação
- **Cobertura Global**: Resolução espacial de 0.5° x 0.625°
- **Período**: Dados desde 1980 até o presente
- **Autenticação**: Integração com NASA Earthdata Login

### Endpoints Principais

#### NASA Earthdata (MERRA-2)
- `GET /api/nasa/health` - Status da integração
- `GET /api/nasa/data` - Dados M2IMNPASM com parâmetros de localização e tempo
- `GET /api/nasa/variables` - Lista de variáveis disponíveis
- `GET /api/nasa/products` - Busca de produtos por conceito
- `GET /api/nasa/stats` - Estatísticas de uso da API

#### TEMPO NO2 (Qualidade do Ar)
- `GET /api/tempo/health` - Status do serviço TEMPO
- `GET /api/tempo/no2` - Dados de NO2 troposférico por localização e período
- `GET /api/tempo/dataset-info` - Informações detalhadas do dataset TEMPO
- `GET /api/tempo/example-data` - Dados de exemplo para Nova York
- `GET /api/tempo/example-locations` - Localizações de exemplo para testes

#### 🏥 Health Check
```
GET /api/nasa-earthdata/health
```
Verifica o status da conexão com a NASA Earthdata API.

#### 📊 Dados M2IMNPASM
```
GET /api/nasa-earthdata/m2imnpasm
```
**Parâmetros obrigatórios:**
- `latitude`: Latitude (-90 a 90)
- `longitude`: Longitude (-180 a 180)
- `startDate`: Data de início (ISO 8601: YYYY-MM-DD)
- `endDate`: Data de fim (ISO 8601: YYYY-MM-DD)

**Parâmetros opcionais:**
- `variables`: Lista de variáveis separadas por vírgula
- `format`: Formato de resposta (json, csv, geojson)

**Exemplo:**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:3001/api/nasa-earthdata/m2imnpasm?latitude=-23.5505&longitude=-46.6333&startDate=2024-01-01&endDate=2024-01-02&variables=T2M,QV2M,PS"
```

#### 📋 Variáveis Disponíveis
```
GET /api/nasa-earthdata/m2imnpasm/variables
```
Lista todas as variáveis M2IMNPASM disponíveis com descrições e unidades.

#### 🗂️ Catálogo de Produtos
```
GET /api/nasa-earthdata/products
GET /api/nasa-earthdata/products/{conceptId}
```
Lista produtos disponíveis e obtém informações detalhadas de produtos específicos.

#### 📈 Estatísticas de Uso
```
GET /api/nasa-earthdata/stats
```
Fornece estatísticas de uso da API (requer autenticação).

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js 18+
- MongoDB
- Conta NASA Earthdata Login

### 1. Instalação das Dependências
```bash
npm install
```

### 2. Configuração das Variáveis de Ambiente
Copie o arquivo `.env.example` para `.env` e configure:

```env
# NASA Earthdata
NASA_EARTHDATA_USERNAME=seu_username
NASA_EARTHDATA_PASSWORD=sua_senha
NASA_EARTHDATA_TOKEN=seu_token_opcional
NASA_EARTHDATA_BASE_URL=https://cmr.earthdata.nasa.gov
NASA_EARTHDATA_SEARCH_URL=https://cmr.earthdata.nasa.gov/search

# Servidor
PORT=3001
NODE_ENV=development

# JWT
JWT_SECRET=sua_chave_secreta_jwt

# MongoDB
MONGODB_URI=mongodb://localhost:27017/air_sentinel

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
TEMPO_RATE_LIMIT_MAX=50

# CORS
CORS_ORIGIN=http://localhost:5173
```

### 3. Executar o Servidor
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## 🧪 Testes

### Executar Testes
```bash
# Todos os testes
npm test

# Testes com cobertura
npm run test:coverage

# Testes em modo watch
npm run test:watch
```

### Testar Endpoints

#### NASA Earthdata (MERRA-2)
```bash
# Health check
curl http://localhost:3001/api/nasa/health

# Dados atmosféricos
curl "http://localhost:3001/api/nasa/data?lat=40.7128&lon=-74.0060&startDate=2024-01-01&endDate=2024-01-02"
```

#### TEMPO NO2 (Qualidade do Ar)
```bash
# Health check TEMPO
curl http://localhost:3001/api/tempo/health

# Dados NO2 para Nova York
curl "http://localhost:3001/api/tempo/no2?lat=40.7128&lon=-74.0060&startDate=2024-01-01&endDate=2024-01-02"

# Informações do dataset
curl http://localhost:3001/api/tempo/dataset-info

# Dados de exemplo
curl http://localhost:3001/api/tempo/example-data

# Localizações de exemplo
curl http://localhost:3001/api/tempo/example-locations
```

## 📚 Documentação da API

### Swagger UI
Acesse a documentação interativa em: `http://localhost:3001/api-docs`

### Endpoints Disponíveis

#### NASA Earthdata (MERRA-2)
- **Base URL**: `/api/nasa`
- **Autenticação**: Credenciais NASA Earthdata via variáveis de ambiente
- **Rate Limiting**: 100 requisições por 15 minutos

#### TEMPO NO2 (Qualidade do Ar)
- **Base URL**: `/api/tempo`
- **Autenticação**: Credenciais NASA Earthdata via variáveis de ambiente
- **Rate Limiting**: 50 requisições por 15 minutos para `/no2`, 100 para outros endpoints
- **Formato de Dados**: NetCDF processado com análise de qualidade

### Estrutura de Resposta

#### Dados NASA (MERRA-2)
```json
{
  "success": true,
  "data": {
    "location": { "lat": 40.7128, "lon": -74.0060 },
    "timeRange": { "start": "2024-01-01", "end": "2024-01-02" },
    "variables": ["T2M", "PS", "QV2M"],
    "granules": [...]
  }
}
```

#### Dados TEMPO NO2
```json
{
  "success": true,
  "data": {
    "location": { "lat": 40.7128, "lon": -74.0060, "description": "Nova York, NY" },
    "timeRange": { "start": "2024-01-01", "end": "2024-01-02" },
    "no2Data": {
      "values": [15.2, 18.7, 22.1],
      "units": "molecules/cm²",
      "quality": "good",
      "statistics": { "mean": 18.67, "min": 15.2, "max": 22.1 }
    },
    "metadata": { "resolution": "2.1km x 4.4km", "instrument": "TEMPO" }
  }
}
```

Ou acesse a especificação OpenAPI em JSON:

```
http://localhost:3001/api-docs.json
```

## 🔐 Autenticação

### JWT Token
A maioria dos endpoints requer autenticação via JWT token:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3001/api/nasa-earthdata/m2imnpasm
```

### NASA Earthdata Login
Para acessar dados da NASA, você precisa:

1. Criar uma conta em [NASA Earthdata Login](https://urs.earthdata.nasa.gov/)
2. Configurar as credenciais no arquivo `.env`
3. Opcionalmente, gerar um token de aplicação para melhor performance

## 📊 Variáveis M2IMNPASM Disponíveis

| Variável | Descrição | Unidade |
|----------|-----------|---------|
| T2M | Temperatura a 2m | K |
| QV2M | Umidade específica a 2m | kg/kg |
| PS | Pressão superficial | Pa |
| SLP | Pressão ao nível do mar | Pa |
| U10M | Vento zonal a 10m | m/s |
| V10M | Vento meridional a 10m | m/s |
| PRECTOT | Precipitação total | kg/m²/s |
| SWGDN | Radiação solar descendente | W/m² |
| LWGAB | Radiação infravermelha absorvida | W/m² |

## 🚦 Rate Limiting

- **Geral**: 100 requisições por 15 minutos por IP
- **NASA Earthdata**: 100 requisições por hora por IP
- **NASA Earthdata API**: 1.000 requisições por hora (limite da NASA)

## 🔧 Estrutura do Projeto

```
hacketon-api/
├── src/
│   ├── config/
│   │   ├── database.js          # Configuração MongoDB
│   │   └── swagger.js           # Configuração Swagger
│   ├── controllers/
│   │   ├── nasaEarthdataController.js
│   │   └── tempoController.js   # Controller para endpoints TEMPO NO2
│   ├── middleware/
│   │   ├── auth.js              # Middleware de autenticação
│   │   └── errorHandler.js      # Tratamento de erros
│   ├── routes/
│   │   ├── nasaEarthdataRoutes.js
│   │   └── tempoRoutes.js       # Rotas da API TEMPO
│   ├── services/
│   │   ├── nasaEarthdataService.js
│   │   ├── tempoService.js      # Integração com dados TEMPO NO2
│   │   └── netcdfProcessor.js   # Processamento de dados NetCDF
│   ├── tests/
│   │   ├── nasaEarthdata.test.js
│   │   └── setup.js
│   └── utils/
│       └── nasaDataProcessor.js
├── .env.example
├── .env.test
├── jest.config.js
├── package.json
└── server.js
```

## 🐛 Troubleshooting

### Erro de Autenticação NASA
```json
{
  "success": false,
  "message": "NASA Earthdata API está unhealthy",
  "data": {
    "status": "unhealthy",
    "error": "Falha na autenticação com NASA Earthdata"
  }
}
```
**Solução**: Verifique suas credenciais NASA Earthdata no arquivo `.env`.

### Rate Limit Excedido
```json
{
  "success": false,
  "message": "Muitas requisições para NASA Earthdata API. Tente novamente em 1 hora."
}
```
**Solução**: Aguarde o período especificado ou implemente cache para reduzir requisições.

### Dados Não Encontrados
```json
{
  "success": false,
  "message": "Nenhum dado encontrado para os parâmetros especificados"
}
```
**Solução**: Verifique se as coordenadas e datas estão corretas e dentro do período disponível.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🔗 Links Úteis

### NASA Earthdata
- [NASA Earthdata Login](https://urs.earthdata.nasa.gov/)
- [MERRA-2 Documentation](https://gmao.gsfc.nasa.gov/reanalysis/MERRA-2/)
- [CMR API Documentation](https://cmr.earthdata.nasa.gov/search/site/docs/search/api.html)

### TEMPO NO2
- [TEMPO Mission Overview](https://tempo.si.edu/)
- [TEMPO NO2 L3 Dataset](https://disc.gsfc.nasa.gov/datasets/TEMPO_NO2_L3_V03/summary)
- [NASA Earthdata Cloud](https://www.earthdata.nasa.gov/cloud/)
- [NetCDF Documentation](https://www.unidata.ucar.edu/software/netcdf/)

### Desenvolvimento
- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/guide/)
- [Swagger/OpenAPI Specification](https://swagger.io/specification/)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)

## 📞 Suporte

Para suporte técnico ou dúvidas sobre a integração NASA Earthdata:

- Abra uma issue no GitHub
- Consulte a documentação da NASA Earthdata
- Verifique os logs do servidor para detalhes de erro

---

**Air Sentinel** - Monitoramento inteligente da qualidade do ar com dados da NASA 🛰️