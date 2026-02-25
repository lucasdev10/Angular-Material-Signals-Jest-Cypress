import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '@app/core/storage/storage';
import { LoginCredentials, User, UserRole } from '../models/auth.model';
import { AuthRepository } from '../repositories/auth.repository';

/**
 * Store de autenticação usando Signals
 * Gerencia estado de autenticação da aplicação
 */
@Injectable({
  providedIn: 'root',
})
export class AuthStore {
  private readonly repository = inject(AuthRepository);
  private readonly storage = inject(StorageService);
  private readonly router = inject(Router);

  // State
  private readonly userState = signal<User | null>(null);
  private readonly tokenState = signal<string | null>(null);
  private readonly loadingState = signal<boolean>(false);
  private readonly errorState = signal<string | null>(null);

  // Computed signals
  readonly user = computed(() => this.userState());
  readonly token = computed(() => this.tokenState());
  readonly isLoading = computed(() => this.loadingState());
  readonly error = computed(() => this.errorState());
  readonly isAuthenticated = computed(() => !!this.userState() && !!this.tokenState());
  readonly isAdmin = computed(() => this.userState()?.role === UserRole.ADMIN);

  constructor() {
    this.initializeAuth();
  }

  /**
   * Inicializa autenticação do localStorage
   */
  private initializeAuth(): void {
    const token = this.storage.get('auth_token') as string | null;
    const user = this.storage.get('auth_user') as User | null;

    if (token && user) {
      this.tokenState.set(token);
      this.userState.set(user);
    }
  }

  /**
   * Realiza login
   */
  login(credentials: LoginCredentials): void {
    this.loadingState.set(true);
    this.errorState.set(null);

    this.repository.login(credentials).subscribe({
      next: (response) => {
        this.userState.set(response.user);
        this.tokenState.set(response.token);

        // Persiste no localStorage
        this.storage.set('auth_token', response.token);
        this.storage.set('auth_user', response.user);

        this.loadingState.set(false);

        // Redireciona baseado no role
        if (response.user.role === UserRole.ADMIN) {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/products']);
        }
      },
      error: (error) => {
        this.errorState.set(error.message || 'Erro ao fazer login');
        this.loadingState.set(false);
      },
    });
  }

  /**
   * Realiza logout
   */
  logout(): void {
    this.loadingState.set(true);

    this.repository.logout().subscribe({
      next: () => {
        this.clearAuth();
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        // Mesmo com erro, limpa autenticação
        this.clearAuth();
        this.router.navigate(['/auth/login']);
      },
    });
  }

  /**
   * Limpa estado de autenticação
   */
  private clearAuth(): void {
    this.userState.set(null);
    this.tokenState.set(null);
    this.loadingState.set(false);
    this.errorState.set(null);

    this.storage.remove('auth_token');
    this.storage.remove('auth_user');
  }

  /**
   * Limpa erro
   */
  clearError(): void {
    this.errorState.set(null);
  }
}
