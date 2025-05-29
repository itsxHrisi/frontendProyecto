// src/app/componentes_global/ver-ingresos/ver-ingresos.component.ts
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild
} from '@angular/core';
import { fromEvent } from 'rxjs';
import {
  map,
  debounceTime,
  distinctUntilChanged,
  tap
} from 'rxjs/operators';
import {
  ServiceLogService,
  IngresoDto,
  PaginaIngresos
} from '../../componentes_log/service/service-log.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ver-ingresos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ver-ingresos.component.html',
  styleUrls: ['./ver-ingresos.component.css']
})
export class VerIngresosComponent implements OnInit, AfterViewInit {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  // todas las páginas consultadas
  private allIngresos: IngresoDto[] = [];

  // ingresos mostrados (página + búsqueda)
  ingresos: IngresoDto[] = [];

  menorQue = 0;
  mayorQue = 0;
  igualQue = 0;

  currentPage = 0;
  totalPages  = 0;
  pageSize    = 10;

  totalIngresosActualPagina: number = 0;

  constructor(private svc: ServiceLogService) {}

  ngOnInit(): void {
    // cargar la página 0 al inicio
    this.loadIngresos(0);
  }

  ngAfterViewInit(): void {
    // búsqueda reactiva: filtra this.allIngresos
    fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
      map(e => (e.target as HTMLInputElement).value.trim().toLowerCase()),
      debounceTime(300),
      distinctUntilChanged(),
      tap(term => {
        // aplicar filtro local
        if (!term) {
          this.ingresos = [...this.allIngresos];
        } else {
          this.ingresos = this.allIngresos.filter(i =>
            i.usuarioNickname.toLowerCase().includes(term)
          );
        }
        this.calculateTotalIngresos(); 
      })
    ).subscribe();
  }

  private buildFilters(): string[] {
    const f: string[] = [];
    if (this.menorQue > 0) f.push(`cantidad:MENOR_QUE:${this.menorQue}`);
    if (this.mayorQue > 0) f.push(`cantidad:MAYOR_QUE:${this.mayorQue}`);
    if (this.igualQue > 0) f.push(`cantidad:IGUAL:${this.igualQue}`);
    return f;
  }

  loadIngresos(page: number = 0): void {
    const filtros = this.buildFilters();

    this.svc.getIngresosFilter(filtros, page, this.pageSize)
      .subscribe({
        next: (p: PaginaIngresos) => {
          // guardamos el contenido “puro”
          this.allIngresos = p.content;
          // mostramos la página completa inicialmente
          this.ingresos    = [...this.allIngresos];
          this.currentPage = p.number;
          this.totalPages  = p.totalPages;
          this.calculateTotalIngresos(); 
        },
        error: (err) => { // Agregado 'err' para depuración
          console.error('Error al cargar ingresos:', err); // Log el error
          this.allIngresos = [];
          this.ingresos    = [];
          this.currentPage = this.totalPages = 0;
          this.totalIngresosActualPagina = 0; // Resetear la suma también en caso de error
        }
      });
  }

  calculateTotalIngresos(): void {
    this.totalIngresosActualPagina = this.ingresos.reduce((sum, ingreso) => sum + ingreso.cantidad, 0);
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.loadIngresos(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage + 1 < this.totalPages) {
      this.loadIngresos(this.currentPage + 1);
    }
  }
}