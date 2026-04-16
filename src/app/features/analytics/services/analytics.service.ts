import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { 
  DashboardSummaryDTO, 
  ChartPointDTO, 
  BreakdownDTO, 
  RiskMetricsDTO 
} from '../models/analytics.models';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private readonly apiUrl = `${environment.apiUrl}/analytics`;
  
  // Basic state signals if needed
  private readonly loading = signal<boolean>(false);
  private readonly error = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  getLoading() {
    return this.loading;
  }

  getError() {
    return this.error;
  }

  private getHttpParams(startDate?: string, endDate?: string): HttpParams {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return params;
  }

  getSummary(startDate?: string, endDate?: string): Observable<DashboardSummaryDTO> {
    return this.http.get<DashboardSummaryDTO>(`${this.apiUrl}/summary`, { params: this.getHttpParams(startDate, endDate) }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  getEquityCurve(startDate?: string, endDate?: string): Observable<ChartPointDTO[]> {
    return this.http.get<ChartPointDTO[]>(`${this.apiUrl}/equity-curve`, { params: this.getHttpParams(startDate, endDate) }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  getAssetBreakdown(startDate?: string, endDate?: string): Observable<BreakdownDTO[]> {
    return this.http.get<BreakdownDTO[]>(`${this.apiUrl}/breakdown/asset`, { params: this.getHttpParams(startDate, endDate) }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  getStrategyBreakdown(startDate?: string, endDate?: string): Observable<BreakdownDTO[]> {
    return this.http.get<BreakdownDTO[]>(`${this.apiUrl}/breakdown/strategy`, { params: this.getHttpParams(startDate, endDate) }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  getTimeBreakdown(startDate?: string, endDate?: string): Observable<BreakdownDTO[]> {
    return this.http.get<BreakdownDTO[]>(`${this.apiUrl}/breakdown/time`, { params: this.getHttpParams(startDate, endDate) }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  getRiskMetrics(startDate?: string, endDate?: string): Observable<RiskMetricsDTO> {
    return this.http.get<RiskMetricsDTO>(`${this.apiUrl}/risk-metrics`, { params: this.getHttpParams(startDate, endDate) }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  getMistakes(startDate?: string, endDate?: string): Observable<BreakdownDTO[]> {
    return this.http.get<BreakdownDTO[]>(`${this.apiUrl}/mistakes`, { params: this.getHttpParams(startDate, endDate) }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  private handleError(error: any) {
    console.error('Analytics service error:', error);
    const errorMessage = error.error?.message || error.message || 'An error occurred';
    this.error.set(errorMessage);
    return throwError(() => errorMessage);
  }
}
