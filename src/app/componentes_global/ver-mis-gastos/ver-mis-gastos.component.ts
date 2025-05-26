// src/app/componentes_global/ver-mis-gastos/ver-mis-gastos.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ServiceLogService,
  GastoDto,
  PaginaGastos,
} from '../../componentes_log/service/service-log.service';

@Component({
  selector: 'app-ver-mis-gastos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ver-mis-gastos.component.html',
  styleUrls: ['./ver-mis-gastos.component.css'],
})
export class VerMisGastosComponent implements OnInit {
  gastos: GastoDto[] = []; // filtros

  tipoFilter = '';
  subtipoFilter = '';

  // !!! NUEVA PROPIEDAD PARA LA SUMA TOTAL !!!
  totalMisGastosActualPagina: number = 0; // opciones según tus enums

  tipoGastos = ['SUPERVIVENCIA', 'LUJO', 'EDUCACION', 'AHORRO', 'INVERSION'];

  subtipoOptions: Record<string, string[]> = {
    SUPERVIVENCIA: [
      'AGUA',
      'BASURAS',
      'COMIDA',
      'COMUNIDAD',
      'FARMACIA',
      'GAS',
      'GASOIL',
      'GIMNASIO',
      'HIJOS',
      'HIPOTECA',
      'IBI',
      'LUZ',
      'MANT_COCHE',
      'MUTUA',
      'ROPA_IMPRESCINDIBLE',
      'SALUD',
      'SEGURO_HOGAR',
      'SEGURO_VIDA',
      'COCHERA',
      'CASA_APARATOS',
      'DOCUMENTOS',
    ],
    LUJO: [
      'ESPECTACULOS',
      'ESTETICA',
      'MAQUILLAJE',
      'PARKING',
      'REGALOS',
      'RESTAURANTES',
      'ROPA_COMPLEMENTOS',
      'SUBSCRIPCIONES_OCIO',
      'VIAJES',
      'SALIDAS_OCIO',
      'TELEFONO_INTERNET',
      'LOTERIA',
      'FALLA',
      'LUJO_NIÑOS',
    ],
    EDUCACION: [
      'CURSOS',
      'LIBROS',
      'MASTERS',
      'SUBSCRIPCIONES_EDU',
      'PROGRAMAS',
    ],
    AHORRO: [
      'BANKINTER',
      'TRADE_REPUBLIC',
      'CAIXABANK',
      'SABADELL',
      'MY_INVESTOR',
    ],
    INVERSION: ['HAUSERA', 'IB', 'MYINVESTOR', 'BINANCE'],
  }; // paginación

  currentPage = 0;
  totalPages = 0;
  pageSize = 5; // nickname del usuario autenticado

  private nickname = '';

  constructor(private svc: ServiceLogService) {}

  ngOnInit(): void {
    this.svc.getPerfil().subscribe({
      next: (perfil) => {
        this.nickname = perfil.nickname;
        this.loadGastos(0);
      },
      error: (err) => console.error('No se pudo cargar perfil', err),
    });
  }

  onTipoChange(): void {
    this.subtipoFilter = '';
    this.loadGastos(0);
  }

  onSubtipoChange(): void {
    this.loadGastos(0);
  }

  private buildFilters(): string[] {
    const filters: string[] = [];
    if (this.tipoFilter) filters.push(`tipoGasto:CONTIENE:${this.tipoFilter}`);
    if (this.subtipoFilter) filters.push(`subtipo:IGUAL:${this.subtipoFilter}`);
    return filters;
  }

  loadGastos(page: number = 0): void {
    this.svc
      .getGastosFilter(this.nickname, this.buildFilters(), page, this.pageSize)
      .subscribe({
        next: (p: PaginaGastos) => {
          this.gastos = p.content;
          this.currentPage = p.number;
          this.totalPages = p.totalPages;
          this.calculateTotalMisGastos(); // !!! Llamar al método para calcular la suma
        },
        error: (err) => {
          console.error('Error al cargar mis gastos:', err);
          this.gastos = [];
          this.currentPage = this.totalPages = 0;
          this.totalMisGastosActualPagina = 0; // Resetear la suma también en caso de error
        },
      });
  }

  // !!! NUEVO MÉTODO PARA CALCULAR LA SUMA DE LOS GASTOS DE LA PÁGINA ACTUAL !!!
  calculateTotalMisGastos(): void {
    this.totalMisGastosActualPagina = this.gastos.reduce(
      (sum, gasto) => sum + gasto.cantidad,
      0
    );
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.loadGastos(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage + 1 < this.totalPages) {
      this.loadGastos(this.currentPage + 1);
    }
  }

  eliminarGasto(id: number): void {
    if (!confirm('¿Seguro que quieres eliminar este gasto?')) return;
    this.svc.deleteGasto(id).subscribe({
      next: () => {
        console.log(
          'Operación de eliminación en Angular completada, recargando gastos...'
        ); // tras borrar, recargamos la misma página
        this.loadGastos(this.currentPage);
      },
      error: (err) => {
        console.error('Error al eliminar gasto:', err);
      },
    });
  }
}
