import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage';

interface TestData {
  id: string;
  name: string;
  value: number;
}

describe('StorageService', () => {
  let service: StorageService<TestData>;
  const TEST_KEY = 'test-key';
  const TEST_DATA: TestData = { id: '1', name: 'Test', value: 100 };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StorageService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('set and get', () => {
    it('should store and retrieve data', () => {
      service.set(TEST_KEY, TEST_DATA);
      const result = service.get(TEST_KEY);

      expect(result).toEqual(TEST_DATA);
    });

    it('should return null for non-existent key', () => {
      const result = service.get('non-existent');

      expect(result).toBeNull();
    });

    it('should overwrite existing data', () => {
      service.set(TEST_KEY, TEST_DATA);
      const newData: TestData = { id: '2', name: 'Updated', value: 200 };
      service.set(TEST_KEY, newData);

      const result = service.get(TEST_KEY);
      expect(result).toEqual(newData);
    });

    it('should handle complex nested objects', () => {
      const complexData = {
        user: { id: '1', profile: { name: 'John', age: 30 } },
        items: [1, 2, 3],
        metadata: { created: new Date().toISOString() },
      };

      service.set(TEST_KEY, complexData as any);
      const result = service.get(TEST_KEY);

      expect(result).toEqual(complexData);
    });
  });

  describe('remove', () => {
    it('should remove item from storage', () => {
      service.set(TEST_KEY, TEST_DATA);
      service.remove(TEST_KEY);

      const result = service.get(TEST_KEY);
      expect(result).toBeNull();
    });

    it('should not throw error when removing non-existent key', () => {
      expect(() => service.remove('non-existent')).not.toThrow();
    });
  });

  describe('clear', () => {
    it('should clear all items from storage', () => {
      service.set('key1', TEST_DATA);
      service.set('key2', TEST_DATA);
      service.clear();

      expect(service.get('key1')).toBeNull();
      expect(service.get('key2')).toBeNull();
    });
  });

  describe('has', () => {
    it('should return true for existing key', () => {
      service.set(TEST_KEY, TEST_DATA);

      expect(service.has(TEST_KEY)).toBe(true);
    });

    it('should return false for non-existent key', () => {
      expect(service.has('non-existent')).toBe(false);
    });
  });

  describe('keys', () => {
    it('should return all storage keys', () => {
      service.set('key1', TEST_DATA);
      service.set('key2', TEST_DATA);
      service.set('key3', TEST_DATA);

      const keys = service.keys();
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).toContain('key3');
    });

    it('should return empty array when storage is empty', () => {
      const keys = service.keys();
      expect(keys).toEqual([]);
    });
  });

  describe('error handling', () => {
    it('should handle JSON parse errors gracefully', () => {
      localStorage.setItem(TEST_KEY, 'invalid-json{');

      const result = service.get(TEST_KEY);
      expect(result).toBeNull();
    });

    it('should handle storage quota exceeded', () => {
      const largeData = 'x'.repeat(10 * 1024 * 1024); // 10MB
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Tenta armazenar dados muito grandes
      expect(() => service.set(TEST_KEY, largeData as any)).not.toThrow();

      spy.mockRestore();
    });
  });
});
