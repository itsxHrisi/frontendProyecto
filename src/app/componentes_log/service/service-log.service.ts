import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, tap, throwError, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment.development';
import { RecipeUser } from '../../interface/recipe-user';
export interface Authority { authority: string; }

export interface JwtDto {
  token: string;
  username: string;
  authorities: { authority: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class ServiceLogService {
  private authUrl = environment.authUrl;
  private apiUrl = environment.apiUrl;
  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  private isLoggedInSubject = new BehaviorSubject<boolean>(this.isLoggedIn());
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  private userRoleSubject = new BehaviorSubject<string[]>(this.getUserRoles());
  userRole$ = this.userRoleSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  /** LOGIN */
  userLogin(credentials: { nickname: string; password: string }): Observable<JwtDto> {
    return this.http
      .post<JwtDto>(`${this.authUrl}/login`, credentials, this.httpOptions)
      .pipe(
        tap(response => {
          if (response.token) {
            localStorage.setItem('auth_token', response.token);
            const roles = response.authorities.map(a => a.authority);
            localStorage.setItem('user_roles', JSON.stringify(roles));
            this.updateLoginStatus();
            this.updateUserRoles();
          }
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Error en userLogin:', error);
          return throwError(() => error);
        })
      );
  }

  /** LOGOUT */
  logout(): void {
    const token = localStorage.getItem('auth_token');
    const headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);

    this.http.post(
      `${this.authUrl}/logout`,
      {},
      { headers }
    ).subscribe({
      next: () => this.logoutLocally(),
      error: err => {
        console.error('Error al cerrar sesión:', err);
        this.logoutLocally();
      }
    });
  }
  getOldPasswordFromToken(): string {
    const token = localStorage.getItem('auth_token');
    if (!token) return '';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // Aquí asumimos que el claim se llama `password`
      return payload.password || '';
    } catch (e) {
      console.error('Error al parsear token para extraer contraseña:', e);
      return '';
    }
  }
  private logoutLocally() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_roles');
    this.updateLoginStatus();
    this.updateUserRoles();
    this.router.navigate(['/inicio']);
  }

  /** REGISTER */
  userRegistro(user: RecipeUser): Observable<RecipeUser> {
    return this.http.post<RecipeUser>(`${this.authUrl}/nuevo`, user, this.httpOptions)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error en userRegistro:', error);
          return throwError(() => error);
        })
      );
  }

  /** GET CURRENT USERNAME FROM TOKEN */
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

  /** FETCH USER DATA BY NICKNAME */
  getUsuarioByNickname(nickname: string): Observable<any> {
    return this.http.get<any>(
      `http://localhost:8091/api/usuarios/${nickname}`,
      this.httpOptions
    );
  }
 /** UPDATE USER DATA */
  updateUsuario(oldNickname: string, updatedData: any): Observable<JwtDto> {
    const token = localStorage.getItem('auth_token') || '';
    const headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);

    return this.http.put<JwtDto>(
      `${this.apiUrl}/usuarios/${oldNickname}/actualizar`,
      updatedData,
      { headers }
    ).pipe(
      tap((response: JwtDto) => {
        if (response.token) {
          localStorage.setItem('auth_token', response.token);
          // ahora a² tiene tipo Authority
          const roles = response.authorities.map((a: Authority) => a.authority);
          localStorage.setItem('user_roles', JSON.stringify(roles));
          this.updateLoginStatus();
          this.updateUserRoles();
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error en updateUsuario:', error);
        return throwError(() => error);
      }),
    );
  }

  /**  GET perfil del usuario autenticado */
  getPerfil(): Observable<any> {
    const token = localStorage.getItem('auth_token') || '';
    const headers = this.httpOptions.headers.set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(
      `${this.apiUrl}/usuarios/perfil`,
      { headers }
    );
  }
  /** TOKEN VALIDATION */
  isLoggedIn(): boolean {
    const token = localStorage.getItem('auth_token');
    return !!token && !this.isTokenExpired(token);
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiration = payload.exp * 1000;
      if (Date.now() > expiration) {
        this.logoutLocally();
        return true;
      }
      return false;
    } catch {
      this.logoutLocally();
      return true;
    }
  }

  /** ROLE MANAGEMENT */
  getUserRoles(): string[] {
    const roles = localStorage.getItem('user_roles');
    return roles ? JSON.parse(roles) : [];
  }

  public updateLoginStatus() {
    this.isLoggedInSubject.next(this.isLoggedIn());
  }

  public updateUserRoles() {
    this.userRoleSubject.next(this.getUserRoles());
  }
}
