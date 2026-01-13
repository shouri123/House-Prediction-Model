import requests
import os

BASE_URL = 'http://localhost:5000'
TEST_FILE = 'test_data.csv'

def test_health():
    try:
        response = requests.get(f'{BASE_URL}/health')
        print(f"Health Status: {response.status_code}")
        print(response.json())
    except Exception as e:
        print(f"Health Check Failed: {e}")

def test_predict():
    if not os.path.exists(TEST_FILE):
        print("Test file not found!")
        return

    try:
        files = {'file': open(TEST_FILE, 'rb')}
        response = requests.post(f'{BASE_URL}/predict', files=files)
        
        print(f"Predict Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print("Keys in response:", data.keys())
            if 'data' in data and len(data['data']) > 0:
                print("First record keys:", data['data'][0].keys())
                print("Predicted Price in first record:", data['data'][0].get('predicted_price'))
            if 'graphs' in data:
                print("Graph keys:", data['graphs'].keys())
        else:
            print("Error:", response.text)
    except Exception as e:
        print(f"Predict Failed: {e}")

if __name__ == "__main__":
    test_health()
    test_predict()
