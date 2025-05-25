

// src/app/componentes_global/crear-invitaciones/crear-invitaciones.component.ts
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { fromEvent, Observable, of } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  switchMap,
  tap,
  catchError
} from 'rxjs/operators';
import {
  ServiceLogService,
  PaginaUsuarios,
  UserDto
} from '../../componentes_log/service/service-log.service';

@Component({
  selector: 'app-crear-invitaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-invitaciones.component.html',
  styleUrls: ['./crear-invitaciones.component.css']
})
export class CrearInvitacionesComponent implements OnInit, AfterViewInit {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  // lista “pura” extraída del servidor (sin agrupar paginación)
  private todosUsuariosSinGrupo: UserDto[] = [];

  // la página actual a mostrar
  usuarios: UserDto[] = [];
  sending = new Set<string>();
  invited = new Set<string>();      // ← usuarios ya invitados

  currentPage = 0;
  totalPages  = 0;
  pageSize    = 5;
  private grupoId!: number;

  ngOnInit(): void {
    this.auth.getPerfil().pipe(
      tap(p => this.grupoId = p.grupoFamiliarId),
      // en cuanto tenemos el grupo, cargamos TODO el listado (size enorme)
      switchMap(() => this.svc.getAllUsuarios(0, 1000, ['id,asc']))
    ).pipe(
      tap(page => {
        // filtrar **solo** los que NO tengan grupo
        this.todosUsuariosSinGrupo = page.content.filter(u =>
          // u.grupoFamiliar viene undefined/null para quien no tiene grupo
          !u.grupoFamiliar
        );
        // calculamos cuántas páginas hay:
        this.totalPages = Math.ceil(this.todosUsuariosSinGrupo.length / this.pageSize);
        // y renderizamos la primera
        this.goToPage(0);
      }),
      catchError(err => {
        console.error('Error cargando usuarios completos:', err);
        return of({ content: [], totalPages: 0, totalElements:0, size:0, number:0 });
      })
    ).subscribe();
  }

  ngAfterViewInit(): void {
    fromEvent(this.searchInput.nativeElement, 'keyup').pipe(
      map(e => (e.target as HTMLInputElement).value.trim().toLowerCase()),
      debounceTime(300),
      distinctUntilChanged(),
      tap(term => {
        // sobre la lista completa sin grupo, aplicamos startsWith
        const filtrados = term
          ? this.todosUsuariosSinGrupo.filter(u =>
              u.nickname.toLowerCase().startsWith(term) ||
              u.nombre.toLowerCase().startsWith(term)   ||
              u.email.toLowerCase().startsWith(term)
            )
          : this.todosUsuariosSinGrupo;

        // recalculamos páginas
        this.totalPages = Math.ceil(filtrados.length / this.pageSize);
        // y mostramos la primera página de ese filtrado
        this.currentPage = 0;
        this.usuarios    = filtrados.slice(0, this.pageSize);
      })
    ).subscribe();
  }

  /** Navegar a la página `n` */
  goToPage(n: number) {
    if (n < 0 || n >= this.totalPages) return;
    this.currentPage = n;
    const start = n * this.pageSize;
    this.usuarios = this.todosUsuariosSinGrupo.slice(start, start + this.pageSize);
  }

  prevPage() { this.goToPage(this.currentPage - 1); }
  nextPage() { this.goToPage(this.currentPage + 1); }

  invitar(nickname: string): void {
    if (this.sending.has(nickname)) return;
    this.sending.add(nickname);
    this.svc.createInvitacion(nickname, this.grupoId).subscribe({
      next: () => this.sending.delete(nickname),
      error: err => {
        console.error('Error al invitar:', err);
        this.sending.delete(nickname);
        this.invited.add(nickname);   // ← marcamos como invitado

      }
    });
  }

  constructor(
    private auth: ServiceLogService,
    private svc:  ServiceLogService
  ) {}
}
