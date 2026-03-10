import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { StorageService } from '@app/core/storage/storage';
import { EUserRole } from '@app/features/user/models/user.model';
import { DateUtils } from '@app/shared';
import { of, throwError } from 'rxjs';
import type { Mocked } from 'vitest';
import { AuthRepository } from '../repositories/auth.repository';
import { AuthStore } from './auth.store';

describe('AuthStore', () => {
  let store: AuthStore;
  let mockRepository: Mocked<AuthRepository>;
  let mockStorage: Mocked<StorageService>;
  let mockRouter: Mocked<Router>;

  beforeEach(() => {
    // Criar mocks
    mockRepository = {
      login: vi.fn(),
      logout: vi.fn(),
      validateToken: vi.fn(),
      refreshToken: vi.fn(),
    } as any;

    mockStorage = {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn(),
      clear: vi.fn(),
      has: vi.fn(),
      keys: vi.fn(),
    } as any;

    mockRouter = {
      navigate: vi.fn(),
    } as any;

    TestBed.configureTestingModule({
      providers: [
        AuthStore,
        { provide: AuthRepository, useValue: mockRepository },
        { provide: StorageService, useValue: mockStorage },
        { provide: Router, useValue: mockRouter },
      ],
    });

    store = TestBed.inject(AuthStore);
  });

  afterEach(() => {
    mockStorage.clear();
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  describe('login', () => {
    it('should login successfully and redirect admin to /admin', async () => {
      const mockResponse = {
        user: {
          id: '1',
          email: 'admin@test.com',
          password: 'hashed-password',
          fullName: 'Admin User',
          role: EUserRole.ADMIN,
          createdAt: DateUtils.now(),
          updatedAt: DateUtils.now(),
        },
        token: 'mock-token',
      };

      mockRepository.login.mockReturnValue(of(mockResponse));

      store.login({ email: 'admin@test.com', password: 'password' });

      await vi.waitFor(() => {
        expect(store.isAuthenticated()).toBe(true);
        expect(store.isAdmin()).toBe(true);
        expect(store.user()?.email).toBe('admin@test.com');
        expect(mockStorage.set).toHaveBeenCalledWith('auth_token', 'mock-token');
        expect(mockStorage.set).toHaveBeenCalledWith('auth_user', mockResponse.user);
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/admin']);
      });
    });

    it('should login successfully and redirect user to /products', async () => {
      const mockResponse = {
        user: {
          id: '2',
          email: 'user@test.com',
          password: 'hashed-password',
          fullName: 'Regular User',
          role: EUserRole.USER,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        token: 'mock-token',
      };

      mockRepository.login.mockReturnValue(of(mockResponse));

      store.login({ email: 'user@test.com', password: 'password' });

      await vi.waitFor(() => {
        expect(store.isAuthenticated()).toBe(true);
        expect(store.isAdmin()).toBe(false);
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/products']);
      });
    });

    it('should handle login error', async () => {
      mockRepository.login.mockReturnValue(throwError(() => ({ message: 'Invalid credentials' })));

      store.login({ email: 'wrong@test.com', password: 'wrong' });

      await vi.waitFor(() => {
        expect(store.error()).toBe('Invalid credentials');
        expect(store.isAuthenticated()).toBe(false);
      });
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      mockRepository.logout.mockReturnValue(of(void 0));

      store.logout();

      await vi.waitFor(() => {
        expect(store.isAuthenticated()).toBe(false);
        expect(store.user()).toBeNull();
        expect(mockStorage.remove).toHaveBeenCalledWith('auth_token');
        expect(mockStorage.remove).toHaveBeenCalledWith('auth_user');
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login']);
      });
    });
  });

  describe('computed signals', () => {
    it('should return correct isAuthenticated value', () => {
      expect(store.isAuthenticated()).toBe(false);
    });

    it('should return correct isAdmin value', () => {
      expect(store.isAdmin()).toBe(false);
    });
  });

  describe('initialization', () => {
    it('should load auth from localStorage on init', () => {
      const mockUser = {
        id: '1',
        email: 'test@test.com',
        password: 'hashed',
        fullName: 'Test User',
        role: EUserRole.USER,
        createdAt: DateUtils.now(),
        updatedAt: DateUtils.now(),
      };

      mockStorage.get.mockImplementation((key: string) => {
        if (key === 'auth_token') return 'stored-token';
        if (key === 'auth_user') return mockUser;
        return null;
      });

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          AuthStore,
          { provide: AuthRepository, useValue: mockRepository },
          { provide: StorageService, useValue: mockStorage },
          { provide: Router, useValue: mockRouter },
        ],
      });

      const newStore = TestBed.inject(AuthStore);

      expect(newStore.isAuthenticated()).toBe(true);
      expect(newStore.user()).toEqual(mockUser);
      expect(newStore.token()).toBe('stored-token');
    });

    it('should start with empty state when no stored auth', () => {
      mockStorage.get.mockReturnValue(null);

      expect(store.isAuthenticated()).toBe(false);
      expect(store.user()).toBeNull();
      expect(store.token()).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should set error on login failure', async () => {
      mockRepository.login.mockReturnValue(throwError(() => ({ message: 'Network error' })));

      store.login({ email: 'test@test.com', password: 'pass' });

      await vi.waitFor(() => {
        expect(store.error()).toBe('Network error');
        expect(store.isLoading()).toBe(false);
      });
    });

    it('should handle logout error gracefully', async () => {
      mockRepository.logout.mockReturnValue(throwError(() => new Error('Logout failed')));

      store.logout();

      await vi.waitFor(() => {
        expect(store.isAuthenticated()).toBe(false);
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login']);
      });
    });

    it('should use default error message when none provided', async () => {
      mockRepository.login.mockReturnValue(throwError(() => ({})));

      store.login({ email: 'test@test.com', password: 'pass' });

      await vi.waitFor(() => {
        expect(store.error()).toBe('Error when logging in');
      });
    });
  });

  describe('loading states', () => {
    it('should set loading during login', () => {
      mockRepository.login.mockReturnValue(
        new (class {
          subscribe() {
            // Never completes
          }
        })() as any,
      );

      store.login({ email: 'test@test.com', password: 'pass' });

      expect(store.isLoading()).toBe(true);
    });

    it('should clear loading after successful login', async () => {
      const mockResponse = {
        user: {
          id: '1',
          email: 'test@test.com',
          password: 'hashed',
          fullName: 'Test',
          role: EUserRole.USER,
          createdAt: DateUtils.now(),
          updatedAt: DateUtils.now(),
        },
        token: 'token',
      };

      mockRepository.login.mockReturnValue(of(mockResponse));

      store.login({ email: 'test@test.com', password: 'pass' });

      await vi.waitFor(() => {
        expect(store.isLoading()).toBe(false);
      });
    });
  });

  describe('role-based features', () => {
    it('should correctly identify admin users', async () => {
      const adminResponse = {
        user: {
          id: '1',
          email: 'admin@test.com',
          password: 'hashed',
          fullName: 'Admin',
          role: EUserRole.ADMIN,
          createdAt: DateUtils.now(),
          updatedAt: DateUtils.now(),
        },
        token: 'token',
      };

      mockRepository.login.mockReturnValue(of(adminResponse));
      store.login({ email: 'admin@test.com', password: 'pass' });

      await vi.waitFor(() => {
        expect(store.isAdmin()).toBe(true);
      });
    });

    it('should correctly identify regular users', async () => {
      const userResponse = {
        user: {
          id: '2',
          email: 'user@test.com',
          password: 'hashed',
          fullName: 'User',
          role: EUserRole.USER,
          createdAt: DateUtils.now(),
          updatedAt: DateUtils.now(),
        },
        token: 'token',
      };

      mockRepository.login.mockReturnValue(of(userResponse));
      store.login({ email: 'user@test.com', password: 'pass' });

      await vi.waitFor(() => {
        expect(store.isAdmin()).toBe(false);
      });
    });
  });
});
