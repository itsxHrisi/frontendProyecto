// src/app/componentes_global/grupo/grupo.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule }        from '@angular/common';
import { Router, RouterLink, RouterOutlet }  from '@angular/router';
import { ServiceLogService }   from '../../componentes_log/service/service-log.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-grupo',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterOutlet
  ],
  templateUrl: './grupo.component.html',
  styleUrls: ['./grupo.component.css']
})
export class GrupoComponent implements OnInit {
  groupName = '';
  roles: string[] = [];
  private grupoId!: number;  // ← guardamos el ID aquí

  constructor(
    private authService: ServiceLogService,
    private router: Router
  ) {}


  ngOnInit(): void {
    this.authService.getPerfil().subscribe({
      next: user => {
        console.log('Perfil recibido en GrupoComponent:', user);
        this.groupName = user.grupoFamiliarNombre || '';
        this.roles     = (user.roles || []).map((r: any) => r.nombre);
        this.grupoId   = user.grupoFamiliarId;  // ← capturamos el ID
      },
      error: err => {
        console.error('No se pudo cargar perfil en GrupoComponent:', err);
        this.router.navigate(['/crearGrupo']);
      }
    });
  }

  hasRole(role: string): boolean {
    return this.roles.includes(role);
  }

  abandonarGrupo(): void {
    this.authService.abandonarGrupo()
      .pipe(
        finalize(() => {
          // tras completar la petición (éxito o error), vamos a creación
          this.router.navigate(['/crearGrupo']);
        })
      )
      .subscribe({
        next: () => console.log('Has abandonado el grupo correctamente'),
        error: err => console.error('Error al abandonar grupo:', err)
      });
  }


eliminarGrupo(): void {
  if (!this.grupoId) return;

  this.authService.deleteGrupo(this.grupoId)
    .pipe(
      finalize(() => {
        // Esto siempre se ejecuta al terminar la petición
        this.router.navigate(['/crearGrupo']);
      })
    )
    .subscribe({
      next: () => console.log('Grupo eliminado correctamente'),
      error: err => {
        console.error('Error eliminando grupo:', err);
        // Opcional: si quieres solo navegar en caso de éxito,
        // quita el finalize() y hazlo en next().
      }
    });
}
}
