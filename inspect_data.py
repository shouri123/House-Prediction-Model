import pandas as pd

try:
    df = pd.read_csv('Data_file - data_file.csv')
    print("--- HEAD ---")
    print(df.head())
    print("\n--- INFO ---")
    print(df.info())
    print("\n--- DESCRIBE ---")
    print(df.describe())
    print("\n--- MISSING VALUES ---")
    print(df.isnull().sum())
except Exception as e:
    print(f"Error: {e}")
