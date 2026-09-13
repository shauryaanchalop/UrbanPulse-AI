import sys
import os
import unittest
from pathlib import Path

sys.path.insert(0, os.path.dirname(__file__))

from fastapi.testclient import TestClient
from main import app, init_db

class TestMasterBackendFlow(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_db()
        cls.client = TestClient(app)

    def test_01_health(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "HEALTHY")

    def test_02_road_segments(self):
        response = self.client.get("/api/road-segments")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertGreater(len(data), 0)
        self.assertIn("healthScore", data[0])
        self.assertIn("condition", data[0])

    def test_03_citizen_report_submission_and_reward(self):
        report_payload = {
            "userId": "user-cit-101",
            "userName": "Ananya Sharma",
            "category": "Pothole",
            "description": "Deep dangerous pothole near Sector 18 bus stand",
            "latitude": 18.5204,
            "longitude": 73.8567,
            "locationAddress": "Sector 18 Bus Bay, FC Road"
        }
        res = self.client.post("/api/reports", json=report_payload)
        self.assertIn(res.status_code, [200, 201])
        data = res.json()
        report_obj = data.get("report", data)
        self.assertEqual(report_obj["aiClassification"], "Pothole")
        self.assertGreaterEqual(report_obj["aiConfidence"], 0.85)

        # Check leaderboard
        lb_res = self.client.get("/api/rewards/leaderboard")
        self.assertEqual(lb_res.status_code, 200)
        lb_data = lb_res.json()
        self.assertGreater(len(lb_data), 0)

    def test_04_evidence_search(self):
        res = self.client.get("/api/evidence/search?location=FC%20Road&minutesRadius=15")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        clips = data.get("clips", data) if isinstance(data, dict) else data
        self.assertGreater(len(clips), 0)
        self.assertIn("relevanceScore", clips[0])

    def test_05_watchlist_matching(self):
        res = self.client.get("/api/watchlist/matches/UP16AB1234")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("isWatchlistMatch", data)

    def test_06_distress_alert(self):
        alert_payload = {
            "userId": "user-cit-102",
            "userName": "Rhea Kapoor",
            "category": "Safety / Distress",
            "latitude": 18.5250,
            "longitude": 73.8580,
            "address": "FC Road Night Market"
        }
        res = self.client.post("/api/safety/distress", json=alert_payload)
        self.assertIn(res.status_code, [200, 201])
        data = res.json()
        alert_obj = data.get("alert", data)
        self.assertEqual(alert_obj["status"], "ACTIVE")

    def test_07_survey_missions(self):
        res = self.client.get("/api/survey-missions")
        self.assertEqual(res.status_code, 200)
        missions = res.json()
        self.assertGreater(len(missions), 0)

    def test_08_admin_audit_logs(self):
        res = self.client.get("/api/audit-logs")
        self.assertEqual(res.status_code, 200)
        logs = res.json()
        self.assertGreater(len(logs), 0)

    def test_09_vision_api_endpoints(self):
        health_res = self.client.get("/api/v1/vision/health")
        self.assertEqual(health_res.status_code, 200)
        
        model_res = self.client.get("/api/v1/vision/model")
        self.assertEqual(model_res.status_code, 200)
        
        detect_res = self.client.post("/api/v1/vision/detect", json={
            "telemetry": {"busId": "BUS-004", "latitude": 18.5912, "longitude": 73.7389}
        })
        self.assertEqual(detect_res.status_code, 200)
        self.assertEqual(detect_res.json()["pipeline_status"], "OK")

if __name__ == '__main__':
    unittest.main()
