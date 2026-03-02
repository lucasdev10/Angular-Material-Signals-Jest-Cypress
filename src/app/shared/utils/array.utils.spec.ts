import { ArrayUtils } from './array.utils';

describe('ArrayUtils', () => {
  describe('unique', () => {
    it('should remove duplicate primitives', () => {
      const array = [1, 2, 2, 3, 3, 3, 4];
      const result = ArrayUtils.unique(array);

      expect(result).toEqual([1, 2, 3, 4]);
    });

    it('should handle empty array', () => {
      const result = ArrayUtils.unique([]);

      expect(result).toEqual([]);
    });

    it('should work with strings', () => {
      const array = ['a', 'b', 'a', 'c', 'b'];
      const result = ArrayUtils.unique(array);

      expect(result).toEqual(['a', 'b', 'c']);
    });
  });

  describe('uniqueBy', () => {
    it('should remove duplicates by property', () => {
      const array = [
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' },
        { id: 1, name: 'John Doe' },
      ];

      const result = ArrayUtils.uniqueBy(array, 'id');

      expect(result.length).toBe(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
    });
  });

  describe('groupBy', () => {
    it('should group items by property', () => {
      const array = [
        { category: 'fruit', name: 'apple' },
        { category: 'fruit', name: 'banana' },
        { category: 'vegetable', name: 'carrot' },
      ];

      const result = ArrayUtils.groupBy(array, 'category');

      expect(result['fruit'].length).toBe(2);
      expect(result['vegetable'].length).toBe(1);
    });
  });

  describe('sortBy', () => {
    it('should sort ascending by default', () => {
      const array = [{ age: 30 }, { age: 20 }, { age: 25 }];
      const result = ArrayUtils.sortBy(array, 'age');

      expect(result[0].age).toBe(20);
      expect(result[2].age).toBe(30);
    });

    it('should sort descending', () => {
      const array = [{ age: 30 }, { age: 20 }, { age: 25 }];
      const result = ArrayUtils.sortBy(array, 'age', 'desc');

      expect(result[0].age).toBe(30);
      expect(result[2].age).toBe(20);
    });

    it('should not mutate original array', () => {
      const array = [{ age: 30 }, { age: 20 }];
      const original = [...array];
      ArrayUtils.sortBy(array, 'age');

      expect(array).toEqual(original);
    });
  });

  describe('chunk', () => {
    it('should divide array into chunks', () => {
      const array = [1, 2, 3, 4, 5, 6, 7];
      const result = ArrayUtils.chunk(array, 3);

      expect(result.length).toBe(3);
      expect(result[0]).toEqual([1, 2, 3]);
      expect(result[1]).toEqual([4, 5, 6]);
      expect(result[2]).toEqual([7]);
    });

    it('should handle empty array', () => {
      const result = ArrayUtils.chunk([], 3);

      expect(result).toEqual([]);
    });
  });

  describe('shuffle', () => {
    it('should shuffle array', () => {
      const array = [1, 2, 3, 4, 5];
      const result = ArrayUtils.shuffle(array);

      expect(result.length).toBe(array.length);
      expect(result).toContain(1);
      expect(result).toContain(5);
    });

    it('should not mutate original array', () => {
      const array = [1, 2, 3];
      const original = [...array];
      ArrayUtils.shuffle(array);

      expect(array).toEqual(original);
    });
  });

  describe('random', () => {
    it('should return random item from array', () => {
      const array = [1, 2, 3, 4, 5];
      const result = ArrayUtils.random(array);

      expect(array).toContain(result);
    });
  });

  describe('sum', () => {
    it('should calculate sum of property', () => {
      const array = [{ value: 10 }, { value: 20 }, { value: 30 }];
      const result = ArrayUtils.sum(array, 'value');

      expect(result).toBe(60);
    });

    it('should return 0 for empty array', () => {
      const result = ArrayUtils.sum([], 'value');

      expect(result).toBe(0);
    });
  });

  describe('average', () => {
    it('should calculate average of property', () => {
      const array = [{ value: 10 }, { value: 20 }, { value: 30 }];
      const result = ArrayUtils.average(array, 'value');

      expect(result).toBe(20);
    });

    it('should return 0 for empty array', () => {
      const result = ArrayUtils.average([], 'value');

      expect(result).toBe(0);
    });
  });

  describe('min', () => {
    it('should find minimum value', () => {
      const array = [{ value: 30 }, { value: 10 }, { value: 20 }];
      const result = ArrayUtils.min(array, 'value');

      expect(result).toBe(10);
    });
  });

  describe('max', () => {
    it('should find maximum value', () => {
      const array = [{ value: 30 }, { value: 10 }, { value: 20 }];
      const result = ArrayUtils.max(array, 'value');

      expect(result).toBe(30);
    });
  });
});
