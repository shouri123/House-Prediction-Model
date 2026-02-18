import os
import pandas as pd
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import logging
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(BASE_DIR)
MODEL_PATH = os.path.join(ROOT_DIR, 'models', 'model.pkl')
REQUIRED_COLUMNS = [
    'longitude', 'latitude', 'housing_median_age', 'total_rooms',
    'total_bedrooms', 'population', 'households', 'median_income',
    'ocean_proximity'
]

OCEAN_PROXIMITY_OPTIONS = ['<1H OCEAN', 'INLAND', 'ISLAND', 'NEAR BAY', 'NEAR OCEAN']

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

def add_engineered_features(df):
    """Add engineered features matching the training pipeline."""
    df = df.copy()
    if 'rooms_per_household' not in df.columns:
        df['rooms_per_household'] = df['total_rooms'] / df['households']
    if 'bedrooms_per_room' not in df.columns:
        df['bedrooms_per_room'] = df['total_bedrooms'] / df['total_rooms']
    if 'population_per_household' not in df.columns:
        df['population_per_household'] = df['population'] / df['households']
    # Replace NaN/inf from division by zero
    df = df.replace([np.inf, -np.inf], np.nan).fillna(0)
    return df

def get_feature_importance():
    """Extract feature importance from the model (Ridge coefficients)."""
    try:
        preprocessor = model.named_steps['preprocessing']
        ridge = model.named_steps['model']
        feature_names = preprocessor.get_feature_names_out()
        # Clean up feature names (remove num__ and cat__ prefixes)
        clean_names = [name.replace('num__', '').replace('cat__', '') for name in feature_names]
        coefs = np.abs(ridge.coef_)
        # Normalize to 0-1
        if coefs.max() > 0:
            normalized = (coefs / coefs.max()).tolist()
        else:
            normalized = coefs.tolist()
        # Sort by importance descending
        pairs = sorted(zip(clean_names, normalized), key=lambda x: x[1], reverse=True)
        return {
            'features': [p[0] for p in pairs],
            'importance': [round(p[1], 4) for p in pairs]
        }
    except Exception as e:
        logger.warning(f"Failed to extract feature importance: {e}")
        return {'features': [], 'importance': []}

def estimate_confidence_intervals(predictions, confidence_pct=0.1):
    """Estimate confidence intervals as ± percentage of prediction."""
    margins = predictions * confidence_pct
    return margins.tolist()

def detect_outliers(df, predictions):
    """Detect outlier predictions using IQR method."""
    q1 = np.percentile(predictions, 25)
    q3 = np.percentile(predictions, 75)
    iqr = q3 - q1
    lower = q1 - 1.5 * iqr
    upper = q3 + 1.5 * iqr
    outlier_indices = [int(i) for i, p in enumerate(predictions) if p < lower or p > upper]
    return outlier_indices, float(lower), float(upper)

def generate_insights(df, predictions, feature_importance):
    """Auto-generate smart insights from the prediction data."""
    insights = []

    # Strongest predictor
    if feature_importance['features']:
        top_feature = feature_importance['features'][0]
        insights.append({
            'type': 'info',
            'icon': '🧠',
            'title': 'Strongest Price Driver',
            'text': f'"{top_feature.replace("_", " ").title()}" is the most influential feature in determining house prices.'
        })

    # Ocean proximity premium
    try:
        ocean_groups = df.groupby('ocean_proximity')['predicted_price'].mean()
        if 'INLAND' in ocean_groups.index:
            inland_avg = ocean_groups['INLAND']
            coastal_cols = [c for c in ocean_groups.index if c != 'INLAND']
            if coastal_cols:
                coastal_avg = ocean_groups[coastal_cols].mean()
                premium = ((coastal_avg - inland_avg) / inland_avg) * 100
                if premium > 0:
                    insights.append({
                        'type': 'success',
                        'icon': '🌊',
                        'title': 'Ocean Proximity Premium',
                        'text': f'Coastal properties show a {premium:.0f}% higher predicted value compared to inland properties.'
                    })
    except Exception:
        pass

    # Price range insight
    price_range = predictions.max() - predictions.min()
    insights.append({
        'type': 'info',
        'icon': '📊',
        'title': 'Market Spread',
        'text': f'Predicted prices range from ${predictions.min():,.0f} to ${predictions.max():,.0f} — a spread of ${price_range:,.0f}.'
    })

    # Outlier insight
    outlier_indices, _, _ = detect_outliers(df, predictions)
    if outlier_indices:
        insights.append({
            'type': 'warning',
            'icon': '⚠️',
            'title': 'Outlier Alert',
            'text': f'{len(outlier_indices)} properties have predicted prices significantly outside the typical range.'
        })

    # Income correlation
    try:
        corr = df['median_income'].corr(pd.Series(predictions))
        if abs(corr) > 0.5:
            insights.append({
                'type': 'success',
                'icon': '💰',
                'title': 'Income-Price Correlation',
                'text': f'Median income shows a strong correlation ({corr:.2f}) with predicted prices, confirming it as a key driver.'
            })
    except Exception:
        pass

    return insights

