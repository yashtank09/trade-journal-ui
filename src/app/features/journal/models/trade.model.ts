export interface Trade {
  id: number;
  instrument: string;
  type: 'LONG' | 'SHORT';
  entry: number;
  exit: number | null;
  qty: number;
  date: string;
  time: string;
  status: 'OPEN' | 'CLOSED';
  netPnl: number | null;
  emotion: string;
  plan: string;
  notes: string;
  tags: string[];
}

export interface TradeFilters {
  type: 'ALL' | 'LONG' | 'SHORT';
  status: 'ALL' | 'OPEN' | 'CLOSED';
  date: 'ALL' | 'TODAY' | 'WEEK';
}

export interface SummaryStat {
  label: string;
  value: string | number;
  mono: boolean;
  color?: string;
}
