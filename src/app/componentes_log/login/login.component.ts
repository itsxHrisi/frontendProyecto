import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { ServiceLogService } from '../service/service-log.service';

@Component({
  selector: 'app-login',
  standalone: true,                // ← IMPORTANTE
  imports: [
    CommonModule,
    FormsModule,                   // ← Aquí se importa FormsModule
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  nickname = '';
  password = '';
  loading = false;
  errorMessage: string | null = null;

  constructor(
    private serviceLog: ServiceLogService,
    private router: Router
  ) {}

  sendLogin(): void {
    if (!this.nickname || !this.password) {
      this.errorMessage = 'Nickname y contraseña son obligatorios';
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    this.serviceLog.userLogin({ nickname: this.nickname, password: this.password })
      .subscribe({
        next: () => {
          this.loading = false;
          const roles = this.serviceLog.getUserRoles();
          if (roles.includes('ADMINISTRADOR')) {
            this.router.navigate(['/home']);
          } else {
            this.router.navigate(['/inicio']);
          }
        },
        error: err => {
          this.loading = false;
          if (err.status === 400 && err.error?.mensaje) {
            this.errorMessage = err.error.mensaje;
          } else {
            this.errorMessage = 'Nickname o contraseña incorrectos';
          }
        }
      });
  }
}
