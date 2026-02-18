import urllib.request
import urllib.parse
import json
import os
import io

# Test 1: Health check
print("=== Test 1: Health Check ===")
try:
    req = urllib.request.urlopen("http://localhost:5000/health")
    data = json.loads(req.read().decode())
    print(f"Status: {req.status}")
    print(f"Response: {data}")
except Exception as e:
    print(f"FAILED: {e}")

# Test 2: Model info
print("\n=== Test 2: Model Info ===")
try:
    req = urllib.request.urlopen("http://localhost:5000/model-info")
    data = json.loads(req.read().decode())
    print(f"Status: {req.status}")
    print(f"Keys: {list(data.keys())}")
    fi = data.get('feature_importance', {})
    print(f"Feature count: {len(fi.get('features', []))}")
    print(f"Top 3 features: {fi.get('features', [])[:3]}")
except Exception as e:
    print(f"FAILED: {e}")

# Test 3: Predict with file upload (multipart/form-data)
print("\n=== Test 3: Predict (file upload) ===")
try:
    csv_path = r"e:\New folder (10)\House-Prediction-Model\sample_data.csv"
    
    # Build multipart form data manually
    boundary = "----TestBoundary12345"
    
    with open(csv_path, 'rb') as f:
        csv_content = f.read()
    
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="sample_data.csv"\r\n'
        f"Content-Type: text/csv\r\n\r\n"
    ).encode() + csv_content + f"\r\n--{boundary}--\r\n".encode()
    
    req = urllib.request.Request(
        "http://localhost:5000/predict",
        data=body,
        headers={
            "Content-Type": f"multipart/form-data; boundary={boundary}",
        },
        method="POST"
    )
    
    resp = urllib.request.urlopen(req)
    raw = resp.read().decode()
    print(f"Status: {resp.status}")
    print(f"Raw response length: {len(raw)}")
    
    # Check for NaN in raw
    if 'NaN' in raw or 'nan' in raw:
        print("!!! WARNING: NaN found in raw response !!!")
        idx = raw.find('NaN')
        if idx == -1:
            idx = raw.find('nan')
        print(f"Context: ...{raw[max(0,idx-50):idx+50]}...")
    else:
        print("No NaN found in raw response - GOOD")
    
    # Try to parse
    try:
        data = json.loads(raw)
        print(f"JSON parse: SUCCESS")
        print(f"Type: {type(data).__name__}")
        
        if isinstance(data, str):
            print("Response is a STRING, trying to parse again...")
            data = json.loads(data)
            print(f"Second parse type: {type(data).__name__}")
        
        if isinstance(data, dict):
            print(f"Keys: {list(data.keys())}")
            print(f"data['data'] type: {type(data.get('data')).__name__}")
            d = data.get('data', [])
            print(f"data['data'] length: {len(d) if isinstance(d, list) else 'NOT A LIST'}")
            print(f"graphs keys: {list(data.get('graphs', {}).keys())}")
            print(f"insights count: {len(data.get('insights', []))}")
            print(f"confidence_margins count: {len(data.get('confidence_margins', []))}")
            print(f"outlier_indices: {data.get('outlier_indices')}")
            print(f"has_actual: {data.get('has_actual')}")
            
            if isinstance(d, list) and len(d) > 0:
                print(f"\nFirst record keys: {list(d[0].keys())}")
                for k, v in d[0].items():
                    print(f"  {k}: {v} (type: {type(v).__name__})")
        else:
            print(f"Unexpected data type: {type(data)}")
    except json.JSONDecodeError as e:
        print(f"JSON parse FAILED: {e}")
        print(f"First 500 chars: {raw[:500]}")
        
except Exception as e:
    print(f"FAILED: {e}")
    import traceback
    traceback.print_exc()

# Test 4: Predict single
print("\n=== Test 4: Predict Single ===")
try:
    payload = json.dumps({
        "longitude": -122.23,
        "latitude": 37.88,
        "housing_median_age": 30,
        "total_rooms": 2000,
        "total_bedrooms": 400,
        "population": 800,
        "households": 350,
        "median_income": 5.0,
        "ocean_proximity": "NEAR BAY"
    }).encode()
    
    req = urllib.request.Request(
        "http://localhost:5000/predict-single",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    resp = urllib.request.urlopen(req)
    data = json.loads(resp.read().decode())
    print(f"Status: {resp.status}")
    print(f"Predicted price: ${data.get('predicted_price', 0):,.0f}")
    print(f"Confidence: ${data.get('confidence_low', 0):,.0f} - ${data.get('confidence_high', 0):,.0f}")
except Exception as e:
    print(f"FAILED: {e}")

print("\n=== ALL TESTS COMPLETE ===")
