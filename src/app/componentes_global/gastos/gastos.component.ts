// src/app/componentes_global/gastos/gastos.component.ts
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import { fromEvent }    from 'rxjs';
import { debounceTime, distinctUntilChanged, map, tap } from 'rxjs/operators';
import { ServiceLogService, GastoDto, PaginaGastos } from '../../componentes_log/service/service-log.service';

@Component({
  selector: 'app-gastos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gastos.component.html',
  styleUrls: ['./gastos.component.css']
})
export class GastosComponent implements OnInit, AfterViewInit {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  gastos: GastoDto[] = [];
  // filtros
  nicknameFilter = '';
  tipoFilter = '';
  subtipoFilter = '';

  // !!! NUEVA PROPIEDAD PARA LA SUMA TOTAL !!!
  totalGastosActualPagina: number = 0;


  // aquí los tipos según tu enum TipoGasto
  tipoGastos = [
    'SUPERVIVENCIA',
    'LUJO',
    'EDUCACION',
    'AHORRO',
    'INVERSION'
  ];

  // y los subtipos según SubtipoGasto
  subtipoOptions: Record<string,string[]> = {
    SUPERVIVENCIA: [
      'AGUA','BASURAS','COMIDA','COMUNIDAD','FARMACIA','GAS','GASOIL',
      'GIMNASIO','HIJOS','HIPOTECA','IBI','LUZ','MANT_COCHE','MUTUA',
      'ROPA_IMPRESCINDIBLE','SALUD','SEGURO_HOGAR','SEGURO_VIDA',
      'COCHERA','CASA_APARATOS','DOCUMENTOS'
    ],
    LUJO: [
      'ESPECTACULOS','ESTETICA','MAQUILLAJE','PARKING','REGALOS',
      'RESTAURANTES','ROPA_COMPLEMENTOS','SUBSCRIPCIONES_OCIO',
      'VIAJES','SALIDAS_OCIO','TELEFONO_INTERNET','LOTERIA','FALLA','LUJO_NIÑOS'
    ],
    EDUCACION: [
      'CURSOS','LIBROS','MASTERS','SUBSCRIPCIONES_EDU','PROGRAMAS'
    ],
    AHORRO: [
      'BANKINTER','TRADE_REPUBLIC','CAIXABANK','SABADELL','MY_INVESTOR'
    ],
    INVERSION: [
      'HAUSERA','IB','MYINVESTOR','BINANCE'
    ]
  };

  // paginación
  currentPage = 0;
  totalPages = 0;
  pageSize = 5;

  constructor(private svc: ServiceLogService) {}

  ngOnInit(): void {
    this.loadGastos();
  }

  ngAfterViewInit(): void {
    fromEvent(this.searchInput.nativeElement,'keyup').pipe(
      map(e => (e.target as HTMLInputElement).value.trim()),
      debounceTime(300),
      distinctUntilChanged(),
      tap(term => {
        this.nicknameFilter = term;
        this.loadGastos(0);
      })
    ).subscribe();
  }

  onTipoChange(): void {
    this.subtipoFilter = '';
    this.loadGastos(0);
  }

  onSubtipoChange(): void {
    this.loadGastos(0);
  }

  loadGastos(page: number = 0): void {
    const filters: string[] = [];
    if (this.tipoFilter)   filters.push(`tipoGasto:EMPIEZA:${this.tipoFilter}`);
    if (this.subtipoFilter)filters.push(`subtipo:IGUAL:${this.subtipoFilter}`);

    this.svc.getGastosFilter(
      this.nicknameFilter,
      filters,
      page,
      this.pageSize
    ).subscribe({
      next: (p: PaginaGastos) => {
        console.log('Respuesta /gastos/filter:', p);
        this.gastos       = p.content;
        this.currentPage  = p.number;
        this.totalPages   = p.totalPages;
        this.calculateTotalGastos(); // !!! Llamar al método para calcular la suma
      },
      error: (err) => {
        console.error('Error al cargar gastos:', err);
        this.gastos = [];
        this.currentPage = this.totalPages = 0;
        this.totalGastosActualPagina = 0; // Resetear la suma también en caso de error
      }
    });
  }

  // !!! NUEVO MÉTODO PARA CALCULAR LA SUMA DE LOS GASTOS DE LA PÁGINA ACTUAL !!!
  calculateTotalGastos(): void {
    this.totalGastosActualPagina = this.gastos.reduce((sum, gasto) => sum + gasto.cantidad, 0);
  }

  prevPage(): void {
    if (this.currentPage > 0) this.loadGastos(this.currentPage - 1);
  }
  nextPage(): void {
    if (this.currentPage + 1 < this.totalPages) this.loadGastos(this.currentPage + 1);
  }
}