import {Component, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators} from '@angular/forms';

interface LoginForm {
  username: FormControl<string | null>;
  password: FormControl<string | null>;
}

interface RegisterForm {
  username: FormControl<string | null>;
  email: FormControl<string | null>;
  password: FormControl<string | null>;
  confirm: FormControl<string | null>;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  view = signal<'login' | 'register' | 'success'>('login');
  loading = signal(false);
  apiError = signal('');
  showPassword = false;
  showConfirmPassword = false;

  loginForm: FormGroup<LoginForm>;
  registerForm: FormGroup<RegisterForm>;

  constructor(private readonly fb: FormBuilder) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/)
        ]
      ]
    });

    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirm: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup<RegisterForm>): ValidationErrors | null {
    const password = form.get('password')?.value;
    const confirm = form.get('confirm')?.value;
    return password === confirm ? null : {mismatch: true};
  }

  get currentForm(): FormGroup {
    return this.view() === 'login' ? this.loginForm : this.registerForm;
  }

  getControl(field: string) {
    const form = this.currentForm;
    return form.get(field);
  }

  isFieldInvalid(field: string): boolean {
    const control = this.getControl(field);
    return !!(control?.invalid && control?.touched);
  }

  switchTo(mode: 'login' | 'register') {
    this.view.set(mode);
    this.apiError.set('');
    this.loginForm.reset();
    this.registerForm.reset();
  }

  getErrorMessage(field: string): string {
    const form = this.currentForm;
    const control = form.get(field);

    if (!control?.errors || (!control.touched && !control.dirty)) {
      return '';
    }

    if (control.errors['required']) {
      return 'Please enter your ' + field;
    }

    if (control.errors['minlength']) {
      return `At least ${control.errors['minlength'].requiredLength} characters`;
    }

    if (control.errors['pattern']) {
      return 'Password must include uppercase, lowercase, number and special character';
    }

    if (control.errors['email']) {
      return "That doesn't look like a valid email";
    }

    if (field === 'confirm' && form.errors?.['mismatch']) {
      return "Passwords don't match";
    }

    return '';
  }

  async submit() {
    const form = this.currentForm;

    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.apiError.set('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      this.view.set('success');
    } catch {
      this.apiError.set('An error occurred. Please try again.');
    } finally {
      this.loading.set(false);
      // Clear sensitive data
      this.loginForm.get('password')?.reset();
      this.registerForm.get('password')?.reset();
      this.registerForm.get('confirm')?.reset();
    }
  }

  backToLogin() {
    this.switchTo('login');
  }
}
