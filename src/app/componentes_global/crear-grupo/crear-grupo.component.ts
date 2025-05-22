import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ServiceLogService, JwtDto } from '../../componentes_log/service/service-log.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-crear-grupo',
  standalone: true,
  imports: [CommonModule,RouterLink],
  templateUrl: './crear-grupo.component.html',
  styleUrls: ['./crear-grupo.component.css']
})
export class CrearGrupoComponent implements OnInit {
  grupoFamiliarId: number | null = null;
  cargando = true;
  error: string | null = null;

  constructor(private authService: ServiceLogService) {}

  ngOnInit(): void {
    this.authService.getPerfil()
      .pipe(
        catchError(err => {
          console.error(err);
          this.error = 'No se pudo cargar el perfil';
          this.cargando = false;
          return of(null);
        })
      )
      .subscribe(perfil => {
        if (perfil) {
          // perfil.grupoFamiliarId viene de tu DTO UsuarioInfo
          this.grupoFamiliarId = perfil.grupoFamiliarId;
        }
        this.cargando = false;
      });
  }

  crearGrupo(): void {
    // TODO: lógica para crear grupo (navegar a formulario, abrir modal, etc.)
    console.log('Crear grupo familiar');
  }

  verInvitaciones(): void {
    // TODO: lógica para ver invitaciones (navegar a lista, etc.)
    console.log('Ver invitaciones');
  }
}
