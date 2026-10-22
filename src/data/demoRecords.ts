import { DEMO_SOURCE } from "./demoQuotes";

/**
 * Demo fixtures part 2/2 — backtests, paper, activity.
 * All synthetic. Simulation-only rules apply.
 */

export interface BacktestDemo {
  id: string;
  strategyName: string;
  strategyVersion: string;
  symbol: string;
  period: string;
  totalReturnPct: number;
  maxDrawdownPct: number;
  tradeCount: number;
  assumptions: string;
  source: typeof DEMO_SOURCE;
}

export interface PaperOrder {
  id: string;
  symbol: string;
  side: "BUY" | "SELL";
  quantity: number;
  simulatedPrice: number;
  status: "Simulated (demo)";
  timestamp: string;
}

export interface ActivityRecord {
  id: string;
  at: string;
  kind: "research" | "backtest" | "paper" | "copilot";
  summary: string;
}

export interface CopilotPreset {
  id: string;
  prompt: string;
  answer: string;
  limitation: string;
}

export const demoBacktests: BacktestDemo[] = [
  {
    id: "bt-1",
    strategyName: "SMA cross (demo)",
    strategyVersion: "v1",
    symbol: "DEMO Bank (NSE)",
    period: "2024-01-01 → 2024-12-31 (demo bars)",
    totalReturnPct: 6.4,
    maxDrawdownPct: -3.1,
    tradeCount: 14,
    assumptions: "₹20/order fees · 0.05% slippage · next-bar fill · DEMO_DATA bars",
    source: DEMO_SOURCE,
  },
];

export const initialPaperOrders: PaperOrder[] = [
  { id: "po-1", symbol: "DEMO Bank", side: "BUY", quantity: 10, simulatedPrice: 123.45, status: "Simulated (demo)", timestamp: "2026-10-18 10:15 IST" },
];

export const PAPER_CASH_START = 100000;

export const demoActivity: ActivityRecord[] = [
  { id: "ac-1", at: "2026-10-20", kind: "research", summary: "Opened DEMO Bank analysis (demo snapshot)." },
  { id: "ac-2", at: "2026-10-19", kind: "backtest", summary: "Ran SMA cross (demo) v1 — 14 demo trades." },
  { id: "ac-3", at: "2026-10-18", kind: "paper", summary: "Simulated BUY 10 × DEMO Bank (demo order)." },
  { id: "ac-4", at: "2026-10-17", kind: "copilot", summary: "Asked preset prompt “What is a backtest?” (demo)." },
];

export const copilotPresets: CopilotPreset[] = [
  {
    id: "cp-1",
    prompt: "What is a backtest?",
    answer:
      "Demonstration response: a backtest replays a strategy over historical data with stated assumptions (period, fees, slippage, fill timing). Results are historical, not predictive.",
    limitation: "Demo answer only — no model connected, no real data used.",
  },
  {
    id: "cp-2",
    prompt: "Compare my demo watchlist",
    answer:
      "Demonstration response: DEMO Bank and DEMO Motors both sit in the demo watchlist. Like-for-like comparison needs verified fields and a stated period first — the demo fixtures carry neither.",
    limitation: "Uses synthetic watchlist entries; no live quotes, no verified fundamentals.",
  },
  {
    id: "cp-3",
    prompt: "Is this paper order real?",
    answer:
      "Demonstration response: no. Paper orders are simulated records only and are never routed to a broker.",
    limitation: "Simulation boundary is permanent in this release.",
  },
];
