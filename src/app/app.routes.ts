// src/app/app.routes.ts

import { Routes } from '@angular/router';
import { LoginComponent }   from './componentes_log/login/login.component';
import { RegistroComponent } from './componentes_log/registro/registro.component';
import { InicioComponent }   from './componentes_log/inicio/inicio.component';
import { PerfilComponent }   from './componentes_global/perfil/perfil.component';
import { CambiarPassComponent }   from './componentes_global/cambiar-pass/cambiar-pass.component';

import { authGuard }         from './componentes_log/guards/auth.guard';

export const routes: Routes = [
  // Redirige la raíz a /#/inicio
  { path: '', pathMatch: 'full', redirectTo: 'inicio' },

  // Rutas principales
  { path: 'inicio', component: InicioComponent },
  { path: 'login', canActivate: [ authGuard ], component: LoginComponent },
  { path: 'registro', canActivate: [ authGuard ], component: RegistroComponent },
  { path: 'perfil', component: PerfilComponent },
  { path: 'cambiarpass', component: CambiarPassComponent },

  // Wildcard: cualquier otra ruta a /#/inicio
  { path: '**', redirectTo: 'inicio' }
];
