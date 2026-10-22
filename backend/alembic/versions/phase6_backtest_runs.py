"""phase 6 backtest runs

Revision ID: 7a1b2c3d4e5f
Revises: 4f55fd26d348
Create Date: 2026-10-21 12:00:00.000000
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "7a1b2c3d4e5f"
down_revision: Union[str, Sequence[str], None] = "4f55fd26d348"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "backtest_runs",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("exchange", sa.String(length=8), nullable=False),
        sa.Column("symbol", sa.String(length=64), nullable=False),
        sa.Column("strategy_name", sa.String(length=64), nullable=False),
        sa.Column("strategy_version", sa.String(length=32), nullable=False, server_default="1"),
        sa.Column("params_json", sa.Text(), nullable=False, server_default="{}"),
        sa.Column("start_ts", sa.Integer(), nullable=False),
        sa.Column("end_ts", sa.Integer(), nullable=False),
        sa.Column("split_ts", sa.Integer(), nullable=True),
        sa.Column("initial_capital", sa.Float(), nullable=False),
        sa.Column("allocation_pct", sa.Float(), nullable=False),
        sa.Column("cost_bps", sa.Float(), nullable=False),
        sa.Column("slippage_bps", sa.Float(), nullable=False),
        sa.Column("execution_rule", sa.String(length=64), nullable=False, server_default="signal_at_close_execute_next_open"),
        sa.Column("dataset_source", sa.String(length=32), nullable=False, server_default="IMPORTED_CSV"),
        sa.Column("dataset_first_ts", sa.Integer(), nullable=True),
        sa.Column("dataset_last_ts", sa.Integer(), nullable=True),
        sa.Column("candle_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("status", sa.String(length=16), nullable=False, server_default="COMPLETED"),
        sa.Column("error_message", sa.String(length=512), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("(CURRENT_TIMESTAMP)"), nullable=False),
        sa.Column("finished_at", sa.DateTime(), nullable=True),
        sa.Column("result_json", sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_backtest_runs_exchange", "backtest_runs", ["exchange"], unique=False)
    op.create_index("ix_backtest_runs_symbol", "backtest_runs", ["symbol"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_backtest_runs_symbol", table_name="backtest_runs")
    op.drop_index("ix_backtest_runs_exchange", table_name="backtest_runs")
    op.drop_table("backtest_runs")
