import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FormsModule }       from '@angular/forms';
import { Router, RouterLink }from '@angular/router';
import { catchError, of }    from 'rxjs';
import { ServiceLogService } from '../../componentes_log/service/service-log.service';

@Component({
  selector: 'app-crear-grupo',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './crear-grupo-familiar.component.html',
  styleUrls: ['./crear-grupo-familiar.component.css']
})
export class CrearGrupoFamiliarComponent implements OnInit {
  nombre: string = '';
  grupoFamiliarId: number | null = null;
  cargando = true;
  errorMsg = '';
  successMsg = '';

  constructor(
    private service: ServiceLogService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // 1) comprobar perfil al inicializar
    this.service.getPerfil().pipe(
      catchError(err => {
        console.error('Error al cargar perfil en CrearGrupo:', err);
        this.cargando = false;
        return of(null);
      })
    ).subscribe(perfil => {
      this.cargando = false;
      this.grupoFamiliarId = perfil?.grupoFamiliarId ?? null;
      // 2) si ya tiene grupo, vamos hacia /grupo
      if (this.grupoFamiliarId !== null) {
        this.router.navigate(['/grupo']);
      }
    });
  }

  onSubmit(): void {
    this.errorMsg   = '';
    this.successMsg = '';

    // validación rápida
    if (!this.nombre.trim() || this.nombre.trim().length < 3) {
      this.errorMsg = 'Ingresa un nombre válido de al menos 3 caracteres.';
      return;
    }

    this.cargando = true;
    this.service.createGrupo(this.nombre.trim()).subscribe({
      next: () => {
        this.cargando = false;
        // tras crear, también redirige
        this.router.navigate(['/grupo']);
      },
      error: err => {
        this.cargando = false;
        console.error('Error al crear grupo:', err);
        this.errorMsg = err.error?.message || 'Error al crear el grupo.';
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/crearGrupo']);
  }
}
