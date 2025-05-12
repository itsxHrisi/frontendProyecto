import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';

import {
  provideRouter,
  withComponentInputBinding,
  withHashLocation,
} from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptor/auth.interceptor';


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withHashLocation(), withComponentInputBinding()),
    //Declaracion del interceptor para que por cada llamada introduzca token si existe
    provideHttpClient(withInterceptors([authInterceptor])),
    
  ],
  
};