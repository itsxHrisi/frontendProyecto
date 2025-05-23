// src/app/componentes_log/service/service-log.service.ts
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, tap, throwError, Observable, map } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment.development';

export interface Authority { authority: string; }
export interface JwtDto {
  token: string;
  username: string;
  authorities: Authority[];
}

export interface InvitacionDto {
  id: string;
  remitente: string;
  grupoFamiliarId: number;
  fechaEnvio: string;
  estado: 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA';
  // añade aquí más campos si tu API devuelve otros
}
export interface GrupoDto {
  id: number;
  nombre: string;
  administrador: {
    id: number;
    nombre: string;
    nickname: string;
    email: string;
    roles: { id: number; nombre: string }[];
    telefono: string;
  };
  usuarios: Array<{
    id: number;
    nombre: string;
    nickname: string;
    email: string;
    roles: { id: number; nombre: string }[];
    telefono: string;
  }>;
}
export interface PaginaInvitaciones {
  content: InvitacionDto[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;    // página actual
  // puedes añadir más (sort, pageable…) si los necesitas
}
export interface RolDto {
  id: number;
  nombre: string;
}
export interface PaginaUsuarios {
  content: UserDto[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;  // página actual
}
export interface UserDto {
  id: number;
  nickname: string;
  nombre: string;
  email: string;
  telefono: string;
  roles: RolDto[];
}
@Injectable({
  providedIn: 'root'
})
export class ServiceLogService {
  private authUrl = environment.authUrl;
  private apiUrl  = environment.apiUrl;
  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.isLoggedIn());
  isLoggedIn$ = this.isLoggedInSubject.asObservable();
  private userRoleSubject = new BehaviorSubject<string[]>(this.getUserRoles());
  userRole$ = this.userRoleSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}
// src/app/componentes_log/service/service-log.service.ts

/** Devuelve sólo el array de usuarios de un grupo dado */
getUsuariosPorGrupo(
  grupoId: number,
  page: number = 0,
  size: number = 100,
  sort: string[] = ['id,asc']
): Observable<UserDto[]> {
  // reusa el método genérico de filter
  return this.getUsuariosFilter(
    `grupoFamiliar.id:EQUAL:${grupoId}`,
    page,
    size,
    sort
  ).pipe(
    map(pageDto => pageDto.content)  // extrae solo el array
  );
}

  /** LOGIN */
  userLogin(credentials: { nickname: string; password: string }): Observable<JwtDto> {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_roles');
    return this.http
      .post<JwtDto>(`${this.authUrl}/login`, credentials, this.httpOptions)
      .pipe(
        tap(res => {
          if (res.token) {
            localStorage.setItem('auth_token', res.token);
            const roles = res.authorities.map(a => a.authority);
            localStorage.setItem('user_roles', JSON.stringify(roles));
            this.updateLoginStatus();
            this.updateUserRoles();
          }
        }),
        catchError((err: HttpErrorResponse) => throwError(() => err))
      );
  }

