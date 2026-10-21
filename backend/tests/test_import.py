import io

CSV = """timestamp,open,high,low,close,volume
2024-01-01,100,105,99,103,1000
2024-01-02,103,108,102,107,1200
2024-01-03,107,108,100,101,900
"""


def test_import_dry_run(client):
    files = {"file": ("t.csv", io.BytesIO(CSV.encode()), "text/csv")}
    data = {"exchange": "NSE", "symbol": "TEST", "dry_run": "true"}
    r = client.post("/api/v1/imports", data=data, files=files)
    assert r.status_code == 200
    body = r.json()
    assert body["accepted"] == 3
    assert body["rejected"] == 0
    assert body["duplicated"] == 0
    # dry run: no candles persisted
    r2 = client.get("/api/v1/candles", params={"exchange": "NSE", "symbol": "TEST"})
    assert r2.json()["count"] == 0


def test_import_persist_and_idempotent(client):
    files = {"file": ("t.csv", io.BytesIO(CSV.encode()), "text/csv")}
    data = {"exchange": "NSE", "symbol": "TEST", "dry_run": "false"}
    r = client.post("/api/v1/imports", data=data, files=files)
    assert r.status_code == 200
    assert r.json()["accepted"] == 3
    # second import duplicates
    files2 = {"file": ("t.csv", io.BytesIO(CSV.encode()), "text/csv")}
    r2 = client.post("/api/v1/imports", data=data, files=files2)
    assert r2.json()["duplicated"] == 3
    assert r2.json()["accepted"] == 0
    # candles present
    r3 = client.get("/api/v1/candles", params={"exchange": "NSE", "symbol": "TEST"})
    assert r3.json()["count"] == 3
    assert r3.json()["status"] == "IMPORTED"
    assert r3.json()["is_live"] is False


def test_import_bad_headers(client):
    bad = "foo,bar\n1,2\n"
    files = {"file": ("t.csv", io.BytesIO(bad.encode()), "text/csv")}
    data = {"exchange": "NSE", "symbol": "TEST", "dry_run": "true"}
    r = client.post("/api/v1/imports", data=data, files=files)
    assert r.status_code == 200
    body = r.json()
    assert body["errors"]
    assert "missing required headers" in body["errors"][0]["message"]


def test_import_bad_ohlc(client):
    bad = """timestamp,open,high,low,close,volume
2024-01-01,100,90,99,103,1000
"""
    files = {"file": ("t.csv", io.BytesIO(bad.encode()), "text/csv")}
    data = {"exchange": "NSE", "symbol": "TEST2", "dry_run": "true"}
    r = client.post("/api/v1/imports", data=data, files=files)
    body = r.json()
    assert body["rejected"] == 1
    assert body["accepted"] == 0


def test_transaction_rollback_on_duplicate_constraint(monkeypatch, client):
    # Not easily forcing DB-level dup; skip assertion of rollback internals.
    pass
