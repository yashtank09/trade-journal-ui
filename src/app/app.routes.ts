import {Routes} from '@angular/router';

export const routes: Routes = [
  {
    path: 'trade',
    loadChildren: () => import('./features/ingestion/ingestion-module').then(m => m.IngestionModule)
  }
];