  /** Paginado y filtrado genérico de usuarios */
  getUsuariosFilter(
    filter: string,
    page: number = 0,
    size: number = 10,
    sort: string[] = ['id,asc']
  ): Observable<PaginaUsuarios> {
    const token   = localStorage.getItem('auth_token') || '';
    const headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    let params    = new HttpParams()
      .set('filter', filter)
      .set('page', page.toString())
      .set('size', size.toString());

    sort.forEach(s => params = params.append('sort', s));

    return this.http
      .get<PaginaUsuarios>(`${this.apiUrl}/usuarios/filter`, { headers, params })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          console.error('Error al cargar usuarios filtrados:', err);
          return throwError(() => err);
        })
      );
  }
  /** LOGOUT */
  logout(): void {
    const token = localStorage.getItem('auth_token') || '';
    const headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    this.http.post(`${this.authUrl}/logout`, {}, { headers }).subscribe({
      next: () => this.logoutLocally(),
      error: () => this.logoutLocally()
    });
  }

  private logoutLocally() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_roles');
    this.updateLoginStatus();
    this.updateUserRoles();
    this.router.navigate(['/inicio']);
  }

  /** REGISTER */
  userRegistro(user: any): Observable<any> {
    return this.http
      .post<any>(`${this.authUrl}/nuevo`, user, this.httpOptions)
      .pipe(catchError((err: HttpErrorResponse) => throwError(() => err)));
  }

  /** Obtener nombre de usuario del token */
  getUsernameFromToken(): string {
    const token = localStorage.getItem('auth_token');
    if (!token) return '';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || '';
    } catch {
      return '';
    }
  }

  /** Perfil */
  getPerfil(): Observable<any> {
    const token = localStorage.getItem('auth_token') || '';
    const headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${this.apiUrl}/usuarios/perfil`, { headers })
      .pipe(catchError((err: HttpErrorResponse) => throwError(() => err)));
  }

  /** Crear gasto */
  createGasto(gasto: {
    usuario:   { id: number };
    grupo:     { id: number };
    tipoGasto: string;
    subtipo:   string;
    cantidad:  string;
    fecha:     string;
  }): Observable<any> {
    const token   = localStorage.getItem('auth_token') || '';
    const headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http
      .post<any>(`${this.apiUrl}/gastos`, gasto, { headers })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          console.error('Error creando gasto:', err);
          return throwError(() => err);
        })
      );
  }
  /** Update usuario */
  updateUsuario(oldNickname: string, data: any): Observable<JwtDto> {
    const token = localStorage.getItem('auth_token') || '';
    const headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.put<JwtDto>(
      `${this.apiUrl}/usuarios/${oldNickname}/actualizar`,
      data,
      { headers }
    ).pipe(
      tap(res => {
        if (res.token) {
          localStorage.setItem('auth_token', res.token);
          const roles = res.authorities.map(a => a.authority);
          localStorage.setItem('user_roles', JSON.stringify(roles));
          this.updateLoginStatus();
          this.updateUserRoles();
        }
      }),
      catchError((err: HttpErrorResponse) => throwError(() => err))
    );
  }

  /** Change password */
  changePassword(newPassword: string): Observable<JwtDto> {
    const nickname = this.getUsernameFromToken();
    const token = localStorage.getItem('auth_token') || '';
    const headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.put<JwtDto>(
      `${this.apiUrl}/usuarios/${nickname}/cambiar-password`,
      { newPassword, confirmPassword: newPassword },
      { headers }
    ).pipe(
      tap(res => {
        if (res.token) {
          localStorage.setItem('auth_token', res.token);
          const roles = res.authorities.map(a => a.authority);
          localStorage.setItem('user_roles', JSON.stringify(roles));
          this.updateLoginStatus();
          this.updateUserRoles();
        }
      }),
      catchError((err: HttpErrorResponse) => throwError(() => err))
    );
  }

  /** Crear grupo familiar */
  createGrupo(nombre: string): Observable<any> {
    const token = localStorage.getItem('auth_token') || '';
    const headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(
      `${this.apiUrl}/grupos`,
      { nombre },
      { headers }
    ).pipe(catchError((err: HttpErrorResponse) => throwError(() => err)));
  }

  /** Listar invitaciones paginadas */
  getInvitaciones(page: number = 0, size: number = 10): Observable<PaginaInvitaciones> {
    const token = localStorage.getItem('auth_token') || '';
    const headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PaginaInvitaciones>(
      `${this.apiUrl}/invitaciones`,
      { headers, params }
    ).pipe(catchError((err: HttpErrorResponse) => throwError(() => err)));
  }

 /** Aceptar o rechazar invitación */
  updateEstado(id: number, nuevoEstado: 'ACEPTADA' | 'RECHAZADA'): Observable<string> {
    const token = localStorage.getItem('auth_token') || '';
    const headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    const params = new HttpParams().set('nuevoEstado', nuevoEstado);

    return this.http.put(
      `${this.apiUrl}/invitaciones/${id}/estado`,
      {}, // body vacío
      {
        headers,
        params,
        responseType: 'text'  // <-- aquí le decimos que espere texto
      }
    ).pipe(
      catchError(err => {
        console.error('Error en updateEstado:', err);
        return throwError(() => err);
      })
    );
  }

  /** Validación de token local */
  isLoggedIn(): boolean {
    const token = localStorage.getItem('auth_token');
    console.log("Se ha iniciado sesion");
    return !!token && !this.isTokenExpired(token);
  
  }
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() > payload.exp * 1000;
    } catch {
      return true;
    }
  }
 // src/app/componentes_log/service/service-log.service.ts

/** Eliminar grupo por ID */
deleteGrupo(grupoId: number): Observable<string> {
  const token   = localStorage.getItem('auth_token') || '';
  const headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
  return this.http.delete(
    `${this.apiUrl}/grupos/${grupoId}`,
    { headers, responseType: 'text' }   // <- respuesta como texto
  ).pipe(
    catchError((err: HttpErrorResponse) => {
      console.error('Error al eliminar grupo:', err);
      return throwError(() => err);
    })
  );
}
 /** Abandonar el grupo familiar actual */
  abandonarGrupo(): Observable<any> {
    const token   = localStorage.getItem('auth_token') || '';
    const headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http
      .delete(`${this.apiUrl}/grupos/abandonar`, { headers, responseType: 'text' })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          console.error('Error abandonando grupo:', err);
          return throwError(() => err);
        })
      );
  }
 
  /** Obtener grupo por ID */
  getGrupo(grupoId: number): Observable<GrupoDto> {
    const token   = localStorage.getItem('auth_token') || '';
    const headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http
      .get<GrupoDto>(`${this.apiUrl}/grupos/${grupoId}`, { headers })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          console.error('Error cargando grupo:', err);
          return throwError(() => err);
        })
      );
  }

  /** Asignar rol PADRE a un usuario dentro del grupo */
  asignarRolPadre(nicknameDestino: string): Observable<any> {
    const token   = localStorage.getItem('auth_token') || '';
    const headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    const params  = new HttpParams()
      .set('nicknameDestino', nicknameDestino)
      .set('rol', 'PADRE');
    return this.http
      .put(`${this.apiUrl}/grupos/asignar-rol`, null, { headers, params, responseType: 'text' })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          console.error('Error asignando rol padre:', err);
          return throwError(() => err);
        })
      );
  }

  /** Quitar todas las asignaciones de rol padre para un usuario */
  quitarRolPadre(nicknameDestino: string): Observable<any> {
    const token   = localStorage.getItem('auth_token') || '';
    const headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    const params  = new HttpParams().set('nicknameDestino', nicknameDestino);
    return this.http
      .put(`${this.apiUrl}/grupos/limpiar-roles`, null, { headers, params, responseType: 'text' })
      .pipe(
        catchError((err: HttpErrorResponse) => {
          console.error('Error quitando rol padre:', err);
          return throwError(() => err);
        })
      );
  }

  /** Expulsar a un usuario del grupo */
  expulsarUsuario(grupoId: number, nicknameDestino: string): Observable<any> {
    const token   = localStorage.getItem('auth_token') || '';
    const headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http
      .put(
        `${this.apiUrl}/grupos/${grupoId}/eliminar-usuario/${nicknameDestino}`,
        null,
        { headers, responseType: 'text' }
      )
      .pipe(
        catchError((err: HttpErrorResponse) => {
          console.error('Error expulsando usuario:', err);
          return throwError(() => err);
        })
      );
  }

  /** Roles as */
  getUserRoles(): string[] {
    const roles = localStorage.getItem('user_roles');
    return roles ? JSON.parse(roles) : [];
  }
  updateLoginStatus() {
    this.isLoggedInSubject.next(this.isLoggedIn());
  }
  updateUserRoles() {
    this.userRoleSubject.next(this.getUserRoles());
  }
}