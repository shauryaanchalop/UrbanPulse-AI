from db_adapter import get_db_connection, get_db_type, RowAdapter

def test_db_adapter_sqlite():
    db_type = get_db_type()
    print(f"Active DB Type: {db_type}")
    assert db_type == "sqlite"

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cur.fetchall()
    conn.close()

    print(f"Fetched {len(tables)} tables via AbstractConnection:")
    assert len(tables) > 0
    assert hasattr(tables[0], 'get')
    assert tables[0].get('name') is not None
    print("[OK] test_db_adapter_sqlite PASSED!")

if __name__ == '__main__':
    test_db_adapter_sqlite()
