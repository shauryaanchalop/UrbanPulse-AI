import os
import time
import json
import sqlite3
from typing import Dict, Any, List

class NotificationService:
    def __init__(self, db_path: str = "urbanpulse.db"):
        self.db_path = db_path
        self.sendgrid_api_key = os.getenv("SENDGRID_API_KEY", "")
        self.sendgrid_from_email = os.getenv("SENDGRID_FROM_EMAIL", "alerts@urbanpulse.ai")
        self.twilio_sid = os.getenv("TWILIO_ACCOUNT_SID", "")
        self.twilio_token = os.getenv("TWILIO_AUTH_TOKEN", "")
        self.twilio_from_number = os.getenv("TWILIO_FROM_NUMBER", "+18005550199")

    def init_tables(self):
        conn = sqlite3.connect(self.db_path)
        cur = conn.cursor()
        
        # Notification Log Table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS notifications (
                id TEXT PRIMARY KEY,
                eventType TEXT,
                severity TEXT,
                department TEXT,
                title TEXT,
                message TEXT,
                targetEmail TEXT,
                targetPhone TEXT,
                channel TEXT,
                status TEXT,
                timestamp TEXT,
                metadataJson TEXT
            )
        """)

        # Notification Rules Table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS notification_rules (
                id TEXT PRIMARY KEY,
                eventType TEXT,
                minSeverity TEXT,
                department TEXT,
                targetEmail TEXT,
                targetPhone TEXT,
                emailEnabled INTEGER,
                smsEnabled INTEGER,
                active INTEGER
            )
        """)

        # Seed initial rules if empty
        cur.execute("SELECT COUNT(*) FROM notification_rules")
        if cur.fetchone()[0] == 0:
            default_rules = [
                ("rule-101", "CRITICAL_DEFECT", "Critical", "Road Engineering", "engineering@pune.gov.in", "+919822011223", 1, 1, 1),
                ("rule-102", "SAFETY_ACCIDENT", "High", "Police Command", "traffic.police@pune.gov.in", "+919822099887", 1, 1, 1),
                ("rule-103", "DISTRESS_ALERT", "Critical", "Women's Safety Cell", "distress.response@pune.gov.in", "+919822044556", 1, 1, 1),
                ("rule-104", "WATCHLIST_MATCH", "High", "Authorized Investigators", "anpr.unit@pune.gov.in", "+919822077889", 1, 0, 1)
            ]
            cur.executemany("""
                INSERT INTO notification_rules (id, eventType, minSeverity, department, targetEmail, targetPhone, emailEnabled, smsEnabled, active)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, default_rules)

        conn.commit()
        conn.close()

    def send_notification(self, event_type: str, severity: str, title: str, message: str, department: str = "General Operations", metadata: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        deliveries = []
        now_str = time.strftime('%Y-%m-%d %H:%M:%S')

        # Check configured rules
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute("SELECT * FROM notification_rules WHERE active = 1 AND (eventType = ? OR eventType = 'ALL')", (event_type,))
        rules = [dict(r) for r in cur.fetchall()]

        if not rules:
            # Fallback default alert log
            rules = [{
                'targetEmail': 'ops@urbanpulse.ai',
                'targetPhone': '+919800000000',
                'emailEnabled': 1,
                'smsEnabled': 1,
                'department': department
            }]

        for idx, rule in enumerate(rules):
            # Email delivery log
            if rule['emailEnabled']:
                email_id = f"notif-em-{int(time.time()*1000)}-{idx}"
                status = "SENT_DEMO" if not self.sendgrid_api_key else "SENT_SENDGRID"
                cur.execute("""
                    INSERT INTO notifications (id, eventType, severity, department, title, message, targetEmail, targetPhone, channel, status, timestamp, metadataJson)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (email_id, event_type, severity, rule['department'], title, message, rule['targetEmail'], rule['targetPhone'], "EMAIL", status, now_str, json.dumps(metadata or {})))
                deliveries.append({"id": email_id, "channel": "EMAIL", "target": rule['targetEmail'], "status": status})

            # SMS delivery log
            if rule['smsEnabled']:
                sms_id = f"notif-sms-{int(time.time()*1000)}-{idx}"
                status = "SENT_DEMO" if not self.twilio_sid else "SENT_TWILIO"
                cur.execute("""
                    INSERT INTO notifications (id, eventType, severity, department, title, message, targetEmail, targetPhone, channel, status, timestamp, metadataJson)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (sms_id, event_type, severity, rule['department'], title, message, rule['targetEmail'], rule['targetPhone'], "SMS", status, now_str, json.dumps(metadata or {})))
                deliveries.append({"id": sms_id, "channel": "SMS", "target": rule['targetPhone'], "status": status})

        conn.commit()
        conn.close()
        return deliveries

    def get_notifications(self, limit: int = 50) -> List[Dict[str, Any]]:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute("SELECT * FROM notifications ORDER BY timestamp DESC LIMIT ?", (limit,))
        rows = [dict(r) for r in cur.fetchall()]
        conn.close()
        return rows

    def get_rules(self) -> List[Dict[str, Any]]:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute("SELECT * FROM notification_rules")
        rows = [dict(r) for r in cur.fetchall()]
        conn.close()
        return rows
