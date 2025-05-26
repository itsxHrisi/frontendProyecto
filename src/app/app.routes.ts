// src/app/app.routes.ts

import { Routes } from '@angular/router';
import { LoginComponent }   from './componentes_log/login/login.component';
import { RegistroComponent } from './componentes_log/registro/registro.component';
import { InicioComponent }   from './componentes_log/inicio/inicio.component';
import { PerfilComponent }   from './componentes_global/perfil/perfil.component';
import { CambiarPassComponent }   from './componentes_global/cambiar-pass/cambiar-pass.component';
import { CrearGrupoComponent }   from './componentes_global/crear-grupo/crear-grupo.component';
import { CrearGrupoFamiliarComponent }   from './componentes_global/crear-grupo-familiar/crear-grupo-familiar.component';
import { InvitacionesComponent }   from './componentes_global/invitaciones/invitaciones.component';
import { authGuard }         from './componentes_log/guards/auth.guard';
import { GrupoComponent } from './componentes_global/grupo/grupo.component';
import { CrearGastoComponent } from './componentes_global/crear-gasto/crear-gasto.component';
import { GestorUsuariosComponent } from './componentes_global/gestor-usuarios/gestor-usuarios.component';
import { CrearInvitacionesComponent } from './componentes_global/crear-invitaciones/crear-invitaciones.component';
import { GastosComponent } from './componentes_global/gastos/gastos.component';
import { CrearIngresosComponent } from './componentes_global/crear-ingresos/crear-ingresos.component';
import { VerMisIngresosComponent } from './componentes_global/ver-mis-ingresos/ver-mis-ingresos.component';
import { VerIngresosComponent } from './componentes_global/ver-ingresos/ver-ingresos.component';
import { VerMisGastosComponent } from './componentes_global/ver-mis-gastos/ver-mis-gastos.component';

export const routes: Routes = [
  { path: '', redirectTo: 'inicio', pathMatch: 'full' },
  { path: 'inicio', component: InicioComponent },
  { path: 'login',    canActivate:[authGuard], component: LoginComponent },
  { path: 'registro', canActivate:[authGuard], component: RegistroComponent },
  { path: 'perfil',   component: PerfilComponent },
  { path: 'cambiarpass', component: CambiarPassComponent },
  { path: 'crearGrupo',  component: CrearGrupoComponent },
  { path: 'crearGrupoFamiliar', component: CrearGrupoFamiliarComponent },
  { path: 'invitaciones', component: InvitacionesComponent },
  {
    path: 'grupo',
    component: GrupoComponent,
    children: [
      { path: '', redirectTo: 'creargasto', pathMatch: 'full' },
      { path: 'creargasto', component: CrearGastoComponent },
      { path: 'gastos', component: GastosComponent },
      { path: 'misgastos', component: VerMisGastosComponent },
      { path: 'gestor', component: GestorUsuariosComponent },
      { path: 'invitacion', component: CrearInvitacionesComponent },
      { path: 'crearingreso', component: CrearIngresosComponent },
      { path: 'ingresos', component: VerIngresosComponent },
      { path: 'misingresos', component: VerMisIngresosComponent },
      // futuras hijas:
      // { path: 'gastos/mios', component: MisGastosComponent },
      // { path: 'gastos',       component: VerGastosComponent }
    ]
  },

  { path: '**', redirectTo: 'inicio' }
];


