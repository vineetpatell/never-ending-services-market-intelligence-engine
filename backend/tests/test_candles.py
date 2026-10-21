def test_candles_empty(client):
    r = client.get("/api/v1/candles", params={"exchange": "NSE", "symbol": "NOPE"})
    assert r.status_code == 200
    assert r.json()["count"] == 0


def test_candles_invalid_exchange(client):
    r = client.get("/api/v1/candles", params={"exchange": "FOO", "symbol": "X"})
    assert r.status_code == 400


def test_candles_date_range(client):
    import io
    CSV = "timestamp,open,high,low,close,volume\n2024-01-01,100,105,99,103,1000\n2024-01-02,103,108,102,107,1200\n"
    files = {"file": ("t.csv", io.BytesIO(CSV.encode()), "text/csv")}
    client.post("/api/v1/imports", data={"exchange": "NSE", "symbol": "R", "dry_run": "false"}, files=files)
    r = client.get("/api/v1/candles", params={"exchange": "NSE", "symbol": "R", "limit": 1})
    assert r.json()["count"] == 1
    # from > to invalid
    r2 = client.get("/api/v1/candles", params={"exchange": "NSE", "symbol": "R", "from": 9999999999999, "to": 1})
    assert r2.status_code == 400
