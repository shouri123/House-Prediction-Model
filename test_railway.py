import urllib.request
import json

# Test Railway health
print("=== Railway Health ===")
req = urllib.request.urlopen("https://housing-price-backend-production.up.railway.app/health")
print("Health:", json.loads(req.read().decode()))

# Test predict with sample CSV
print("\n=== Railway Predict ===")
csv_path = r"e:\New folder (10)\House-Prediction-Model\sample_data.csv"
boundary = "----TestBoundary12345"

with open(csv_path, "rb") as f:
    csv_content = f.read()

header = '--{}\r\nContent-Disposition: form-data; name="file"; filename="sample_data.csv"\r\nContent-Type: text/csv\r\n\r\n'.format(boundary)
footer = "\r\n--{}--\r\n".format(boundary)

body = header.encode() + csv_content + footer.encode()

req = urllib.request.Request(
    "https://housing-price-backend-production.up.railway.app/predict",
    data=body,
    headers={"Content-Type": "multipart/form-data; boundary={}".format(boundary)},
    method="POST"
)

resp = urllib.request.urlopen(req)
raw = resp.read().decode()
print("Status:", resp.status)
print("Raw length:", len(raw))

has_nan = "NaN" in raw
print("NaN in response:", has_nan)

if has_nan:
    idx = raw.find("NaN")
    print("NaN context:", raw[max(0, idx - 80):idx + 80])
    print("\n!!! Railway backend has NOT been updated with the NaN fix !!!")
else:
    data = json.loads(raw)
    print("Keys:", list(data.keys()))
    print("data length:", len(data.get("data", [])))
    print("graphs:", list(data.get("graphs", {}).keys()))
    print("\nRailway backend is working correctly!")
