import { computed, inject } from '@angular/core';
import { LoadingState } from '@app/shared';
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

      return users.filter((user) => {
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          const matchesName = user.fullName.toLowerCase().includes(searchLower);
          const matchesDescription = user.email.toLowerCase().includes(searchLower);
          if (!matchesName && !matchesDescription) {
            return false;
          }
        }
        return true;
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
  withMethods((store, repository = inject(UserRepository)) => ({
    loadUsers(): void {
      this._setLoading('loading');

      repository.findAll().subscribe({
        next: (users) => {
          patchState(store, { users, loading: 'success', error: null });
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
      this._setLoading('loading');

      repository.findById(id).subscribe({
        next: (user) => {
          patchState(store, { selectedUser: user, loading: 'success', error: null });
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
      this._setLoading('loading');

      repository.create(dto).subscribe({
        next: (user) => {
          patchState(store, {
            users: [...store.users(), user],
            loading: 'success',
            error: null,
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
      this._setLoading('loading');

      repository.update(id, dto).subscribe({
        next: (updatedUser) => {
          const users = store.users();
          const updatedUsers = users.map((u) => (u.id === id ? updatedUser : u));

          patchState(store, {
            users: updatedUsers,
            selectedUser: store.selectedUser()?.id === id ? updatedUser : store.selectedUser(),
            loading: 'success',
            error: null,
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
      this._setLoading('loading');

      repository.delete(id).subscribe({
        next: () => {
          const users = store.users();
          const updatedUsers = users.filter((u) => u.id !== id);

          patchState(store, {
            users: updatedUsers,
            selectedUser: store.selectedUser()?.id === id ? null : store.selectedUser(),
            loading: 'success',
            error: null,
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
    _setLoading(loading: LoadingState): void {
      patchState(store, { loading });
    },
  })),
  withHooks((store) => ({
    onInit: () => {
      // Auto-carrega usuários na inicialização
      store.loadUsers();
    },
  })),
);
