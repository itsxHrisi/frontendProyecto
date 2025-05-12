import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { ServiceLogService } from '../service/service-log.service';
import { map, Observable, of } from 'rxjs';


export const authGuard: CanActivateFn = (route, state): Observable<boolean | UrlTree> => {
  // Inyectar el servicio y el router
  const router: Router = inject(Router);
  const serviceLog: ServiceLogService = inject(ServiceLogService);

  // Redirigir al inicio si el usuario está logueado
 /* return serviceLog.isLoggedIn$.pipe(
    map((isLoggedIn: boolean) => {
      console.log(isLoggedIn);
      
      if (isLoggedIn) {
        // Si está logueado, redirige a inicio
        return router.parseUrl('/inicio');
      }
      // Si no está logueado, permite el acceso a la ruta solicitada
      return true;
    })
  );*/

  return of(serviceLog.isLoggedIn() ? router.parseUrl('/inicio') : true)
};