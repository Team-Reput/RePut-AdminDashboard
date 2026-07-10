import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

/** Matches the backend response shape from authController */
export interface LoginResponse {
  success: boolean;
  status_code: number;
  message: string;
  token: string;
  data: {
    user_id: number;
    full_name: string;
    email: string;
    role: string;
    session_id: string;
  };
}

/** Matches the backend registration response shape */
export interface RegisterResponse {
  success: boolean;
  status_code: number;
  message: string;
  token?: string;
  data?: {
    user_id: number;
  };
}

/** Safe user info (stored in localStorage) */
export interface UserInfo {
  user_id: number;
  full_name: string;
  email: string;
  role: string;
  session_id: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  /**
   * POST /api/auth/login
   * Returns an Observable that the component subscribes to.
   * On success, stores the JWT token and user info in localStorage.
   */
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap((res) => {
          if (res.success && res.token) {
            localStorage.setItem('token', res.token);
            localStorage.setItem('user', JSON.stringify(res.data));
            localStorage.setItem('isLoggedIn', 'true');
          }
        }),
        catchError((error: HttpErrorResponse) => {
          return throwError(() => this.handleAuthError(error));
        })
      );
  }

  /**
   * POST /api/auth/register
   * Registers a new user.
   */
  register(
    full_name: string,
    email: string,
    password: string,
    role?: string,
    department?: string
  ): Observable<RegisterResponse> {
    const body: any = { full_name, email, password };
    if (role) body.role = role;
    if (department) body.department = department;

    return this.http
      .post<RegisterResponse>(`${this.apiUrl}/auth/register`, body)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          return throwError(() => this.handleAuthError(error));
        })
      );
  }

  /**
   * Clear all auth data and redirect to /login
   */
  logout(): void {
    const user = this.getUser();
    if (user && user.session_id) {
      this.http.post(`${this.apiUrl}/auth/logout`, { session_id: user.session_id }).subscribe({
        next: () => console.log('Session successfully removed from database'),
        error: (err) => console.error('Failed to remove session from database', err)
      });
    }

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    this.router.navigate(['/login']);
  }

  /**
   * Check if the user has a valid token stored
   */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  /**
   * Get the stored JWT token
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Get the stored user info
   */
  getUser(): UserInfo | null {
    const user = localStorage.getItem('user');
    try {
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  }

  /**
   * Get the stored user email
   */
  getUserEmail(): string {
    return this.getUser()?.email || '';
  }

  /**
   * Get the stored user's full name
   */
  getUserFullName(): string {
    return this.getUser()?.full_name || '';
  }

  /**
   * Get the stored user's role
   */
  getUserRole(): string {
    return this.getUser()?.role || '';
  }

  /**
   * POST /api/auth/refresh
   * Refreshes the access token using the session_id
   */
  refreshToken(sessionId: string): Observable<{ success: boolean; token: string }> {
    return this.http.post<{ success: boolean; token: string }>(
      `${this.apiUrl}/auth/refresh`,
      { session_id: sessionId }
    );
  }

  /**
   * Map HTTP errors to user-friendly messages
   */
  private handleAuthError(error: HttpErrorResponse): { message: string; status: number } {
    let message = 'Something went wrong. Please try again.';

    if (error.status === 0) {
      // Network error — server is down or CORS blocked
      message = 'Unable to reach the server. Please check your connection.';
    } else if (error.status === 400) {
      // Validation error
      message = error.error?.errors?.[0]?.msg || error.error?.message || 'Please check your input.';
    } else if (error.status === 401) {
      // Invalid credentials
      message = error.error?.message || 'Invalid email or password.';
    } else if (error.status === 403) {
      // Account deactivated or session expired
      message = error.error?.message || 'Access denied. Please contact admin.';
    } else if (error.status === 409) {
      // Conflict (e.g. Email already registered)
      message = error.error?.message || 'Email already registered.';
    } else if (error.status === 503) {
      // Service unavailable (DB down)
      message = error.error?.message || 'Service temporarily unavailable. Please try again later.';
    } else if (error.status >= 500) {
      // Server error
      message = error.error?.message || 'Server error. Please try again later.';
    }

    return { message, status: error.status };
  }
}