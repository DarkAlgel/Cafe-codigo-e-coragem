from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import sys
from datetime import datetime
import logging

# Importar os módulos da API
from api_mock import create_mock_app
from api_live import create_live_app

# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_app(use_live_data=False):
    """
    Cria a aplicação Flask com opção de usar dados reais ou mock
    """
    app = Flask(__name__)
    
    # Configuração do CORS para permitir acesso do frontend
    CORS(app, origins=['http://localhost:3000', 'http://localhost:5173'])
    
    # Configurações da aplicação
    app.config['JSON_SORT_KEYS'] = False
    app.config['JSONIFY_PRETTYPRINT_REGULAR'] = True
    
    # Middleware para adicionar headers de resposta
    @app.after_request
    def after_request(response):
        response.headers['X-API-Version'] = '2.0.0'
        response.headers['X-Powered-By'] = 'Hacketon Python API'
        response.headers['Content-Type'] = 'application/json'
        return response
    
    # Rota raiz com informações da API
    @app.route('/')
    def index():
        return jsonify({
            "message": "Hacketon API Python - Dados da NASA para Qualidade do Ar",
            "version": "2.0.0",
            "mode": "live" if use_live_data else "mock",
            "endpoints": {
                "health": "/api/health",
                "co2_data": "/api/co2_data",
                "co2_info": "/api/co2_info", 
                "co2_stats": "/api/co2_stats",
                "tempo_no2": "/api/tempo_no2",
                "merra2_pblh": "/api/merra2_pblh",
                "airs_temperature": "/api/airs_temperature",
                "cygnss_wind": "/api/cygnss_wind",
                "goes_clouds": "/api/goes_clouds",
                "tempo_data": "/api/tempo/data",
                "earthdata_datasets": "/api/earthdata/datasets"
            },
            "documentation": "Migração da API Node.js para Python com suporte a dados NASA"
        })
    
    # Health check endpoint
    @app.route('/api/health')
    def health_check():
        return jsonify({
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "mode": "live" if use_live_data else "mock",
            "python_version": sys.version,
            "uptime": "API funcionando corretamente"
        })
    
    # Registrar blueprints baseado no modo
    if use_live_data:
        logger.info("🌐 Iniciando API com dados LIVE da NASA")
        live_app = create_live_app()
        # Registrar as rotas do app live
        for rule in live_app.url_map.iter_rules():
            if rule.endpoint != 'static':
                app.add_url_rule(
                    rule.rule, 
                    rule.endpoint, 
                    live_app.view_functions[rule.endpoint],
                    methods=rule.methods
                )
    else:
        logger.info("🎭 Iniciando API com dados MOCK (recomendado para desenvolvimento)")
        mock_app = create_mock_app()
        # Registrar as rotas do app mock
        for rule in mock_app.url_map.iter_rules():
            if rule.endpoint != 'static':
                app.add_url_rule(
                    rule.rule, 
                    rule.endpoint, 
                    mock_app.view_functions[rule.endpoint],
                    methods=rule.methods
                )
    
    # Handler para rotas não encontradas
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            "error": "Endpoint não encontrado",
            "message": "Verifique a documentação da API",
            "available_endpoints": list(app.url_map._rules_by_endpoint.keys())
        }), 404
    
    # Handler para erros internos
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            "error": "Erro interno do servidor",
            "message": "Tente novamente mais tarde ou use o modo mock"
        }), 500
    
    return app

if __name__ == '__main__':
    # Verificar se deve usar dados live ou mock
    use_live = os.getenv('USE_LIVE_DATA', 'false').lower() == 'true'
    
    # Criar a aplicação
    app = create_app(use_live_data=use_live)
    
    # Configurações do servidor
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'true').lower() == 'true'
    
    logger.info(f"🚀 Iniciando servidor na porta {port}")
    logger.info(f"🔧 Modo debug: {debug}")
    logger.info(f"📊 Usando dados: {'LIVE' if use_live else 'MOCK'}")
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug
    )