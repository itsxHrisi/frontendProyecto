import { Component, OnInit } from '@angular/core';
import { CommonModule }          from '@angular/common';
import { Router, RouterLink, RouterOutlet }  from '@angular/router';
import { ServiceLogService }   from '../../componentes_log/service/service-log.service';
import { finalize } from 'rxjs/operators';
// Asegúrate de que esta importación sea correcta para tu UserDto
import { UserDto } from '../../componentes_log/service/service-log.service'; // Se mantiene la importación, pero el tipado en next se ajusta

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
  private grupoId!: number;

  // Secciones del menú para controlar su visibilidad (¡tus originales!)
  showGastos   = true;   // abierta por defecto
  showIngresos = false;
  showUsuarios = false;

  constructor(
    private authService: ServiceLogService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // ¡TU CÓDIGO ORIGINAL QUE RECIBE BIEN LOS DATOS!
    this.authService.getPerfil().subscribe({
      next: user => { // No tipamos explícitamente aquí para no forzar la estructura UserDto si no es la que la API devuelve
        console.log('Datos de perfil recibidos (TU CÓDIGO):', user); // DEBUG: Ver el objeto completo
        // Se asume que user.grupoFamiliarNombre y user.grupoFamiliarId existen directamente en el objeto 'user'
        this.groupName = (user as any).grupoFamiliarNombre || ''; // Usamos 'as any' para permitir el acceso directo
        this.roles     = ((user as any).roles || []).map((r: any) => r.nombre);
        this.grupoId   = (user as any).grupoFamiliarId; // Usamos 'as any' para permitir el acceso directo
        
        console.log('Nombre del grupo asignado (TU CÓDIGO):', this.groupName); // DEBUG: Confirmar asignación
        console.log('ID del grupo asignado (TU CÓDIGO):', this.grupoId);     // DEBUG: Confirmar ID
        console.log('Roles del usuario (TU CÓDIGO):', this.roles);          // DEBUG: Confirmar roles

        // Redirige si es la ruta raíz
        if (this.router.url.endsWith('/grupo')) {
          this.router.navigate(['grupo','creargasto']);
        }
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

  // Toggles de visibilidad del menú (¡tus originales, sin cambios en la lógica interna!)
  toggleGastos()   { this.showGastos   = !this.showGastos; }
  toggleIngresos() { this.showIngresos = !this.showIngresos; }
  toggleUsuarios() { this.showUsuarios = !this.showUsuarios; }

  // Métodos de acción (¡tus originales, sin cambios en su lógica!)
  abandonarGrupo(): void {
    if (confirm('¿Estás seguro de que quieres abandonar este grupo?')) { // Agrego el confirm
      this.authService.abandonarGrupo()
        .pipe(
          finalize(() => {
            this.router.navigate(['/crearGrupo']);
          })
        )
        .subscribe({
          next: () => console.log('Has abandonado el grupo correctamente'),
          error: err => console.error('Error al abandonar grupo:', err)
        });
    }
  }

  eliminarGrupo(): void {
    if (confirm('¿Estás seguro de que quieres eliminar este grupo? Esta acción es irreversible.')) { // Agrego el confirm
      if (!this.grupoId) {
        console.warn('No se puede eliminar el grupo: grupoId no está definido.');
        alert('No se pudo eliminar el grupo porque no se encontró la información del grupo.');
        return;
      }

      this.authService.deleteGrupo(this.grupoId)
        .pipe(
          finalize(() => {
            this.router.navigate(['/crearGrupo']);
          })
        )
        .subscribe({
          next: () => console.log('Grupo eliminado correctamente'),
          error: err => {
            console.error('Error eliminando grupo:', err);
            alert('Hubo un error al intentar eliminar el grupo.');
          }
        });
    }
  }
}