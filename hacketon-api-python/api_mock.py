from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime
import random
import math

def create_mock_app():
    """
    Cria a aplicação Flask com dados de exemplo (mock) para garantir funcionamento
    Baseado no arquivo Doc API.txt fornecido
    """
    app = Flask(__name__)
    CORS(app)

    # ==============================================================================
    # API COM DADOS DE EXEMPLO (MOCK) PARA O HACKATHON
    # Usa as palavras-chave que você pediu. Funciona 100% do tempo.
    # ==============================================================================

    # --- Nossos dados de exemplo realistas, baseados nas suas palavras-chave ---
    MOCK_DATA = {
        "TEMPO_NO2_L3": {
            "value": 0.000085,
            "units": "mol/m^2",
            "source_dataset": "TEMPO_NO2_L3 (Simulado)",
            "quality": "good",
            "timestamp": datetime.now().isoformat()
        },
        "M2I1NXASM": {
            "value": 850.5,
            "units": "m",
            "source_dataset": "M2I1NXASM / MERRA-2 PBLH (Simulado)",
            "quality": "excellent",
            "timestamp": datetime.now().isoformat()
        },
        "AIRS3STD": {
            "value": 295.15,  # Em Kelvin (equivale a 22°C)
            "units": "K",
            "source_dataset": "AIRS3STD / AIRS Temperatura (Simulado)",
            "celsius": 22.0,
            "quality": "good",
            "timestamp": datetime.now().isoformat()
        },
        "CYGNSS": {
            "value": 5.8,
            "units": "m/s",
            "source_dataset": "CYGNSS / Velocidade do Vento (Simulado)",
            "quality": "excellent",
            "timestamp": datetime.now().isoformat()
        }
    }

    def generate_realistic_variation(base_value, variation_percent=0.1):
        """Gera variação realística nos dados"""
        variation = base_value * variation_percent * (random.random() - 0.5) * 2
        return round(base_value + variation, 6)

    def get_co2_mock_data():
        """Gera dados mock de CO2 compatíveis com a API Node.js original"""
        base_co2 = 415.5  # ppm base realística
        current_co2 = generate_realistic_variation(base_co2, 0.02)
        
        return {
            "success": True,
            "data": {
                "co2_ppm": current_co2,
                "location": "Nova Iorque, NY",
                "coordinates": {"lat": 40.7128, "lon": -74.0060},
                "timestamp": datetime.now().isoformat(),
                "source": "NASA OCO-2 (Simulado)",
                "quality": "good" if current_co2 < 420 else "moderate",
                "trend": "stable",
                "historical_average": 410.2,
                "interpretation": get_co2_interpretation(current_co2),
                "recommendations": get_co2_recommendations(current_co2)
            },
            "metadata": {
                "api_version": "2.0.0",
                "data_type": "mock",
                "last_updated": datetime.now().isoformat()
            }
        }

    def get_co2_interpretation(co2_value):
        """Interpretação dos níveis de CO2"""
        if co2_value < 400:
            return {
                "level": "Excelente",
                "description": "Níveis de CO2 muito baixos, qualidade do ar excelente",
                "color": "#00ff00"
            }
        elif co2_value < 420:
            return {
                "level": "Bom", 
                "description": "Níveis de CO2 normais para áreas urbanas",
                "color": "#90EE90"
            }
        elif co2_value < 450:
            return {
                "level": "Moderado",
                "description": "Níveis de CO2 elevados, atenção recomendada",
                "color": "#FFD700"
            }
        else:
            return {
                "level": "Alto",
                "description": "Níveis de CO2 muito altos, cuidado necessário",
                "color": "#FF6347"
            }

    def get_co2_recommendations(co2_value):
        """Recomendações baseadas nos níveis de CO2"""
        if co2_value < 420:
            return [
                "Continue monitorando os níveis",
                "Mantenha atividades ao ar livre normalmente",
                "Promova o uso de transporte sustentável"
            ]
        else:
            return [
                "Evite atividades intensas ao ar livre",
                "Use transporte público ou bicicleta",
                "Considere usar purificadores de ar em ambientes fechados",
                "Plante mais árvores na região"
            ]

    # --- Endpoints da API Mock ---

    @app.route('/api/tempo_no2')
    def get_tempo_no2():
        data = MOCK_DATA["TEMPO_NO2_L3"].copy()
        data["value"] = generate_realistic_variation(data["value"], 0.15)
        data["timestamp"] = datetime.now().isoformat()
        return jsonify(data)

    @app.route('/api/merra2_pblh')
    def get_merra2_pblh():
        data = MOCK_DATA["M2I1NXASM"].copy()
        data["value"] = generate_realistic_variation(data["value"], 0.1)
        data["timestamp"] = datetime.now().isoformat()
        return jsonify(data)

    @app.route('/api/airs_temperature')
    def get_airs_temperature():
        data = MOCK_DATA["AIRS3STD"].copy()
        kelvin_temp = generate_realistic_variation(data["value"], 0.05)
        celsius_temp = round(kelvin_temp - 273.15, 2)
        
        data["value"] = kelvin_temp
        data["celsius"] = celsius_temp
        data["fahrenheit"] = round(celsius_temp * 9/5 + 32, 2)
        data["timestamp"] = datetime.now().isoformat()
        return jsonify(data)

    @app.route('/api/cygnss_wind')
    def get_cygnss_wind():
        data = MOCK_DATA["CYGNSS"].copy()
        data["value"] = generate_realistic_variation(data["value"], 0.2)
        data["timestamp"] = datetime.now().isoformat()
        return jsonify(data)

    @app.route('/api/goes_clouds')
    def get_goes_clouds():
        today_str = datetime.now().strftime('%Y-%m-%d')
        gibs_url_template = (
            'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/'
            'GOES-East_ABI_Band2_Red_Visible_1km/default/{date}/'
            'GoogleMapsCompatible_Level8/{{z}}/{{y}}/{{x}}.png'
        ).format(date=today_str)
        
        response = {
            "gibs_url_template": gibs_url_template,
            "source": "NASA GIBS",
            "date": today_str,
            "cloud_coverage": round(random.uniform(10, 80), 1),
            "timestamp": datetime.now().isoformat()
        }
        return jsonify(response)

    # Endpoints compatíveis com a API Node.js original
    @app.route('/api/co2_data')
    def get_co2_data():
        return jsonify(get_co2_mock_data())

    @app.route('/api/co2_info')
    def get_co2_info():
        return jsonify({
            "info": {
                "about": "Dados de CO2 atmosférico simulados",
                "units": "ppm (partes por milhão)",
                "normal_range": "350-420 ppm",
                "current_global_average": "415 ppm",
                "source": "NASA OCO-2 Satellite (Simulado)"
            },
            "interpretation_guide": {
                "excellent": "< 400 ppm",
                "good": "400-420 ppm", 
                "moderate": "420-450 ppm",
                "poor": "> 450 ppm"
            }
        })

    @app.route('/api/co2_stats')
    def get_co2_stats():
        return jsonify({
            "statistics": {
                "daily_average": generate_realistic_variation(415.5, 0.02),
                "weekly_average": generate_realistic_variation(414.8, 0.03),
                "monthly_average": generate_realistic_variation(414.2, 0.05),
                "yearly_trend": "+2.3 ppm/year",
                "last_updated": datetime.now().isoformat()
            },
            "regional_data": {
                "new_york": generate_realistic_variation(418.2, 0.03),
                "global_average": 415.5,
                "rural_average": 412.1,
                "urban_average": 421.3
            }
        })

    # Endpoints TEMPO compatíveis
    @app.route('/api/tempo/data')
    @app.route('/api/tempo/data/<pollutant>')
    def get_tempo_data(pollutant='NO2'):
        pollutant = pollutant.upper()
        
        mock_values = {
            'NO2': generate_realistic_variation(0.000085, 0.2),
            'HCHO': generate_realistic_variation(0.000045, 0.25),
            'O3': generate_realistic_variation(0.000125, 0.15),
            'AI': generate_realistic_variation(0.8, 0.3),
            'PM': generate_realistic_variation(15.5, 0.4)
        }
        
        return jsonify({
            "success": True,
            "data": {
                "pollutant": pollutant,
                "value": mock_values.get(pollutant, 0.0001),
                "units": "mol/m^2" if pollutant in ['NO2', 'HCHO', 'O3'] else "unitless" if pollutant == 'AI' else "μg/m³",
                "quality": random.choice(["excellent", "good", "moderate", "poor"]),
                "coordinates": {"lat": 40.7128, "lon": -74.0060},
                "timestamp": datetime.now().isoformat(),
                "source": f"TEMPO {pollutant} (Simulado)"
            }
        })

    # Endpoints Earthdata compatíveis
    @app.route('/api/earthdata/datasets')
    def get_earthdata_datasets():
        return jsonify({
            "success": True,
            "data": {
                "atmospheric": [
                    {
                        "id": "TEMPO_NO2_L2",
                        "name": "TEMPO Nitrogen Dioxide (NO2)",
                        "description": "Tropospheric NO2 vertical column density from TEMPO",
                        "temporal_coverage": "2023-present",
                        "spatial_resolution": "2.1 x 4.4 km",
                        "status": "active"
                    },
                    {
                        "id": "M2I1NXASM",
                        "name": "MERRA-2 Planetary Boundary Layer Height",
                        "description": "Atmospheric boundary layer height data",
                        "temporal_coverage": "1980-present",
                        "spatial_resolution": "0.5° x 0.625°",
                        "status": "active"
                    }
                ],
                "total_count": 2,
                "mode": "mock"
            }
        })

    return app

if __name__ == '__main__':
    app = create_mock_app()
    app.run(debug=True, port=5000)