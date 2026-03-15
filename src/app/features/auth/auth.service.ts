import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {ApiService} from '../../shared/service/api.service';

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    currency: string;
}

export interface AuthResponse {
    status: string;
    'status-code': number;
    'status-message': string;
    token: string;
    data: {
        token: string;
    };
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly AUTH_ENDPOINT = 'auth';

    constructor(
        private readonly router: Router,
        private readonly apiService: ApiService
    ) {
    }

    login(credentials: LoginRequest): Observable<AuthResponse> {
        return this.apiService.post<AuthResponse>(`${this.AUTH_ENDPOINT}/login`, credentials).pipe(
            tap(result => {
                if (result.status === 'success') {
                    localStorage.setItem('authToken', result.token);
                }
            })
        );
    }

    register(userData: RegisterRequest): Observable<AuthResponse> {
        return this.apiService.post<AuthResponse>(`${this.AUTH_ENDPOINT}/register`, userData).pipe(
            tap(result => {
                if (result.status === 'success') {
                    localStorage.setItem('authToken', result.token);
                }
            })
        );
    }

    logout(): Observable<void> {
        return this.apiService.post<void>(`${this.AUTH_ENDPOINT}/logout`, {}).pipe(
            tap(() => {
                localStorage.removeItem('authToken');
                this.router.navigate(['/auth/login']);
            })
        );
    }

    isAuthenticated(): boolean {
        return !!localStorage.getItem('authToken');
    }

    getToken(): string | null {
        return localStorage.getItem('authToken');
    }
}
