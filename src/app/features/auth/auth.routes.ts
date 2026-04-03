import {Routes} from '@angular/router';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./login/login').then(c => c.LoginComponent)
    },
    {
        path: 'register',
        loadComponent: () => import('./register/register').then(c => c.RegisterComponent)
    }
];
