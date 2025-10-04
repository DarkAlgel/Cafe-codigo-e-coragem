# Hacketon API Python - NASA Data Integration

API Python migrada do Node.js para integração com dados da NASA, desenvolvida para o Space Apps Challenge.

## 🚀 Características

- **Dados Mock**: Funcionamento garantido com dados simulados realísticos
- **Dados Live**: Conexão real com APIs da NASA (quando disponível)
- **Compatibilidade**: Mantém compatibilidade com o frontend existente
- **Autenticação**: Suporte a credenciais NASA via arquivo .netrc
- **Fallback**: Sistema de fallback automático em caso de falha nos serviços NASA

## 📋 Pré-requisitos

- Python 3.8+
- pip (gerenciador de pacotes Python)

## 🛠️ Instalação

1. **Instalar dependências:**
```bash
pip install -r requirements.txt
```

2. **Configurar variáveis de ambiente:**
```bash
cp .env.example .env
# Edite o arquivo .env conforme necessário
```

3. **Configurar credenciais NASA (opcional):**
   - O arquivo `.netrc` já está configurado com suas credenciais
   - Para dados live, certifique-se de que o arquivo está no diretório correto

## 🚀 Execução

### Modo Mock (Recomendado para desenvolvimento)
```bash
python app.py
```

### Modo Live (Dados reais da NASA)
```bash
USE_LIVE_DATA=true python app.py
```

A API estará disponível em: `http://localhost:5000`

## 📡 Endpoints Disponíveis

### Endpoints Principais
- `GET /` - Informações da API
- `GET /api/health` - Status da API

### Dados NASA
- `GET /api/tempo_no2` - Dados de NO2 do TEMPO
- `GET /api/merra2_pblh` - Altura da camada limite (MERRA-2)
- `GET /api/airs_temperature` - Temperatura do AIRS
- `GET /api/cygnss_wind` - Velocidade do vento (CYGNSS)
- `GET /api/goes_clouds` - Imagens de nuvens (GOES)

### Compatibilidade com API Node.js
- `GET /api/co2_data` - Dados de CO2
- `GET /api/co2_info` - Informações sobre CO2
- `GET /api/co2_stats` - Estatísticas de CO2
- `GET /api/tempo/data` - Dados TEMPO genéricos
- `GET /api/tempo/data/<pollutant>` - Dados específicos por poluente
- `GET /api/earthdata/datasets` - Lista de datasets disponíveis

## 🔧 Configuração

### Variáveis de Ambiente

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `PORT` | 5000 | Porta do servidor |
| `FLASK_DEBUG` | true | Modo debug |
| `USE_LIVE_DATA` | false | Usar dados live (true) ou mock (false) |

### Arquivo .netrc

O arquivo `.netrc` contém as credenciais para acesso à NASA:
```
machine urs.earthdata.nasa.gov login seu_usuario password sua_senha
```

## 🎯 Modo de Operação

### Dados Mock (Padrão)
- ✅ Funcionamento 100% garantido
- ✅ Dados realísticos baseados em valores reais
- ✅ Variações dinâmicas para simular dados ao vivo
- ✅ Ideal para desenvolvimento e demonstrações

### Dados Live
- 🌐 Conexão real com servidores NASA
- ⚠️ Dependente da disponibilidade dos serviços
- 🔄 Fallback automático para dados mock em caso de falha
- 🔐 Requer autenticação NASA válida

## 🔄 Migração do Node.js

Esta API mantém compatibilidade total com o frontend existente:

1. **Mesmos endpoints**: Todos os endpoints da API Node.js foram replicados
2. **Mesmo formato de resposta**: JSON compatível
3. **Mesmas funcionalidades**: CO2, TEMPO, MERRA-2, etc.
4. **CORS configurado**: Para `localhost:3000` e `localhost:5173`

## 🚨 Troubleshooting

### Erro de Autenticação NASA
```bash
# Verificar se o arquivo .netrc está correto
cat .netrc

# Testar com dados mock
USE_LIVE_DATA=false python app.py
```

### Dependências não encontradas
```bash
# Reinstalar dependências
pip install -r requirements.txt --upgrade
```

### Porta em uso
```bash
# Usar porta diferente
PORT=5001 python app.py
```

## 📊 Monitoramento

A API inclui logs detalhados:
- 🔐 Status de autenticação
- 🔍 Buscas de dados
- ⚠️ Fallbacks automáticos
- ❌ Erros e exceções

## 🎯 Recomendações

1. **Para desenvolvimento**: Use modo mock (`USE_LIVE_DATA=false`)
2. **Para demonstrações**: Use modo mock para garantir funcionamento
3. **Para produção**: Use modo live com fallback habilitado
4. **Para testes**: Sempre teste ambos os modos

## 🔗 Integração com Frontend

O frontend React deve apontar para:
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

Todos os endpoints existentes continuam funcionando sem modificações no código do frontend.