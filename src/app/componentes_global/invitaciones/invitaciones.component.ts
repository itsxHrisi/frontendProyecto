// src/app/componentes_grupo/invitaciones/invitaciones.component.ts
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild
} from '@angular/core';
import { fromEvent } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { ServiceLogService, PaginaInvitaciones } from '../../componentes_log/service/service-log.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-invitaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invitaciones.component.html',
  styleUrls: ['./invitaciones.component.css']
})
export class InvitacionesComponent implements OnInit, AfterViewInit {
  @ViewChild('searchInput') searchInput!: ElementRef;

  // modo server (sin filtro): sólo la página actual
  invitaciones: any[]         = [];
  // modo client (con filtro): slice de allInvitaciones
  filteredInvitaciones: any[] = [];

  private allInvitaciones: any[] = [];
  private allLoaded = false;
  private totalElements = 0;

  currentPage = 0;
  totalPages  = 0;
  readonly pageSize = 3;

  searchTerm = '';

  constructor(
    private invitService: ServiceLogService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadServerPage(0);
  }

  ngAfterViewInit(): void {
    fromEvent<any>(this.searchInput.nativeElement, 'keyup').pipe(
      map(e => e.target.value.trim().toLowerCase()),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchTerm = term;
      this.applyFilter();
    });
  }

  private loadServerPage(page: number): void {
    this.invitService.getInvitaciones(page, this.pageSize).subscribe({
      next: resp => {
        // guardamos meta para, en caso de filtro, recargar TODO
        this.totalElements = resp.totalElements;

        // server-side
        this.invitaciones = resp.content;
        this.filteredInvitaciones = [...resp.content];
        this.currentPage = resp.number;
        this.totalPages  = resp.totalPages;

        // reset client-side load flag
        this.allLoaded = false;
      },
      error: err => console.error('Error cargando invitaciones', err)
    });
  }

  /** Aplica filtro local / client-side o recarga server-side si no hay término */
  private applyFilter(): void {
    if (!this.searchTerm) {
      // sin búsqueda, volvemos a modo server
      this.loadServerPage(0);
    } else {
      // con búsqueda: client-side sobre allInvitaciones
      if (!this.allLoaded) {
        // primera vez: cargamos TODAS las invitaciones de golpe
        this.invitService
          .getInvitaciones(0, this.totalElements || this.pageSize)
          .subscribe({
            next: respAll => {
              this.allInvitaciones = respAll.content;
              this.allLoaded = true;
              this.setupClientPages();
            },
            error: err => console.error('Error recargando todas invitaciones', err)
          });
      } else {
        this.setupClientPages();
      }
    }
  }

  /** Prepara paginación client-side y muestra página 1 */
  private setupClientPages(): void {
    const hits = this.allInvitaciones.filter(inv =>
      inv.grupo.nombre.toLowerCase().includes(this.searchTerm) ||
      inv.grupo.administrador.nickname.toLowerCase().includes(this.searchTerm)
    );
    this.totalPages = Math.ceil(hits.length / this.pageSize) || 1;
    this.currentPage = 0;
    this.filteredInvitaciones = hits.slice(0, this.pageSize);
  }

  /** Navegar a página: distingue server/client según searchTerm */
  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages) return;
    this.currentPage = page;

    if (!this.searchTerm) {
      this.loadServerPage(page);
    } else {
      // client-side: recalculamos slice
      const hits = this.allInvitaciones.filter(inv =>
        inv.grupo.nombre.toLowerCase().includes(this.searchTerm) ||
        inv.grupo.administrador.nickname.toLowerCase().includes(this.searchTerm)
      );
      const start = page * this.pageSize;
      this.filteredInvitaciones = hits.slice(start, start + this.pageSize);
    }
  }

  prevPage(): void { this.goToPage(this.currentPage - 1); }
  nextPage(): void { this.goToPage(this.currentPage + 1); }

  cambiarEstado(id: number, estado: 'ACEPTADA' | 'RECHAZADA'): void {
    this.invitService.updateEstado(id, estado).subscribe({
      next: () => {
        if (estado === 'ACEPTADA') {
          this.router.navigate(['/grupo']);
        } else {
          // tras rechazar, recargamos la página actual
          if (!this.searchTerm) {
            this.loadServerPage(this.currentPage);
          } else {
            this.applyFilter();
          }
        }
      },
      error: err => {
        console.error('Error al actualizar estado', err);
        alert('No se pudo actualizar la invitación');
      }
    });
  }
}
