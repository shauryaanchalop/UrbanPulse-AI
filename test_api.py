import urllib.request
import json

def test_endpoints():
    endpoints = [
        "/api/overview",
        "/api/buses",
        "/api/routes",
        "/api/road-defects",
        "/api/traffic",
        "/api/incidents",
        "/api/anpr",
        "/api/maintenance",
        "/api/system-health",
        "/api/simulation/status",
        "/api/inference/pipeline"
    ]
    for ep in endpoints:
        url = f"http://localhost:8000{ep}"
        req = urllib.request.urlopen(url)
        data = json.loads(req.read().decode('utf-8'))
        count_str = f"({len(data)} items)" if isinstance(data, list) else f"(keys: {list(data.keys())[:3]})"
        print(f"[PASS] {ep:26} Status: {req.status} {count_str}")

if __name__ == "__main__":
    test_endpoints()
