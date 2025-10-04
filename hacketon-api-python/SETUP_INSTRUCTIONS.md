# Instruções de Configuração - API Python

## 1. Instalação do Python

### Opção 1: Microsoft Store (Recomendado)
1. Abra a Microsoft Store
2. Pesquise por "Python 3.11" ou "Python 3.12"
3. Clique em "Instalar"
4. Aguarde a instalação concluir

### Opção 2: Site Oficial
1. Acesse https://www.python.org/downloads/
2. Baixe a versão mais recente do Python 3.11 ou 3.12
3. **IMPORTANTE**: Durante a instalação, marque a opção "Add Python to PATH"
4. Execute a instalação como administrador

### Opção 3: Chocolatey (se disponível)
```powershell
choco install python
```

## 2. Verificação da Instalação

Após instalar, abra um novo terminal PowerShell e execute:
```powershell
python --version
# ou
py --version
```

## 3. Instalação das Dependências

No diretório da API Python, execute:
```powershell
pip install -r requirements.txt
```

## 4. Configuração do Ambiente

1. Copie o arquivo `.env.example` para `.env`:
```powershell
Copy-Item .env.example .env
```

2. Edite o arquivo `.env` conforme necessário:
   - `USE_LIVE_DATA=false` para dados mock
   - `USE_LIVE_DATA=true` para dados reais da NASA

## 5. Execução da API

### Modo Mock (Recomendado para testes iniciais)
```powershell
$env:USE_LIVE_DATA="false"
python app.py
```

### Modo Live (Dados reais da NASA)
```powershell
$env:USE_LIVE_DATA="true"
python app.py
```

## 6. Teste da API

A API estará disponível em: http://localhost:5000

Endpoints principais:
- `GET /` - Informações da API
- `GET /api/health` - Status da API
- `GET /api/co2_data` - Dados de CO2
- `GET /api/tempo/data/NO2` - Dados TEMPO NO2

## 7. Integração com Frontend

O frontend já foi atualizado para usar a porta 5000. Certifique-se de que:
1. A API Python está rodando na porta 5000
2. O frontend está rodando na porta usual
3. Não há conflitos de CORS

## Troubleshooting

### Erro "Python não foi encontrado"
- Reinstale o Python marcando "Add to PATH"
- Reinicie o terminal após a instalação
- Use `py` em vez de `python`

### Erro de dependências
```powershell
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```

### Erro de CORS
- Verifique se o Flask-CORS está instalado
- Confirme que a API está rodando na porta correta

### Problemas com .netrc
- Verifique se o arquivo `.netrc` existe no diretório da API
- Confirme as credenciais NASA Earthdata