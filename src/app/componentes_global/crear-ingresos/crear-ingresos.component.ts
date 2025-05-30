// src/app/componentes_global/crear-ingresos/crear-ingresos.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router'; // Asegúrate de que Router está importado si lo vas a usar
import { ServiceLogService } from '../../componentes_log/service/service-log.service'; // Asegúrate de que el path es correcto

@Component({
  selector: 'app-crear-ingresos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-ingresos.component.html',
  styleUrls: ['./crear-ingresos.component.css']
})
export class CrearIngresosComponent {
  cantidad: string = '';
  successMessage = '';

  constructor(
    private service: ServiceLogService,
    private router: Router
  ) {}

  onSubmit(form: NgForm) {
    // Si el formulario es inválido (debido a validadores 'required' o 'pattern'),
    // el botón estará deshabilitado, pero si por alguna razón se intenta enviar,
    // esta validación lo detiene.
    if (form.invalid) {
      // Opcional: Marcar todos los controles como 'touched' para que los mensajes de error aparezcan
      // si el usuario intenta enviar el formulario sin tocar los campos inválidos.
      Object.keys(form.controls).forEach(key => {
        form.controls[key].markAsTouched();
      });
      return;
    }

    // Formatear la cantidad reemplazando ',' por '.' si es necesario, para que el backend la procese como un número.
    // Esto es importante porque el patrón permite ',' pero los números en JS/JSON suelen usar '.'.
    const cantidadFormateada = this.cantidad.replace(',', '.');

    this.service.createIngreso(cantidadFormateada).subscribe({
      next: () => {
        this.successMessage = 'El ingreso se ha creado correctamente.';
        form.resetForm();
        // Opcional: Restablecer el mensaje de éxito después de un tiempo para que no quede fijo
        setTimeout(() => {
          this.successMessage = '';
        }, 3000); 
      },
      error: err => {
        console.error('Error al crear ingreso:', err);
      
      }
    });
  }
}
