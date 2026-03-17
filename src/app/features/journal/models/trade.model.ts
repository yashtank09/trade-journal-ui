export interface Trade {
  id: number;
  userId: number;
  symbol: string;
  segment: string;
  exchange: string;
  direction: 'LONG' | 'SHORT';
  positionStatus: 'OPEN' | 'CLOSED';
  entryQty: number;
  entryAvgPrice: number;
  exitQty: number;
  exitAvgPrice: number;
  openQty: number;
  openedAt: string;
  closedAt: string;
  realizedPnl: number;
  lastTradeId: number;
  turnover: number;
  createdBy: number;
  updatedBy: number;
  createdAt: string;
  updatedAt: string;
  // UI-specific fields
  emotion?: string;
  plan?: string;
  notes?: string;
  tags?: string[];
}

export interface TradeFilters {
  type: 'ALL' | 'LONG' | 'SHORT';
  status: 'ALL' | 'OPEN' | 'CLOSED';
  date: 'ALL' | 'TODAY' | 'WEEK' | 'MONTH' | 'CUSTOM';
  startDate?: string;
  endDate?: string;
}

export interface SummaryStat {
  label: string;
  value: string | number;
  mono: boolean;
  color?: string;
}
