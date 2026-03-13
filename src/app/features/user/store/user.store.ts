import { computed, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import {
  ICreateUserDto,
  IUpdateUserDto,
  IUserFilters,
  IUserStoreState,
} from '../models/user.model';
import { UserRepository } from '../repositories/user.repository';

/**
 * Estado inicial da store de usuários
 */
const initialState: IUserStoreState = {
  users: [],
  selectedUser: null,
  filters: {},
  loading: 'idle',
  error: null,
};

/**
 * Store de usuários usando SignalStore
 * Gerencia estado global dos usuários de forma reativa
 */
export const UserStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => {
    const filteredUsers = computed(() => {
      const users = store.users();
      const filters = store.filters();

      if (!filters.search) return users;

      const searchLower = filters.search.toLowerCase();
      return users.filter((user) => {
        const matchesName = user.fullName.toLowerCase().includes(searchLower);
        const matchesEmail = user.email.toLowerCase().includes(searchLower);
        return matchesName || matchesEmail;
      });
    });

    return {
      filteredUsers,
      userCount: computed(() => store.users().length),
      filteredUserCount: computed(() => filteredUsers().length),
      isLoading: computed(() => store.loading() === 'loading'),
      hasError: computed(() => store.error() !== null),
    };
  }),
  withMethods((store, repository = inject(UserRepository), destroyRef = inject(DestroyRef)) => ({
    loadUsers(): void {
      patchState(store, { loading: 'loading', error: null });

      repository
        .findAll()
        .pipe(takeUntilDestroyed(destroyRef))
        .subscribe({
          next: (users) => {
            patchState(store, { users, loading: 'success' });
          },
          error: (error) => {
            patchState(store, {
              loading: 'error',
              error: error.message || 'Failed to load users',
            });
          },
        });
    },
    loadUserById(id: string): void {
      patchState(store, { loading: 'loading', error: null });

      repository
        .findById(id)
        .pipe(takeUntilDestroyed(destroyRef))
        .subscribe({
          next: (user) => {
            patchState(store, { selectedUser: user, loading: 'success' });
          },
          error: (error) => {
            patchState(store, {
              loading: 'error',
              error: error.message || 'Failed to load user',
            });
          },
        });
    },
    createUser(dto: ICreateUserDto): void {
      patchState(store, { loading: 'loading', error: null });

      repository
        .create(dto)
        .pipe(takeUntilDestroyed(destroyRef))
        .subscribe({
          next: (user) => {
            patchState(store, {
              users: [...store.users(), user],
              loading: 'success',
            });
          },
          error: (error) => {
            patchState(store, {
              loading: 'error',
              error: error.message || 'Failed to create user',
            });
          },
        });
    },
    updateUser(id: string, dto: IUpdateUserDto): void {
      patchState(store, { loading: 'loading', error: null });

      repository
        .update(id, dto)
        .pipe(takeUntilDestroyed(destroyRef))
        .subscribe({
          next: (updatedUser) => {
            patchState(store, {
              users: store.users().map((u) => (u.id === id ? updatedUser : u)),
              selectedUser: store.selectedUser()?.id === id ? updatedUser : store.selectedUser(),
              loading: 'success',
            });
          },
          error: (error) => {
            patchState(store, {
              loading: 'error',
              error: error.message || 'Failed to update user',
            });
          },
        });
    },
    deleteUser(id: string): void {
      patchState(store, { loading: 'loading', error: null });

      repository
        .delete(id)
        .pipe(takeUntilDestroyed(destroyRef))
        .subscribe({
          next: () => {
            patchState(store, {
              users: store.users().filter((u) => u.id !== id),
              selectedUser: store.selectedUser()?.id === id ? null : store.selectedUser(),
              loading: 'success',
            });
          },
          error: (error) => {
            patchState(store, {
              loading: 'error',
              error: error.message || 'Failed to delete user',
            });
          },
        });
    },
    setFilters(filters: IUserFilters): void {
      patchState(store, { filters: { ...store.filters(), ...filters } });
    },
    clearFilters(): void {
      patchState(store, { filters: {} });
    },
    clearError(): void {
      patchState(store, { error: null });
    },
  })),
  withHooks((store) => ({
    onInit: () => {
      // Auto-carrega usuários na inicialização
      store.loadUsers();
    },
  })),
);
