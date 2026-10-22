import io
from datetime import date, timedelta


def _make_csv(n=40):
    lines = ["timestamp,open,high,low,close,volume"]
    price = 100.0
    for i in range(n):
        d = date(2024, 1, 1) + timedelta(days=i)
        o = price
        c = price + (i % 5 - 2) * 0.5
        h = max(o, c) + 1.0
        l = min(o, c) - 1.0
        lines.append(f"{d.isoformat()},{o},{h},{l},{c},1000")
        price = c
    return "\n".join(lines) + "\n"


def test_backtest_invalid_params(client):
    r = client.post("/api/v1/backtests", json={
        "exchange": "NSE",
        "symbol": "X",
        "short_period": 5,
        "long_period": 5,
        "start_ms": 1,
        "end_ms": 2,
        "initial_capital": 1000,
        "allocation_pct": 1.0,
        "cost_bps": 0,
        "slippage_bps": 0,
    })
    assert r.status_code == 422


def test_backtest_insufficient_data(client):
    csv = _make_csv(5)
    files = {"file": ("t.csv", io.BytesIO(csv.encode()), "text/csv")}
    client.post("/api/v1/imports", data={"exchange": "NSE", "symbol": "BT", "dry_run": "false"}, files=files)
    cov = client.get("/api/v1/coverage", params={"exchange": "NSE", "symbol": "BT"}).json()
    r = client.post("/api/v1/backtests", json={
        "exchange": "NSE",
        "symbol": "BT",
        "short_period": 3,
        "long_period": 10,
        "start_ms": cov["first_ts"],
        "end_ms": cov["last_ts"],
        "initial_capital": 100000,
        "allocation_pct": 1.0,
        "cost_bps": 10,
        "slippage_bps": 5,
    })
    assert r.status_code == 400


def test_backtest_run_and_retrieve(client):
    csv = _make_csv(40)
    files = {"file": ("t.csv", io.BytesIO(csv.encode()), "text/csv")}
    client.post("/api/v1/imports", data={"exchange": "NSE", "symbol": "BT2", "dry_run": "false"}, files=files)
    cov = client.get("/api/v1/coverage", params={"exchange": "NSE", "symbol": "BT2"}).json()
    r = client.post("/api/v1/backtests", json={
        "exchange": "NSE",
        "symbol": "BT2",
        "short_period": 3,
        "long_period": 8,
        "start_ms": cov["first_ts"],
        "end_ms": cov["last_ts"],
        "initial_capital": 100000,
        "allocation_pct": 1.0,
        "cost_bps": 10,
        "slippage_bps": 5,
    })
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["status"] == "COMPLETED"
    assert body["metrics"] is not None
    assert body["metrics"]["completed_trades"] >= 0
    assert len(body["equity_curve"]) == 40
    assert body["assumptions"]
    # retrieve
    rid = body["id"]
    r2 = client.get(f"/api/v1/backtests/{rid}")
    assert r2.status_code == 200
    assert r2.json()["id"] == rid
    # list
    rl = client.get("/api/v1/backtests", params={"symbol": "BT2"})
    assert rl.json()["count"] >= 1


def test_backtest_walk_forward_split(client):
    csv = _make_csv(40)
    files = {"file": ("t.csv", io.BytesIO(csv.encode()), "text/csv")}
    client.post("/api/v1/imports", data={"exchange": "NSE", "symbol": "BT3", "dry_run": "false"}, files=files)
    cov = client.get("/api/v1/coverage", params={"exchange": "NSE", "symbol": "BT3"}).json()
    mid = cov["first_ts"] + (cov["last_ts"] - cov["first_ts"]) // 2
    r = client.post("/api/v1/backtests", json={
        "exchange": "NSE",
        "symbol": "BT3",
        "short_period": 3,
        "long_period": 8,
        "start_ms": cov["first_ts"],
        "end_ms": cov["last_ts"],
        "split_ms": mid,
        "initial_capital": 100000,
        "allocation_pct": 1.0,
        "cost_bps": 10,
        "slippage_bps": 5,
    })
    assert r.status_code == 200
    body = r.json()
    assert body["split_ts"] == mid
    # trades (if any) should have entry after split
    for t in body["trades"]:
        assert t["entry_ts"] >= mid
