import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necesario para pipes como currency
import { FormsModule } from '@angular/forms'; // Necesario para ngModel
import { ServiceLogService, IngresoDto, PaginaIngresos, GastoDto, PaginaGastos, UserDto, GrupoDto } from '../../componentes_log/service/service-log.service';// Asegúrate de importar GastoDto y PaginaGastos
import { Subject, takeUntil, map, forkJoin } from 'rxjs'; // Importar forkJoin
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-estadisticas',
  templateUrl: './estadisticas.component.html',
  styleUrls: ['./estadisticas.component.css'],
  standalone: true, // Componente autónomo
  imports: [
    CommonModule, // Proporciona pipes como currency
    FormsModule // Proporciona ngModel para el filtro de usuario
  ]
})
export class EstadisticasComponent implements OnInit, OnDestroy {
  totalIngresos: number = 0; // Propiedad para almacenar la suma total de ingresos
  totalGastos: number = 0; // Propiedad para almacenar la suma total de gastos
  balance: number = 0; // Propiedad para almacenar el balance (ingresos - gastos)

  private allIngresos: IngresoDto[] = []; // Para almacenar todos los ingresos obtenidos
  ingresos: IngresoDto[] = []; // Ingresos que se están mostrando (filtrados por usuario)

  private allGastos: GastoDto[] = []; // Para almacenar todos los gastos obtenidos
  gastos: GastoDto[] = []; // Gastos que se están mostrando (filtrados por usuario)

  grupoFamiliarId: number | null = null;
  usuarios: UserDto[] = [];
  selectedUserNickname: string = 'Todos'; // Para el filtro por usuario

  private destroy$ = new Subject<void>();

  constructor(private service: ServiceLogService) {}

  ngOnInit(): void {
    console.log('EstadisticasComponent: ngOnInit - Iniciando carga de datos.');
    this.getCurrentUserGroup();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    console.log('EstadisticasComponent: ngOnDestroy - Componente destruido.');
  }

  getCurrentUserGroup(): void {
    console.log('EstadisticasComponent: getCurrentUserGroup - Obteniendo perfil del usuario...');
    this.service.getPerfil().pipe(
      takeUntil(this.destroy$),
      map(user => {
        console.log('EstadisticasComponent: Perfil de usuario recibido:', user);
        const id = (user as any).grupoFamiliarId || user.grupoFamiliar?.id || null;
        return id;
      })
    ).subscribe({
      next: (grupoId) => {
        if (grupoId) {
          this.grupoFamiliarId = grupoId;
          console.log('EstadisticasComponent: Grupo familiar ID:', this.grupoFamiliarId);
          this.loadGroupMembers(grupoId);
          this.loadAllData(); // Cargar todos los datos (ingresos y gastos)
        } else {
          console.warn('EstadisticasComponent: El usuario no pertenece a ningún grupo familiar. No se cargarán los datos.');
        }
      },
      error: (error) => {
        console.error('EstadisticasComponent: Error al obtener el perfil del usuario:', error);
      }
    });
  }

  loadGroupMembers(grupoId: number): void {
    console.log('EstadisticasComponent: loadGroupMembers - Cargando miembros del grupo ID:', grupoId);
    this.service.getUsuariosPorGrupo(grupoId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (users) => {
        this.usuarios = users;
        console.log('EstadisticasComponent: Miembros del grupo cargados:', this.usuarios);
      },
      error: (error) => {
        console.error('EstadisticasComponent: Error al cargar miembros del grupo:', error);
      }
    });
  }

  /**
   * Carga todos los ingresos y gastos del usuario (o del grupo).
   * Utiliza un tamaño de página grande para obtener todos los datos en una sola llamada.
   */
  loadAllData(): void {
    console.log('EstadisticasComponent: loadAllData - Cargando ingresos y gastos...');
    const pageSize = 500000000; // Tamaño de página muy grande para obtener todos los datos

    // Usamos forkJoin para hacer ambas llamadas a la API de forma concurrente
    forkJoin([
      this.service.getIngresosFilter([], 0, pageSize), // Filtros de cantidad vacíos por ahora
      this.service.getGastosFilter('', [], 0, pageSize) // Nickname vacío para obtener todos los gastos inicialmente
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: ([ingresosPage, gastosPage]) => {
        console.log('EstadisticasComponent: Datos de ingresos recibidos:', ingresosPage);
        console.log('EstadisticasComponent: Datos de gastos recibidos:', gastosPage);

        this.allIngresos = ingresosPage.content;
        this.allGastos = gastosPage.content;

        this.applyUserFilterAndCalculateTotals(); // Aplicar filtro y calcular totales
      },
      error: (err: HttpErrorResponse) => {
        console.error('EstadisticasComponent: Error al cargar ingresos o gastos:', err);
        this.allIngresos = [];
        this.ingresos = [];
        this.allGastos = [];
        this.gastos = [];
        this.totalIngresos = 0;
        this.totalGastos = 0;
        this.balance = 0;
      }
    });
  }

  onUserFilterChange(): void {
    console.log('EstadisticasComponent: Filtro de usuario cambiado a:', this.selectedUserNickname);
    this.applyUserFilterAndCalculateTotals();
  }

  /**
   * Aplica el filtro de usuario a los ingresos y gastos, y luego recalcula los totales.
   */
  applyUserFilterAndCalculateTotals(): void {
    if (this.selectedUserNickname === 'Todos') {
      this.ingresos = [...this.allIngresos];
      this.gastos = [...this.allGastos];
    } else {
      this.ingresos = this.allIngresos.filter(ingreso =>
        ingreso.usuarioNickname.toLowerCase() === this.selectedUserNickname.toLowerCase()
      );
      this.gastos = this.allGastos.filter(gasto =>
        gasto.usuarioNickname.toLowerCase() === this.selectedUserNickname.toLowerCase()
      );
    }
    this.calculateTotals();
  }

  /**
   * Calcula la suma total de los ingresos y gastos actualmente filtrados, y el balance.
   */
  calculateTotals(): void {
    this.totalIngresos = this.ingresos.reduce((sum, ingreso) => sum + ingreso.cantidad, 0);
    this.totalGastos = this.gastos.reduce((sum, gasto) => sum + gasto.cantidad, 0);
    this.balance = this.totalIngresos - this.totalGastos;

    console.log('EstadisticasComponent: Total de ingresos calculado:', this.totalIngresos);
    console.log('EstadisticasComponent: Total de gastos calculado:', this.totalGastos);
    console.log('EstadisticasComponent: Balance calculado:', this.balance);
  }
}