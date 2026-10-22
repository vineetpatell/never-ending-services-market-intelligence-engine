"""Pure backtesting engine for NES (research/paper analysis only)."""
from __future__ import annotations

from dataclasses import asdict, dataclass
from statistics import mean
from typing import Any


@dataclass
class BacktestConfig:
    short_period: int
    long_period: int
    initial_capital: float
    allocation_pct: float
    cost_bps: float
    slippage_bps: float
    cost_per_trade: float = 0.0
    split_ts: int | None = None


@dataclass
class Trade:
    entry_ts: int
    exit_ts: int
    entry_price: float
    exit_price: float
    quantity: float
    gross_pnl: float
    costs: float
    net_pnl: float

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


@dataclass
class BacktestResult:
    metrics: dict[str, Any]
    equity_curve: list[dict[str, Any]]
    trades: list[dict[str, Any]]
    assumptions: list[str]
    warnings: list[str]


def _sma(values: list[float], period: int) -> float | None:
    if len(values) < period:
        return None
    return sum(values[-period:]) / period


def run_sma_crossover(
    candles: list[dict[str, Any]],
    config: BacktestConfig,
) -> BacktestResult:
    candles = sorted(candles, key=lambda c: c["ts"])
    warnings: list[str] = []
    if len(candles) < config.long_period + 2:
        warnings.append("insufficient candles for warm-up; result may be empty")

    cash = config.initial_capital
    qty = 0.0
    entry_price = 0.0
    entry_ts = 0
    entry_cost = 0.0
    trades: list[Trade] = []
    equity_curve: list[dict[str, Any]] = []
    closes: list[float] = []
    in_position = False
    bars_in_market = 0
    total_bars = len(candles)

    slip = config.slippage_bps / 10000.0
    cost_rate = config.cost_bps / 10000.0

    for i, bar in enumerate(candles):
        closes.append(float(bar["close"]))
        ts = int(bar["ts"])

        if in_position:
            bars_in_market += 1
        mtm = cash + (qty * float(bar["close"]) if in_position else 0.0)

        short_sma = _sma(closes, config.short_period)
        long_sma = _sma(closes, config.long_period)

        signal_buy = False
        signal_sell = False
        if short_sma is not None and long_sma is not None:
            if short_sma > long_sma:
                signal_buy = True
            elif short_sma <= long_sma:
                signal_sell = True

        if config.split_ts is not None and ts < config.split_ts:
            signal_buy = False
            signal_sell = False

        next_bar = candles[i + 1] if i + 1 < len(candles) else None
        if next_bar is not None:
            next_open = float(next_bar["open"])
            next_ts = int(next_bar["ts"])
            if signal_buy and not in_position:
                fill = next_open * (1.0 + slip)
                budget = cash * config.allocation_pct
                q = int(budget // fill) if fill > 0 else 0
                if q > 0:
                    notional = q * fill
                    trade_cost = notional * cost_rate + config.cost_per_trade
                    cash -= notional + trade_cost
                    qty = float(q)
                    entry_price = fill
                    entry_ts = next_ts
                    entry_cost = trade_cost
                    in_position = True
            elif signal_sell and in_position:
                fill = next_open * (1.0 - slip)
                notional = qty * fill
                trade_cost = notional * cost_rate + config.cost_per_trade
                gross = (fill - entry_price) * qty
                cash += notional - trade_cost
                trades.append(
                    Trade(
                        entry_ts=entry_ts,
                        exit_ts=next_ts,
                        entry_price=entry_price,
                        exit_price=fill,
                        quantity=qty,
                        gross_pnl=gross,
                        costs=entry_cost + trade_cost,
                        net_pnl=gross - (entry_cost + trade_cost),
                    )
                )
                qty = 0.0
                in_position = False
                entry_cost = 0.0

        equity_curve.append({"ts": ts, "equity": mtm})

    final_equity = cash
    if in_position and candles:
        final_equity = cash + qty * float(candles[-1]["close"])

    completed = len(trades)
    wins = [t for t in trades if t.net_pnl > 0]
    losses = [t for t in trades if t.net_pnl <= 0]
    gross_profit = sum(t.gross_pnl for t in trades)
    total_costs = sum(t.costs for t in trades)
    net_profit = final_equity - config.initial_capital
    net_return_pct = (net_profit / config.initial_capital * 100.0) if config.initial_capital else 0.0

    peak = equity_curve[0]["equity"] if equity_curve else config.initial_capital
    max_dd = 0.0
    for point in equity_curve:
        e = point["equity"]
        if e > peak:
            peak = e
        if peak > 0:
            dd = (peak - e) / peak
            if dd > max_dd:
                max_dd = dd
    max_dd_pct = max_dd * 100.0

    exposure_pct = (bars_in_market / total_bars * 100.0) if total_bars else 0.0

    sharpe = None
    if len(equity_curve) >= 2:
        returns = []
        for j in range(1, len(equity_curve)):
            prev = equity_curve[j - 1]["equity"]
            cur = equity_curve[j]["equity"]
            if prev and prev != 0:
                returns.append((cur - prev) / prev)
        if len(returns) >= 2:
            m = mean(returns)
            var = sum((r - m) ** 2 for r in returns) / (len(returns) - 1)
            std = var ** 0.5
            if std > 0:
                sharpe = (m / std) * (252 ** 0.5)

    metrics = {
        "initial_capital": config.initial_capital,
        "final_equity": final_equity,
        "net_profit": net_profit,
        "net_return_pct": net_return_pct,
        "gross_profit": gross_profit,
        "total_costs": total_costs,
        "completed_trades": completed,
        "win_rate": (len(wins) / completed) if completed else None,
        "avg_win": mean([t.net_pnl for t in wins]) if wins else None,
        "avg_loss": mean([t.net_pnl for t in losses]) if losses else None,
        "max_drawdown_pct": max_dd_pct,
        "exposure_pct": exposure_pct,
        "sharpe_ratio": sharpe,
    }

    assumptions = [
        "Strategy: SMA crossover (long-only).",
        "Signal uses closes up to the decision bar only (no look-ahead).",
        "Execution at next bar open with slippage applied.",
        "Costs applied as basis points of notional plus per-trade fee.",
        "Position size = floor(cash * allocation / fill price) whole units.",
        "Open position at end is marked to market but not closed (no trade recorded).",
        "Equity curve marks to market at each bar close.",
        "Sharpe annualized with sqrt(252) assuming daily bars; risk-free rate 0.",
    ]
    if config.split_ts is not None:
        assumptions.append(f"Walk-forward split at {config.split_ts}; entries disabled before split.")

    return BacktestResult(
        metrics=metrics,
        equity_curve=equity_curve,
        trades=[t.to_dict() for t in trades],
        assumptions=assumptions,
        warnings=warnings,
    )
