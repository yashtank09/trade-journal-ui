import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TradeLogsComponent } from './components/trade-logs/trade-logs';

const routes: Routes = [
  {
    path: '',
    component: TradeLogsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JournalRoutingModule { }
