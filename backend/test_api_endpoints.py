import urllib.request
import json

BASE_URL = "http://localhost:8000"

def test_endpoint(url: str, method: str = "GET", data: dict = None):
    req = urllib.request.Request(url, method=method)
    if data:
        req.add_header('Content-Type', 'application/json')
        body = json.dumps(data).encode('utf-8')
    else:
        body = None

    with urllib.request.urlopen(req, data=body) as response:
        status_code = response.status
        res_data = json.loads(response.read().decode('utf-8'))
        return status_code, res_data

def run_tests():
    print("Testing GET /health...")
    status, health = test_endpoint(f"{BASE_URL}/health")
    assert status == 200
    assert health["status"] == "HEALTHY"
    print("[OK] GET /health PASSED", health)

    print("\nTesting POST /api/auth/demo-login...")
    status, auth_res = test_endpoint(f"{BASE_URL}/api/auth/demo-login", method="POST", data={"role": "operator"})
    assert status == 200
    assert "token" in auth_res
    assert auth_res["role"] == "ICCC OPERATOR"
    print("[OK] POST /api/auth/demo-login PASSED (Token received)")

    print("\nTesting GET /api/notifications...")
    status, notifs = test_endpoint(f"{BASE_URL}/api/notifications")
    assert status == 200
    print(f"[OK] GET /api/notifications PASSED ({len(notifs)} records)")

    print("\nTesting POST /api/inference/analyze-frame...")
    status, frame_res = test_endpoint(f"{BASE_URL}/api/inference/analyze-frame", method="POST", data={"frameData": "sample_b64"})
    assert status == 200
    assert "detections" in frame_res
    assert "anpr" in frame_res
    print("[OK] POST /api/inference/analyze-frame PASSED", frame_res["mode"])

    print("\nALL URBANPULSE API ENDPOINT TESTS PASSED CLEANLY!")

if __name__ == '__main__':
    run_tests()
