import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { DatePickerModule } from 'primeng/datepicker';
import { Trade, TradeFilters, SummaryStat } from '../../models/trade.model';
import { TradeService } from '../../services/trade.service';
import { FileUploadComponent } from '../file-upload/file-upload.component';
@Component({
  selector: 'app-trade-summary',
  imports: [CommonModule, FormsModule, RouterModule, FileUploadComponent,
    TableModule, ButtonModule, InputTextModule, TagModule, DatePickerModule],
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
  showUploadModalSignal = signal(false);
  editing = signal<Trade | null>(null);
  search = signal('');
  filters = signal<TradeFilters>({ type: 'ALL', status: 'ALL', date: 'ALL' });
  page = signal(0);
  dateRange = signal<Date[] | undefined>(undefined);
  readonly PAGE_SIZE = 7;

  // PrimeNG Table properties
  first = signal(0);
  rows = signal(7);
  globalFilterFields = ['symbol', 'direction', 'positionStatus'];

  private tradeService = inject(TradeService);
  trades = this.tradeService.getAllTrades();

  constructor() {
    this.tradeService.loadTrades();
  }

  filtered = computed(() => {
    return this.trades().filter(t => {
      const f = this.filters();
      // Map old properties to new API structure
      const type = t.direction;
      const status = t.positionStatus;
      const tradeDate = new Date(t.openedAt.split('T')[0]);
      const instrument = t.symbol;

      if (f.type !== 'ALL' && type !== f.type) return false;
      if (f.status !== 'ALL' && status !== f.status) return false;

      // Enhanced date filtering
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (f.date === 'TODAY') {
        const todayDate = today.toISOString().split('T')[0];
        if (t.openedAt.split('T')[0] !== todayDate) return false;
      } else if (f.date === 'WEEK') {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        if (tradeDate < weekAgo) return false;
      } else if (f.date === 'MONTH') {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        if (tradeDate < monthAgo) return false;
      } else if (f.date === 'CUSTOM' && f.startDate && f.endDate) {
        const start = new Date(f.startDate);
        const end = new Date(f.endDate);
        end.setHours(23, 59, 59, 999); // Include end date
        if (tradeDate < start || tradeDate > end) return false;
      }

      if (this.search() && !instrument.toLowerCase().includes(this.search().toLowerCase())) return false;
      return true;
    }).sort((a, b) => b.openedAt.localeCompare(a.openedAt));
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
    const closed = filtered.filter(t => t.positionStatus === 'CLOSED');
    const wins = closed.filter(t => t.realizedPnl > 0);
    const total = closed.reduce((s, t) => s + t.realizedPnl, 0);
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

  onDateFilterChange(date: 'ALL' | 'TODAY' | 'WEEK' | 'MONTH' | 'CUSTOM') {
    if (date !== 'CUSTOM') {
      this.dateRange.set(undefined);
    }
    this.filters.update(current => ({ ...current, date, startDate: undefined, endDate: undefined }));
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

  // PrimeNG Table pagination methods
  onPageChange(event: any) {
    this.first.set(event.first);
    this.rows.set(event.rows);
    this.page.set(Math.floor(event.first / event.rows));
  }

  onGlobalFilter(table: any, event: Event) {
    const value = (event.target as HTMLInputElement).value;
    table.filterGlobal(value, 'contains');
    this.search.set(value);
  }

  clearFilters() {
    this.filters.set({ type: 'ALL', status: 'ALL', date: 'ALL' });
    this.search.set('');
    this.dateRange.set(undefined);
    this.page.set(0);
    this.first.set(0);
  }

  onDateRangeChange(dates: Date[] | null | undefined) {
    if (dates) {
      this.dateRange.set(dates);
    } else {
      this.dateRange.set(undefined);
    }
    if (dates && dates.length >= 2 && dates[0] && dates[1]) {
      const startDate = new Date(dates[0].getTime() - (dates[0].getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      const endDate = new Date(dates[1].getTime() - (dates[1].getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      this.filters.update(current => ({ ...current, date: 'CUSTOM', startDate, endDate }));
      this.page.set(0);
    }
  }

  createArray(length: number): number[] {
    return Array.from({ length }, (_, i) => i);
  }

  getStatIcon(label: string): string {
    switch (label) {
      case 'Trades shown': return 'pi pi-chart-bar';
      case 'Net P&L': return 'pi pi-indian-rupee';
      case 'Win rate': return 'pi pi-percentage';
      case 'Wins / Losses': return 'pi pi-chart-pie';
      default: return 'pi pi-trending-up';
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

  // Upload modal methods
  showUploadModal() {
    this.showUploadModalSignal.set(true);
  }

  closeUploadModal() {
    this.showUploadModalSignal.set(false);
  }

  onUploadSuccess() {
    this.closeUploadModal();
    this.tradeService.loadTrades(); // Refresh trades after successful upload
  }
}
