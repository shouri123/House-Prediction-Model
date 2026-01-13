import os
import pandas as pd
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Configuration
# Configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(BASE_DIR)
MODEL_PATH = os.path.join(ROOT_DIR, 'model.pkl')
REQUIRED_COLUMNS = [
    'longitude', 'latitude', 'housing_median_age', 'total_rooms',
    'total_bedrooms', 'population', 'households', 'median_income',
    'ocean_proximity'
]

# Global model variable
model = None

def load_model():
    """Loads the trained model from disk."""
    global model
    try:
        if not os.path.exists(MODEL_PATH):
            logger.error(f"Model file not found at {MODEL_PATH}")
            return False
        
        model = joblib.load(MODEL_PATH)
        
        logger.info("Model loaded successfully.")
        return True
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        return False

# Load model on startup
load_model()

def validate_input(df):
    """Validates that the input DataFrame contains all required columns."""
    missing_cols = [col for col in REQUIRED_COLUMNS if col not in df.columns]
    if missing_cols:
        return False, f"Missing required columns: {', '.join(missing_cols)}"
    return True, ""

def generate_graph_data(df):
    """Generates structured data for frontend visualization."""
    try:
        # Example: Histogram of predicted prices
        # Create bins for the histogram
        prices = df['predicted_price']
        hist, bin_edges = np.histogram(prices, bins=20)
        
        graph_data = {
            'histogram': {
                'labels': [f"{int(bin_edges[i])}-{int(bin_edges[i+1])}" for i in range(len(bin_edges)-1)],
                'values': hist.tolist()
            },
            'scatter': {
                # Sample scatter plot data (e.g., Median Income vs Predicted Price)
                'x': df['median_income'].tolist(),
                'y': df['predicted_price'].tolist(),
                'x_label': 'Median Income',
                'y_label': 'Predicted Price'
            },
            'summary_stats': {
                'min_price': float(prices.min()),
                'max_price': float(prices.max()),
                'avg_price': float(prices.mean()),
                'median_price': float(prices.median())
            }
        }
        return graph_data
    except Exception as e:
        logger.warning(f"Failed to generate graph data: {e}")
        return {}

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    status = 'healthy' if model is not None else 'unhealthy'
    return jsonify({'status': status, 'model_loaded': model is not None})

@app.route('/', methods=['GET'])
def index():
    """Root endpoint to guide users."""
    return jsonify({
        'message': 'This is the Backend API Server.',
        'frontend_url': 'http://localhost:5173',
        'instruction': 'Please visit the frontend URL to use the application.'
    })

@app.route('/predict', methods=['POST'])
def predict():
    """
    Endpoint to predict house prices from an uploaded file.
    Accepts: CSV or JSON file with required columns.
    Returns: JSON with original data + predictions + graph data.
    """
    if model is None:
        # Try to reload
        if not load_model():
            return jsonify({'error': 'Model is not available. Please contact support.'}), 503

    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    try:
        # Read file into DataFrame
        if file.filename.endswith('.csv'):
            df = pd.read_csv(file)
        elif file.filename.endswith('.json'):
            df = pd.read_json(file)
        else:
            return jsonify({'error': 'Invalid file format. Please upload CSV or JSON.'}), 400

        # Validate columns
        is_valid, error_msg = validate_input(df)
        if not is_valid:
            return jsonify({'error': error_msg}), 400

        # Feature Engineering (must match verify_model.py)
        if 'rooms_per_household' not in df.columns:
            df['rooms_per_household'] = df['total_rooms'] / df['households']
        if 'bedrooms_per_room' not in df.columns:
            df['bedrooms_per_room'] = df['total_bedrooms'] / df['total_rooms']
        if 'population_per_household' not in df.columns:
            df['population_per_household'] = df['population'] / df['households']

        # Predict
        predictions = model.predict(df)
        
        # Append predictions
        df['predicted_price'] = predictions
        
        # Generate graph data
        graph_data = generate_graph_data(df)
        
        # Prepare response
        response_data = {
            'data': df.to_dict(orient='records'),
            'graphs': graph_data,
            'message': 'Prediction successful'
        }
        
        return jsonify(response_data)

    except Exception as e:
        logger.error(f"Error processing request: {e}")
        return jsonify({'error': f"An error occurred during processing: {str(e)}"}), 500

if __name__ == '__main__':
    debug_mode = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    app.run(debug=debug_mode, host='0.0.0.0', port=5000)
