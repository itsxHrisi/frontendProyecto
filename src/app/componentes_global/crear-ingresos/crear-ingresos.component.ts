// src/app/componentes_global/crear-ingresos/crear-ingresos.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ServiceLogService } from '../../componentes_log/service/service-log.service';

@Component({
  selector: 'app-crear-ingresos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-ingresos.component.html',
  styleUrls: ['./crear-ingresos.component.css']
})
export class CrearIngresosComponent {
  cantidad: string = '';
  // **Nuevo** mensaje de éxito
  successMessage = '';

  constructor(
    private service: ServiceLogService,
    private router: Router
  ) {}

  onSubmit(form: NgForm) {
    if (form.invalid) return;
    this.service.createIngreso(this.cantidad).subscribe({
      next: () => {
        // sustituimos el alert por nuestro mensaje
        this.successMessage = 'El ingreso se ha creado correctamente.';
        form.resetForm();
        // opcional: navegación posterior
        // this.router.navigate(['/ingresos/lista']);
      },
      error: err => {
        console.error('Error al crear ingreso:', err);
        alert('No se pudo crear el ingreso');
      }
    });
  }
}