def generate_graph_data(df):
    """Generates structured data for frontend visualization."""
    try:
        prices = df['predicted_price']
        hist, bin_edges = np.histogram(prices, bins=20)

        graph_data = {
            'histogram': {
                'labels': [f"${int(bin_edges[i]/1000)}k-${int(bin_edges[i+1]/1000)}k" for i in range(len(bin_edges)-1)],
                'values': hist.tolist()
            },
            'scatter': {
                'x': df['median_income'].tolist(),
                'y': prices.tolist(),
                'x_label': 'Median Income',
                'y_label': 'Predicted Price'
            },
            'summary_stats': {
                'min_price': float(prices.min()),
                'max_price': float(prices.max()),
                'avg_price': float(prices.mean()),
                'median_price': float(prices.median()),
                'total_properties': int(len(df))
            }
        }
        return graph_data
    except Exception as e:
        logger.warning(f"Failed to generate graph data: {e}")
        return {}

# ─── ROUTES ───

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    status = 'healthy' if model is not None else 'unhealthy'
    return jsonify({'status': status, 'model_loaded': model is not None})

@app.route('/', methods=['GET'])
def index():
    """Root endpoint."""
    return jsonify({
        'message': 'House Price Prediction API Server',
        'endpoints': ['/health', '/predict', '/predict-single', '/model-info'],
        'status': 'running'
    })

@app.route('/model-info', methods=['GET'])
def model_info():
    """Returns model metadata and feature importance."""
    if model is None:
        if not load_model():
            return jsonify({'error': 'Model is not available.'}), 503

    importance = get_feature_importance()
    return jsonify({
        'model_type': 'Ridge Regression',
        'feature_importance': importance,
        'ocean_proximity_options': OCEAN_PROXIMITY_OPTIONS,
        'required_columns': REQUIRED_COLUMNS
    })

@app.route('/predict-single', methods=['POST'])
def predict_single():
    """Predict price for a single property from JSON body."""
    if model is None:
        if not load_model():
            return jsonify({'error': 'Model is not available.'}), 503

    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400

        df = pd.DataFrame([data])

        # Validate
        is_valid, error_msg = validate_input(df)
        if not is_valid:
            return jsonify({'error': error_msg}), 400

        # Feature engineering
        df = add_engineered_features(df)

        # Predict
        prediction = model.predict(df)
        price = float(prediction[0])
        margin = price * 0.1  # 10% confidence interval

        return jsonify({
            'predicted_price': price,
            'confidence_low': price - margin,
            'confidence_high': price + margin,
            'margin': margin,
            'input': data
        })
    except Exception as e:
        logger.error(f"Error in single prediction: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/predict', methods=['POST'])
def predict():
    """Predict house prices from uploaded CSV/JSON file."""
    if model is None:
        if not load_model():
            return jsonify({'error': 'Model is not available.'}), 503

    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    try:
        # Read file
        if file.filename.endswith('.csv'):
            df = pd.read_csv(file)
        elif file.filename.endswith('.json'):
            df = pd.read_json(file)
        else:
            return jsonify({'error': 'Invalid file format. Upload CSV or JSON.'}), 400

        # Validate
        is_valid, error_msg = validate_input(df)
        if not is_valid:
            return jsonify({'error': error_msg}), 400

        # Check for actual values
        has_actual = 'median_house_value' in df.columns
        actual_values = df['median_house_value'].tolist() if has_actual else None

        # Feature engineering
        df = add_engineered_features(df)

        # Predict
        predictions = model.predict(df)
        df['predicted_price'] = predictions

        # Confidence intervals
        margins = estimate_confidence_intervals(predictions)

        # Outlier detection
        outlier_indices, outlier_lower, outlier_upper = detect_outliers(df, predictions)

        # Feature importance
        importance = get_feature_importance()

        # Smart insights
        insights = generate_insights(df, predictions, importance)

        # Graph data
        graph_data = generate_graph_data(df)

        # Model metrics (if actual values available)
        metrics = None
        predicted_vs_actual = None
        if has_actual:
            y_true = np.array(actual_values)
            y_pred = predictions
            metrics = {
                'mae': float(mean_absolute_error(y_true, y_pred)),
                'rmse': float(np.sqrt(mean_squared_error(y_true, y_pred))),
                'r2': float(r2_score(y_true, y_pred))
            }
            predicted_vs_actual = {
                'predicted': y_pred.tolist(),
                'actual': y_true.tolist()
            }
            # Additional insight about model accuracy
            insights.append({
                'type': 'info',
                'icon': '🎯',
                'title': 'Model Accuracy',
                'text': f'R² Score: {metrics["r2"]:.3f} | MAE: ${metrics["mae"]:,.0f} | RMSE: ${metrics["rmse"]:,.0f}'
            })

        # Clean NaN/inf values before JSON serialization
        df = df.replace([np.inf, -np.inf], np.nan).fillna(0)

        # Build response
        response_data = {
            'data': df.to_dict(orient='records'),
            'graphs': graph_data,
            'confidence_margins': margins,
            'outlier_indices': outlier_indices,
            'outlier_bounds': {'lower': outlier_lower, 'upper': outlier_upper},
            'feature_importance': importance,
            'insights': insights,
            'metrics': metrics,
            'predicted_vs_actual': predicted_vs_actual,
            'has_actual': has_actual,
            'message': 'Prediction successful'
        }

        return jsonify(response_data)

    except Exception as e:
        logger.error(f"Error processing request: {e}")
        return jsonify({'error': f"An error occurred: {str(e)}"}), 500

if __name__ == '__main__':
    debug_mode = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=debug_mode, host='0.0.0.0', port=port)
