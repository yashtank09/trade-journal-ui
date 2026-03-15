import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { JournalRoutingModule } from './journal-routing-module';
import { TradeSummaryComponent } from './components/trade-summary/trade-summary';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    JournalRoutingModule,
    TradeSummaryComponent
  ]
})
export class JournalModule { }
