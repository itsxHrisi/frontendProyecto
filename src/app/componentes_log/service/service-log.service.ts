import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, tap, throwError, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment.development';
import { RecipeUser } from '../../interface/recipe-user';

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
  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  private isLoggedInSubject = new BehaviorSubject<boolean>(this.isLoggedIn());
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  private userRoleSubject = new BehaviorSubject<string[]>(this.getUserRoles());
  userRole$ = this.userRoleSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

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

  private logoutLocally() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_roles');
    this.updateLoginStatus();
    this.updateUserRoles();
    this.router.navigate(['/inicio']);
  }

  logout(): void {
    this.http.post(`${this.authUrl}/logout`, {}, this.httpOptions).subscribe({
      next: () => this.logoutLocally(),
      error: err => console.error('Error al cerrar sesión:', err)
    });
  }
//Metodo para registrar
  userRegistro(user: RecipeUser): Observable<RecipeUser> {
    return this.http.post<RecipeUser>(`${this.authUrl}/nuevo`,user, this.httpOptions).pipe(

      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Ocurrió un error insesperado.';
        if(error.status === 400) {
          errorMessage = "Email / Nickname en uso. Prueba con otro.";
        }else if (error.status === 500){
          errorMessage = "Error en el servidor. Intentelo mas tarde";
        }

        return throwError(() => error);
      })
    );}
    
   
  getUserRoles(): string[] {
    const roles = localStorage.getItem('user_roles');
    return roles ? JSON.parse(roles) : [];
  }

  private updateLoginStatus() {
    this.isLoggedInSubject.next(this.isLoggedIn());
  }

  private updateUserRoles() {
    this.userRoleSubject.next(this.getUserRoles());
  }
}
