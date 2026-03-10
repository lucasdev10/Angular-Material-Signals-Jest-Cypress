import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthStore } from '@app/features/auth/store/auth.store';
import { EUserRole, IUser } from '@app/features/user/models/user.model';
import { DateUtils } from '@app/shared';
import { roleGuard } from './role.guard';

describe('roleGuard', () => {
  let mockRouter: Router;
  let mockAuthStore: Partial<AuthStore>;

  const mockAdminUser: IUser = {
    id: '1',
    email: 'admin@test.com',
    password: 'hashed',
    fullName: 'Admin User',
    role: EUserRole.ADMIN,
    createdAt: DateUtils.now(),
    updatedAt: DateUtils.now(),
  };

  const mockRegularUser: IUser = {
    id: '2',
    email: 'user@test.com',
    password: 'hashed',
    fullName: 'Regular User',
    role: EUserRole.USER,
    createdAt: DateUtils.now(),
    updatedAt: DateUtils.now(),
  };

  beforeEach(() => {
    mockRouter = {
      navigate: vi.fn(),
    } as any;

    mockAuthStore = {
      user: signal(null),
    } as any;

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: AuthStore, useValue: mockAuthStore },
      ],
    });
  });

  it('should allow access when user has required role', () => {
    (mockAuthStore.user as any) = signal(mockAdminUser);

    const route: any = {
      data: { roles: [EUserRole.ADMIN] },
    };

    const result = TestBed.runInInjectionContext(() => roleGuard(route, {} as any));

    expect(result).toBe(true);
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should deny access when user does not have required role', () => {
    (mockAuthStore.user as any) = signal(mockRegularUser);

    const route: any = {
      data: { roles: [EUserRole.ADMIN] },
    };

    const result = TestBed.runInInjectionContext(() => roleGuard(route, {} as any));

    expect(result).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/products']);
  });

  it('should redirect to login when user is not authenticated', () => {
    (mockAuthStore.user as any) = signal(null);

    const route: any = {
      data: { roles: [EUserRole.ADMIN] },
    };

    const result = TestBed.runInInjectionContext(() => roleGuard(route, {} as any));

    expect(result).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('should allow access when no roles are required', () => {
    (mockAuthStore.user as any) = signal(mockRegularUser);

    const route: any = {
      data: { roles: [] },
    };

    const result = TestBed.runInInjectionContext(() => roleGuard(route, {} as any));

    expect(result).toBe(true);
  });

  it('should allow access when roles data is undefined', () => {
    (mockAuthStore.user as any) = signal(mockRegularUser);

    const route: any = {
      data: {},
    };

    const result = TestBed.runInInjectionContext(() => roleGuard(route, {} as any));

    expect(result).toBe(true);
  });

  it('should allow access when user has one of multiple required roles', () => {
    (mockAuthStore.user as any) = signal(mockRegularUser);

    const route: any = {
      data: { roles: [EUserRole.ADMIN, EUserRole.USER] },
    };

    const result = TestBed.runInInjectionContext(() => roleGuard(route, {} as any));

    expect(result).toBe(true);
  });

  it('should deny access when user has none of the required roles', () => {
    (mockAuthStore.user as any) = signal(mockRegularUser);

    const route: any = {
      data: { roles: [EUserRole.ADMIN] },
    };

    const result = TestBed.runInInjectionContext(() => roleGuard(route, {} as any));

    expect(result).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/products']);
  });
});
