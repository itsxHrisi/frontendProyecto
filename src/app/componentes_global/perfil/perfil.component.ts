import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm }                       from '@angular/forms';
import { ServiceLogService }            from '../../componentes_log/service/service-log.service';
import { CommonModule }                 from '@angular/common';
import { FormsModule }                  from '@angular/forms';
import { RouterLink }                   from '@angular/router';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  @ViewChild('perfilForm') perfilForm!: NgForm;

  nickname   = '';
  email      = '';
  nombre     = '';
  telefono   = '';
  errorMsg   = '';
  successMsg = '';

  private oldNickname = '';

  constructor(private authService: ServiceLogService) {}

  ngOnInit(): void {
    this.authService.getPerfil().subscribe({
      next: user => {
        this.nickname    = user.nickname;
        this.email       = user.email;
        this.nombre      = user.nombre  || '';
        this.telefono    = user.telefono || '';
        this.oldNickname = user.nickname;
      },
      error: err => {
        console.error('No se pudo cargar perfil', err);
        this.errorMsg = 'Error cargando datos de perfil';
      }
    });
  }

  onSubmit(): void {
    if (this.perfilForm.invalid) {
      this.perfilForm.form.markAllAsTouched();
      return;
    }

    this.errorMsg   = '';
    this.successMsg = '';

    const payload = {
      nickname: this.nickname,
      email:    this.email,
      nombre:   this.nombre,
      telefono: this.telefono
    };

    this.authService.updateUsuario(this.oldNickname, payload).subscribe({
      next: () => {
        this.successMsg   = 'Datos actualizados correctamente.';
        this.oldNickname  = this.nickname;
      },
      error: err => {
        console.error('Error al actualizar perfil', err);
        this.errorMsg = err.error?.errores?.[0] || 'Error al actualizar perfil';
      }
    });
  }
}
