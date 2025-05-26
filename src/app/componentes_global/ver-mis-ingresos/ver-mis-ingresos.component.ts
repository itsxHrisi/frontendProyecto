// src/app/componentes_global/lista-ingresos/lista-ingresos.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceLogService, IngresoDto } from '../../componentes_log/service/service-log.service';

@Component({
  selector: 'app-lista-ingresos',
  standalone: true,
  imports: [CommonModule],
   templateUrl: './ver-mis-ingresos.component.html',
  styleUrl: './ver-mis-ingresos.component.css'
})
export class VerMisIngresosComponent implements OnInit {
  ingresos: IngresoDto[] = [];

  constructor(private svc: ServiceLogService) {}

  ngOnInit() {
    this.svc.getIngresosUsuario().subscribe({
      next: data => this.ingresos = data,
      error: err => console.error('Error cargando lista de ingresos:', err)
    });
  }

  modificarIngreso(id: number) {
    console.log('Modificar ingreso ID:', id);
    // lógica de modificar más adelante…
  }
}
