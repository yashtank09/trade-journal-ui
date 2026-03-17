import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { Trade } from '../models/trade.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TradeService {
  private readonly apiUrl = `${environment.apiUrl}/trade-summaries`;
  private readonly trades = signal<Trade[]>([]);
  private readonly loading = signal<boolean>(false);
  private readonly error = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  getAllTrades() {
    return this.trades;
  }

  getLoading() {
    return this.loading;
  }

  getError() {
    return this.error;
  }

  loadTrades(): void {
    this.loading.set(true);
    this.error.set(null);
    
    this.http.get<Trade[]>(this.apiUrl).pipe(
      map(trades => trades.map(trade => ({
        ...trade,
        // Add default UI-specific fields if not present
        emotion: trade.emotion || 'Neutral',
        plan: trade.plan || '',
        notes: trade.notes || '',
        tags: trade.tags || []
      }))),
      catchError(error => {
        const errorMessage = error.error?.message || error.message || 'Failed to load trades';
        this.error.set(errorMessage);
        return throwError(() => error);
      })
    ).subscribe({
      next: (trades) => {
        this.trades.set(trades);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  refreshTrades(): Observable<Trade[]> {
    return this.http.get<Trade[]>(this.apiUrl).pipe(
      map(trades => trades.map(trade => ({
        ...trade,
        emotion: trade.emotion || 'Neutral',
        plan: trade.plan || '',
        notes: trade.notes || '',
        tags: trade.tags || []
      }))),
      catchError(error => {
        const errorMessage = error.error?.message || error.message || 'Failed to refresh trades';
        this.error.set(errorMessage);
        return throwError(() => error);
      })
    );
  }

  saveTrade(trade: Trade) {
    this.trades.update(current => {
      const existingIndex = current.findIndex(t => t.id === trade.id);
      if (existingIndex >= 0) {
        return current.map(t => t.id === trade.id ? trade : t);
      } else {
        return [trade, ...current];
      }
    });
  }

  private handleError(error: any) {
    console.error('Trade service error:', error);
    const errorMessage = error.error?.message || error.message || 'An error occurred';
    this.error.set(errorMessage);
    return throwError(() => errorMessage);
  }
}
