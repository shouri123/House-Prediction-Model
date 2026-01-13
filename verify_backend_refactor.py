import requests
import pandas as pd
import time
import subprocess
import sys
import os
import signal

# Configuration
BASE_URL = 'http://localhost:5000'
TEST_FILE = 'test_data.csv'

def start_server():
    """Starts the Flask server in a subprocess."""
    print("Starting Flask server...")
    process = subprocess.Popen([sys.executable, 'backend/app.py'], cwd=os.getcwd())
    time.sleep(5)  # Wait for server to start
    return process

def stop_server(process):
    """Stops the Flask server."""
    print("Stopping Flask server...")
    process.terminate()
    process.wait()

def test_health():
    """Tests the health endpoint."""
    try:
        response = requests.get(f'{BASE_URL}/health')
        if response.status_code == 200:
            print("Health check passed.")
            return True
        else:
            print(f"Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"Health check exception: {e}")
        return False

def test_predict():
    """Tests the predict endpoint."""
    if not os.path.exists(TEST_FILE):
        print(f"Test file {TEST_FILE} not found.")
        return False

    try:
        files = {'file': open(TEST_FILE, 'rb')}
        response = requests.post(f'{BASE_URL}/predict', files=files)
        
        if response.status_code == 200:
            data = response.json()
            if 'data' in data and 'graphs' in data:
                print("Prediction test passed.")
                # Check for predicted_price
                if 'predicted_price' in data['data'][0]:
                     print("predicted_price column found.")
                else:
                     print("predicted_price column MISSING.")
                
                # Check graph data
                if 'histogram' in data['graphs']:
                    print("Graph data found.")
                else:
                    print("Graph data MISSING.")
                return True
            else:
                print("Response structure invalid.")
                return False
        else:
            print(f"Prediction test failed: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"Prediction test exception: {e}")
        return False

if __name__ == '__main__':
    server_process = start_server()
    try:
        if test_health():
            test_predict()
    finally:
        stop_server(server_process)
