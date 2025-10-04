# 🐍 Instalação do Python no Windows

O Python não foi encontrado no seu sistema. Siga estas instruções para instalar:

## Opção 1: Microsoft Store (Recomendado)
1. Abra a Microsoft Store
2. Pesquise por "Python 3.11" ou "Python 3.12"
3. Clique em "Instalar"
4. Aguarde a instalação completar

## Opção 2: Site Oficial
1. Acesse: https://www.python.org/downloads/
2. Baixe a versão mais recente do Python 3.x
3. Execute o instalador
4. **IMPORTANTE**: Marque a opção "Add Python to PATH"
5. Clique em "Install Now"

## Opção 3: Chocolatey (se disponível)
```powershell
choco install python
```

## Verificação da Instalação
Após instalar, abra um novo terminal e execute:
```bash
python --version
# ou
py --version
```

## Instalação das Dependências
Depois que o Python estiver instalado:
```bash
cd c:\Programs\Git\Cafe-codigo-e-coragem\hacketon-api-python
pip install -r requirements.txt
```

## Executar a API
```bash
python app.py
```

## Alternativa: Usar Docker (Avançado)
Se preferir, você pode usar Docker:
```bash
# Criar Dockerfile
# docker build -t hacketon-api-python .
# docker run -p 5000:5000 hacketon-api-python
```