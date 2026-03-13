import { computed, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { StorageService } from '@app/core/storage/storage';
import { EUserRole, IUser } from '@app/features/user/models/user.model';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { IAuthStoreState, ILoginCredentials } from '../models/auth.model';
import { AuthRepository } from '../repositories/auth.repository';

/**
 * Estado inicial da store de usuários
 */
const initialState: IAuthStoreState = {
  user: null,
  token: null,
  loading: 'idle',
  error: null,
};

/**
 * Store de Autenticação usando SignalStore
 * Gerencia estado global de autenticação de forma reativa
 */
export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    isAuthenticated: computed(() => !!store.user() && !!store.token()),
    isAdmin: computed(() => store.user()?.role === EUserRole.ADMIN),
    isLoading: computed(() => store.loading() === 'loading'),
  })),
  withMethods(
    (
      store,
      storage = inject(StorageService),
      repository = inject(AuthRepository),
      router = inject(Router),
      destroyRef = inject(DestroyRef),
    ) => ({
      _initializeAuth(): void {
        const token = storage.get('auth_token') as string | null;
        const user = storage.get('auth_user') as IUser | null;

        if (token && user) {
          patchState(store, { token, user });
        }
      },
      login(credentials: ILoginCredentials): void {
        patchState(store, { loading: 'loading', error: null });

        repository
          .login(credentials)
          .pipe(takeUntilDestroyed(destroyRef))
          .subscribe({
            next: ({ user, token }) => {
              patchState(store, { user, token, loading: 'success' });

              storage.set('auth_token', token);
              storage.set('auth_user', user);

              if (user.role === EUserRole.ADMIN) {
                router.navigate(['/admin']);
              } else {
                router.navigate(['/products']);
              }
            },
            error: (error) => {
              patchState(store, {
                error: error.message || 'Error when logging in',
                loading: 'error',
              });
            },
          });
      },
      logout(): void {
        patchState(store, { loading: 'loading' });

        repository
          .logout()
          .pipe(takeUntilDestroyed(destroyRef))
          .subscribe({
            next: () => {
              this._clearAuth();
              router.navigate(['/auth/login']);
            },
            error: () => {
              this._clearAuth();
              router.navigate(['/auth/login']);
            },
          });
      },
      _clearAuth(): void {
        patchState(store, { user: null, token: null, loading: 'idle', error: null });
        storage.remove('auth_token');
        storage.remove('auth_user');
      },
      clearError(): void {
        patchState(store, { error: null });
      },
    }),
  ),
  withHooks((store) => ({
    onInit: () => {
      store._initializeAuth();
    },
  })),
);
