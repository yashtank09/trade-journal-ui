export interface DashboardSummaryDTO {
  totalTrades: number;
  winRate: number;
  totalNetPnl: number;
  profitFactor: number;
  averageWin: number;
  averageLoss: number;
  maxWin: number;
  maxLoss: number;
}

export interface ChartPointDTO {
  label: string;
  value: number;
}

export interface BreakdownDTO {
  category: string;
  netPnl: number;
  tradeCount: number;
  winRate: number;
}

export interface RiskMetricsDTO {
  averageRiskAmount: number;
  averageRMultiple: number;
  maxDrawdown: number;
  expectancy: number;
}
