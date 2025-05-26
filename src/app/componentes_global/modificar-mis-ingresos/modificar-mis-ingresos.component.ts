// src/app/componentes_global/modificar-mis-ingresos/modificar-mis-ingresos.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FormsModule, NgForm }   from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import {
  ServiceLogService,
  IngresoDto
} from '../../componentes_log/service/service-log.service';

@Component({
  selector: 'app-modificar-mis-ingresos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './modificar-mis-ingresos.component.html',
  styleUrls: ['./modificar-mis-ingresos.component.css']
})
export class ModificarMisIngresosComponent implements OnInit {
  ingresoId!: number;
  cantidad = '';
  successMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private svc: ServiceLogService
  ) {}

  ngOnInit(): void {
    // 1) Leemos el id de queryParams
    this.ingresoId = Number(this.route.snapshot.queryParamMap.get('id'));
    // 2) Cargar los datos actuales
    this.svc.getIngresoById(this.ingresoId).subscribe({
      next: ing => {
        // pre-llenamos el input con la cantidad en formato 'xxx,yy'
        this.cantidad = ing.cantidad.toFixed(2).replace('.', ',');
      },
      error: err => {
        console.error('No se pudo cargar ingreso:', err);
        // opcional: redirigir atrás
        this.router.navigate(['/modificaringresos']);
      }
    });
  }

  onSubmit(form: NgForm) {
    if (form.invalid) return;
    // enviamos la actualización
    this.svc.updateIngreso(this.ingresoId, this.cantidad).subscribe({
      next: () => {
        this.successMessage = 'Ingreso actualizado correctamente';
          setTimeout(() => {
          this.router.navigate(['/grupo','misingresos']);
        }, 900);
      },
      error: err => {
        console.error('Error actualizando ingreso:', err);
      }
    });
  }

  onCancel() {
    // volvemos a la lista de ingresos
    this.router.navigate(['/grupo','misingresos']);
  }
}
