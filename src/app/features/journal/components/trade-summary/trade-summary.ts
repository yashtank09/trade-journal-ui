import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Trade, TradeFilters, SummaryStat } from '../../models/trade.model';
import { TradeService } from '../../services/trade.service';
import { SharedModule } from '../../../../shared/shared.module';

@Component({
  selector: 'app-trade-summary',
  imports: [CommonModule, FormsModule, SharedModule],
  templateUrl: './trade-summary.html',
  styleUrl: './trade-summary.scss'
})
export class TradeSummaryComponent {
  readonly C = {
    bg: "#F7F5F0", surface: "#FFFFFF", surfaceAlt: "#FAFAF8", border: "#E8E4DC",
    borderLight: "#F0EDE7", ink: "#1A1A1A", inkMid: "#5A5A5A", inkLight: "#9A9A9A",
    green: "#2D6A4F", greenLight: "#EAF3EE", greenBorder: "#A8D5BC", greenText: "#1E5C3F",
    red: "#C0392B", redLight: "#FDECEA", redBorder: "#F0A8A1", amber: "#B45309",
    amberLight: "#FEF3C7", amberBorder: "#FCD34D", indigo: "#4338CA", indigoLight: "#EEF2FF",
    shadow: "0 1px 8px rgba(0,0,0,0.07)", shadowMd: "0 4px 24px rgba(0,0,0,0.10)",
  };

  selected = signal<Trade | null>(null);
  showForm = signal(false);
  editing = signal<Trade | null>(null);
  search = signal('');
  filters = signal<TradeFilters>({ type: 'ALL', status: 'ALL', date: 'ALL' });
  page = signal(0);
  readonly PAGE_SIZE = 7;

  private tradeService = inject(TradeService);
  trades = this.tradeService.getAllTrades();

  constructor() {}

  filtered = computed(() => {
    return this.trades().filter(t => {
      const f = this.filters();
      if (f.type !== 'ALL' && t.type !== f.type) return false;
      if (f.status !== 'ALL' && t.status !== f.status) return false;
      if (f.date === 'TODAY' && t.date !== '2026-03-01') return false;
      if (f.date === 'WEEK' && t.date < '2026-02-24') return false;
      if (this.search() && !t.instrument.toLowerCase().includes(this.search().toLowerCase())) return false;
      return true;
    }).sort((a, b) => b.date.localeCompare(a.date));
  });

  pages = computed(() => Math.ceil(this.filtered().length / this.PAGE_SIZE));
  pageRows = computed(() => {
    const p = this.page();
    return this.filtered().slice(p * this.PAGE_SIZE, (p + 1) * this.PAGE_SIZE);
  });

  fmtPnl(n: number | null) {
    if (n === null) return '—';
    return n >= 0 ? `+₹${n.toLocaleString('en-IN')}` : `−₹${Math.abs(n).toLocaleString('en-IN')}`;
  }

  pnlStyle(n: number | null) {
    if (n === null) return { color: this.C.amber, fontWeight: 700 };
    return { color: n > 0 ? this.C.greenText : n < 0 ? this.C.red : this.C.amber, fontWeight: 700 };
  }

  summaryStats = computed((): SummaryStat[] => {
    const filtered = this.filtered();
    const closed = filtered.filter(t => t.status === 'CLOSED');
    const wins = closed.filter(t => t.netPnl! > 0);
    const total = closed.reduce((s, t) => s + (t.netPnl || 0), 0);
    const rate = closed.length ? Math.round(wins.length / closed.length * 100) : 0;

    return [
      { label: 'Trades shown', value: filtered.length, mono: false },
      { label: 'Net P&L', value: this.fmtPnl(total), mono: true, color: total >= 0 ? this.C.greenText : this.C.red },
      { label: 'Win rate', value: `${rate}%`, mono: true, color: rate >= 50 ? this.C.greenText : this.C.red },
      { label: 'Wins / Losses', value: `${wins.length} / ${closed.length - wins.length}`, mono: true },
    ];
  });

  onFiltersChange(newFilters: TradeFilters) {
    this.filters.set(newFilters);
    this.page.set(0);
  }

  onTypeFilterChange(type: 'ALL' | 'LONG' | 'SHORT') {
    this.filters.update(current => ({ ...current, type }));
    this.page.set(0);
  }

  onStatusFilterChange(status: 'ALL' | 'OPEN' | 'CLOSED') {
    this.filters.update(current => ({ ...current, status }));
    this.page.set(0);
  }

  onDateFilterChange(date: 'ALL' | 'TODAY' | 'WEEK') {
    this.filters.update(current => ({ ...current, date }));
    this.page.set(0);
  }

  onSearchChange(value: string) {
    this.search.set(value);
    this.page.set(0);
  }

  selectTrade(trade: Trade) {
    this.selected.set(trade);
  }

  closeDetails() {
    this.selected.set(null);
  }

  editTrade(trade: Trade) {
    this.editing.set(trade);
    this.showForm.set(true);
    this.selected.set(null);
  }

  addTrade() {
    this.editing.set(null);
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
    this.editing.set(null);
  }

  saveTrade(trade: Trade) {
    this.tradeService.saveTrade(trade);
    if (this.selected()?.id === trade.id) {
      this.selected.set(trade);
    }
    this.closeForm();
  }

  changePage(newPage: number) {
    this.page.set(newPage);
  }

  clearFilters() {
    this.filters.set({ type: 'ALL', status: 'ALL', date: 'ALL' });
    this.search.set('');
    this.page.set(0);
  }

  createArray(length: number): number[] {
    return Array.from({ length }, (_, i) => i);
  }

  getStatIcon(label: string): string {
    switch (label) {
      case 'Trades shown': return '📊';
      case 'Net P&L': return '💰';
      case 'Win rate': return '🎯';
      case 'Wins / Losses': return '⚖️';
      default: return '📈';
    }
  }

  getStatChange(label: string): boolean {
    // Simulate some stats having change indicators
    return label === 'Net P&L' || label === 'Win rate';
  }

  isDefaultFilters(): boolean {
    const f = this.filters();
    return f.type === 'ALL' && f.status === 'ALL' && f.date === 'ALL' && !this.search();
  }

  getCurrentDateString(): string {
    return new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
}
