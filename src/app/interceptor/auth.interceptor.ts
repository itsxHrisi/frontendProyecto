import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  //Obtiene tocken de localStorage
  const token = localStorage.getItem('auth_token');

  //Si tocken existe colona solicitud y añade
  //a headers el token
  if (token) {
    const authReq = req.clone({
      setHeaders: {
        
        Authorization: `Bearer ${token}`
      }
      
    });
    return next(authReq);
  }
  return next(req);
}
