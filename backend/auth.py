import time
import base64
import hmac
import hashlib
import json
import sqlite3
from typing import Optional, Dict, Any

SECRET_KEY = "urbanpulse-sih2026-super-secret-jwt-key-do-not-share"
TOKEN_EXPIRE_SECONDS = 86400 * 7  # 7 days

def base64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode('utf-8')

def base64url_decode(data_str: str) -> bytes:
    padding = '=' * (4 - (len(data_str) % 4))
    return base64.urlsafe_b64decode(data_str + padding)

def hash_password(password: str) -> str:
    salt = "urbanpulse_salt_2026"
    return hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000).hex()

def verify_password(password: str, password_hash: str) -> bool:
    return hash_password(password) == password_hash

def create_jwt_token(payload: Dict[str, Any]) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    header_bytes = json.dumps(header, separators=(',', ':')).encode('utf-8')
    
    payload_copy = payload.copy()
    payload_copy['exp'] = int(time.time()) + TOKEN_EXPIRE_SECONDS
    payload_bytes = json.dumps(payload_copy, separators=(',', ':')).encode('utf-8')

    encoded_header = base64url_encode(header_bytes)
    encoded_payload = base64url_encode(payload_bytes)

    signing_input = f"{encoded_header}.{encoded_payload}".encode('utf-8')
    signature = hmac.new(SECRET_KEY.encode('utf-8'), signing_input, hashlib.sha256).digest()
    encoded_signature = base64url_encode(signature)

    return f"{encoded_header}.{encoded_payload}.{encoded_signature}"

def verify_jwt_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return None
        
        encoded_header, encoded_payload, encoded_signature = parts
        signing_input = f"{encoded_header}.{encoded_payload}".encode('utf-8')
        expected_sig = base64url_encode(hmac.new(SECRET_KEY.encode('utf-8'), signing_input, hashlib.sha256).digest())

        if not hmac.compare_digest(encoded_signature, expected_sig):
            return None

        payload_bytes = base64url_decode(encoded_payload)
        payload = json.loads(payload_bytes.decode('utf-8'))

        if payload.get('exp', 0) < time.time():
            return None

        return payload
    except Exception:
        return None

# Seed Accounts Mapping for Demo Access
DEMO_ACCOUNTS = {
    'citizen': {
        'id': 'user-cit-101',
        'username': 'citizen',
        'email': 'citizen@demo.urbanpulse.ai',
        'fullName': 'Ananya Sharma',
        'role': 'CITIZEN',
        'department': 'Public Citizen',
        'avatarUrl': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
    },
    'operator': {
        'id': 'user-op-201',
        'username': 'operator',
        'email': 'operator@demo.urbanpulse.ai',
        'fullName': 'Vikramaditya Deshmukh',
        'role': 'ICCC OPERATOR',
        'department': 'Municipal Control Center',
        'avatarUrl': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
    },
    'fleet': {
        'id': 'user-fleet-301',
        'username': 'fleet',
        'email': 'fleet@demo.urbanpulse.ai',
        'fullName': 'Rajesh Kulkarni',
        'role': 'FLEET OPERATOR',
        'department': 'PMPML Transit Operations',
        'avatarUrl': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
    },
    'investigator': {
        'id': 'user-pol-401',
        'username': 'investigator',
        'email': 'investigator@demo.urbanpulse.ai',
        'fullName': 'Inspector Sunita Patil',
        'role': 'POLICE / AUTHORIZED INVESTIGATOR',
        'department': 'Traffic & Cyber Crime Branch',
        'avatarUrl': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
    },
    'admin': {
        'id': 'user-admin-001',
        'username': 'admin',
        'email': 'admin@demo.urbanpulse.ai',
        'fullName': 'Dr. Rajeshwar Rao',
        'role': 'SUPER ADMIN',
        'department': 'Smart City Mission Director',
        'avatarUrl': 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
    }
}

def authenticate_user(db_path: str, username_or_email: str, password: str) -> Optional[Dict[str, Any]]:
    # Check demo accounts first
    lowered = username_or_email.lower().strip()
    for role_key, acc in DEMO_ACCOUNTS.items():
        if lowered in [acc['username'], acc['email'], role_key]:
            token = create_jwt_token(acc)
            return {**acc, 'token': token}

    # DB Query fallback
    try:
        from db_adapter import get_db_connection
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT * FROM users WHERE LOWER(email) = ? OR LOWER(username) = ?", (lowered, lowered))
        row = cur.fetchone()
        conn.close()
        if row:
            user_data = dict(row)
            user_data.pop('passwordHash', None)
            token = create_jwt_token(user_data)
            return {**user_data, 'token': token}
    except Exception as e:
        print("[Auth Error]", e)

    return None
