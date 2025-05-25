import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ServiceLogService } from '../../componentes_log/service/service-log.service';

@Component({
  selector: 'app-gastos',
  imports: [],
  templateUrl: './gastos.component.html',
  styleUrl: './gastos.component.css'
})
export class GastosComponent {
  // datos de perfil
  usuarioId!: number;
  grupoId!: number;

  gastos: any[] = [];
  paginatedGastos: any[] = [];

  pageSize = 10;
  currentPage = 1;
  totalPages = 1;

  constructor(
    private service: ServiceLogService,
  ) {}

  ngOnInit(): void {
    // 1) cargar perfil y guardar ids
    // this.service.getPerfil().subscribe({
    //   next: perfil => {
    //     console.log('Perfil en GastosComponent →', perfil);
    //     this.usuarioId = perfil.id;
    //     this.grupoId   = perfil.grupoFamiliarId;
    //   },
    //   error: err => {
    //     console.error('Error cargando perfil en GastosComponent', err);
    //   }
    // });

    // Simulación de datos
    this.gastos = Array.from({ length: 35 }, (_, i) => ({
      usuario: `Usuario ${i + 1}`,
      grupo: `Grupo ${(i % 3) + 1}`,
      tipoGasto: 'Comida',
      subtipo: ['Desayuno', 'Almuerzo', 'Cena'][i % 3],
      cantidad: Math.round(Math.random() * 100),
      fecha: new Date()
    }));

    this.totalPages = Math.ceil(this.gastos.length / this.pageSize);
    this.updatePaginatedGastos();
  } 

  updatePaginatedGastos() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedGastos = this.gastos.slice(start, end);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedGastos();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedGastos();
    }
  }

}
