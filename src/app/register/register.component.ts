import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  showPassword = false;
  isLoading = false;
  registerError = '';
  registerSuccess = '';
  currentYear = new Date().getFullYear();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // If already sign in, redirect to dashboard
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/admin/overview']);
      return;
    }

    this.registerForm = this.fb.group({
      full_name: ['', [Validators.required, Validators.minLength(2)]],
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
        ]
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.pattern(/\d/) // Must contain a number to match backend validation
        ]
      ],
      role: ['sales', [Validators.required]],
      department: ['']
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  isFieldInvalid(field: string): boolean {
    const c = this.registerForm.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  getFieldError(field: string): string {
    const c = this.registerForm.get(field);
    if (!c) return '';
    if (field === 'full_name') {
      if (c.hasError('required')) return 'Full name is required.';
      if (c.hasError('minlength')) return 'Full name must be at least 2 characters.';
    }
    if (field === 'email') {
      if (c.hasError('required')) return 'Email is required.';
      if (c.hasError('email') || c.hasError('pattern')) return 'Enter a valid email address.';
    }
    if (field === 'password') {
      if (c.hasError('required')) return 'Password is required.';
      if (c.hasError('minlength')) return 'Password must be at least 6 characters.';
      if (c.hasError('pattern')) return 'Password must contain at least one number.';
    }
    return '';
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.registerError = '';
    this.registerSuccess = '';

    const { full_name, email, password, role, department } = this.registerForm.value;

    this.authService.register(full_name, email, password, role, department).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.registerSuccess = 'Registration successful! Redirecting to sign in...';
          setTimeout(() => {
            this.router.navigate(['/login'], { queryParams: { registered: 'true' } });
          }, 2000);
        } else {
          this.registerError = res.message || 'Registration failed.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.registerError = err?.message || 'Something went wrong. Please try again.';
      },
    });
  }
}
