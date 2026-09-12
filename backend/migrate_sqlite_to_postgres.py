import os
import sys
import sqlite3
from typing import Dict, Any, List
from db_adapter import RAW_DATABASE_URL
from database_schema import TABLE_DEFINITIONS, create_all_tables

def migrate_sqlite_to_postgres(sqlite_path: str = "urbanpulse.db", target_postgres_url: str = None):
    if not os.path.exists(sqlite_path):
        print(f"[Migrate] Source SQLite file '{sqlite_path}' does not exist.")
        return False

    url = target_postgres_url or RAW_DATABASE_URL
    if not url or not url.strip():
        print("[Migrate] Error: No target PostgreSQL DATABASE_URL supplied.")
        return False

    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)

    import psycopg
    import psycopg.rows

    print(f"[Migrate] Starting migration from SQLite ('{sqlite_path}') to PostgreSQL...")

    # Connect to SQLite source
    sqlite_conn = sqlite3.connect(sqlite_path)
    sqlite_conn.row_factory = sqlite3.Row
    sqlite_cur = sqlite_conn.cursor()

    # Connect to PostgreSQL target
    pg_conn = psycopg.connect(url, autocommit=False)
    pg_cur = pg_conn.cursor(row_factory=psycopg.rows.dict_row)

    # Ensure schema exists on Postgres
    class TargetAdapterConn:
        def __init__(self, c):
            self._c = c
            self.is_postgres = True
        def cursor(self):
            return self._c.cursor()
        def commit(self):
            self._c.commit()

    create_all_tables(TargetAdapterConn(pg_conn))

    tables = list(TABLE_DEFINITIONS.keys())
    success_count = 0
    fail_count = 0

    for tbl in tables:
        try:
            # Check if source table exists in SQLite
            sqlite_cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (tbl,))
            if not sqlite_cur.fetchone():
                print(f"[Migrate] Table '{tbl}' not found in SQLite source, skipping.")
                continue

            sqlite_cur.execute(f"SELECT * FROM {tbl}")
            rows = sqlite_cur.fetchall()
            if not rows:
                print(f"[Migrate] Table '{tbl}' is empty in SQLite.")
                continue

            columns = [desc[0] for desc in sqlite_cur.description]
            cols_str = ", ".join(columns)
            placeholders = ", ".join(["%s"] * len(columns))
            insert_sql = f"INSERT INTO {tbl} ({cols_str}) VALUES ({placeholders}) ON CONFLICT DO NOTHING"

            migrated_rows = 0
            for r in rows:
                row_vals = tuple(dict(r)[col] for col in columns)
                pg_cur.execute(insert_sql, row_vals)
                migrated_rows += 1

            pg_conn.commit()
            print(f"[Migrate] Table '{tbl}': Successfully migrated {migrated_rows} rows to PostgreSQL.")
            success_count += 1

        except Exception as e:
            pg_conn.rollback()
            print(f"[Migrate Error] Failed migrating table '{tbl}': {e}")
            fail_count += 1

    sqlite_conn.close()
    pg_conn.close()

    print(f"[Migrate Complete] Tables Processed: {success_count} Succeeded, {fail_count} Failed.")
    return fail_count == 0

if __name__ == "__main__":
    sqlite_file = sys.argv[1] if len(sys.argv) > 1 else "urbanpulse.db"
    target_url = sys.argv[2] if len(sys.argv) > 2 else os.environ.get("DATABASE_URL")
    migrate_sqlite_to_postgres(sqlite_file, target_url)
