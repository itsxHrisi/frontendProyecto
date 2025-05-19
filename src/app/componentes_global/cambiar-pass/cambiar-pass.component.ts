// src/app/componentes_global/change-password/change-password.component.ts
import { Component } from '@angular/core';
import { ServiceLogService, JwtDto } from '../../componentes_log/service/service-log.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './cambiar-pass.component.html',
  styleUrls: ['./cambiar-pass.component.css']
})
export class CambiarPassComponent {
  newPassword = '';
  confirmPassword = '';
  errorMsg = '';
  successMsg = '';

  constructor(
    private authService: ServiceLogService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.errorMsg = '';
    this.successMsg = '';

    if (!this.newPassword || !this.confirmPassword) {
      this.errorMsg = 'Ambos campos son obligatorios.';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.errorMsg = 'Las contraseñas no coinciden.';
      return;
    }

    this.authService.changePassword(this.newPassword).subscribe({
      next: (jwt: JwtDto) => {
        this.successMsg = 'Contraseña actualizada correctamente.';
        // ya actualizamos el token en el service
        setTimeout(() => this.router.navigate(['/perfil']), 1000);
      },
      error: err => {
        console.error(err);
        this.errorMsg = err.error?.errores?.[0] || 'Error al cambiar contraseña.';
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/perfil']);
  }
}
