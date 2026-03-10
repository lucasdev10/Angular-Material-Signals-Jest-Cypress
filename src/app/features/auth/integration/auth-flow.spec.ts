import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { StorageService } from '@app/core/storage/storage';
import { AuthRepository } from '@app/features/auth/repositories/auth.repository';
import { AuthStore } from '@app/features/auth/store/auth.store';
import { EUserRole } from '@app/features/user/models/user.model';
import { DateUtils } from '@app/shared';
import { of, Subject, throwError } from 'rxjs';

/**
 * Testes de integração para fluxo de autenticação
 * Testa o fluxo completo de login, persistência e logout
 */
describe('Authentication Flow Integration Tests', () => {
  let authStore: AuthStore;
  let authRepository: AuthRepository;
  let storageService: StorageService;
  let router: Router;

  const mockAdminUser = {
    id: '1',
    email: 'admin@test.com',
    password: 'hashed',
    fullName: 'Admin User',
    role: EUserRole.ADMIN,
    createdAt: DateUtils.now(),
    updatedAt: DateUtils.now(),
  };

  const mockRegularUser = {
    id: '2',
    email: 'user@test.com',
    password: 'hashed',
    fullName: 'Regular User',
    role: EUserRole.USER,
    createdAt: DateUtils.now(),
    updatedAt: DateUtils.now(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthStore,
        AuthRepository,
        StorageService,
        {
          provide: Router,
          useValue: {
            navigate: vi.fn(),
          },
        },
      ],
    });

    authStore = TestBed.inject(AuthStore);
    authRepository = TestBed.inject(AuthRepository);
    storageService = TestBed.inject(StorageService);
    router = TestBed.inject(Router);

    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Complete Login Flow', () => {
    it('should complete admin login flow with persistence', async () => {
      // Arrange
      const mockResponse = {
        user: mockAdminUser,
        token: 'admin-token-123',
      };

      const loginSpy = vi.spyOn(authRepository, 'login');
      loginSpy.mockReturnValue(of(mockResponse));

      // Act - Login
      authStore.login({
        email: 'admin@test.com',
        password: 'password',
      });

      // Assert - Authentication state
      await vi.waitFor(() => {
        expect(authStore.isAuthenticated()).toBe(true);
        expect(authStore.isAdmin()).toBe(true);
        expect(authStore.user()?.email).toBe('admin@test.com');
        expect(authStore.token()).toBe('admin-token-123');
      });

      // Assert - Storage persistence
      const storedToken = storageService.get('auth_token');
      const storedUser = storageService.get('auth_user');

      expect(storedToken).toBe('admin-token-123');
      expect(storedUser).toEqual(mockAdminUser);

      // Assert - Navigation
      expect(router.navigate).toHaveBeenCalledWith(['/admin']);
    });

    it('should complete regular user login flow', async () => {
      // Arrange
      const mockResponse = {
        user: mockRegularUser,
        token: 'user-token-456',
      };

      const loginSpy = vi.spyOn(authRepository, 'login');
      loginSpy.mockReturnValue(of(mockResponse));

      // Act
      authStore.login({
        email: 'user@test.com',
        password: 'password',
      });

      // Assert
      await vi.waitFor(() => {
        expect(authStore.isAuthenticated()).toBe(true);
        expect(authStore.isAdmin()).toBe(false);
        expect(router.navigate).toHaveBeenCalledWith(['/products']);
      });
    });
  });

  describe('Session Persistence', () => {
    it('should restore session from localStorage on init', () => {
      // Arrange - Simulate stored session
      storageService.set('auth_token', 'stored-token');
      storageService.set('auth_user', mockRegularUser);

      // Act - Create new store instance (simulates page reload)
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          AuthStore,
          AuthRepository,
          StorageService,
          { provide: Router, useValue: { navigate: vi.fn() } },
        ],
      });

      const newAuthStore = TestBed.inject(AuthStore);

      // Assert
      expect(newAuthStore.isAuthenticated()).toBe(true);
      expect(newAuthStore.user()).toEqual(mockRegularUser);
      expect(newAuthStore.token()).toBe('stored-token');
    });

    it('should start with empty state when no stored session', () => {
      // Arrange - Clear storage
      localStorage.clear();

      // Act - Create new store instance
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          AuthStore,
          AuthRepository,
          StorageService,
          { provide: Router, useValue: { navigate: vi.fn() } },
        ],
      });

      const newAuthStore = TestBed.inject(AuthStore);

      // Assert
      expect(newAuthStore.isAuthenticated()).toBe(false);
      expect(newAuthStore.user()).toBeNull();
      expect(newAuthStore.token()).toBeNull();
    });
  });

  describe('Complete Logout Flow', () => {
    it('should complete logout flow and clear all data', async () => {
      // Arrange - Login first
      const mockResponse = {
        user: mockRegularUser,
        token: 'user-token',
      };

      const loginSpy = vi.spyOn(authRepository, 'login');
      loginSpy.mockReturnValue(of(mockResponse));

      authStore.login({
        email: 'user@test.com',
        password: 'password',
      });

      await vi.waitFor(() => {
        expect(authStore.isAuthenticated()).toBe(true);
      });

      // Act - Logout
      const logoutSpy = vi.spyOn(authRepository, 'logout');
      logoutSpy.mockReturnValue(of(void 0));

      authStore.logout();

      // Assert - State cleared
      await vi.waitFor(() => {
        expect(authStore.isAuthenticated()).toBe(false);
        expect(authStore.user()).toBeNull();
        expect(authStore.token()).toBeNull();
      });

      // Assert - Storage cleared
      expect(storageService.get('auth_token')).toBeNull();
      expect(storageService.get('auth_user')).toBeNull();

      // Assert - Navigation
      expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
    });

    it('should clear auth even if logout API fails', async () => {
      // Arrange - Login first
      const mockResponse = {
        user: mockRegularUser,
        token: 'user-token',
      };

      const loginSpy = vi.spyOn(authRepository, 'login');
      loginSpy.mockReturnValue(of(mockResponse));

      authStore.login({
        email: 'user@test.com',
        password: 'password',
      });

      await vi.waitFor(() => {
        expect(authStore.isAuthenticated()).toBe(true);
      });

      // Act - Logout with error
      const logoutSpy = vi.spyOn(authRepository, 'logout');
      logoutSpy.mockReturnValue(throwError(() => new Error('Network error')));

      authStore.logout();

      // Assert - Still clears auth
      await vi.waitFor(() => {
        expect(authStore.isAuthenticated()).toBe(false);
        expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid credentials', async () => {
      // Arrange
      const loginSpy = vi.spyOn(authRepository, 'login');
      loginSpy.mockReturnValue(throwError(() => ({ message: 'Invalid email or password' })));

      // Act
      authStore.login({
        email: 'wrong@test.com',
        password: 'wrong',
      });

      // Assert
      await vi.waitFor(() => {
        expect(authStore.error()).toBe('Invalid email or password');
        expect(authStore.isAuthenticated()).toBe(false);
        expect(authStore.isLoading()).toBe(false);
      });

      // Assert - No storage
      expect(storageService.get('auth_token')).toBeNull();
      expect(storageService.get('auth_user')).toBeNull();
    });

    it('should handle network errors', async () => {
      // Arrange
      const loginSpy = vi.spyOn(authRepository, 'login');
      loginSpy.mockReturnValue(throwError(() => ({ message: 'Network error' })));

      // Act
      authStore.login({
        email: 'user@test.com',
        password: 'password',
      });

      // Assert
      await vi.waitFor(() => {
        expect(authStore.error()).toBe('Network error');
        expect(authStore.isAuthenticated()).toBe(false);
      });
    });
  });

  describe('Role-Based Access', () => {
    it('should correctly identify admin users', async () => {
      // Arrange
      const mockResponse = {
        user: mockAdminUser,
        token: 'admin-token',
      };

      const loginSpy = vi.spyOn(authRepository, 'login');
      loginSpy.mockReturnValue(of(mockResponse));

      // Act
      authStore.login({
        email: 'admin@test.com',
        password: 'password',
      });

      // Assert
      await vi.waitFor(() => {
        expect(authStore.isAdmin()).toBe(true);
        expect(authStore.user()?.role).toBe(EUserRole.ADMIN);
      });
    });

    it('should correctly identify regular users', async () => {
      // Arrange
      const mockResponse = {
        user: mockRegularUser,
        token: 'user-token',
      };

      const loginSpy = vi.spyOn(authRepository, 'login');
      loginSpy.mockReturnValue(of(mockResponse));

      // Act
      authStore.login({
        email: 'user@test.com',
        password: 'password',
      });

      // Assert
      await vi.waitFor(() => {
        expect(authStore.isAdmin()).toBe(false);
        expect(authStore.user()?.role).toBe(EUserRole.USER);
      });
    });
  });

  describe('Loading States', () => {
    it('should manage loading state during login', () => {
      const subject = new Subject<any>();

      vi.spyOn(authRepository, 'login').mockReturnValue(subject.asObservable());

      authStore.login({
        email: 'user@test.com',
        password: 'hashed',
      });

      // Loading deve estar true imediatamente
      expect(authStore.isLoading()).toBe(true);

      // Agora simulamos resposta do backend
      subject.next({
        user: mockRegularUser,
        token: 'token',
      });
      subject.complete();

      // Agora deve estar false
      expect(authStore.isLoading()).toBe(false);
    });
  });
});
