"""CSV import workflow for historical OHLCV data."""
from __future__ import annotations
import csv, io, json
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app import models, schemas
from app.validators import normalize_record, validate_candle_record


def _has_ts(headers):
    lower = {h.strip().lower() for h in headers}
    return bool(lower & {"timestamp", "time", "date", "datetime", "ts"})


def _missing(headers):
    lower = {h.strip().lower() for h in headers}
    missing = []
    for field, aliases in {"open": ["open", "o"], "high": ["high", "h"], "low": ["low", "l"], "close": ["close", "c"], "volume": ["volume", "vol", "v"]}.items():
        if not (lower & set(aliases)):
            missing.append(field)
    if not _has_ts(headers):
        missing.append("timestamp/date")
    return missing


def import_csv(db, *, file_name, content, exchange, symbol, dry_run=False):
    errors = []
    total = accepted = rejected = duplicated = skipped = 0
    try:
        text = content.decode("utf-8-sig")
    except UnicodeDecodeError:
        text = content.decode("latin-1")
    reader = csv.DictReader(io.StringIO(text))
    headers = reader.fieldnames or []
    missing = _missing(headers)
    if missing:
        return schemas.ImportSummary(file_name=file_name, exchange=exchange, symbol=symbol, dry_run=dry_run, total_rows=0, accepted=0, rejected=0, duplicated=0, skipped=0, errors=[schemas.ValidationErrorOut(row=None, field=None, message=f"missing required headers: {', '.join(missing)}")])
    instrument = db.execute(select(models.Instrument).where(models.Instrument.exchange == exchange, models.Instrument.symbol == symbol)).scalar_one_or_none()
    if instrument is None:
        instrument = models.Instrument(exchange=exchange, symbol=symbol, name=symbol)
        db.add(instrument)
        db.flush()
    existing_ts = set(r[0] for r in db.execute(select(models.Candle.ts).where(models.Candle.instrument_id == instrument.id)).all())
    rows_to_insert = []
    seen_in_file = set()
    for idx, raw in enumerate(reader, start=2):
        total += 1
        if raw is None or all((v is None or str(v).strip() == "") for v in raw.values()):
            skipped += 1
            continue
        normalized = normalize_record(raw)
        if normalized is None:
            rejected += 1
            errors.append(schemas.ValidationErrorOut(row=idx, field="timestamp", message="unparseable timestamp"))
            continue
        ok, verrs = validate_candle_record(normalized)
        if not ok:
            rejected += 1
            for e in verrs:
                errors.append(schemas.ValidationErrorOut(row=idx, field=None, message=e))
            continue
        ts = normalized["ts"]
        if ts in seen_in_file:
            duplicated += 1
            errors.append(schemas.ValidationErrorOut(row=idx, field="timestamp", message="duplicate timestamp within file"))
            continue
        seen_in_file.add(ts)
        if ts in existing_ts:
            duplicated += 1
            continue
        rows_to_insert.append(models.Candle(instrument_id=instrument.id, ts=ts, open=float(normalized["open"]), high=float(normalized["high"]), low=float(normalized["low"]), close=float(normalized["close"]), volume=float(normalized["volume"]), status="IMPORTED", source="IMPORTED_CSV"))
        accepted += 1
    import_run_id = None
    if not dry_run:
        try:
            if rows_to_insert:
                db.add_all(rows_to_insert)
            run = models.ImportRun(exchange=exchange, symbol=symbol, file_name=file_name, source_name="CSV", status="COMPLETED", total_rows=total, accepted=accepted, rejected=rejected, duplicated=duplicated, skipped=skipped, errors_json=json.dumps([e.model_dump() for e in errors]) if errors else None, finished_at=datetime.now(timezone.utc))
            db.add(run)
            db.commit()
            db.refresh(run)
            import_run_id = run.id
        except IntegrityError:
            db.rollback()
            raise
    return schemas.ImportSummary(file_name=file_name, exchange=exchange, symbol=symbol, dry_run=dry_run, total_rows=total, accepted=accepted, rejected=rejected, duplicated=duplicated, skipped=skipped, errors=errors, import_run_id=import_run_id)
