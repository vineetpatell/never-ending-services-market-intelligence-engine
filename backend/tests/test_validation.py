from app.validators import parse_timestamp, validate_candle_record, normalize_record


def test_parse_timestamp_seconds():
    assert parse_timestamp(1700000000) == 1700000000000


def test_parse_timestamp_ms():
    assert parse_timestamp(1700000000000) == 1700000000000


def test_parse_timestamp_iso():
    assert parse_timestamp("2024-01-01") is not None


def test_validate_valid_candle():
    rec = {"ts": 1000, "open": 10, "high": 12, "low": 9, "close": 11, "volume": 5}
    ok, errs = validate_candle_record(rec)
    assert ok is True
    assert errs == []


def test_validate_bad_ohlc():
    rec = {"ts": 1000, "open": 10, "high": 8, "low": 9, "close": 11, "volume": 5}
    ok, errs = validate_candle_record(rec)
    assert ok is False
    assert any("high" in e for e in errs)


def test_validate_negative_volume():
    rec = {"ts": 1000, "open": 10, "high": 12, "low": 9, "close": 11, "volume": -1}
    ok, errs = validate_candle_record(rec)
    assert ok is False


def test_normalize_record():
    raw = {"timestamp": "2024-01-01", "open": "10", "high": "12", "low": "9", "close": "11", "volume": "5"}
    out = normalize_record(raw)
    assert out is not None
    assert out["open"] == 10.0
    assert out["volume"] == 5.0
    assert isinstance(out["ts"], int)
