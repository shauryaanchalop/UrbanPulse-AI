from fastapi.testclient import TestClient
from main import app, init_db

client = TestClient(app)

def setup_module(module):
    init_db()

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "HEALTHY"

def test_road_segments():
    response = client.get("/api/road-segments")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert "healthScore" in data[0]
    assert "condition" in data[0]

def test_citizen_report_submission_and_reward():
    report_payload = {
        "userId": "user-cit-101",
        "userName": "Ananya Sharma",
        "category": "Pothole",
        "description": "Deep dangerous pothole near Sector 18 bus stand",
        "latitude": 18.5204,
        "longitude": 73.8567,
        "locationAddress": "Sector 18 Bus Bay, FC Road"
    }
    res = client.post("/api/reports", json=report_payload)
    assert res.status_code in [200, 201]
    data = res.json()
    report_obj = data.get("report", data)
    assert report_obj["aiClassification"] == "Pothole"
    assert report_obj["aiConfidence"] >= 0.85

    # Check leaderboard
    lb_res = client.get("/api/rewards/leaderboard")
    assert lb_res.status_code == 200
    lb_data = lb_res.json()
    assert len(lb_data) > 0

def test_evidence_search():
    res = client.get("/api/evidence/search?location=FC%20Road&minutesRadius=15")
    assert res.status_code == 200
    clips = res.json()
    assert len(clips) > 0
    assert "relevanceScore" in clips[0]

def test_watchlist_matching():
    # Test OCR normalize and query
    res = client.get("/api/watchlist/matches/UP16AB1234")
    assert res.status_code == 200
    data = res.json()
    assert "isWatchlistMatch" in data

def test_distress_alert():
    alert_payload = {
        "userId": "user-cit-102",
        "userName": "Rhea Kapoor",
        "category": "Safety / Distress",
        "latitude": 18.5250,
        "longitude": 73.8580,
        "address": "FC Road Night Market"
    }
    res = client.post("/api/safety/distress", json=alert_payload)
    assert res.status_code in [200, 201]
    data = res.json()
    alert_obj = data.get("alert", data)
    assert alert_obj["status"] == "ACTIVE"

def test_survey_missions():
    res = client.get("/api/survey-missions")
    assert res.status_code == 200
    missions = res.json()
    assert len(missions) > 0

def test_admin_audit_logs():
    res = client.get("/api/audit-logs")
    assert res.status_code == 200
    logs = res.json()
    assert len(logs) > 0

if __name__ == '__main__':
    setup_module(None)
    test_health()
    test_road_segments()
    test_citizen_report_submission_and_reward()
    test_evidence_search()
    test_watchlist_matching()
    test_distress_alert()
    test_survey_missions()
    test_admin_audit_logs()
    print("ALL URBANPULSE MASTER BACKEND TESTS PASSED SUCCESSFULLY!")

