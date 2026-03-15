import {Routes} from '@angular/router';
import {AuthGuard} from './core/guards/auth.guard';
import {PublicGuard} from './core/guards/public.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/auth/login',
        pathMatch: 'full'
    },
    {
        path: 'auth',
        loadChildren: () => import('./features/auth/auth-module').then(m => m.AuthModule),
        canActivate: [PublicGuard]
    },
    {
        path: 'trade',
        loadChildren: () => import('./features/ingestion/ingestion-module').then(m => m.IngestionModule),
        canActivate: [AuthGuard]
    },
    {
        path: 'journal',
        loadChildren: () => import('./features/journal/journal-module').then(m => m.JournalModule),
        canActivate: [AuthGuard]
    },
    {
        path: '**',
        redirectTo: '/auth/login'
    }
];
