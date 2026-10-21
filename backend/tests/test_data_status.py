def test_data_status_empty(client):
    r = client.get("/api/v1/data-status", params={"exchange": "NSE", "symbol": "NOPE"})
    assert r.status_code == 200
    body = r.json()
    assert body["count"] == 0
    assert body["is_live"] is False


def test_data_status_after_import(client):
    import io
    CSV = "timestamp,open,high,low,close,volume\n2024-01-01,100,105,99,103,1000\n"
    files = {"file": ("t.csv", io.BytesIO(CSV.encode()), "text/csv")}
    client.post("/api/v1/imports", data={"exchange": "NSE", "symbol": "D", "dry_run": "false"}, files=files)
    r = client.get("/api/v1/data-status", params={"exchange": "NSE", "symbol": "D"})
    body = r.json()
    assert body["count"] == 1
    assert body["status"] == "IMPORTED"
    assert body["is_live"] is False
    assert body["first_ts"] is not None
    assert body["last_ts"] is not None
