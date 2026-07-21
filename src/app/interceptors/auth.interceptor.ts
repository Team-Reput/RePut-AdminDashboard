import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Auth interceptor – attaches the JWT Bearer token to every outgoing
 * request EXCEPT login, register and refresh endpoints (which don't need a token).
 * Also intercepts 401/403 expired token errors to perform auto-refresh.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // Skip adding the token for auth endpoints (login, register, refresh)
  const skipUrls = ['/auth/login', '/auth/register', '/auth/refresh'];
  const shouldSkip = skipUrls.some((url) => req.url.includes(url));

  if (shouldSkip) {
    return next(req);
  }

  // Retrieve the auth token from localStorage
  const token = authService.getToken();

  // Clone the request and add the Authorization header if the token exists
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // 401 = expired/invalid token → attempt refresh
      // 403 = insufficient role (RBAC) → do NOT refresh, just propagate
      if (error.status === 401) {
        const user = authService.getUser();
        if (user && user.session_id) {
          // Attempt to refresh the token using the session_id
          return authService.refreshToken(user.session_id).pipe(
            switchMap((res) => {
              if (res.success && res.token) {
                // Update the token in localStorage
                localStorage.setItem('token', res.token);

                // Clone and retry the original failed request with the new token
                const retryReq = req.clone({
                  setHeaders: {
                    Authorization: `Bearer ${res.token}`
                  }
                });
                return next(retryReq);
              } else {
                authService.logout();
                return throwError(() => error);
              }
            }),
            catchError((refreshErr) => {
              // If refresh request fails, log out the user
              authService.logout();
              return throwError(() => refreshErr);
            })
          );
        } else {
          // No session_id found, force logout
          authService.logout();
        }
      }
      return throwError(() => error);
    })
  );
};
