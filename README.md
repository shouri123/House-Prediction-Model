# California House Price Prediction App

This project is a full-stack application that predicts median house values in California districts. It features a Machine Learning model exposed via a Flask API and a modern React frontend.

## 🏗️ Architecture

- **Backend:** Flask (Python) with Scikit-Learn. Handles model inference and data processing.
- **Frontend:** React + Vite + TailwindCSS. Provides a user-friendly interface for uploading data and viewing predictions.
- **Model:** Ridge Regression pipeline with feature engineering.

## 🚀 Getting Started

### Prerequisites

- Python 3.12+
- Node.js & npm

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-folder>
    ```

2.  **Setup Backend:**
    ```bash
    # Create virtual environment (optional but recommended)
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate

    # Install dependencies
    pip install -r backend/requirements.txt
    ```

3.  **Setup Frontend:**
    ```bash
    cd frontend
    npm install
    cd ..
    ```

4.  **Environment Variables:**
    - Copy `.env.example` to `.env` in the root directory if needed, or set variables manually.
    - Default `.env` is provided for local development.

### Running Locally

1.  **Start the Backend:**
    ```bash
    python app.py
    ```
    The backend runs on `http://localhost:5000`.

2.  **Start the Frontend:**
    ```bash
    cd frontend
    npm run dev
    ```
    The frontend runs on `http://localhost:5173`.

3.  **Use the App:**
    - Open `http://localhost:5173` in your browser.
    - Upload a CSV or JSON file containing housing data.
    - View predicted prices and visualizations.

## 📦 Deployment

This app is configured for deployment on **Render**.
See [DEPLOY.md](DEPLOY.md) for detailed deployment instructions.

## 📂 Project Structure

- `backend/`: Flask application and API logic.
- `frontend/`: React application source code.
- `model.pkl`: The trained machine learning model.
- `scripts/`: Utility scripts (verification, etc.).
- `render.yaml`: Infrastructure as Code for Render deployment.

## 📊 Model Details

The model uses **Ridge Regression** with:
- **Imputation**: Median strategy.
- **Feature Engineering**: `rooms_per_household`, `bedrooms_per_room`, `population_per_household`.
- **Performance**: RMSE ~69k, R2 ~0.64.
