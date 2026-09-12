import os
import re
import sqlite3
from typing import Any, List, Dict, Tuple, Optional

# Load environment variables if python-dotenv is present
try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

RAW_DATABASE_URL = os.environ.get("DATABASE_URL") or os.environ.get("POSTGRES_URL")

def get_db_type() -> str:
    if RAW_DATABASE_URL and RAW_DATABASE_URL.strip():
        return "postgresql"
    return "sqlite"

class RowAdapter:
    """
    Unified Row Wrapper supporting dictionary access r['col'], property access r.col,
    and dictionary methods like r.get('col').
    """
    def __init__(self, data: Dict[str, Any]):
        self._data = data

    def __getitem__(self, item: Any) -> Any:
        if isinstance(item, int):
            return list(self._data.values())[item]
        return self._data[item]

    def __getattr__(self, item: str) -> Any:
        if item in self._data:
            return self._data[item]
        raise AttributeError(f"'RowAdapter' object has no attribute '{item}'")

    def get(self, key: str, default: Any = None) -> Any:
        return self._data.get(key, default)

    def keys(self):
        return self._data.keys()

    def values(self):
        return self._data.values()

    def items(self):
        return self._data.items()

    def to_dict(self) -> Dict[str, Any]:
        return dict(self._data)

    def __repr__(self):
        return f"<RowAdapter {self._data}>"

class AbstractCursor:
    """
    Abstract Cursor providing unified execute/fetchall/fetchone behavior
    with positional placeholder translation ('?' -> '%s' for Postgres).
    """
    def __init__(self, raw_cursor: Any, is_postgres: bool = False):
        self._cursor = raw_cursor
        self.is_postgres = is_postgres

    def _translate_query(self, query: str) -> str:
        if self.is_postgres:
            # Preserve existing double percents
            q = query.replace('%%', '__DB_ADAPTER_DBL_PCT__')
            # Escape literal % that are not valid psycopg placeholders (%s, %b, %t)
            q = re.sub(r'%(?![sbt])', '%%', q)
            q = q.replace('__DB_ADAPTER_DBL_PCT__', '%%')
            # Replace ? with %s for Postgres psycopg DBAPI
            q = q.replace('?', '%s')
            return q
        return query

    def execute(self, query: str, params: Optional[Tuple] = None):
        translated = self._translate_query(query)
        if params is None or (isinstance(params, (tuple, list)) and len(params) == 0):
            return self._cursor.execute(translated)
        return self._cursor.execute(translated, params)

    def executemany(self, query: str, params_list: List[Tuple]):
        translated = self._translate_query(query)
        if not params_list:
            return
        return self._cursor.executemany(translated, params_list)

    def fetchone(self) -> Optional[RowAdapter]:
        row = self._cursor.fetchone()
        if row is None:
            return None
        if isinstance(row, sqlite3.Row):
            return RowAdapter(dict(row))
        if isinstance(row, dict):
            return RowAdapter(row)
        if hasattr(self._cursor, 'description') and self._cursor.description:
            colnames = [desc[0] for desc in self._cursor.description]
            return RowAdapter(dict(zip(colnames, row)))
        return row

    def fetchall(self) -> List[RowAdapter]:
        rows = self._cursor.fetchall()
        if not rows:
            return []
        if hasattr(self._cursor, 'description') and self._cursor.description:
            colnames = [desc[0] for desc in self._cursor.description]
            result = []
            for r in rows:
                if isinstance(r, sqlite3.Row):
                    result.append(RowAdapter(dict(r)))
                elif isinstance(r, dict):
                    result.append(RowAdapter(r))
                else:
                    result.append(RowAdapter(dict(zip(colnames, r))))
            return result
        return [RowAdapter(dict(r)) if isinstance(r, (sqlite3.Row, dict)) else r for r in rows]

    @property
    def rowcount(self):
        return getattr(self._cursor, 'rowcount', -1)

class AbstractConnection:
    """
    Abstract Database Connection wrapping SQLite or PostgreSQL connection.
    """
    def __init__(self, raw_conn: Any, is_postgres: bool = False):
        self._conn = raw_conn
        self.is_postgres = is_postgres

    def cursor(self) -> AbstractCursor:
        if self.is_postgres:
            # psycopg 3 cursor or psycopg2 dict cursor
            try:
                import psycopg.rows
                raw_cur = self._conn.cursor(row_factory=psycopg.rows.dict_row)
            except Exception:
                raw_cur = self._conn.cursor()
        else:
            raw_cur = self._conn.cursor()
        return AbstractCursor(raw_cur, is_postgres=self.is_postgres)

    def commit(self):
        return self._conn.commit()

    def rollback(self):
        return self._conn.rollback()

    def close(self):
        return self._conn.close()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type:
            self.rollback()
        else:
            self.commit()

def get_db_connection() -> AbstractConnection:
    db_type = get_db_type()
    if db_type == "postgresql":
        import psycopg
        # Parse connection string
        url = RAW_DATABASE_URL
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
        raw_conn = psycopg.connect(url, autocommit=False)
        return AbstractConnection(raw_conn, is_postgres=True)
    else:
        db_path = os.environ.get("DB_PATH", "urbanpulse.db")
        raw_conn = sqlite3.connect(db_path)
        raw_conn.row_factory = sqlite3.Row
        return AbstractConnection(raw_conn, is_postgres=False)
