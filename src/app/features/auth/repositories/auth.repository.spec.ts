import { TestBed } from '@angular/core/testing';
import { HttpService } from '@app/core/http/http';
import { EUserRole, IUser } from '@app/features/user/models/user.model';
import { of, throwError } from 'rxjs';
import { IAuthResponse, ILoginCredentials } from '../models/auth.model';
import { AuthRepository } from './auth.repository';

describe('AuthRepository', () => {
  let authRepository: AuthRepository;
  let httpService: HttpService<IUser>;

  const mockUsers: IUser[] = [
    {
      id: 'user-1',
      fullName: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: EUserRole.USER,
      createdAt: 1640995200,
      updatedAt: 1640995200,
    },
    {
      id: 'admin-1',
      fullName: 'Admin User',
      email: 'admin@admin.com',
      password: 'admin123',
      role: EUserRole.ADMIN,
      createdAt: 1640995200,
      updatedAt: 1640995200,
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthRepository, HttpService],
    });

    authRepository = TestBed.inject(AuthRepository);
    httpService = TestBed.inject(HttpService);
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      const credentials: ILoginCredentials = {
        email: 'john@example.com',
        password: 'password123',
      };

      const mockHttpGet = vi.spyOn(httpService, 'get');
      mockHttpGet.mockReturnValue(of(mockUsers));

      return new Promise<void>((resolve, reject) => {
        authRepository.login(credentials).subscribe({
          next: (response: IAuthResponse) => {
            try {
              expect(response.user.email).toBe(credentials.email);
              expect(response.user.fullName).toBe('John Doe');
              expect(response.user.role).toBe(EUserRole.USER);
              expect(response.token).toBe('mock-jwt-token-user-1');
              expect(response.refreshToken).toBe('mock-refresh-token-user-1');
              expect(response.user).not.toHaveProperty('password');
              resolve();
            } catch (error) {
              reject(error);
            }
          },
          error: reject,
        });
      });
    });

    it('should login admin user with valid credentials', async () => {
      const credentials: ILoginCredentials = {
        email: 'admin@admin.com',
        password: 'admin123',
      };

      const mockHttpGet = vi.spyOn(httpService, 'get');
      mockHttpGet.mockReturnValue(of(mockUsers));

      return new Promise<void>((resolve, reject) => {
        authRepository.login(credentials).subscribe({
          next: (response: IAuthResponse) => {
            try {
              expect(response.user.email).toBe(credentials.email);
              expect(response.user.role).toBe(EUserRole.ADMIN);
              expect(response.token).toBe('mock-jwt-token-admin-1');
              expect(response.refreshToken).toBe('mock-refresh-token-admin-1');
              resolve();
            } catch (error) {
              reject(error);
            }
          },
          error: reject,
        });
      });
    });

    it('should reject login with invalid email', async () => {
      const credentials: ILoginCredentials = {
        email: 'invalid@example.com',
        password: 'password123',
      };

      const mockHttpGet = vi.spyOn(httpService, 'get');
      mockHttpGet.mockReturnValue(of(mockUsers));

      return new Promise<void>((resolve, reject) => {
        authRepository.login(credentials).subscribe({
          next: () => reject(new Error('Should have failed')),
          error: (error) => {
            try {
              expect(error.message).toBe('Invalid email or password');
              resolve();
            } catch (e) {
              reject(e);
            }
          },
        });
      });
    });

    it('should reject login with invalid password', async () => {
      const credentials: ILoginCredentials = {
        email: 'john@example.com',
        password: 'wrongpassword',
      };

      const mockHttpGet = vi.spyOn(httpService, 'get');
      mockHttpGet.mockReturnValue(of(mockUsers));

      return new Promise<void>((resolve, reject) => {
        authRepository.login(credentials).subscribe({
          next: () => reject(new Error('Should have failed')),
          error: (error) => {
            try {
              expect(error.message).toBe('Invalid email or password');
              resolve();
            } catch (e) {
              reject(e);
            }
          },
        });
      });
    });

    it('should handle HTTP service error during login', async () => {
      const credentials: ILoginCredentials = {
        email: 'john@example.com',
        password: 'password123',
      };

      const mockHttpGet = vi.spyOn(httpService, 'get');
      mockHttpGet.mockReturnValue(throwError(() => new Error('Network error')));

      return new Promise<void>((resolve, reject) => {
        authRepository.login(credentials).subscribe({
          next: () => reject(new Error('Should have failed')),
          error: (error) => {
            try {
              expect(error.message).toBe('Network error');
              resolve();
            } catch (e) {
              reject(e);
            }
          },
        });
      });
    });

    it('should not include password in response', async () => {
      const credentials: ILoginCredentials = {
        email: 'john@example.com',
        password: 'password123',
      };

      const mockHttpGet = vi.spyOn(httpService, 'get');
      mockHttpGet.mockReturnValue(of(mockUsers));

      return new Promise<void>((resolve, reject) => {
        authRepository.login(credentials).subscribe({
          next: (response) => {
            try {
              expect(response).not.toHaveProperty('password');
              expect(Object.keys(response.user)).not.toContain('password');
              resolve();
            } catch (error) {
              reject(error);
            }
          },
          error: reject,
        });
      });
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      return new Promise<void>((resolve, reject) => {
        authRepository.logout().subscribe({
          next: (result) => {
            try {
              expect(result).toBeUndefined();
              resolve();
            } catch (error) {
              reject(error);
            }
          },
          error: reject,
        });
      });
    });

    it('should complete logout within reasonable time', async () => {
      const startTime = Date.now();

      return new Promise<void>((resolve, reject) => {
        authRepository.logout().subscribe({
          next: () => {
            try {
              const endTime = Date.now();
              const duration = endTime - startTime;
              expect(duration).toBeGreaterThanOrEqual(300);
              expect(duration).toBeLessThan(500);
              resolve();
            } catch (error) {
              reject(error);
            }
          },
          error: reject,
        });
      });
    });
  });

  describe('validateToken', () => {
    it('should validate valid token', async () => {
      const token = 'mock-jwt-token-user-1';

      const mockHttpGet = vi.spyOn(httpService, 'get');
      mockHttpGet.mockReturnValue(of(mockUsers));

      return new Promise<void>((resolve, reject) => {
        authRepository.validateToken(token).subscribe({
          next: (user: IUser) => {
            try {
              expect(user.id).toBe('user-1');
              expect(user.email).toBe('john@example.com');
              expect(user).not.toHaveProperty('password');
              resolve();
            } catch (error) {
              reject(error);
            }
          },
          error: reject,
        });
      });
    });

    it('should reject invalid token format', async () => {
      const token = 'invalid-token';

      return new Promise<void>((resolve, reject) => {
        authRepository.validateToken(token).subscribe({
          next: () => reject(new Error('Should have failed')),
          error: (error) => {
            try {
              expect(error.message).toBe('Token inválido');
              resolve();
            } catch (e) {
              reject(e);
            }
          },
        });
      });
    });

    it('should reject empty token', async () => {
      const token = '';

      return new Promise<void>((resolve, reject) => {
        authRepository.validateToken(token).subscribe({
          next: () => reject(new Error('Should have failed')),
          error: (error) => {
            try {
              expect(error.message).toBe('Token inválido');
              resolve();
            } catch (e) {
              reject(e);
            }
          },
        });
      });
    });

    it('should reject token for non-existent user', async () => {
      const token = 'mock-jwt-token-nonexistent';

      const mockHttpGet = vi.spyOn(httpService, 'get');
      mockHttpGet.mockReturnValue(of(mockUsers));

      return new Promise<void>((resolve, reject) => {
        authRepository.validateToken(token).subscribe({
          next: () => reject(new Error('Should have failed')),
          error: (error) => {
            try {
              expect(error.message).toBe('User not found');
              resolve();
            } catch (e) {
              reject(e);
            }
          },
        });
      });
    });

    it('should handle HTTP service error during token validation', async () => {
      const token = 'mock-jwt-token-user-1';

      const mockHttpGet = vi.spyOn(httpService, 'get');
      mockHttpGet.mockReturnValue(throwError(() => new Error('Service unavailable')));

      return new Promise<void>((resolve, reject) => {
        authRepository.validateToken(token).subscribe({
          next: () => reject(new Error('Should have failed')),
          error: (error) => {
            try {
              expect(error.message).toBe('Service unavailable');
              resolve();
            } catch (e) {
              reject(e);
            }
          },
        });
      });
    });

    it('should not include password in validated user', async () => {
      const token = 'mock-jwt-token-user-1';

      const mockHttpGet = vi.spyOn(httpService, 'get');
      mockHttpGet.mockReturnValue(of(mockUsers));

      return new Promise<void>((resolve, reject) => {
        authRepository.validateToken(token).subscribe({
          next: (user) => {
            try {
              expect(user).not.toHaveProperty('password');
              expect(Object.keys(user)).not.toContain('password');
              resolve();
            } catch (error) {
              reject(error);
            }
          },
          error: reject,
        });
      });
    });
  });

  describe('refreshToken', () => {
    it('should throw not implemented error', async () => {
      return new Promise<void>((resolve, reject) => {
        authRepository.refreshToken().subscribe({
          next: () => reject(new Error('Should have failed')),
          error: (error) => {
            try {
              expect(error.message).toBe('Not implemented');
              resolve();
            } catch (e) {
              reject(e);
            }
          },
        });
      });
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete login flow', async () => {
      const credentials: ILoginCredentials = {
        email: 'john@example.com',
        password: 'password123',
      };

      const mockHttpGet = vi.spyOn(httpService, 'get');
      mockHttpGet.mockReturnValue(of(mockUsers));

      return new Promise<void>((resolve, reject) => {
        // Login
        authRepository.login(credentials).subscribe({
          next: (loginResponse: IAuthResponse) => {
            try {
              expect(loginResponse.token).toBeTruthy();

              // Validate the received token
              authRepository.validateToken(loginResponse.token).subscribe({
                next: (validatedUser: IUser) => {
                  try {
                    expect(validatedUser.id).toBe(loginResponse.user.id);
                    expect(validatedUser.email).toBe(loginResponse.user.email);

                    // Logout
                    authRepository.logout().subscribe({
                      next: () => {
                        resolve();
                      },
                      error: reject,
                    });
                  } catch (error) {
                    reject(error);
                  }
                },
                error: reject,
              });
            } catch (error) {
              reject(error);
            }
          },
          error: reject,
        });
      });
    });

    it('should handle case-sensitive email matching', async () => {
      const credentials: ILoginCredentials = {
        email: 'JOHN@EXAMPLE.COM',
        password: 'password123',
      };

      const mockHttpGet = vi.spyOn(httpService, 'get');
      mockHttpGet.mockReturnValue(of(mockUsers));

      return new Promise<void>((resolve, reject) => {
        authRepository.login(credentials).subscribe({
          next: () => reject(new Error('Should have failed due to case sensitivity')),
          error: (error) => {
            try {
              expect(error.message).toBe('Invalid email or password');
              resolve();
            } catch (e) {
              reject(e);
            }
          },
        });
      });
    });
  });
});
