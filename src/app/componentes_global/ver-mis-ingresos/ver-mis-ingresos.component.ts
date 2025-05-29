import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ServiceLogService, IngresoDto } from '../../componentes_log/service/service-log.service';

@Component({
  selector: 'app-lista-ingresos', 
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ver-mis-ingresos.component.html', 
  styleUrls: ['./ver-mis-ingresos.component.css']
})
export class VerMisIngresosComponent implements OnInit {
  ingresos: IngresoDto[] = [];

  totalMisIngresos: number = 0;

  constructor(
    private service: ServiceLogService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadIngresos(); // Llama a loadIngresos al inicio para cargar y calcular la suma
  }

  // Nuevo método para cargar o recargar los ingresos
  loadIngresos(): void {
    this.service.getIngresosUsuario().subscribe({
      next: data => {
        this.ingresos = data;
        this.calculateTotalIngresos(); 
      },
      error: err => {
        console.error('Error cargando lista de ingresos:', err);
        this.ingresos = []; // Limpiar ingresos en caso de error
        this.totalMisIngresos = 0; // Resetear la suma en caso de error
      }
    });
  }

  calculateTotalIngresos(): void {
    this.totalMisIngresos = this.ingresos.reduce((sum, ing) => sum + ing.cantidad, 0);
  }

  modificarIngreso(id: number) {
    this.router.navigate(['/grupo','modificaringresos'], { queryParams: { id } });
  }

  eliminarIngreso(id: number): void {
    if (!confirm('¿Estás seguro de que quieres eliminar este ingreso?')) {
      return;
    }

    this.service.deleteIngreso(id).subscribe({
      next: () => {
        console.log('Ingreso eliminado exitosamente en el backend.');
        // Recarga la lista de ingresos después de la eliminación exitosa
        this.loadIngresos(); // Esto también recalculará la suma
      },
      error: err => {
        console.error('Error al eliminar ingreso:', err);
        alert('Hubo un error al eliminar el ingreso. Consulta la consola para más detalles.');
      }
    });
  }
}