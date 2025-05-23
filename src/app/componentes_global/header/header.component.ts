import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ServiceLogService } from '../../componentes_log/service/service-log.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  isMenuOpen = false;
  isLoggedIn = false;
  userRole: string[] = [];
  hayAdmin = false;

  // Nueva propiedad para el nombre de usuario
  userName: string = '';

  constructor(
    private authService: ServiceLogService,
    private router: Router
  ) {}

  ngOnInit() {
    // Estado de autenticación
    this.authService.isLoggedIn$.subscribe(status => {
      this.isLoggedIn = status;
      if (status) {
        // Cuando ya esté logeado, obtenemos el nickname
        this.userName = this.authService.getUsernameFromToken();
      } else {
        this.userName = '';
      }
    });

    // Roles de usuario
    this.authService.userRole$.subscribe(roles => {
      this.userRole = roles;
      this.hayAdmin = roles.includes('ROL_ADMIN');
    });
  }

  logout() {
    this.authService.logout();
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
}