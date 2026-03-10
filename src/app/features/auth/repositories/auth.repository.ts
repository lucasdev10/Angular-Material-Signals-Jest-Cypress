import { inject, Injectable } from '@angular/core';
import { HttpService } from '@app/core/http/http';
import { IUser } from '@app/features/user/models/user.model';
import { delay, firstValueFrom, Observable, of, throwError } from 'rxjs';
import { IAuthResponse, ILoginCredentials } from '../models/auth.model';

/**
 * Repository para autenticação
 * Simula chamadas de API - substituir por API real no futuro
 */
@Injectable({
  providedIn: 'root',
})
export class AuthRepository {
  private readonly http = inject(HttpService);

  /**
   * Realiza login
   */
  login(credentials: ILoginCredentials): Observable<IAuthResponse> {
    // Simula delay de rede
    return new Observable<IAuthResponse>((observer) => {
      setTimeout(async () => {
        try {
          const users = await firstValueFrom(this.http.get<IUser[]>('users'));
          const user = users.find(
            (u) => u.email === credentials.email && u.password === credentials.password,
          );

          if (!user) {
            observer.error({ message: 'Invalid email or password' });
            return;
          }

          const userWithoutPassword = {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          };

          const response: IAuthResponse = {
            user: userWithoutPassword,
            token: `mock-jwt-token-${user.id}`,
            refreshToken: `mock-refresh-token-${user.id}`,
          };

          observer.next(response);
          observer.complete();
        } catch (error) {
          observer.error(error);
        }
      }, 1000);
    });
  }

  /**
   * Realiza logout
   */
  logout(): Observable<void> {
    return of(void 0).pipe(delay(300));
  }

  /**
   * Valida token
   */
  validateToken(token: string): Observable<IUser> {
    // Simula validação de token
    return new Observable<IUser>((observer) => {
      setTimeout(async () => {
        try {
          if (!token || !token.startsWith('mock-jwt-token-')) {
            observer.error({ message: 'Token inválido' });
            return;
          }

          const userId = token.replace('mock-jwt-token-', '');
          const users = await firstValueFrom(this.http.get<IUser[]>('users'));
          const user = users.find((u) => u.id === userId);

          if (!user) {
            observer.error({ message: 'User not found' });
            return;
          }

          const userWithoutPassword = {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          };

          observer.next(userWithoutPassword);
          observer.complete();
        } catch (error) {
          observer.error(error);
        }
      }, 500);
    });
  }

  /**
   * Refresh token
   */
  refreshToken(): Observable<IAuthResponse> {
    return throwError(() => ({ message: 'Not implemented' }));
  }
}
