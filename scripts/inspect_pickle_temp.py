import pickle
import pandas as pd
import sys

try:
    with open('e:/ALL/python/House-Prediction-Model/california_housing_final.pkl', 'rb') as f:
        model = pickle.load(f)
    
    with open('inspect_pickle_result.txt', 'w') as f:
        f.write(f"Type: {type(model)}\n")
        f.write(f"Model: {model}\n")
        if hasattr(model, 'steps'):
            f.write("Pipeline steps:\n")
            for step in model.steps:
                f.write(f"  {step}\n")
except Exception as e:
    with open('inspect_pickle_result.txt', 'w') as f:
        f.write(f"Error: {e}\n")
