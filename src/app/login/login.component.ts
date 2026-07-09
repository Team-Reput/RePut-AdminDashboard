import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;
  showPassword = false;
  isLoading    = false;
  loginError   = '';
  loginSuccess = '';
  currentYear  = new Date().getFullYear();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // If already logged in, redirect to dashboard
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/admin/overview']);
      return;
    }

    // Check for success message from registration
    this.route.queryParams.subscribe(params => {
      if (params['registered'] === 'true') {
        this.loginSuccess = 'Registration successful! Please sign in.';
      }
    });

    this.loginForm = this.fb.group({
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
        ]
      ],
      password  : ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
    });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  isFieldInvalid(field: string): boolean {
    const c = this.loginForm.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  getEmailError(): string {
    const c = this.loginForm.get('email');
    if (c?.hasError('required')) return 'Email is required.';
    if (c?.hasError('email') || c?.hasError('pattern')) return 'Enter a valid email address.';
    return '';
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.loginError = '';
    this.loginSuccess = ''; // Clear success banner if they click submit again

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.router.navigate(['/admin/overview']);
        } else {
          this.loginError = res.message || 'Login failed.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.loginError = err?.message || 'Something went wrong. Please try again.';
      },
    });
  }

  // ── SSO ───────────────────────────────────────────────────────────────────
  loginWithSSO(): void {
    // this.authService.loginWithGoogle();
    console.log('Google SSO triggered');
  }
}