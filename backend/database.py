import os
import tempfile
import json
import random
import math
from datetime import datetime, timedelta

from db_adapter import get_db_connection, get_db_type, RAW_DATABASE_URL
from database_schema import create_all_tables
from seed_demo import BASE_ROUTES, seed_demo_data

if os.environ.get("VERCEL"):
    DB_PATH = os.path.join(tempfile.gettempdir(), "urbanpulse.db")
else:
    DB_PATH = os.environ.get("DB_PATH", "urbanpulse.db")

def init_db(force_reseed: bool = False):
    db_type = get_db_type()
    print(f"[Database Init] Initializing UrbanPulse AI Database in {db_type.upper()} mode...")
    
    try:
        conn = get_db_connection()
        create_all_tables(conn)
        
        cur = conn.cursor()
        should_seed = force_reseed
        if not should_seed:
            try:
                cur.execute("SELECT COUNT(*) as cnt FROM buses")
                row = cur.fetchone()
                cnt = row["cnt"] if row else 0
                if cnt == 0:
                    should_seed = True
            except Exception:
                should_seed = True
        
        conn.close()

        if should_seed:
            seed_demo_data()
        else:
            print(f"[Database Init] Existing database tables verified in {db_type.upper()} mode. Skipping re-seed.")

    except Exception as e:
        print(f"[Database Init Error]", e)
        raise e

if __name__ == "__main__":
    init_db()
