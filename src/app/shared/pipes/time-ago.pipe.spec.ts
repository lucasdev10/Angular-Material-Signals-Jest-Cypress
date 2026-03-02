import { TimeAgoPipe } from './time-ago.pipe';

describe('TimeAgoPipe', () => {
  let pipe: TimeAgoPipe;

  beforeEach(() => {
    pipe = new TimeAgoPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return "just now" for recent dates', () => {
    const now = new Date();
    const result = pipe.transform(now);

    expect(result).toBe('just now');
  });

  it('should return "just now" for dates less than 60 seconds ago', () => {
    const date = new Date(Date.now() - 30 * 1000); // 30 seconds ago
    const result = pipe.transform(date);

    expect(result).toBe('just now');
  });

  it('should return minutes ago', () => {
    const date = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
    const result = pipe.transform(date);

    expect(result).toBe('5 minutes ago');
  });

  it('should return singular minute', () => {
    const date = new Date(Date.now() - 1 * 60 * 1000); // 1 minute ago
    const result = pipe.transform(date);

    expect(result).toBe('1 minute ago');
  });

  it('should return hours ago', () => {
    const date = new Date(Date.now() - 3 * 60 * 60 * 1000); // 3 hours ago
    const result = pipe.transform(date);

    expect(result).toBe('3 hours ago');
  });

  it('should return days ago', () => {
    const date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
    const result = pipe.transform(date);

    expect(result).toBe('2 days ago');
  });

  it('should return weeks ago', () => {
    const date = new Date(Date.now() - 2 * 7 * 24 * 60 * 60 * 1000); // 2 weeks ago
    const result = pipe.transform(date);

    expect(result).toBe('2 weeks ago');
  });

  it('should return months ago', () => {
    const date = new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000); // ~3 months ago
    const result = pipe.transform(date);

    expect(result).toBe('3 months ago');
  });

  it('should return years ago', () => {
    const date = new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000); // ~2 years ago
    const result = pipe.transform(date);

    expect(result).toBe('2 years ago');
  });

  it('should handle string dates', () => {
    const dateString = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const result = pipe.transform(dateString);

    expect(result).toBe('5 minutes ago');
  });

  it('should return empty string for null or undefined', () => {
    expect(pipe.transform(null as any)).toBe('');
    expect(pipe.transform(undefined as any)).toBe('');
  });
});
