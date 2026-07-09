import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Auth interceptor – attaches the JWT Bearer token to every outgoing
 * request EXCEPT login and register endpoints (which don't need a token).
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {

  // Skip adding the token for auth endpoints (login, register)
  const skipUrls = ['/auth/login', '/auth/register'];
  const shouldSkip = skipUrls.some((url) => req.url.includes(url));

  if (shouldSkip) {
    return next(req);
  }

  // Retrieve the auth token from localStorage
  const token = localStorage.getItem('token');

  // Clone the request and add the Authorization header if the token exists
  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }

  return next(req);
};
