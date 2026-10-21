"""Reusable validation + normalization for imported market-data records."""
from __future__ import annotations

import math
from datetime import datetime, timezone
from typing import Any

VALID_STATUSES = {"DEMO", "IMPORTED", "DELAYED", "LIVE"}


def _is_finite_number(v: Any) -> bool:
    return isinstance(v, (int, float)) and not isinstance(v, bool) and math.isfinite(v)


def parse_timestamp(value: Any) -> int | None:
    """Normalize a timestamp value to epoch milliseconds (UTC).

    Accepts:
      - int/float epoch seconds (<= 10 digits) or milliseconds
      - ISO-8601 strings (date or datetime; naive assumed UTC)
      - numeric strings
    Returns None when unparseable.
    """
    if isinstance(value, bool):
        return None
    if isinstance(value, (int, float)):
        if not math.isfinite(value):
            return None
        iv = int(value)
        # Heuristic: seconds vs milliseconds
        if abs(iv) < 10_000_000_000:  # < 10^10 => seconds
            iv *= 1000
        return iv
    if isinstance(value, str):
        s = value.strip()
        if s == "":
            return None
        # numeric string
        try:
            num = float(s)
            if math.isfinite(num):
                iv = int(num)
                if abs(iv) < 10_000_000_000:
                    iv *= 1000
                return iv
        except ValueError:
            pass
        # ISO-8601
        try:
            txt = s.replace("Z", "+00:00")
            dt = datetime.fromisoformat(txt)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return int(dt.timestamp() * 1000)
        except ValueError:
            return None
    if isinstance(value, datetime):
        dt = value if value.tzinfo else value.replace(tzinfo=timezone.utc)
        return int(dt.timestamp() * 1000)
    return None


def validate_candle_record(record: dict[str, Any]) -> tuple[bool, list[str]]:
    """Validate a single normalized candle record (dict with price fields).

    Returns (ok, errors). Does not mutate input. Does not fabricate values.
    """
    errors: list[str] = []

    required = ("ts", "open", "high", "low", "close", "volume")
    for field in required:
        if field not in record or record[field] is None:
            errors.append(f"missing required field: {field}")
    if errors:
        return False, errors

    ts = record.get("ts")
    if not isinstance(ts, int) or ts <= 0:
        # allow parse attempt
        parsed = parse_timestamp(ts)
        if parsed is None or parsed <= 0:
            errors.append("invalid timestamp")
        else:
            ts = parsed
    # We don't mutate; caller uses parse_timestamp separately.

    for field in ("open", "high", "low", "close", "volume"):
        val = record.get(field)
        if not _is_finite_number(val):
            errors.append(f"{field} must be a finite number")
            continue
        if field in {"open", "high", "low", "close"} and val <= 0:
            errors.append(f"{field} must be > 0")
        if field == "volume" and val < 0:
            errors.append("volume must be >= 0")

    # OHLC relationship checks (only if all present & finite)
    o = record.get("open")
    h = record.get("high")
    l = record.get("low")
    c = record.get("close")
    if all(_is_finite_number(x) for x in (o, h, l, c)):
        if h < max(o, c, l):  # type: ignore[arg-type]
            errors.append("high must be >= open, close and low")
        if l > min(o, c, h):  # type: ignore[arg-type]
            errors.append("low must be <= open, close and high")
        if h < l:  # type: ignore[operator]
            errors.append("high must not be below low")

    return len(errors) == 0, errors


def normalize_record(raw: dict[str, Any]) -> dict[str, Any] | None:
    """Normalize a raw CSV row dict into a candle record. Returns None if
    timestamp cannot be parsed. Prices/volume kept as parsed floats."""
    out: dict[str, Any] = {}
    # timestamp
    ts_val = None
    for key in ("timestamp", "time", "date", "datetime", "ts"):
        if key in raw and raw[key] not in (None, ""):
            ts_val = raw[key]
            break
    ts = parse_timestamp(ts_val)
    if ts is None:
        return None
    out["ts"] = ts

    def _num(key: str) -> float | None:
        v = raw.get(key)
        if v is None or v == "":
            return None
        try:
            f = float(v)
            return f if math.isfinite(f) else None
        except (ValueError, TypeError):
            return None

    for field in ("open", "high", "low", "close", "volume"):
        aliases = {
            "open": ["open", "o"],
            "high": ["high", "h"],
            "low": ["low", "l"],
            "close": ["close", "c"],
            "volume": ["volume", "vol", "v"],
        }[field]
        val = None
        for a in aliases:
            if a in raw:
                val = _num(a)
                break
        out[field] = val if val is not None else raw.get(field)
    return out
