// src/app/componentes_global/gestor-usuarios/gestor-usuarios.component.ts
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';
import { fromEvent }    from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';
import { RolDto, ServiceLogService, UserDto,GrupoDto,PaginaUsuarios } from '../../componentes_log/service/service-log.service';

@Component({
  selector: 'app-gestor-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestor-usuarios.component.html',
  styleUrls: ['./gestor-usuarios.component.css']
})
export class GestorUsuariosComponent implements OnInit, AfterViewInit {
  @ViewChild('searchInput') searchInput!: ElementRef;

  usuarios: UserDto[] = [];
  filteredUsuarios: UserDto[] = [];
  searchTerm = '';

    // paginación
  currentPage = 0;
  pageSize    = 3;

  private grupoId!: number;

  constructor(
    private authService: ServiceLogService,
    private service: ServiceLogService
  ) {}
  
ngOnInit(): void {
    this.authService.getPerfil().pipe(
      tap(perf => this.grupoId = perf.grupoFamiliarId),
      switchMap(perf => this.service.getGrupo(this.grupoId))
    ).subscribe({
      next: (grupo: GrupoDto) => {
        // filtramos fuera los admins
        const nonAdmins = grupo.usuarios.filter(u =>
          !u.roles.some(r => r.nombre === 'ROL_ADMIN')
        );
        this.usuarios         = nonAdmins;
        this.filteredUsuarios = [...nonAdmins];
        this.currentPage      = 0;
      },
      error: err => console.error(err)
    });
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

  private applyFilter(): void {
    this.currentPage = 0;
    if (!this.searchTerm) {
      this.filteredUsuarios = [...this.usuarios];
    } else {
      const t = this.searchTerm;
      this.filteredUsuarios = this.usuarios.filter(u =>
        u.nickname.toLowerCase().includes(t) ||
        u.nombre.toLowerCase().includes(t)   ||
        u.email.toLowerCase().includes(t)    ||
        u.telefono.toLowerCase().includes(t)
      );
    }
  }

  /** Colección paginada que usa el template */
  get paginatedUsuarios(): UserDto[] {
    const start = this.currentPage * this.pageSize;
    return this.filteredUsuarios.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredUsuarios.length / this.pageSize);
  }

  prevPage() {
    if (this.currentPage > 0) this.currentPage--;
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) this.currentPage++;
  }

    getRoleNames(u: UserDto): string {
    // r está tipado como RolDto en lugar de any
    return (u.roles ?? []).map((r: RolDto) => r.nombre).join(', ');
  }

  hasPadreRole(u: UserDto): boolean {
    return (u.roles ?? []).some((r: RolDto) => r.nombre === 'ROL_PADRE');
  }

  toggleRolPadre(u: UserDto, checked: boolean): void {
    const nick = u.nickname;
    if (checked) {
      this.service.asignarRolPadre(nick).subscribe({
        next: () => {
          // añades un RolDto
          u.roles.push({ id: 0, nombre: 'ROL_PADRE' } as RolDto);
        },
        error: err => console.error('Error asignando rol padre:', err)
      });
    } else {
      this.service.quitarRolPadre(nick).subscribe({
        next: () => {
          // filtras con RolDto
          u.roles = u.roles.filter((r: RolDto) => r.nombre !== 'ROL_PADRE');
        },
        error: err => console.error('Error quitando rol padre:', err)
      });
    }
  }
/** Devuelve true si el usuario tiene rol ADMIN */
  hasAdminRole(u: UserDto): boolean {
    return (u.roles ?? []).some((r: RolDto) => r.nombre === 'ROL_ADMIN');
  }
  expulsarUsuario(u: UserDto): void {
    this.service.expulsarUsuario(this.grupoId, u.nickname).subscribe({
      next: () => {
        this.usuarios = this.usuarios.filter(x => x.nickname !== u.nickname);
        this.applyFilter();
      },
      error: err => console.error('Error expulsando usuario:', err)
    });
  }
}
