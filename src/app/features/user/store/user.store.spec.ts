import { TestBed } from '@angular/core/testing';
import { DateUtils } from '@app/shared';
import { Utils } from '@app/shared/utils/utils';
import { of, throwError } from 'rxjs';
import { EUserRole, IUser } from '../models/user.model';
import { UserRepository } from '../repositories/user.repository';
import { UserStore } from './user.store';

describe('UserStore', () => {
  let userStore: InstanceType<typeof UserStore>;
  let userRepository: UserRepository;

  const mockUsers: IUser[] = [
    {
      id: Utils.generateId(),
      fullName: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: EUserRole.USER,
      createdAt: DateUtils.fromDate(2026, 1, 1),
      updatedAt: DateUtils.fromDate(2026, 1, 1),
    },
    {
      id: Utils.generateId(),
      fullName: 'Jane Smith',
      email: 'jane@example.com',
      password: 'password456',
      role: EUserRole.ADMIN,
      createdAt: DateUtils.fromDate(2026, 1, 2),
      updatedAt: DateUtils.fromDate(2026, 1, 2),
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [],
    }).compileComponents();

    userRepository = TestBed.inject(UserRepository);

    // Mock the repository before creating the store since constructor calls loadUsers()
    const mockRepository = vi.spyOn(userRepository, 'findAll');
    mockRepository.mockReturnValue(of(mockUsers));

    userStore = TestBed.inject(UserStore);
  });

  describe('initialization', () => {
    it('should initialize with correct default state', () => {
      // Since we mock findAll in beforeEach, the store will have loaded users
      expect(userStore.users()).toEqual(mockUsers);
      expect(userStore.selectedUser()).toBeNull();
      expect(userStore.filters()).toEqual({});
      expect(userStore.loading()).toBe('success'); // Successfully loaded in constructor
      expect(userStore.error()).toBeNull();
      expect(userStore.isLoading()).toBe(false);
      expect(userStore.hasError()).toBe(false);
    });

    it('should auto-load users on initialization', () => {
      // The mock was already set up in beforeEach and the store constructor was called
      // We can verify the repository was called during initialization
      expect(vi.mocked(userRepository.findAll)).toHaveBeenCalled();
      expect(userStore.users()).toEqual(mockUsers);
      expect(userStore.loading()).toBe('success');
    });
  });

  describe('loadUsers', () => {
    it('should load users successfully', () => {
      const mockRepository = vi.spyOn(userRepository, 'findAll');
      mockRepository.mockReturnValue(of(mockUsers));

      userStore.loadUsers();

      expect(userStore.users()).toEqual(mockUsers);
      expect(userStore.loading()).toBe('success');
      expect(userStore.error()).toBeNull();
      expect(userStore.isLoading()).toBe(false);
    });

    it('should handle load users error', () => {
      const mockRepository = vi.spyOn(userRepository, 'findAll');
      mockRepository.mockReturnValue(throwError(() => new Error('Failed to load users')));

      userStore.loadUsers();

      // Users should remain from the successful initialization, error doesn't clear them
      expect(userStore.users()).toEqual(mockUsers);
      expect(userStore.loading()).toBe('error');
      expect(userStore.error()).toBe('Failed to load users');
      expect(userStore.hasError()).toBe(true);
    });

    it('should set loading state correctly during request', () => {
      const mockRepository = vi.spyOn(userRepository, 'findAll');
      mockRepository.mockReturnValue(of(mockUsers));

      // Initially loaded successfully, so not loading
      expect(userStore.isLoading()).toBe(false);

      userStore.loadUsers();

      // After calling loadUsers, it should complete immediately with our mock
      expect(userStore.isLoading()).toBe(false);
    });
  });

  describe('loadUserById', () => {
    it('should load user by id successfully', () => {
      const mockRepository = vi.spyOn(userRepository, 'findById');
      mockRepository.mockReturnValue(of(mockUsers[0]));

      userStore.loadUserById(mockUsers[0].id);

      expect(userStore.selectedUser()).toEqual(mockUsers[0]);
      expect(userStore.loading()).toBe('success');
      expect(userStore.error()).toBeNull();
    });

    it('should handle load user by id error', () => {
      const mockRepository = vi.spyOn(userRepository, 'findById');
      mockRepository.mockReturnValue(throwError(() => new Error('User not found')));

      userStore.loadUserById('invalid-id');

      expect(userStore.selectedUser()).toBeNull();
      expect(userStore.loading()).toBe('error');
      expect(userStore.error()).toBe('User not found');
    });
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const newUserDto = {
        fullName: 'New User',
        email: 'new@example.com',
        password: 'password789',
        role: EUserRole.USER,
      };

      const createdUser: IUser = {
        ...newUserDto,
        id: 'new-id',
        createdAt: DateUtils.now(),
        updatedAt: DateUtils.now(),
      };

      const mockCreate = vi.spyOn(userRepository, 'create');
      mockCreate.mockReturnValue(of(createdUser));

      // Load initial users first
      const mockFindAll = vi.spyOn(userRepository, 'findAll');
      mockFindAll.mockReturnValue(of(mockUsers));
      userStore.loadUsers();

      userStore.createUser(newUserDto);

      await vi.waitFor(() => {
        expect(userStore.users().length).toBe(3);
        expect(userStore.users()).toContain(createdUser);
        expect(userStore.loading()).toBe('success');
        expect(userStore.error()).toBeNull();
      });
    });

    it('should handle create user error', async () => {
      const mockCreate = vi.spyOn(userRepository, 'create');
      mockCreate.mockReturnValue(throwError(() => new Error('Failed to create user')));

      userStore.createUser({
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'password',
        role: EUserRole.USER,
      });

      await vi.waitFor(() => {
        expect(userStore.error()).toBe('Failed to create user');
        expect(userStore.loading()).toBe('error');
      });
    });
  });

  describe('updateUser', () => {
    beforeEach(() => {
      const mockFindAll = vi.spyOn(userRepository, 'findAll');
      mockFindAll.mockReturnValue(of(mockUsers));
      userStore.loadUsers();
    });

    it('should update user successfully', async () => {
      const updatedUser = { ...mockUsers[0], fullName: 'Updated Name' };
      const mockUpdate = vi.spyOn(userRepository, 'update');
      mockUpdate.mockReturnValue(of(updatedUser));

      userStore.updateUser(mockUsers[0].id, { fullName: 'Updated Name' });

      await vi.waitFor(() => {
        const user = userStore.users().find((u) => u.id === mockUsers[0].id);
        expect(user?.fullName).toBe('Updated Name');
        expect(userStore.loading()).toBe('success');
        expect(userStore.error()).toBeNull();
      });
    });

    it('should update selected user if it matches', async () => {
      // Set selected user first
      const mockFindById = vi.spyOn(userRepository, 'findById');
      mockFindById.mockReturnValue(of(mockUsers[0]));
      userStore.loadUserById(mockUsers[0].id);

      // Wait for the selected user to be set
      await vi.waitFor(() => {
        expect(userStore.selectedUser()).toEqual(mockUsers[0]);
      });

      const updatedUser = { ...mockUsers[0], fullName: 'Updated Selected' };
      const mockUpdate = vi.spyOn(userRepository, 'update');
      mockUpdate.mockReturnValue(of(updatedUser));

      userStore.updateUser(mockUsers[0].id, { fullName: 'Updated Selected' });

      await vi.waitFor(() => {
        expect(userStore.selectedUser()?.fullName).toBe('Updated Selected');
      });
    });

    it('should handle update user error', async () => {
      const mockUpdate = vi.spyOn(userRepository, 'update');
      mockUpdate.mockReturnValue(throwError(() => new Error('Failed to update user')));

      userStore.updateUser(mockUsers[0].id, { fullName: 'Updated Name' });

      await vi.waitFor(() => {
        expect(userStore.error()).toBe('Failed to update user');
        expect(userStore.loading()).toBe('error');
      });
    });
  });

  describe('deleteUser', () => {
    beforeEach(() => {
      const mockFindAll = vi.spyOn(userRepository, 'findAll');
      mockFindAll.mockReturnValue(of(mockUsers));
      userStore.loadUsers();
    });

    it('should delete user successfully', async () => {
      const mockDelete = vi.spyOn(userRepository, 'delete');
      mockDelete.mockReturnValue(of(void 0));

      userStore.deleteUser(mockUsers[0].id);

      await vi.waitFor(() => {
        expect(userStore.users().length).toBe(1);
        expect(userStore.users().find((u) => u.id === mockUsers[0].id)).toBeUndefined();
        expect(userStore.loading()).toBe('success');
        expect(userStore.error()).toBeNull();
      });
    });

    it('should clear selected user if it matches deleted user', async () => {
      // Set selected user first
      const mockFindById = vi.spyOn(userRepository, 'findById');
      mockFindById.mockReturnValue(of(mockUsers[0]));
      userStore.loadUserById(mockUsers[0].id);

      const mockDelete = vi.spyOn(userRepository, 'delete');
      mockDelete.mockReturnValue(of(void 0));

      userStore.deleteUser(mockUsers[0].id);

      await vi.waitFor(() => {
        expect(userStore.selectedUser()).toBeNull();
      });
    });

    it('should handle delete user error', async () => {
      const mockDelete = vi.spyOn(userRepository, 'delete');
      mockDelete.mockReturnValue(throwError(() => new Error('Failed to delete user')));

      userStore.deleteUser(mockUsers[0].id);

      await vi.waitFor(() => {
        expect(userStore.error()).toBe('Failed to delete user');
        expect(userStore.loading()).toBe('error');
      });
    });
  });

  describe('filtering', () => {
    beforeEach(() => {
      const mockRepository = vi.spyOn(userRepository, 'findAll');
      mockRepository.mockReturnValue(of(mockUsers));
      userStore.loadUsers();
    });

    it('should filter users by search text (name)', () => {
      userStore.setFilters({ search: 'john' });

      const filtered = userStore.filteredUsers();
      expect(filtered.length).toBe(1);
      expect(filtered[0].fullName).toContain('John');
    });

    it('should filter users by search text (email)', () => {
      userStore.setFilters({ search: 'jane@example' });

      const filtered = userStore.filteredUsers();
      expect(filtered.length).toBe(1);
      expect(filtered[0].email).toContain('jane@example');
    });

    it('should return all users when no search filter', () => {
      userStore.setFilters({});

      const filtered = userStore.filteredUsers();
      expect(filtered.length).toBe(2);
    });

    it('should clear filters', () => {
      userStore.setFilters({ search: 'john' });
      expect(userStore.filteredUsers().length).toBe(1);

      userStore.clearFilters();
      expect(userStore.filteredUsers().length).toBe(2);
      expect(userStore.filters()).toEqual({});
    });

    it('should update filters correctly', () => {
      userStore.setFilters({ search: 'test' });
      expect(userStore.filters().search).toBe('test');

      userStore.setFilters({ search: 'updated' });
      expect(userStore.filters().search).toBe('updated');
    });
  });

  describe('computed signals', () => {
    beforeEach(() => {
      const mockRepository = vi.spyOn(userRepository, 'findAll');
      mockRepository.mockReturnValue(of(mockUsers));
      userStore.loadUsers();
    });

    it('should calculate user count correctly', () => {
      expect(userStore.userCount()).toBe(2);
    });

    it('should calculate filtered user count correctly', () => {
      userStore.setFilters({ search: 'john' });
      expect(userStore.filteredUserCount()).toBe(1);
    });

    it('should return correct loading states', () => {
      expect(userStore.isLoading()).toBe(false);
      expect(userStore.hasError()).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should clear error', () => {
      const mockRepository = vi.spyOn(userRepository, 'findAll');
      mockRepository.mockReturnValue(throwError(() => new Error('Test error')));

      userStore.loadUsers();
      expect(userStore.error()).toBe('Test error');

      userStore.clearError();
      expect(userStore.error()).toBeNull();
      expect(userStore.hasError()).toBe(false);
    });

    it('should handle error without message', () => {
      const mockRepository = vi.spyOn(userRepository, 'findAll');
      mockRepository.mockReturnValue(throwError(() => ({})));

      userStore.loadUsers();
      expect(userStore.error()).toBe('Failed to load users');
    });
  });
});
