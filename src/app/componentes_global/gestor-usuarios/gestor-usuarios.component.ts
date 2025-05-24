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
import { RolDto, ServiceLogService, UserDto,GrupoDto } from '../../componentes_log/service/service-log.service';

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
  private grupoId!: number;

  constructor(
    private authService: ServiceLogService,
    private service: ServiceLogService
  ) {}
  /** Devuelve true si el usuario tiene rol ADMIN */
  hasAdminRole(u: UserDto): boolean {
    return (u.roles ?? []).some((r: RolDto) => r.nombre === 'ROL_ADMIN');
  }
  ngOnInit(): void {
    this.authService.getPerfil().pipe(
      tap(perfil => this.grupoId = perfil.grupoFamiliarId),
      switchMap(perfil => this.service.getGrupo(perfil.grupoFamiliarId))
    ).subscribe({
      next: grupo => {
        console.log('Grupo completo:', grupo);
        // filtramos fuera los admins
        const nonAdmins = grupo.usuarios.filter(u => !this.hasAdminRole(u));
        this.usuarios = nonAdmins;
        this.filteredUsuarios = [...nonAdmins];
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
    const base = this.usuarios; // ya no contiene admins
    if (!this.searchTerm) {
      this.filteredUsuarios = [...base];
    } else {
      const term = this.searchTerm;
      this.filteredUsuarios = base.filter(u =>
        u.nickname.toLowerCase().includes(term) ||
        u.nombre.toLowerCase().includes(term)   ||
        u.email.toLowerCase().includes(term)    ||
        u.telefono.toLowerCase().includes(term)
      );
    }
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
