import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { JournalRoutingModule } from './journal-routing-module';
import { TradeLogsComponent } from './components/trade-logs/trade-logs';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    JournalRoutingModule,
    TradeLogsComponent
  ]
})
export class JournalModule { }
