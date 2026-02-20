# 🏠 House Price Prediction

A full-stack Machine Learning application that predicts median house values in California districts. Upload housing data and get instant price predictions with interactive visualizations.

## ✨ Features

- **CSV/JSON Upload** — Drag & drop housing data for batch predictions
- **Single Property Prediction** — Predict price for individual properties via API
- **Interactive Visualizations** — Price histograms, scatter plots, predicted vs actual charts, and geographic map views
- **Smart Insights** — Auto-generated analysis of prediction patterns
- **Scenario Simulator** — Adjust property features and see real-time price changes
- **Export Tools** — Download predictions as CSV or PDF reports
- **Confidence Intervals** — See prediction ranges alongside point estimates
- **Outlier Detection** — Automatically flags unusual predictions

## 🏗️ Tech Stack

| Layer          | Technology                               |
| -------------- | ---------------------------------------- |
| **Frontend**   | React + Vite + TailwindCSS               |
| **Backend**    | Flask (Python) + Flask-CORS              |
| **ML Model**   | Scikit-Learn (Ridge Regression Pipeline) |
| **Deployment** | Vercel (frontend) / Railway (backend)    |

## 📂 Project Structure

```
House-Prediction-Model/
├── backend/              # Flask API server
│   ├── app.py            # Main API (health, predict, predict-single, model-info)
│   ├── requirements.txt  # Python dependencies
│   └── __init__.py
├── frontend/             # React application
│   ├── src/
│   │   ├── components/   # UI components
│   │   │   ├── FileUpload.jsx
│   │   │   ├── PredictionResults.jsx
│   │   │   ├── ScenarioSimulator.jsx
│   │   │   ├── PriceHistogram.jsx
│   │   │   ├── IncomeScatter.jsx
│   │   │   ├── PredictedVsActual.jsx
│   │   │   ├── MapView.jsx
│   │   │   ├── FeatureImportance.jsx
│   │   │   ├── SmartInsights.jsx
│   │   │   ├── SummaryCards.jsx
│   │   │   └── ExportTools.jsx
│   │   ├── App.jsx       # Main application
│   │   ├── config.js     # API configuration
│   │   └── utils.js      # Helper utilities
│   └── package.json
├── api/                  # Vercel serverless entry point
│   └── index.py
├── data/                 # Datasets
│   ├── Data_file - data_file.csv
│   ├── sample_data.csv
│   └── test_data.csv
├── models/               # Trained ML model
│   └── model.pkl
├── notebooks/            # Jupyter notebooks
│   └── House_Price_Prediction.ipynb
├── scripts/              # Utility scripts
│   └── predict.py
├── tests/                # Test scripts
│   ├── test_api.py
│   ├── test_client.py
│   └── test_railway.py
├── app.py                # Backend entry point
├── vercel.json           # Vercel deployment config
├── .env.example          # Environment variable template
├── DEPLOY.md             # Deployment guide
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Python 3.12+
- Node.js & npm

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/shouri123/House-Prediction-Model.git
   cd House-Prediction-Model
   ```

2. **Setup Backend:**

   ```bash
   python -m venv venv
   venv\Scripts\activate        # Windows
   # source venv/bin/activate   # macOS/Linux

   pip install -r backend/requirements.txt
   ```

3. **Setup Frontend:**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

### Running Locally

1. **Start the Backend** (runs on `http://localhost:5000`):

   ```bash
   python app.py
   ```

2. **Start the Frontend** (runs on `http://localhost:5173`):

   ```bash
   cd frontend
   npm run dev
   ```

3. **Open** `http://localhost:5173` and upload a CSV file with housing data.

## 🔌 API Endpoints

| Method | Endpoint          | Description                                 |
| ------ | ----------------- | ------------------------------------------- |
| `GET`  | `/health`         | Health check                                |
| `GET`  | `/model-info`     | Model metadata & feature importance         |
| `POST` | `/predict`        | Batch predictions from CSV/JSON file upload |
| `POST` | `/predict-single` | Single property prediction from JSON body   |

### Example — Single Prediction

```bash
curl -X POST http://localhost:5000/predict-single \
  -H "Content-Type: application/json" \
  -d '{
    "longitude": -122.23,
    "latitude": 37.88,
    "housing_median_age": 30,
    "total_rooms": 2000,
    "total_bedrooms": 400,
    "population": 800,
    "households": 350,
    "median_income": 5.0,
    "ocean_proximity": "NEAR BAY"
  }'
```

## 📊 Model Details

- **Algorithm:** Ridge Regression with GridSearchCV hyperparameter tuning
- **Preprocessing:** Median imputation + StandardScaler + OneHotEncoder
- **Feature Engineering:** `rooms_per_household`, `bedrooms_per_room`, `population_per_household`
- **Performance:** RMSE ~$69,000 | R² ~0.64

## 📦 Deployment

See [DEPLOY.md](DEPLOY.md) for deployment instructions on **Vercel** and **Render**.

## 📄 License

This project is open source and available for educational purposes.
