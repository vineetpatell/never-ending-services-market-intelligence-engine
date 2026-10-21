import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router-dom";
import { Shell } from "./components/Shell";
import { CopilotPage } from "./pages/Copilot";
import { HomePage } from "./pages/Home";
import { InsuranceOverviewPage, ReviewPage, VaultPage } from "./pages/Insurance1";
import { ClaimsPage, ComparisonPage, RenewalsPage } from "./pages/Insurance2";
import { LibraryPage, SettingsPage } from "./pages/Misc";
import { NotFoundPage } from "./pages/NotFound";
import { ScreenerPage, TradingOverviewPage } from "./pages/Trading1";
import { AnalysisPage, WatchlistPage } from "./pages/Trading2";
import { ChartExplorerPage } from "./pages/ChartExplorer";
import { BacktestingPage, StrategiesPage } from "./pages/Trading3";
import { PaperPage } from "./pages/Trading4";
import { RiskPage } from "./pages/Trading5";
import { MotionLabPage } from "./motion/MotionLabPage";
import "./index.css";

// HashRouter: no server rewrites needed for a localhost static build (ADR-0003).
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HashRouter>
      <Shell>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/trading" element={<TradingOverviewPage />} />
          <Route path="/trading/screener" element={<ScreenerPage />} />
          <Route path="/trading/watchlist" element={<WatchlistPage />} />
          <Route path="/trading/analysis" element={<AnalysisPage />} />
<Route path="/trading/chart" element={<ChartExplorerPage />} />
          <Route path="/trading/strategies" element={<StrategiesPage />} />
          <Route path="/trading/backtesting" element={<BacktestingPage />} />
          <Route path="/trading/paper" element={<PaperPage />} />
          <Route path="/trading/risk" element={<RiskPage />} />
          <Route path="/trading/motion-lab" element={<MotionLabPage />} />
          <Route path="/insurance" element={<InsuranceOverviewPage />} />
          <Route path="/insurance/vault" element={<VaultPage />} />
          <Route path="/insurance/review" element={<ReviewPage />} />
          <Route path="/insurance/comparison" element={<ComparisonPage />} />
          <Route path="/insurance/claims" element={<ClaimsPage />} />
          <Route path="/insurance/renewals" element={<RenewalsPage />} />
          <Route path="/copilot" element={<CopilotPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Shell>
    </HashRouter>
  </StrictMode>,
);

