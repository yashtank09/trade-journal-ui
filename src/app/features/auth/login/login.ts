import {Component, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {AuthService, LoginRequest} from '../auth.service';

interface LoginForm {
    username: FormControl<string | null>;
    password: FormControl<string | null>;
}

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './login.html',
    styleUrl: './login.scss'
})
export class LoginComponent {
    loading = signal(false);
    apiError = signal('');
    showPassword = false;

    loginForm: FormGroup<LoginForm>;

    constructor(
        private readonly fb: FormBuilder,
        private readonly router: Router,
        private readonly authService: AuthService
    ) {
        this.loginForm = this.fb.group({
            username: ['', [Validators.required, Validators.minLength(3)]],
            password: ['', [Validators.required, Validators.minLength(8)]]
        });

    }


    getControl(field: string) {
        return this.loginForm.get(field);
    }

    isFieldInvalid(field: string): boolean {
        const control = this.getControl(field);
        return !!(control?.invalid && control?.touched);
    }


    getErrorMessage(field: string): string {
        const control = this.getControl(field);

        if (!control?.errors || (!control.touched && !control.dirty)) {
            return '';
        }

        if (control.errors['required']) {
            return 'Please enter your ' + field;
        }

        if (control.errors['minlength']) {
            return `At least ${control.errors['minlength'].requiredLength} characters`;
        }

        return '';
    }

    submit() {
        if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            return;
        }

        this.loading.set(true);
        this.apiError.set('');

        const formValues = this.loginForm.value;
        const credentials: LoginRequest = {
            username: formValues.username!,
            password: formValues.password!
        };

        this.authService.login(credentials).subscribe({
            next: (result) => {
                if (result.status === 'success') {
                    // Navigate to journal after successful login
                    this.router.navigate(['/journal']);
                } else {
                    this.apiError.set(result['status-message'] || 'Login failed. Please try again.');
                }
            },
            error: (error) => {
                console.error('Login error:', error);
                this.apiError.set('An error occurred. Please try again.');
            },
            complete: () => {
                this.loading.set(false);
                // Clear sensitive data
                this.loginForm.get('password')?.reset();
            }
        });
    }

    goToRegister() {
        this.router.navigate(['/auth/register']);
    }
}
