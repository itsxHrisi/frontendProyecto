// src/app/componentes_grupo/invitaciones/invitaciones.component.ts
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild
} from '@angular/core';
import { fromEvent } from 'rxjs';
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ServiceLogService, PaginaInvitaciones } from '../../componentes_log/service/service-log.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-invitaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invitaciones.component.html',
  styleUrls: ['./invitaciones.component.css']
})
export class InvitacionesComponent implements OnInit, AfterViewInit {
  @ViewChild('searchInput') searchInput!: ElementRef;

  invitaciones: any[] = [];
  filteredInvitaciones: any[] = [];
  currentPage = 0;
  totalPages = 0;
  searchTerm = '';

  constructor(
  private invitService: ServiceLogService,
  private router: Router
) {}

  ngOnInit(): void {
    this.loadInvitaciones();
  }

  ngAfterViewInit(): void {
    fromEvent<any>(this.searchInput.nativeElement, 'keyup').pipe(
      map(e => e.target.value),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(text => {
      this.searchTerm = text.trim().toLowerCase();
      this.applyFilter();
    });
  }

  loadInvitaciones(page: number = 0): void {
    this.invitService.getInvitaciones(page).subscribe({
      next: (resp: PaginaInvitaciones) => {
        this.invitaciones = resp.content;
        this.filteredInvitaciones = [...this.invitaciones];
        this.currentPage = resp.number;
        this.totalPages = resp.totalPages;
        this.applyFilter();
      },
      error: err => console.error('Error cargando invitaciones', err)
    });
  }

  applyFilter(): void {
    if (!this.searchTerm) {
      this.filteredInvitaciones = [...this.invitaciones];
    } else {
      this.filteredInvitaciones = this.invitaciones.filter(inv =>
        inv.grupo.nombre.toLowerCase().includes(this.searchTerm) ||
        inv.grupo.administrador.nickname.toLowerCase().includes(this.searchTerm)
      );
    }
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages) return;
    this.loadInvitaciones(page);
  }

 cambiarEstado(id: number, estado: 'ACEPTADA' | 'RECHAZADA'): void {
  this.invitService.updateEstado(id, estado).subscribe({
    next: () => {
      if (estado === 'ACEPTADA') {
        this.router.navigate(['/grupo']);
      } else {
        this.loadInvitaciones(this.currentPage);
      }
    },
    error: err => {
      console.error('Error al actualizar estado', err);
      alert('No se pudo actualizar la invitación');
    }
  });
}
}