import { FilterPipe } from './filter.pipe';

describe('FilterPipe', () => {
  let pipe: FilterPipe;

  beforeEach(() => {
    pipe = new FilterPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return all items when search text is empty', () => {
    const items = [{ name: 'John' }, { name: 'Jane' }];
    const result = pipe.transform(items, '');

    expect(result).toEqual(items);
  });

  it('should return all items when search text is null', () => {
    const items = [{ name: 'John' }, { name: 'Jane' }];
    const result = pipe.transform(items, null as any);

    expect(result).toEqual(items);
  });

  it('should filter by specific property', () => {
    const items = [
      { name: 'John', age: 30 },
      { name: 'Jane', age: 25 },
      { name: 'Bob', age: 35 },
    ];

    const result = pipe.transform(items, 'john', 'name');

    expect(result).toEqual([{ name: 'John', age: 30 }]);
  });

  it('should be case insensitive', () => {
    const items = [{ name: 'John' }, { name: 'jane' }];
    const result = pipe.transform(items, 'JOHN', 'name');

    expect(result).toEqual([{ name: 'John' }]);
  });

  it('should search in all properties when property is not specified', () => {
    const items = [
      { name: 'John', city: 'New York' },
      { name: 'Jane', city: 'Los Angeles' },
    ];

    const result = pipe.transform(items, 'angeles');

    expect(result).toEqual([{ name: 'Jane', city: 'Los Angeles' }]);
  });

  it('should handle partial matches', () => {
    const items = [{ name: 'JavaScript' }, { name: 'TypeScript' }, { name: 'Python' }];

    const result = pipe.transform(items, 'script', 'name');

    expect(result.length).toBe(2);
  });

  it('should return empty array when no matches found', () => {
    const items = [{ name: 'John' }, { name: 'Jane' }];
    const result = pipe.transform(items, 'xyz', 'name');

    expect(result).toEqual([]);
  });

  it('should handle empty array', () => {
    const result = pipe.transform([], 'test');

    expect(result).toEqual([]);
  });

  it('should handle null items', () => {
    const result = pipe.transform(null as any, 'test');

    expect(result).toBeNull();
  });
});
