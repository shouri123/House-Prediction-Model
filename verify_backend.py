import requests
import pandas as pd
import time
import subprocess
import sys
import os

def verify_backend():
    # Start backend in background
    print("Starting backend...")
    backend_process = subprocess.Popen([sys.executable, 'backend/app.py'], cwd='e:/ALL/python/House-Prediction-Model')
    
    # Wait for backend to start
    time.sleep(10)
    
    try:
        print("Sending request...")
        files = {'file': open('test_data.csv', 'rb')}
        response = requests.post('http://localhost:5000/predict', files=files)
        
        if response.status_code == 200:
            print("Success! Response:")
            print(response.json())
            return True
        else:
            print(f"Failed with status {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"Error: {e}")
        return False
    finally:
        print("Stopping backend...")
        backend_process.terminate()

if __name__ == "__main__":
    if verify_backend():
        print("Verification PASSED")
    else:
        print("Verification FAILED")
