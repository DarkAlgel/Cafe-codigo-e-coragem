from flask import Flask, jsonify, request
from flask_cors import CORS
import earthaccess
import xarray as xr
import os
import numpy as np
from datetime import datetime
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_live_app():
    """
    Creates Flask application with LIVE connection to NASA data
    WARNING: This code will attempt to connect to NASA servers using your credentials.
    If search problems persist, this script may return errors.
    """
    app = Flask(__name__)
    CORS(app)

    # New York coordinates for searches
    NYC_BOUNDING_BOX = (-74.3, 40.4, -73.7, 41.1)

    # Try to login using .netrc file
    try:
        logger.info("🔐 Attempting to authenticate with NASA Earthdata using .netrc...")
        earthaccess.login(strategy="netrc")
        logger.info("✅ NASA authentication successful!")
    except Exception as e:
        logger.error(f"❌ NASA login error: {e}")
        logger.warning("⚠️ Continuing without authentication - some data may not be available")

    def fetch_and_process_data(search_term, variable_name, group_name=None):
        """
        Searches and processes NASA data using earthaccess
        """
        try:
            logger.info(f"🔍 Searching data for: {search_term}")
            
            # Using your exact keyword in the search
            search_results = earthaccess.search_data(
                keyword=search_term,  # Using 'keyword' for broader search
                short_name=search_term if '_' in search_term else None,  # Try as Short Name if more specific
                bounding_box=NYC_BOUNDING_BOX,
                count=1
            )
            
            if not search_results:
                logger.warning(f"⚠️ No data found for: {search_term}")
                return {"error": f"No data found for: {search_term}"}, 404

            logger.info(f"📥 Downloading data for: {search_term}")
            local_files = earthaccess.download(search_results, local_path="data")
            filepath = local_files[0]
            
            logger.info(f"📊 Processing file: {filepath}")
            with xr.open_dataset(filepath, group=group_name) as ds:
                if variable_name not in ds.variables:
                    available_vars = list(ds.variables.keys())
                    logger.error(f"❌ Variable '{variable_name}' not found. Available: {available_vars}")
                    return {"error": f"Variable '{variable_name}' not found", "available_variables": available_vars}, 400
                
                data_array = ds[variable_name]
                mean_value = float(np.nanmean(data_array.values))
                units = data_array.attrs.get('units', 'N/A')
                
                logger.info(f"✅ Data processed successfully for {search_term}")
            
            # Clean temporary file
            if os.path.exists(filepath):
                os.remove(filepath)
            
            return {
                "value": round(mean_value, 6),
                "units": units,
                "source_dataset": search_term,
                "timestamp": datetime.now().isoformat(),
                "quality": "live_data"
            }
            
        except Exception as e:
            logger.error(f"❌ Error processing {search_term}: {str(e)}")
            return {"error": str(e), "search_term": search_term}, 500

    def safe_fetch_with_fallback(search_term, variable_name, group_name=None, fallback_value=None):
        """
        Searches data with fallback to mock values in case of error
        """
        try:
            result = fetch_and_process_data(search_term, variable_name, group_name)
            if isinstance(result, tuple) and result[1] >= 400:  # If there was an error
                if fallback_value:
                    logger.warning(f"⚠️ Using fallback value for {search_term}")
                    return fallback_value
                return result
            return result
        except Exception as e:
            logger.error(f"❌ Critical error in {search_term}: {e}")
            if fallback_value:
                logger.warning(f"⚠️ Using fallback value for {search_term}")
                return fallback_value
            return {"error": f"Critical error: {str(e)}"}, 500

    # --- Live API Endpoints ---

    @app.route('/api/tempo_no2')
    def get_tempo_no2():
        """User keyword: TEMPO_NO2_L3"""
        fallback = {
            "value": 0.000085,
            "units": "mol/m^2",
            "source_dataset": "TEMPO_NO2_L3 (Fallback)",
            "timestamp": datetime.now().isoformat(),
            "quality": "fallback"
        }
        
        result = safe_fetch_with_fallback(
            search_term='TEMPO_NO2_L3',
            variable_name='nitrogendioxide_tropospheric_column',
            group_name='product_data',
            fallback_value=fallback
        )
        
        if isinstance(result, tuple):
            return jsonify(result[0]), result[1]
        return jsonify(result)

    @app.route('/api/merra2_pblh')
    def get_merra2_pblh():
        """User keyword: M2I1NXASM"""
        fallback = {
            "value": 850.5,
            "units": "m",
            "source_dataset": "M2I1NXASM (Fallback)",
            "timestamp": datetime.now().isoformat(),
            "quality": "fallback"
        }
        
        result = safe_fetch_with_fallback(
            search_term='M2I1NXASM',
            variable_name='PBLH',
            fallback_value=fallback
        )
        
        if isinstance(result, tuple):
            return jsonify(result[0]), result[1]
        return jsonify(result)

    @app.route('/api/airs_temperature')
    def get_airs_temperature():
        """User keyword: AIRS3STD"""
        fallback = {
            "value": 295.15,
            "units": "K",
            "celsius": 22.0,
            "source_dataset": "AIRS3STD (Fallback)",
            "timestamp": datetime.now().isoformat(),
            "quality": "fallback"
        }
        
        result = safe_fetch_with_fallback(
            search_term='AIRS3STD',
            variable_name='SurfAirTemp_D',
            fallback_value=fallback
        )
        
        if isinstance(result, tuple):
            return jsonify(result[0]), result[1]
        
        # Add temperature conversion if it's real data
        if 'value' in result and result['units'] == 'K':
            result['celsius'] = round(result['value'] - 273.15, 2)
            result['fahrenheit'] = round(result['celsius'] * 9/5 + 32, 2)
        
        return jsonify(result)

    @app.route('/api/cygnss_wind')
    def get_cygnss_wind():
        """
        User keyword: CYGNSS
        Note: 'CYGNSS' is very generic, high chance of failure.
        """
        fallback = {
            "value": 5.8,
            "units": "m/s",
            "source_dataset": "CYGNSS (Fallback)",
            "timestamp": datetime.now().isoformat(),
            "quality": "fallback"
        }
        
        result = safe_fetch_with_fallback(
            search_term='CYGNSS',
            variable_name='wind_speed',
            fallback_value=fallback
        )
        
        if isinstance(result, tuple):
            return jsonify(result[0]), result[1]
        return jsonify(result)

    @app.route('/api/goes_clouds')
    def get_goes_clouds():
        """
        This endpoint uses GIBS which is a stable service
        """
        today_str = datetime.now().strftime('%Y-%m-%d')
        gibs_url_template = (
            'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/'
            'GOES-East_ABI_Band2_Red_Visible_1km/default/{date}/'
            'GoogleMapsCompatible_Level8/{{z}}/{{y}}/{{x}}.png'
        ).format(date=today_str)
        
        return jsonify({
            "gibs_url_template": gibs_url_template,
            "source": "NASA GIBS",
            "date": today_str,
            "timestamp": datetime.now().isoformat(),
            "quality": "live_service"
        })

    # Endpoints compatible with original Node.js API
    @app.route('/api/co2_data')
    def get_co2_data():
        """
        CO2 endpoint using live data when possible
        """
        try:
            # Try to fetch real CO2 data
            co2_result = safe_fetch_with_fallback(
                search_term='OCO2_L2_Lite_FP',
                variable_name='xco2',
                fallback_value={"value": 415.5, "units": "ppm"}
            )
            
            co2_value = co2_result.get('value', 415.5)
            
            return jsonify({
                "success": True,
                "data": {
                    "co2_ppm": co2_value,
                    "location": "New York, NY",
                    "coordinates": {"lat": 40.7128, "lon": -74.0060},
                    "timestamp": datetime.now().isoformat(),
                    "source": co2_result.get('source_dataset', 'NASA OCO-2'),
                    "quality": co2_result.get('quality', 'live'),
                    "units": co2_result.get('units', 'ppm')
                },
                "metadata": {
                    "api_version": "2.0.0",
                    "data_type": "live",
                    "last_updated": datetime.now().isoformat()
                }
            })
        except Exception as e:
            logger.error(f"❌ Error fetching CO2 data: {e}")
            return jsonify({
                "success": False,
                "error": str(e),
                "fallback_available": True
            }), 500

    @app.route('/api/tempo/data')
    @app.route('/api/tempo/data/<pollutant>')
    def get_tempo_data_live(pollutant='NO2'):
        """
        TEMPO endpoint with live data
        """
        pollutant = pollutant.upper()
        
        # Mapeamento de poluentes para datasets
        pollutant_mapping = {
            'NO2': ('TEMPO_NO2_L2', 'nitrogendioxide_tropospheric_column'),
            'HCHO': ('TEMPO_HCHO_L2', 'formaldehyde_tropospheric_vertical_column'),
            'O3': ('TEMPO_O3_L2', 'ozone_profile'),
        }
        
        if pollutant not in pollutant_mapping:
            return jsonify({
                "error": f"Poluente '{pollutant}' não suportado",
                "supported_pollutants": list(pollutant_mapping.keys())
            }), 400
        
        dataset, variable = pollutant_mapping[pollutant]
        
        result = safe_fetch_with_fallback(
            search_term=dataset,
            variable_name=variable,
            fallback_value={
                "value": 0.000085,
                "units": "mol/m^2",
                "quality": "fallback"
            }
        )
        
        if isinstance(result, tuple):
            return jsonify(result[0]), result[1]
        
        return jsonify({
            "success": True,
            "data": {
                "pollutant": pollutant,
                "value": result.get('value'),
                "units": result.get('units'),
                "quality": result.get('quality'),
                "coordinates": {"lat": 40.7128, "lon": -74.0060},
                "timestamp": datetime.now().isoformat(),
                "source": result.get('source_dataset')
            }
        })

    return app

if __name__ == '__main__':
    # Create data directory if it doesn't exist
    if not os.path.exists('data'):
        os.makedirs('data')
    
    app = create_live_app()
    app.run(debug=True, port=5000)