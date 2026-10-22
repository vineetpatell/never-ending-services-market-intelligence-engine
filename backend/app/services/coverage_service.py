"""Historical data coverage / quality analysis (read-only, no fabrication)."""
from __future__ import annotations

import json
from datetime import datetime, timezone
from statistics import median
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app import models, schemas


def _ts_to_iso(ts: int | None) -> str | None:
    if ts is None:
        return None
    return datetime.fromtimestamp(ts / 1000, tz=timezone.utc).isoformat()


def compute_coverage(db: Session, exchange: str, symbol: str) -> schemas.CoverageReport:
    instrument = db.execute(
        select(models.Instrument).where(models.Instrument.exchange == exchange, models.Instrument.symbol == symbol)
    ).scalar_one_or_none()

    warnings: list[str] = []
    limitations: list[str] = [
        "Trading calendar is not enforced; missing sessions are not treated as errors.",
        "Corporate-action adjustment status is unverified unless explicit metadata exists.",
        "Gap detection uses inferred median interval; may miss irregular schedules.",
        "Duplicate/invalid counts come from retained import metadata, not re-scanning raw files.",
    ]

    if instrument is None:
        return schemas.CoverageReport(
            exchange=exchange,  # type: ignore[arg-type]
            symbol=symbol,
            candle_count=0,
            warnings=["No instrument or imported history found."],
            limitations=limitations,
        )

    rows = db.execute(
        select(models.Candle.ts).where(models.Candle.instrument_id == instrument.id).order_by(models.Candle.ts)
    ).scalars().all()
    ts_list = [int(r) for r in rows]
    count = len(ts_list)

    first_ts = ts_list[0] if ts_list else None
    last_ts = ts_list[-1] if ts_list else None

    # gaps
    gaps: list[schemas.CoverageGapOut] = []
    if len(ts_list) >= 2:
        deltas = [ts_list[i + 1] - ts_list[i] for i in range(len(ts_list) - 1)]
        med = median(deltas)
        threshold = med * 1.5 if med and med > 0 else None
        if threshold:
            for i in range(len(ts_list) - 1):
                d = ts_list[i + 1] - ts_list[i]
                if d > threshold:
                    gaps.append(schemas.CoverageGapOut(from_ts=ts_list[i], to_ts=ts_list[i + 1], gap_ms=d))

    # import runs
    runs = db.execute(
        select(models.ImportRun)
        .where(models.ImportRun.exchange == exchange, models.ImportRun.symbol == symbol)
        .order_by(models.ImportRun.started_at.desc())
    ).scalars().all()
    import_runs = [schemas.ImportRunOut.model_validate(r) for r in runs]

    dup_records = sum(r.duplicated for r in runs)
    invalid_records = sum(r.rejected for r in runs)

    # latest candle status/source
    latest = db.execute(
        select(models.Candle).where(models.Candle.instrument_id == instrument.id).order_by(models.Candle.ts.desc()).limit(1)
    ).scalar_one_or_none()
    status = latest.status if latest else "IMPORTED"
    source = latest.source if latest else "IMPORTED_CSV"

    date_range_days = None
    if first_ts is not None and last_ts is not None:
        date_range_days = (last_ts - first_ts) / (1000 * 60 * 60 * 24)

    if count == 0:
        warnings.append("No candle records available.")
    if count > 0 and count < 30:
        warnings.append("Very small history; metrics may be unreliable.")
    if gaps:
        warnings.append(f"{len(gaps)} gap(s) detected in the series.")
    if dup_records > 0:
        warnings.append(f"{dup_records} duplicate record(s) reported by imports.")
    if invalid_records > 0:
        warnings.append(f"{invalid_records} invalid record(s) reported by imports.")

    # corporate action adjustment status
    adj_notes = db.execute(
        select(models.Candle.adjustment_note).where(models.Candle.instrument_id == instrument.id).distinct()
    ).scalars().all()
    if any(n for n in adj_notes):
        corporate_status = "adjustment notes present (unverified)"
    else:
        corporate_status = "unknown / unverified"

    return schemas.CoverageReport(
        exchange=exchange,  # type: ignore[arg-type]
        symbol=symbol,
        candle_count=count,
        first_ts=first_ts,
        last_ts=last_ts,
        date_range_days=date_range_days,
        duplicate_records=dup_records,
        invalid_records=invalid_records,
        gaps=gaps,
        missing_sessions=[],
        corporate_action_status=corporate_status,
        source=source,
        status=status,  # type: ignore[arg-type]
        is_live=(status == "LIVE"),
        import_runs=import_runs,
        warnings=warnings,
        limitations=limitations,
    )
