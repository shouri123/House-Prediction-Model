import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

def train_and_predict():
    # 1. Load and Prepare Data
    print("Training model...")
    df = pd.read_csv('Data_file - data_file.csv')
    X = df.drop('median_house_value', axis=1)
    y = df['median_house_value']

    # 2. Define Pipeline
    num_attribs = list(X.select_dtypes(include=[np.number]))
    cat_attribs = ['ocean_proximity']

    num_pipeline = Pipeline([
        ('imputer', SimpleImputer(strategy='median')),
        ('std_scaler', StandardScaler()),
    ])

    full_pipeline = ColumnTransformer([
        ('num', num_pipeline, num_attribs),
        ('cat', OneHotEncoder(), cat_attribs),
    ])

    # 3. Train Model
    X_prepared = full_pipeline.fit_transform(X)
    model = LinearRegression()
    model.fit(X_prepared, y)
    print("Model trained successfully.")

    # 4. Define a "New House" to ask the model about
    # These are the questions you are "asking" the model:
    new_house = pd.DataFrame([{
        'longitude': -122.23,
        'latitude': 37.88,
        'housing_median_age': 41.0,
        'total_rooms': 880.0,
        'total_bedrooms': 129.0,
        'population': 322.0,
        'households': 126.0,
        'median_income': 8.3252,
        'ocean_proximity': 'NEAR BAY'
    }])

    print("\n--- Asking the model to predict price for: ---")
    print(new_house.iloc[0])
    
    # 5. Predict
    new_house_prepared = full_pipeline.transform(new_house)
    prediction = model.predict(new_house_prepared)

    print(f"\nPredicted Median House Value: ${prediction[0]:,.2f}")

if __name__ == "__main__":
    train_and_predict()
