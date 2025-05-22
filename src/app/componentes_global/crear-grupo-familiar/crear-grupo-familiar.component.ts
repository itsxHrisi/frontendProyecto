
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ServiceLogService } from '../../componentes_log/service/service-log.service';

@Component({
  selector: 'app-crear-grupo-familiar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './crear-grupo-familiar.component.html',
  styleUrl: './crear-grupo-familiar.component.css'
})
export class CrearGrupoFamiliarComponent {
  nombre = '';
  errorMsg = '';
  successMsg = '';
  cargando = false;

  constructor(
    private service: ServiceLogService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.errorMsg = '';
    this.successMsg = '';

    // validaciones básicas
    if (!this.nombre || this.nombre.trim().length < 3) {
      this.errorMsg = 'Ingresa un nombre válido de al menos 3 caracteres.';
      return;
    }

    this.cargando = true;
    this.service.createGrupo(this.nombre.trim()).subscribe({
      next: grupo => {
        this.cargando = false;
        this.successMsg = 'Grupo creado correctamente.';
        // redirige, por ejemplo, al detalle del grupo
        setTimeout(() => this.router.navigate(['/grupos', grupo.id]), 1000);
      },
      error: err => {
        this.cargando = false;
        this.errorMsg = err.error?.message || 'Error al crear el grupo.';
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/']); // o la ruta que prefieras
  }
}
