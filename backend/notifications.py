import os
import time
import json
from typing import Dict, Any, List
from db_adapter import get_db_connection

class NotificationService:
    def __init__(self, db_path: str = "urbanpulse.db"):
        self.db_path = db_path
        self.sendgrid_api_key = os.getenv("SENDGRID_API_KEY", "")
        self.sendgrid_from_email = os.getenv("SENDGRID_FROM_EMAIL", "alerts@urbanpulse.ai")
        self.twilio_sid = os.getenv("TWILIO_ACCOUNT_SID", "")
        self.twilio_token = os.getenv("TWILIO_AUTH_TOKEN", "")
        self.twilio_from_number = os.getenv("TWILIO_FROM_NUMBER", "+18005550199")

    def init_tables(self):
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Notification Log Table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS notifications (
                id VARCHAR(50) PRIMARY KEY,
                eventType VARCHAR(100) NOT NULL,
                severity VARCHAR(50) NOT NULL,
                department VARCHAR(100) NOT NULL,
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                targetEmail VARCHAR(255),
                targetPhone VARCHAR(50),
                channel VARCHAR(50) NOT NULL,
                status VARCHAR(50) NOT NULL,
                timestamp VARCHAR(50) NOT NULL,
                metadataJson TEXT
            )
        """)

        # Notification Rules Table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS notification_rules (
                id VARCHAR(50) PRIMARY KEY,
                eventType VARCHAR(100) NOT NULL,
                minSeverity VARCHAR(50) NOT NULL,
                department VARCHAR(100) NOT NULL,
                targetEmail VARCHAR(255),
                targetPhone VARCHAR(50),
                emailEnabled INT DEFAULT 1,
                smsEnabled INT DEFAULT 1,
                active INT DEFAULT 1
            )
        """)

        # Seed initial rules if empty
        cur.execute("SELECT COUNT(*) FROM notification_rules")
        res = cur.fetchone()
        count = res[0] if res else 0
        if count == 0:
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
        conn = get_db_connection()
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
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM notifications ORDER BY timestamp DESC LIMIT ?", (limit,))
        rows = [dict(r) for r in cur.fetchall()]
        conn.close()
        return rows

    def get_rules(self) -> List[Dict[str, Any]]:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM notification_rules")
        rows = [dict(r) for r in cur.fetchall()]
        conn.close()
        return rows
