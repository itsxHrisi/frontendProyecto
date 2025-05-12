import { Routes } from '@angular/router';
import { LoginComponent } from './componentes_log/login/login.component';
import { RegistroComponent } from './componentes_log/registro/registro.component';
import { InicioComponent } from './componentes_log/inicio/inicio.component';
import { authGuard } from './componentes_log/guards/auth.guard';


export const routes: Routes = [
    { path: 'inicio', component: InicioComponent},
    { path: 'login', canActivate: [authGuard], component: LoginComponent},
    { path: 'registro', canActivate: [authGuard], component: RegistroComponent},
    { path: '', pathMatch: 'full', redirectTo: 'inicio'}
];