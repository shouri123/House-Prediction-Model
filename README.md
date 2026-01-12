# California House Price Prediction

This project predicts median house values in California districts using various features like location, number of rooms, and income. It utilizes **Ridge Regression** with hyperparameter tuning and advanced feature engineering to achieve accurate predictions.

## 📂 Project Structure

- `House_Price_Prediction.ipynb`: The main Jupyter Notebook containing EDA, preprocessing, modeling, and evaluation.
- `predict.py`: A script to demonstrate how to use the trained model for making new predictions.
- `verify_model.py`: A script to verify the model's performance and logic.
- `generate_notebook.py`: Script used to generate the notebook programmatically.
- `california_housing_final.pkl`: The saved trained model (Ridge Regression).
- `Data_file - data_file.csv`: The dataset used for training and testing.
- `requirements.txt`: List of dependencies.

## 🚀 Getting Started

### Prerequisites

Ensure you have Python installed. Install the required dependencies:

```bash
pip install -r requirements.txt
```

### Running the Analysis

You can open the Jupyter Notebook to view the full analysis, visualizations, and model development process:

```bash
jupyter notebook House_Price_Prediction.ipynb
```

### Making Predictions

To see the model in action and predict the price of a sample house, run:

```bash
python predict.py
```

### Verifying Performance

To verify the model's metrics (RMSE, R2 Score) and ensure everything is working correctly:

```bash
python verify_model.py
```

## 📊 Model Performance

The model uses **Ridge Regression** with a unified pipeline including:
- **Imputation**: Median strategy for missing values.
- **Feature Engineering**: Added features like `rooms_per_household`, `bedrooms_per_room`, `population_per_household`.
- **Scaling**: StandardScaler.
- **One-Hot Encoding**: For `ocean_proximity`.

**Performance Metrics (Test Set):**
- **RMSE**: ~69,127
- **R2 Score**: ~0.6353

## 🛠️ Built With

- Python
- Pandas, NumPy
- Scikit-Learn
- Matplotlib, Seaborn
- Jupyter Notebook
