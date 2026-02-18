import os
import pandas as pd
import numpy as np
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import joblib
import logging
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder='../frontend/dist', static_url_path='')

@app.route('/')
def serve_frontend():
    return send_from_directory(app.static_folder, 'index.html')

@app.errorhandler(404)
def not_found(e):
    if request.path.startswith('/api/'):
        return jsonify({'error': 'Not found'}), 404
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/info', methods=['GET'])
def api_info():
    """API Info endpoint."""
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
