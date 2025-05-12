import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ServiceLogService } from '../service/service-log.service';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule,RouterLink],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent implements OnInit {
  formRegistro!: FormGroup;
  formSubmitted: boolean = false; // Para rastrear si el usuario presionó "Submit"
  messageError: string = '';

  constructor(private formBuilder: FormBuilder, private serviceLog: ServiceLogService, private router: Router) {}

  ngOnInit(): void {
    //Formulario reactivo se crea desde un principio con valores nulos
    //tambien se añaden una serie de validators para cada campo
    this.formRegistro = this.formBuilder.group({
      nickname: ['', Validators.required],
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.pattern('^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$')
        ]
      ],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]{9}$')]]
    });
  }

  newUser() {
    this.formSubmitted = true; //Indica que el usuario intentó enviar el formulario

    if (this.formRegistro.invalid) {
      this.formRegistro.markAllAsTouched(); //Muestra los errores en todos los campos
      return;
    }

    //Si el formulario es valido se envian los datos al servicio
    this.serviceLog.userRegistro(this.formRegistro.value).subscribe({
      next: () => {
        console.log('Usuario creado con éxito.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        if (err.error && err.error.message) {
          this.messageError = err.error.message;
        } else {
          this.messageError = 'Error desconocido. Inténtalo de nuevo.';
        }
      }
    });


  }
}
