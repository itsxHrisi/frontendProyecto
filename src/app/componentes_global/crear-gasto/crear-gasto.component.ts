// src/app/componentes_gastos/crear-gasto/crear-gasto.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { ServiceLogService } from '../../componentes_log/service/service-log.service';

@Component({
  selector: 'app-crear-gasto',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './crear-gasto.component.html',
  styleUrls: ['./crear-gasto.component.css']
})
export class CrearGastoComponent implements OnInit {
  // enums
  tipoGastos = ['SUPERVIVENCIA','LUJO','EDUCACION','AHORRO','INVERSION'] as const;
  subtipoMap: Record<string,string[]> = {
    SUPERVIVENCIA: ['AGUA','BASURAS','COMIDA','COMUNIDAD','FARMACIA','GAS','GASOIL','GIMNASIO','HIJOS','HIPOTECA','IBI','LUZ','MANT_COCHE','MUTUA','ROPA_IMPRESCINDIBLE','SALUD','SEGURO_HOGAR','SEGURO_VIDA','COCHERA','CASA_APARATOS','DOCUMENTOS'],
    LUJO:          ['ESPECTACULOS','ESTETICA','MAQUILLAJE','PARKING','REGALOS','RESTAURANTES','ROPA_COMPLEMENTOS','SUBSCRIPCIONES_OCIO','VIAJES','SALIDAS_OCIO','TELEFONO_INTERNET','LOTERIA','FALLA','LUJO_NIÑOS'],
    EDUCACION:     ['CURSOS','LIBROS','MASTERS','SUBSCRIPCIONES_EDU','PROGRAMAS'],
    AHORRO:        ['BANKINTER','TRADE_REPUBLIC','CAIXABANK','SABADELL','MY_INVESTOR'],
    INVERSION:     ['HAUSERA','IB','MYINVESTOR','BINANCE']
  };

  // datos de perfil
  usuarioId!: number;
  grupoId!: number;

  // modelo de formulario
  formModel = {
    tipoGasto: '',
    subtipo:   '',
    cantidad:  '',
    fecha:     ''
  };

  // **Nuevo** mensaje de éxito
  successMessage = '';

  constructor(
    private service: ServiceLogService,
    private auth:    ServiceLogService
  ) {}

  ngOnInit(): void {
    this.auth.getPerfil().subscribe({
      next: perfil => {
        this.usuarioId = perfil.id;
        this.grupoId   = perfil.grupoFamiliarId;
        this.formModel.fecha = new Date().toISOString().slice(0,10);
      },
      error: err => console.error('Error cargando perfil', err)
    });
  }

  get subtipoOptions(): string[] {
    return this.subtipoMap[this.formModel.tipoGasto] || [];
  }

  onSubmit(f: NgForm) {
    if (f.invalid) return;

    const payload = {
      usuario:   { id: this.usuarioId },
      grupo:     { id: this.grupoId },
      tipoGasto: this.formModel.tipoGasto,
      subtipo:   this.formModel.subtipo,
      cantidad:  this.formModel.cantidad.replace('.', ','), 
      fecha:     this.formModel.fecha
    };

    this.service.createGasto(payload).subscribe({
      next: res => {
        // **Aquí asignamos el mensaje**
        this.successMessage = 'El gasto se ha creado correctamente.';
        // opcional: limpiamos el formulario y su estado
        f.resetForm({
          tipoGasto: '',
          subtipo:   '',
          cantidad:  '',
          fecha:     new Date().toISOString().slice(0,10)
        });
      },
      error: err => {
        console.error('Falló la creación de gasto:', err);
      }
    });
  }
}