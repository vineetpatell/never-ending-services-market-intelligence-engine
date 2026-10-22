import io

CSV = """timestamp,open,high,low,close,volume
2024-01-01,100,105,99,103,1000
2024-01-02,103,108,102,107,1200
2024-01-03,107,108,100,101,900
2024-01-04,101,106,100,105,950
2024-01-05,105,110,104,109,1100
"""


def test_coverage_empty(client):
    r = client.get("/api/v1/coverage", params={"exchange": "NSE", "symbol": "NOPE"})
    assert r.status_code == 200
    body = r.json()
    assert body["candle_count"] == 0
    assert body["gaps"] == []
    assert body["warnings"]


def test_coverage_after_import(client):
    files = {"file": ("t.csv", io.BytesIO(CSV.encode()), "text/csv")}
    client.post("/api/v1/imports", data={"exchange": "NSE", "symbol": "COV", "dry_run": "false"}, files=files)
    r = client.get("/api/v1/coverage", params={"exchange": "NSE", "symbol": "COV"})
    assert r.status_code == 200
    body = r.json()
    assert body["candle_count"] == 5
    assert body["first_ts"] is not None
    assert body["last_ts"] is not None
    assert body["duplicate_records"] == 0
    assert body["invalid_records"] == 0
    assert body["corporate_action_status"].startswith("unknown")


def test_coverage_gap_detection(client):
    csv = "timestamp,open,high,low,close,volume\n2024-01-01,100,105,99,103,1000\n2024-01-02,103,108,102,107,1200\n2024-01-12,107,108,100,101,900\n"
    files = {"file": ("g.csv", io.BytesIO(csv.encode()), "text/csv")}
    client.post("/api/v1/imports", data={"exchange": "NSE", "symbol": "GAP", "dry_run": "false"}, files=files)
    r = client.get("/api/v1/coverage", params={"exchange": "NSE", "symbol": "GAP"})
    body = r.json()
    assert len(body["gaps"]) == 1
