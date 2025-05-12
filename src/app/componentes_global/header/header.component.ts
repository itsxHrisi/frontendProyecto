import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ServiceLogService } from '../../componentes_log/service/service-log.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {

  isMenuOpen = false;
  isLoggedIn: boolean = false;
  userRole: string [] = [];
  hayAdmin:boolean =false;

  constructor(private authService: ServiceLogService, private router:Router) { }

  ngOnInit() {
    //Suscripcion al estado actual de la autenticacion
    this.authService.isLoggedIn$.subscribe(status => {
      this.isLoggedIn = status;
    });

    //Suscripcion actual al estado de el rol del usuario
    this.authService.userRole$.subscribe(role => {
      this.userRole = role;
      this.funcHayAdmin();
    })
  }

  //Cuando pulsas el boton de logaut actua esta funcion 
  // que llama al metodo de logout del service
  logout(){
    this.authService.logout();
  }

  //Menu desplegable para responsive nav
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  //Comprueva si el usuario logeado tiene el rol de administrador 
  // para asi mostrar el inicio normal o el del admin
  funcHayAdmin(){
    if(this.userRole.includes("ROL_ADMIN")){
      this.hayAdmin = true;
      console.log(this.hayAdmin);
      
    }
  }
}
