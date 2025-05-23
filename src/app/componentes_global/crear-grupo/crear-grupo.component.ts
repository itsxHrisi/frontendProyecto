// src/app/componentes_grupo/estado-grupo/estado-grupo.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ServiceLogService } from '../../componentes_log/service/service-log.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-crear-grupo',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './crear-grupo.component.html',
  styleUrls: ['./crear-grupo.component.css']
})
export class CrearGrupoComponent implements OnInit {
 grupoFamiliarId: number | null = null;
  cargando = true;
  error: string | null = null;

  constructor(
    private authService: ServiceLogService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.getPerfil().pipe(
      catchError(err => {
        this.error = 'No se pudo cargar el perfil';
        this.cargando = false;
        return of(null);
      })
    ).subscribe(perfil => {
      this.cargando = false;
      this.grupoFamiliarId = perfil?.grupoFamiliarId ?? null;

      if (this.grupoFamiliarId !== null) {
        // redirige CORRECTAMENTE a /grupo
        this.router.navigate(['/grupo']);
      }
    });
  }

}
