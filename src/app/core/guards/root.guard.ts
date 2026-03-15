import {Injectable} from '@angular/core';
import {CanActivate, Router} from '@angular/router';
import {AuthService} from '../../features/auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class RootGuard implements CanActivate {
    constructor(
        private readonly authService: AuthService,
        private readonly router: Router
    ) {
    }

    canActivate(): boolean {
        const token = this.authService.getToken();

        // If no token, redirect to login
        if (!token) {
            this.router.navigate(['/auth/login']);
            return false;
        }

        // Check if token is expired
        if (this.isTokenExpired(token)) {
            this.authService.logout(); // Clear expired token
            return false; // Let the logout handle the redirect
        }

        // User is authenticated, redirect to journal
        this.router.navigate(['/journal']);
        return false;
    }

    private isTokenExpired(token: string): boolean {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const exp = payload.exp;
            return exp ? Date.now() >= exp * 1000 : false;
        } catch {
            return true; // Invalid token format
        }
    }
}
