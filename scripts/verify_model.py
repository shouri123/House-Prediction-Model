import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

def run_verification():
    print("Loading data...")
    df = pd.read_csv('Data_file - data_file.csv')

    # Feature Engineering
    print("Feature Engineering...")
    df['rooms_per_household'] = df['total_rooms'] / df['households']
    df['bedrooms_per_room'] = df['total_bedrooms'] / df['total_rooms']
    df['population_per_household'] = df['population'] / df['households']

    X = df.drop('median_house_value', axis=1)
    y = df['median_house_value']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    num_attribs = list(X.select_dtypes(include=[np.number]))
    cat_attribs = ['ocean_proximity']

    num_pipeline = Pipeline([
        ('imputer', SimpleImputer(strategy='median')),
        ('std_scaler', StandardScaler()),
    ])

    preprocessor = ColumnTransformer([
        ('num', num_pipeline, num_attribs),
        ('cat', OneHotEncoder(handle_unknown='ignore'), cat_attribs),
    ])

    # Ridge Regression Pipeline
    print("Training Ridge Regression with GridSearchCV...")
    ridge_pipeline = Pipeline([
        ('preprocessing', preprocessor),
        ('model', Ridge())
    ])

    param_grid = {'model__alpha': [0.1, 1, 10, 50]}
    grid = GridSearchCV(ridge_pipeline, param_grid, cv=3, scoring='r2') # cv=3 for speed in verification
    grid.fit(X_train, y_train)

    print(f"Best Alpha: {grid.best_params_['model__alpha']}")
    print(f"Best CV R2: {grid.best_score_:.4f}")

    final_model = grid.best_estimator_
    y_pred = final_model.predict(X_test)

    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)
    print(f"Test RMSE: {rmse:.2f}")
    print(f"Test R2: {r2:.4f}")

    # Save and Load check
    print("Testing Model Persistence...")
    joblib.dump(final_model, "california_housing_final.pkl")
    loaded_model = joblib.load("california_housing_final.pkl")
    y_pred_loaded = loaded_model.predict(X_test)
    
    if np.allclose(y_pred, y_pred_loaded):
        print("SUCCESS: Model saved and loaded correctly.")
    else:
        print("ERROR: Saved model predictions do not match.")

if __name__ == "__main__":
    run_verification()
