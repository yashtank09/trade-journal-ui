import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

const routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./login/login').then(c => c.LoginComponent)
    },
    {
        path: 'register',
        loadComponent: () => import('./register/register').then(c => c.RegisterComponent)
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AuthRoutingModule {
}
