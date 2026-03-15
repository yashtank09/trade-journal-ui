import {Injectable} from '@angular/core';
import {CanActivate, Router} from '@angular/router';
import {AuthService} from '../../features/auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class PublicGuard implements CanActivate {
    constructor(
        private readonly authService: AuthService,
        private readonly router: Router
    ) {
    }

    canActivate(): boolean {
        const token = this.authService.getToken();

        // If no token, allow access to public/auth pages
        if (!token) {
            return true;
        }

        // Check if token is expired
        if (this.isTokenExpired(token)) {
            this.authService.logout(); // Clear expired token
            return true;
        }

        // User is already authenticated, redirect to journal
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
