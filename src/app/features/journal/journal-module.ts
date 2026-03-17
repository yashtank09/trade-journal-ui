import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';

import { JournalRoutingModule } from './journal-routing-module';
import { TradeSummaryComponent } from './components/trade-summary/trade-summary';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    JournalRoutingModule,
    TradeSummaryComponent,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule
  ]
})
export class JournalModule { }
