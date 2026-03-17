import { EUserRole, IUser } from '../../models/user.model';
import { IUserState } from '../user.state';
import {
  selectError,
  selectFilteredUserCount,
  selectFilteredUsers,
  selectFilters,
  selectHasError,
  selectIsLoading,
  selectLoading,
  selectSelectedUser,
  selectUserCount,
  selectUserState,
  selectUsers,
} from './user.selectors';

describe('User Selectors', () => {
  const mockUsers: IUser[] = [
    {
      id: 'user-1',
      fullName: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: EUserRole.USER,
      createdAt: 1773667531,
      updatedAt: 1773667531,
    },
    {
      id: 'user-2',
      fullName: 'Jane Smith',
      email: 'jane@example.com',
      password: 'password456',
      role: EUserRole.ADMIN,
      createdAt: 1773667531,
      updatedAt: 1773667531,
    },
  ];

  // Helper function to create clean state for each test
  const createMockState = (overrides: Partial<IUserState> = {}): { user: IUserState } => ({
    user: {
      users: mockUsers,
      selectedUser: null,
      filters: {},
      loading: 'success' as const,
      error: null,
      ...overrides,
    },
  });

  describe('selectUserState', () => {
    it('should select the user state', () => {
      const state = createMockState();
      const result = selectUserState.projector(state.user);
      expect(result).toEqual(state.user);
    });
  });

  describe('selectUsers', () => {
    it('should select users', () => {
      const state = createMockState();
      const result = selectUsers.projector(state.user);
      expect(result).toEqual(mockUsers);
    });
  });

  describe('selectSelectedUser', () => {
    it('should select selected user', () => {
      const state = createMockState({ selectedUser: mockUsers[0] });
      const result = selectSelectedUser.projector(state.user);
      expect(result).toEqual(mockUsers[0]);
    });

    it('should return null when no user selected', () => {
      const state = createMockState({ selectedUser: null });
      const result = selectSelectedUser.projector(state.user);
      expect(result).toBeNull();
    });
  });

  describe('selectFilters', () => {
    it('should select filters', () => {
      const filters = { search: 'john' };
      const state = createMockState({ filters });
      const result = selectFilters.projector(state.user);
      expect(result).toEqual(filters);
    });

    it('should select empty filters', () => {
      const state = createMockState({ filters: {} });
      const result = selectFilters.projector(state.user);
      expect(result).toEqual({});
    });
  });

  describe('selectLoading', () => {
    it('should select loading state', () => {
      const state = createMockState({ loading: 'loading' });
      const result = selectLoading.projector(state.user);
      expect(result).toBe('loading');
    });

    it('should select success state', () => {
      const state = createMockState({ loading: 'success' });
      const result = selectLoading.projector(state.user);
      expect(result).toBe('success');
    });
  });

  describe('selectError', () => {
    it('should select null when no error', () => {
      const state = createMockState({ error: null });
      const result = selectError.projector(state.user);
      expect(result).toBeNull();
    });

    it('should select error when present', () => {
      const state = createMockState({ error: 'Test error' });
      const result = selectError.projector(state.user);
      expect(result).toBe('Test error');
    });
  });

  describe('selectIsLoading', () => {
    it('should return false when not loading', () => {
      const result = selectIsLoading.projector('success');
      expect(result).toBe(false);
    });

    it('should return true when loading', () => {
      const result = selectIsLoading.projector('loading');
      expect(result).toBe(true);
    });

    it('should return false when idle', () => {
      const result = selectIsLoading.projector('idle');
      expect(result).toBe(false);
    });

    it('should return false when error', () => {
      const result = selectIsLoading.projector('error');
      expect(result).toBe(false);
    });
  });

  describe('selectHasError', () => {
    it('should return false when no error', () => {
      const result = selectHasError.projector(null);
      expect(result).toBe(false);
    });

    it('should return true when error exists', () => {
      const result = selectHasError.projector('Test error');
      expect(result).toBe(true);
    });
  });

  describe('selectFilteredUsers', () => {
    it('should return all users when no filter', () => {
      const result = selectFilteredUsers.projector(mockUsers, {});
      expect(result).toEqual(mockUsers);
      expect(result.length).toBe(2);
    });

    it('should filter users by name (case insensitive)', () => {
      const result = selectFilteredUsers.projector(mockUsers, { search: 'john' });
      expect(result.length).toBe(1);
      expect(result[0].fullName).toBe('John Doe');
    });

    it('should filter users by name (uppercase)', () => {
      const result = selectFilteredUsers.projector(mockUsers, { search: 'JOHN' });
      expect(result.length).toBe(1);
      expect(result[0].fullName).toBe('John Doe');
    });

    it('should filter users by email', () => {
      const result = selectFilteredUsers.projector(mockUsers, { search: 'jane@example' });
      expect(result.length).toBe(1);
      expect(result[0].email).toBe('jane@example.com');
    });

    it('should filter users by partial name', () => {
      const result = selectFilteredUsers.projector(mockUsers, { search: 'Doe' });
      expect(result.length).toBe(1);
      expect(result[0].fullName).toBe('John Doe');
    });

    it('should return empty array when no match', () => {
      const result = selectFilteredUsers.projector(mockUsers, { search: 'nonexistent' });
      expect(result.length).toBe(0);
    });

    it('should handle empty search string', () => {
      const result = selectFilteredUsers.projector(mockUsers, { search: '' });
      expect(result).toEqual(mockUsers);
      expect(result.length).toBe(2);
    });

    it('should handle undefined search', () => {
      const result = selectFilteredUsers.projector(mockUsers, {});
      expect(result).toEqual(mockUsers);
      expect(result.length).toBe(2);
    });
  });

  describe('selectUserCount', () => {
    it('should return correct user count', () => {
      const result = selectUserCount.projector(mockUsers);
      expect(result).toBe(2);
    });

    it('should return 0 for empty users array', () => {
      const result = selectUserCount.projector([]);
      expect(result).toBe(0);
    });

    it('should return correct count for single user', () => {
      const result = selectUserCount.projector([mockUsers[0]]);
      expect(result).toBe(1);
    });
  });

  describe('selectFilteredUserCount', () => {
    it('should return total count when no filter', () => {
      const result = selectFilteredUserCount.projector(mockUsers);
      expect(result).toBe(2);
    });

    it('should return filtered count when filter matches one user', () => {
      const filteredUsers = [mockUsers[0]]; // Simula o resultado do selectFilteredUsers
      const result = selectFilteredUserCount.projector(filteredUsers);
      expect(result).toBe(1);
    });

    it('should return 0 when filter matches no users', () => {
      const filteredUsers: IUser[] = []; // Simula o resultado do selectFilteredUsers
      const result = selectFilteredUserCount.projector(filteredUsers);
      expect(result).toBe(0);
    });

    it('should return total count for all users', () => {
      const result = selectFilteredUserCount.projector(mockUsers);
      expect(result).toBe(2);
    });
  });

  describe('integration tests', () => {
    it('should work with complete state object', () => {
      const state = createMockState({
        filters: { search: 'john' },
      });

      // Test the complete selector chain
      const userState = selectUserState.projector(state.user);
      const users = selectUsers.projector(userState);
      const filters = selectFilters.projector(userState);
      const filteredUsers = selectFilteredUsers.projector(users, filters);
      const filteredCount = selectFilteredUserCount.projector(filteredUsers);

      expect(users).toEqual(mockUsers);
      expect(filters).toEqual({ search: 'john' });
      expect(filteredUsers.length).toBe(1);
      expect(filteredUsers[0].fullName).toBe('John Doe');
      expect(filteredCount).toBe(1);
    });
  });
});
