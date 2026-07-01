import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '../../core/models/user.model';
import { AuthService } from '../auth/auth.service';
import { ProfileService } from '../../core/services/profile.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class UserProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly profileService = inject(ProfileService);

  // Core Signals
  userProfile = signal<User>({
    username: 'trader_yash',
    email: 'yash@tradejournal.com',
    firstName: 'Yash',
    lastName: 'Sharma',
    mobileNumber: '9876543210',
    residentialAddress: '123 Wealth Avenue, Financial District',
    pan: 'ABCDE1234F',
    currency: 'INR',
    tradingStyle: 'Swing Trader',
    role: 'PRO_TRADER',
    joinedDate: 'June 2025'
  });

  isLoading = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  showToast = signal<boolean>(false);
  toastMessage = signal<string>('');
  toastType = signal<'success' | 'error'>('success');
  avatarInitial = computed(() => {
    const firstName = this.userProfile().firstName || '';
    return firstName.charAt(0).toUpperCase();
  });

  // Reactive Form
  profileForm!: FormGroup;

  // Static options for dropdowns
  currencies = [
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' }
  ];

  tradingStyles = ['Day Trader', 'Swing Trader', 'Scalper'];

  ngOnInit(): void {
    this.loadProfile();
    this.initForm();
  }

  /**
   * Initializes or loads the user profile from local storage or decoded token
   */
  private loadProfile(): void {
    this.isLoading.set(true);
    
    this.profileService.getProfile().subscribe({
      next: (res) => {
        if (res && res.data) {
          this.userProfile.set(res.data);
          this.initForm(); // Re-initialize form controls with backend values
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.warn('Failed to fetch user profile from backend, using offline fallback', err);
        this.loadProfileFromFallback();
        this.isLoading.set(false);
      }
    });
  }

  private loadProfileFromFallback(): void {
    // Attempt to load from localStorage first
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      try {
        this.userProfile.set(JSON.parse(savedProfile));
      } catch (e) {
        console.error('Failed to parse saved profile', e);
      }
    } else {
      // Fallback: Check auth token metadata if available
      const decoded = this.authService.getDecodedToken();
      if (decoded && decoded.sub) {
        const email = decoded.sub;
        const name = email.split('@')[0];
        const firstName = name.charAt(0).toUpperCase() + name.slice(1);
        
        this.userProfile.update(profile => ({
          ...profile,
          email: email,
          username: name,
          firstName: firstName,
          lastName: 'Trader'
        }));
      }
    }
  }

  /**
   * Initializes the reactive form with standard and custom validations
   */
  private initForm(): void {
    const profile = this.userProfile();

    this.profileForm = this.fb.group({
      firstName: [profile.firstName, [Validators.required, Validators.minLength(2)]],
      lastName: [profile.lastName, [Validators.required, Validators.minLength(2)]],
      fullName: [`${profile.firstName} ${profile.lastName}`.trim(), [Validators.required, Validators.minLength(4)]],
      email: [profile.email, [Validators.required, Validators.email]], // Disabled in UI or marked read-only
      mobileNumber: [profile.mobileNumber || '', [
        Validators.required, 
        Validators.pattern(/^[6-9]\d{9}$/) // Standard Indian 10-digit mobile validation
      ]],
      residentialAddress: [profile.residentialAddress || '', [
        Validators.required, 
        Validators.minLength(10)
      ]],
      pan: [profile.pan || '', [
        Validators.required,
        Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i) // Standard Indian PAN format (case-insensitive in pattern)
      ]],
      currency: [profile.currency, [Validators.required]],
      tradingStyle: [profile.tradingStyle, [Validators.required]]
    });

    // Make Email FormControl read-only/disabled
    this.profileForm.get('email')?.disable();

    // Two-way synchronization between fullName and firstName/lastName
    this.profileForm.get('fullName')?.valueChanges.subscribe(value => {
      const nameParts = (value || '').trim().split(/\s+/);
      const first = nameParts[0] || '';
      const last = nameParts.slice(1).join(' ') || '';
      
      this.profileForm.get('firstName')?.setValue(first, { emitEvent: false });
      this.profileForm.get('lastName')?.setValue(last, { emitEvent: false });
      
      this.profileForm.get('firstName')?.markAsDirty();
      this.profileForm.get('lastName')?.markAsDirty();
    });

    const updateFullName = () => {
      const first = this.profileForm.get('firstName')?.value || '';
      const last = this.profileForm.get('lastName')?.value || '';
      this.profileForm.get('fullName')?.setValue(`${first} ${last}`.trim(), { emitEvent: false });
    };

    this.profileForm.get('firstName')?.valueChanges.subscribe(updateFullName);
    this.profileForm.get('lastName')?.valueChanges.subscribe(updateFullName);
  }

  // --- Form Accessors for Templates ---
  
  get f() {
    return this.profileForm.controls;
  }

  isFieldInvalid(field: string): boolean {
    if (field === 'fullName') {
      const fnControl = this.profileForm.get('firstName');
      const lnControl = this.profileForm.get('lastName');
      const fullControl = this.profileForm.get('fullName');
      
      const fnInvalid = !!(fnControl && fnControl.invalid && (fnControl.touched || fnControl.dirty));
      const lnInvalid = !!(lnControl && lnControl.invalid && (lnControl.touched || lnControl.dirty));
      const fullInvalid = !!(fullControl && fullControl.invalid && (fullControl.touched || fullControl.dirty));
      
      return fnInvalid || lnInvalid || fullInvalid;
    }
    const control = this.profileForm.get(field);
    return !!(control && control.invalid && (control.touched || control.dirty));
  }

  getFieldError(field: string): string {
    if (field === 'fullName') {
      const fnControl = this.profileForm.get('firstName');
      const lnControl = this.profileForm.get('lastName');
      const fullControl = this.profileForm.get('fullName');
      
      if (fullControl?.errors?.['required'] || fnControl?.errors?.['required'] || lnControl?.errors?.['required']) {
        return 'Full name is required (first and last name)';
      }
      if (fnControl?.errors?.['minlength']) {
        return 'First name must be at least 2 characters';
      }
      if (lnControl?.errors?.['minlength']) {
        return 'Last name must be at least 2 characters';
      }
      if (fullControl?.errors?.['minlength']) {
        return 'Full name must be at least 4 characters';
      }
      
      if (fullControl?.invalid || fnControl?.invalid || lnControl?.invalid) {
        return 'Please enter a valid full name (first and last name)';
      }
      return '';
    }

    const control = this.profileForm.get(field);
    if (!control || !control.errors || !control.touched) return '';

    if (control.errors['required']) return 'This field is required';
    if (control.errors['email']) return 'Please enter a valid email address';
    if (control.errors['minlength']) {
      return `Minimum length is ${control.errors['minlength'].requiredLength} characters`;
    }
    if (control.errors['pattern']) {
      if (field === 'pan') return 'Format must be ABCDE1234F (5 letters, 4 digits, 1 letter)';
      if (field === 'mobileNumber') return 'Please enter a valid 10-digit mobile number';
      return 'Invalid format';
    }

    return 'Invalid field value';
  }

  // --- Component Actions ---

  /**
   * Automatically formats the PAN input to uppercase for UX excellence
   */
  onPanInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.toUpperCase();
    this.profileForm.get('pan')?.setValue(value, { emitEvent: false });
  }

  /**
   * Resets editing form back to current signal state
   */
  cancelEdit(): void {
    const profile = this.userProfile();
    
    this.profileForm.reset({
      firstName: profile.firstName,
      lastName: profile.lastName,
      fullName: `${profile.firstName} ${profile.lastName}`.trim(),
      mobileNumber: profile.mobileNumber || '',
      residentialAddress: profile.residentialAddress || '',
      pan: profile.pan || '',
      currency: profile.currency,
      tradingStyle: profile.tradingStyle
    });

    this.showToastNotification('Changes cancelled', 'success');
  }

  /**
   * Triggers simulated API patch request to save changes
   */
  saveChanges(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.showToastNotification('Please correct the validation errors in the form', 'error');
      return;
    }

    this.isSaving.set(true);

    const formValues = this.profileForm.getRawValue(); // Get raw value to include disabled email

    // Create updated user profile object
    const updatedProfile: User = {
      ...this.userProfile(),
      firstName: formValues.firstName.trim(),
      lastName: formValues.lastName.trim(),
      mobileNumber: formValues.mobileNumber,
      residentialAddress: formValues.residentialAddress,
      pan: formValues.pan.toUpperCase(),
      currency: formValues.currency,
      tradingStyle: formValues.tradingStyle
    };

    this.profileService.updateProfile(updatedProfile).subscribe({
      next: (res) => {
        if (res && res.data) {
          this.userProfile.set(res.data);
          localStorage.setItem('userProfile', JSON.stringify(res.data));
          
          // Re-initialize or reset form control state
          this.profileForm.reset({
            firstName: res.data.firstName,
            lastName: res.data.lastName,
            fullName: `${res.data.firstName} ${res.data.lastName}`.trim(),
            email: res.data.email,
            mobileNumber: res.data.mobileNumber || '',
            residentialAddress: res.data.residentialAddress || '',
            pan: res.data.pan || '',
            currency: res.data.currency,
            tradingStyle: res.data.tradingStyle
          });
        }
        this.isSaving.set(false);
        this.showToastNotification('Profile updated successfully!', 'success');
      },
      error: (err) => {
        console.error('Failed to save profile changes', err);
        this.isSaving.set(false);
        const errMsg = err.error?.['status-message'] || err.message || 'An error occurred while saving profile';
        this.showToastNotification(errMsg, 'error');
      }
    });
  }

  private showToastNotification(message: string, type: 'success' | 'error'): void {
    this.toastMessage.set(message);
    this.toastType.set(type);
    this.showToast.set(true);

    setTimeout(() => {
      this.showToast.set(false);
    }, 4000);
  }

  closeToast(): void {
    this.showToast.set(false);
  }

  /**
   * Simulated Avatar upload
   */
  simulateAvatarUpload(): void {
    this.showToastNotification('Avatar upload feature simulated successfully!', 'success');
  }

  /**
   * Simulated Email Verification Request
   */
  requestEmailVerification(): void {
    this.showToastNotification('Verification link sent to ' + this.userProfile().email, 'success');
  }
}
