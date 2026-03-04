import {Routes} from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth-module').then(m => m.AuthModule)
  },
  {
    path: 'trade',
    loadChildren: () => import('./features/ingestion/ingestion-module').then(m => m.IngestionModule)
  },
  {
    path: 'journal',
    loadChildren: () => import('./features/journal/journal-module').then(m => m.JournalModule)
  },
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];
