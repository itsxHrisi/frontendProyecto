// src/app/componentes_global/grupo/grupo.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule }        from '@angular/common';
import { Router, RouterLink, RouterOutlet }  from '@angular/router';
import { ServiceLogService }   from '../../componentes_log/service/service-log.service';

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
    console.log('Abandonar grupo');
  }
}
