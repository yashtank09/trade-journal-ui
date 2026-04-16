import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnalyticsService } from '../../services/analytics.service';
import { DashboardSummaryDTO, ChartPointDTO, BreakdownDTO, RiskMetricsDTO } from '../../models/analytics.models';
import { Subject, forkJoin, of } from 'rxjs';
import { finalize, catchError, switchMap, debounceTime, tap } from 'rxjs/operators';

import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-analytics',
  imports: [
    CommonModule, 
    FormsModule, 
    CardModule, 
    ChartModule, 
    TableModule, 
    TabsModule,
    DatePickerModule,
    ButtonModule,
    SkeletonModule
  ],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss'
})
export class AnalyticsComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);

  summary = signal<DashboardSummaryDTO | null>(null);
  equityCurve = signal<ChartPointDTO[]>([]);
  assetBreakdown = signal<BreakdownDTO[]>([]);
  strategyBreakdown = signal<BreakdownDTO[]>([]);
  timeBreakdown = signal<BreakdownDTO[]>([]);
  riskMetrics = signal<RiskMetricsDTO | null>(null);
  mistakes = signal<BreakdownDTO[]>([]);

  // UI States
  isLoading = signal<boolean>(false);
  isError = signal<boolean>(false);

  // Filters
  dateRange: Date[] | undefined;
  private filterSubject = new Subject<{start?: string, end?: string}>();

  // Chart configs
  chartData: any;
  chartOptions: any;

  ngOnInit() {
    this.initChartOptions();
    this.setupReactivePipeline();
    
    // Default to last 30 days
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);
    this.dateRange = [start, end];

    this.triggerLoad();
  }

  setupReactivePipeline() {
    this.filterSubject.pipe(
      debounceTime(300), // Debounce rapid filter clicks
      tap(() => {
        this.isLoading.set(true);
        this.isError.set(false);
      }),
      switchMap(dates => {
        // switchMap automatically cancels the previous inner observable (forkJoin) if a new value arrives
        return forkJoin({
            summary: this.analyticsService.getSummary(dates.start, dates.end),
            riskMetrics: this.analyticsService.getRiskMetrics(dates.start, dates.end),
            assetBreakdown: this.analyticsService.getAssetBreakdown(dates.start, dates.end),
            strategyBreakdown: this.analyticsService.getStrategyBreakdown(dates.start, dates.end),
            timeBreakdown: this.analyticsService.getTimeBreakdown(dates.start, dates.end),
            mistakes: this.analyticsService.getMistakes(dates.start, dates.end),
            equityCurve: this.analyticsService.getEquityCurve(dates.start, dates.end)
        }).pipe(
            catchError(err => {
               console.error('Failed to load analytics', err);
               this.isError.set(true);
               this.isLoading.set(false);
               // Return empty to keep the outer stream alive after an error
               return of(null);
            })
        );
      })
    ).subscribe(data => {
        if (data) {
            this.summary.set(data.summary);
            this.riskMetrics.set(data.riskMetrics);
            this.assetBreakdown.set(data.assetBreakdown);
            this.strategyBreakdown.set(data.strategyBreakdown);
            this.timeBreakdown.set(data.timeBreakdown);
            this.mistakes.set(data.mistakes);
            
            this.equityCurve.set(data.equityCurve);
            this.updateChartData(data.equityCurve);
            this.isLoading.set(false); // Successfully loaded
        }
    });
  }

  applyFilters() {
     this.triggerLoad();
  }

  resetFilters() {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 30);
      this.dateRange = [start, end];
      this.triggerLoad();
  }

  private triggerLoad() {
    let startStr = undefined;
    let endStr = undefined;

    if (this.dateRange && this.dateRange.length > 0) {
        if (this.dateRange[0]) {
            startStr = new Date(this.dateRange[0].getTime() - (this.dateRange[0].getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        }
        if (this.dateRange[1]) {
            endStr = new Date(this.dateRange[1].getTime() - (this.dateRange[1].getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        } else if (this.dateRange[0]) {
             endStr = startStr;
        }
    }

    // Push the new filter state into the pipeline
    this.filterSubject.next({ start: startStr, end: endStr });
  }

  updateChartData(data: ChartPointDTO[]) {
    const documentStyle = getComputedStyle(document.documentElement);
    const primaryColor = documentStyle.getPropertyValue('--p-primary-500') || '#2D6A4F';

    this.chartData = {
      labels: data.map(d => {
         const date = new Date(d.label);
         return isNaN(date.getTime()) ? d.label : date.toLocaleDateString();
      }),
      datasets: [
        {
          label: 'Cumulative P&L',
          data: data.map(d => d.value),
          fill: true,
          borderColor: primaryColor,
          backgroundColor: 'rgba(45, 106, 79, 0.1)',
          borderWidth: 2,
          pointRadius: 2,
          tension: 0.4
        }
      ]
    };
  }

  initChartOptions() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color') || '#495057';
    const textColorSecondary = documentStyle.getPropertyValue('--p-text-color-secondary') || '#6c757d';
    const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color') || '#dfe7ef';

    this.chartOptions = {
        maintainAspectRatio: false,
        aspectRatio: 0.6,
        plugins: {
            legend: { 
                display: false // looks cleaner without legend for a single metric
            },
            tooltip: {
                callbacks: {
                    label: (context: any) => {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += this.fmtMoney(context.parsed.y);
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            x: {
                ticks: { color: textColorSecondary },
                grid: { color: surfaceBorder, drawBorder: false }
            },
            y: {
                ticks: { 
                    color: textColorSecondary,
                    callback: (value: any) => {
                        return this.fmtMoney(value);
                    }
                },
                grid: { color: surfaceBorder, drawBorder: false }
            }
        }
    };
  }

  fmtMoney(n: number | undefined | null) {
      if (n === null || n === undefined) return '—';
      return n >= 0 ? `+₹${Number(n).toLocaleString('en-IN')}` : `−₹${Math.abs(Number(n)).toLocaleString('en-IN')}`;
  }

  pnlStyle(n: number | undefined | null) {
      if (n === null || n === undefined) return {};
      return { color: n > 0 ? '#1E5C3F' : n < 0 ? '#C0392B' : '#5A5A5A', fontWeight: 600 };
  }
}
