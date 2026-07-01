import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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
  currentYear  = new Date().getFullYear();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
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
  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.loginError = '';

    try {
      const { email, password } = this.loginForm.value;

      // simulate a short delay so the spinner is visible
      await new Promise(r => setTimeout(r, 600));

      const success = this.authService.login(email, password);

      if (success) {
        this.router.navigate(['/admin/overview']);
      } else {
        this.loginError = 'Invalid email or password.';
      }

    } catch (err: any) {
      this.loginError = err?.error?.message ?? 'Invalid email or password.';
    } finally {
      this.isLoading = false;
    }
  }

  // ── SSO ───────────────────────────────────────────────────────────────────
  loginWithSSO(): void {
    // this.authService.loginWithGoogle();
    console.log('Google SSO triggered');
  }
}