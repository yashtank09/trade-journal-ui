import {Routes} from '@angular/router';
import {AuthGuard} from './core/guards/auth.guard';
import {PublicGuard} from './core/guards/public.guard';
import {LayoutComponent} from './shared/components/layout/layout';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/auth/login',
        pathMatch: 'full'
    },
    {
        path: 'auth',
        loadChildren: () => import('./features/auth/auth.routes').then(m => m.routes),
        canActivate: [PublicGuard]
    },
    {
        path: '',
        component: LayoutComponent,
        canActivate: [AuthGuard],
        children: [
            {
                path: 'trade',
                loadChildren: () => import('./features/ingestion/ingestion.routes').then(m => m.routes)
            },
            {
                path: 'journal',
                loadChildren: () => import('./features/journal/journal.routes').then(m => m.routes)
            },
            {
                path: 'analytics',
                loadChildren: () => import('./features/analytics/analytics.routes').then(m => m.routes)
            }
        ]
    },
    {
        path: '**',
        redirectTo: '/auth/login'
    }
];
