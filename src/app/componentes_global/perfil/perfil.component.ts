import { Component, OnInit } from '@angular/core';
import { ServiceLogService }    from '../../componentes_log/service/service-log.service';
import { RecipeUser }           from '../../interface/recipe-user';
import { CommonModule }         from '@angular/common';
import { FormsModule }          from '@angular/forms';
import { RouterLink }           from '@angular/router';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  // campos del formulario
  nickname = '';
  email    = '';
  nombre   = '';
  telefono = '';
  errorMsg = '';

  // guardamos el viejo nickname para la URL de actualización
  private oldNickname = '';

  constructor(private authService: ServiceLogService) {}

  ngOnInit(): void {
    // 1) Cargamos perfil
    this.authService.getPerfil().subscribe({
      next: (user: any) => {
        // suponemos que la respuesta incluye { nickname, email, nombre, telefono }
        this.nickname    = user.nickname;
        this.email       = user.email;
        this.nombre      = user.nombre  || '';
        this.telefono    = user.telefono || '';

        // guardamos el nickname viejo
        this.oldNickname = user.nickname;
      },
      error: err => {
        console.error('No se pudo cargar perfil', err);
        this.errorMsg = 'Error cargando datos de perfil';
      }
    });
  }

  onSubmit(): void {
    this.errorMsg = '';

    const payload = {
      nickname: this.nickname,
      email:    this.email,
      nombre:   this.nombre,
      telefono: this.telefono
    };

    this.authService
      .updateUsuario(this.oldNickname, payload)
      .subscribe({
        next: (jwtDto) => {
          alert('Perfil actualizado con éxito');
          // si el nickname cambió, actualizamos oldNickname
          this.oldNickname = this.nickname;
        },
        error: (err) => {
          console.error('Error al actualizar perfil', err);
          this.errorMsg = 'Error al actualizar perfil';
        }
      });
  }
}
