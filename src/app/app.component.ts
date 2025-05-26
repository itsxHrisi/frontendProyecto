import { Component, OnInit, OnDestroy, HostBinding } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common'; // For ngIf, ngFor, etc.
import { filter, map } from 'rxjs/operators';
import { Subject, takeUntil } from 'rxjs';

// Asegúrate de que estas rutas de importación sean correctas para tus componentes
import { HeaderComponent } from "./componentes_global/header/header.component";
import { Footer2Component } from "./componentes_global/footer2/footer2.component"; // Ajusta la ruta si es necesario

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,

    HeaderComponent,
    Footer2Component
],
  template: `
    <app-header></app-header>
    <div class="app-container">
        <div class="contenedor">
          <router-outlet></router-outlet>
        </div>
    </div>
    <app-footer2></app-footer2>
  `,
  styleUrls: ['./app.component.css'] // O referencia styles.css si es global
})
export class AppComponent implements OnInit, OnDestroy {
  @HostBinding('class') routeClass: string = ''; // Binds a class to the <app-root> element

  private destroy$ = new Subject<void>();

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    // Escucha los eventos del router para detectar el final de la navegación
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd), // Filtra solo los eventos NavigationEnd
      map(() => this.activatedRoute), // Obtiene la ruta activa
      map(route => {
        // Recorre la jerarquía de rutas para encontrar la ruta de nivel superior
        while (route.firstChild) {
          route = route.firstChild;
        }
        return route;
      }),
      filter(route => route.outlet === 'primary'), // Asegura que sea el outlet primario
      map(route => {
        // Obtiene el primer segmento de la URL como nombre de la ruta
        const urlSegments = route.snapshot.url;
        return urlSegments.length > 0 ? urlSegments[0].path : '';
      }),
      takeUntil(this.destroy$) // Se desuscribe al destruir el componente
    ).subscribe(urlSegment => {
      // Limpia clases anteriores y añade la nueva clase basada en la ruta
      this.routeClass = ''; // Limpia la clase existente
      if (urlSegment) {
        this.routeClass = `${urlSegment}-route`; // Ejemplo: "login-route", "grupo-route"
      } else {
        this.routeClass = 'default-route'; // Para la ruta raíz o vacía
      }
      console.log('Clase de ruta actual aplicada a app-root:', this.routeClass);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}