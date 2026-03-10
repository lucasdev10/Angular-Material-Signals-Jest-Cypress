import { DateUtils } from './date.utils';

describe('DateUtils', () => {
  describe('toUnixTime', () => {
    it('should return current timestamp when no date provided', () => {
      const before = Math.floor(Date.now() / 1000);
      const result = DateUtils.toUnixTime();
      const after = Math.floor(Date.now() / 1000);

      expect(result).toBeGreaterThanOrEqual(before);
      expect(result).toBeLessThanOrEqual(after);
    });

    it('should convert Date object to unix timestamp', () => {
      const date = new Date('2026-01-01T01:00:00.000Z');
      const result = DateUtils.toUnixTime(date);

      expect(result).toBe(1767229200); // Unix timestamp for 2026-01-01
    });

    it('should convert ISO string to unix timestamp', () => {
      const isoString = '2026-01-01T01:00:00.000Z';
      const result = DateUtils.toUnixTime(isoString);

      expect(result).toBe(1767229200);
    });

    it('should return number as-is if already timestamp', () => {
      const timestamp = 1735689600;
      const result = DateUtils.toUnixTime(timestamp);

      expect(result).toBe(timestamp);
    });
  });

  describe('now', () => {
    it('should return current unix timestamp', () => {
      const before = Math.floor(Date.now() / 1000);
      const result = DateUtils.now();
      const after = Math.floor(Date.now() / 1000);

      expect(result).toBeGreaterThanOrEqual(before);
      expect(result).toBeLessThanOrEqual(after);
    });
  });

  describe('fromDate', () => {
    it('should create unix timestamp from year, month, day', () => {
      const result = DateUtils.fromDate(2026, 1, 1);

      // Should be January 1, 2026 at midnight local time
      const expected = new Date(2026, 0, 1); // month is 0-indexed
      const expectedTimestamp = Math.floor(expected.getTime() / 1000);

      expect(result).toBe(expectedTimestamp);
    });

    it('should handle different months correctly', () => {
      const jan = DateUtils.fromDate(2026, 1, 1);
      const feb = DateUtils.fromDate(2026, 2, 1);

      expect(feb).toBeGreaterThan(jan);
    });
  });

  describe('fromUnixTime', () => {
    it('should convert unix timestamp to Date object', () => {
      const timestamp = 1735689600; // 2026-01-01T00:00:00.000Z
      const result = DateUtils.fromUnixTime(timestamp);

      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBe(timestamp * 1000);
    });

    it('should handle zero timestamp', () => {
      const result = DateUtils.fromUnixTime(0);

      expect(result.getTime()).toBe(0);
      expect(result.toISOString()).toBe('1970-01-01T00:00:00.000Z');
    });
  });

  describe('format', () => {
    it('should format Date object with default format', () => {
      const date = new Date('2026-01-01T12:30:45.000Z');
      const result = DateUtils.format(date);

      expect(result).toBe('2026-01-01');
    });

    it('should format Date object with custom format', () => {
      const date = new Date('2026-01-01T12:30:45.000Z');
      const result = DateUtils.format(date, 'yyyy-MM-dd HH:mm:ss');

      expect(result).toMatch(/2026-01-01 \d{2}:\d{2}:\d{2}/);
    });

    it('should format unix timestamp', () => {
      const timestamp = 1767240000; // 2026-01-01T00:00:00.000Z
      const result = DateUtils.format(timestamp);

      expect(result).toBe('2026-01-01');
    });

    it('should handle different format patterns', () => {
      const date = new Date('2026-03-15T12:30:45.000Z');

      expect(DateUtils.format(date, 'dd/MM/yyyy')).toMatch(/15\/03\/2026/);
      expect(DateUtils.format(date, 'MMM dd, yyyy')).toMatch(/Mar 15, 2026/);
    });
  });

  describe('timeAgo', () => {
    it('should return time ago for Date object', () => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const result = DateUtils.timeAgo(oneHourAgo);

      expect(result).toContain('ago');
      expect(result).toMatch(/about 1 hour ago|1 hour ago/);
    });

    it('should return time ago for unix timestamp', () => {
      const oneHourAgo = Math.floor((Date.now() - 60 * 60 * 1000) / 1000);
      const result = DateUtils.timeAgo(oneHourAgo);

      expect(result).toContain('ago');
    });

    it('should handle recent dates', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const result = DateUtils.timeAgo(fiveMinutesAgo);

      expect(result).toMatch(/\d+ minutes? ago|about \d+ minutes? ago/);
    });
  });

  describe('isValid', () => {
    it('should return true for valid Date object', () => {
      const validDate = new Date('2026-01-01');

      expect(DateUtils.isValid(validDate)).toBe(true);
    });

    it('should return false for invalid Date object', () => {
      const invalidDate = new Date('invalid-date');

      expect(DateUtils.isValid(invalidDate)).toBe(false);
    });

    it('should return true for valid date string', () => {
      expect(DateUtils.isValid('2026-01-01')).toBe(true);
      expect(DateUtils.isValid('2026-01-01T12:30:45.000Z')).toBe(true);
    });

    it('should return false for invalid date string', () => {
      expect(DateUtils.isValid('invalid-date')).toBe(false);
      expect(DateUtils.isValid('2026-13-01')).toBe(false); // Invalid month
    });

    it('should return false for null or undefined', () => {
      expect(DateUtils.isValid(null)).toBe(false);
      expect(DateUtils.isValid(undefined)).toBe(false);
    });

    it('should return false for non-date values', () => {
      expect(DateUtils.isValid(123)).toBe(false);
      expect(DateUtils.isValid({})).toBe(false);
      expect(DateUtils.isValid([])).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle leap year correctly', () => {
      const leapYear = DateUtils.fromDate(2024, 2, 29); // Feb 29, 2024 (leap year)
      const date = DateUtils.fromUnixTime(leapYear);

      expect(date.getMonth()).toBe(1); // February (0-indexed)
      expect(date.getDate()).toBe(29);
    });

    it('should handle year boundaries', () => {
      const newYear = DateUtils.fromDate(2026, 1, 1);
      const prevYear = DateUtils.fromDate(2025, 12, 31);

      expect(newYear).toBeGreaterThan(prevYear);
    });

    it('should handle timezone differences consistently', () => {
      const date1 = DateUtils.fromDate(2026, 1, 1);
      const date2 = DateUtils.fromDate(2026, 1, 1);

      expect(date1).toBe(date2);
    });
  });
});
