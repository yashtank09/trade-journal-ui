import {Component, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {AuthService, RegisterRequest} from '../auth.service';

interface RegisterForm {
    username: FormControl<string | null>;
    email: FormControl<string | null>;
    password: FormControl<string | null>;
    confirm: FormControl<string | null>;
}

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './register.html',
    styleUrl: './register.scss'
})
export class RegisterComponent {
    loading = signal(false);
    apiError = signal('');
    showPassword = false;
    showConfirmPassword = false;

    registerForm: FormGroup<RegisterForm>;

    constructor(
        private readonly fb: FormBuilder,
        private readonly router: Router,
        private readonly authService: AuthService
    ) {
        this.registerForm = this.fb.group({
            username: ['', [Validators.required, Validators.minLength(3)]],
            email: ['', [Validators.required, Validators.email]],
            password: [
                '',
                [
                    Validators.required,
                    Validators.minLength(8),
                    Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/)
                ]
            ],
            confirm: ['', Validators.required]
        }, {validators: this.passwordMatchValidator});
    }

    passwordMatchValidator(form: FormGroup<RegisterForm>): ValidationErrors | null {
        const password = form.get('password')?.value;
        const confirm = form.get('confirm')?.value;
        return password === confirm ? null : {mismatch: true};
    }

    getControl(field: string) {
        return this.registerForm.get(field);
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

        if (control.errors['email']) {
            return "That doesn't look like a valid email";
        }

        if (control.errors['pattern']) {
            return 'Password must include uppercase, lowercase, number and special character';
        }

        if (field === 'confirm' && this.registerForm.errors?.['mismatch']) {
            return "Passwords don't match";
        }

        return '';
    }

    submit() {
        if (this.registerForm.invalid) {
            this.registerForm.markAllAsTouched();
            return;
        }

        this.loading.set(true);
        this.apiError.set('');

        const formValues = this.registerForm.value;
        const userData: RegisterRequest = {
            username: formValues.username!,
            email: formValues.email!,
            password: formValues.password!,
            currency: 'USD' // Default currency as per API requirement
        };

        this.authService.register(userData).subscribe({
            next: (result) => {
                if (result.status === 'success') {
                    // Navigate to login or dashboard
                    this.router.navigate(['/auth/login']);
                } else {
                    this.apiError.set(result['status-message'] || 'Registration failed. Please try again.');
                }
            },
            error: (error) => {
                console.error('Registration error:', error);
                this.apiError.set('An error occurred. Please try again.');
            },
            complete: () => {
                this.loading.set(false);
                // Clear sensitive data
                this.registerForm.get('password')?.reset();
                this.registerForm.get('confirm')?.reset();
            }
        });
    }

    goToLogin() {
        this.router.navigate(['/auth/login']);
    }
}
