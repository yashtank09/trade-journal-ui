import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TradeSummaryComponent } from './components/trade-summary/trade-summary';

const routes: Routes = [
  {
    path: '',
    component: TradeSummaryComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JournalRoutingModule { }
