import { DateUtils } from './date.utils';

describe('DateUtils', () => {
  describe('format', () => {
    it('should format date with default format', () => {
      const date = new Date(2024, 0, 15); // Jan 15, 2024
      const result = DateUtils.format(date);

      expect(result).toBe('15/01/2024');
    });

    it('should format date with custom format', () => {
      const date = new Date(2024, 0, 15, 14, 30, 45);
      const result = DateUtils.format(date, 'dd/MM/yyyy HH:mm:ss');

      expect(result).toBe('15/01/2024 14:30:45');
    });

    it('should handle string dates', () => {
      const dateString = '2024-01-15';
      const result = DateUtils.format(dateString);

      expect(result).toContain('15/01/2024');
    });

    it('should pad single digits', () => {
      const date = new Date(2024, 0, 5, 9, 5, 3);
      const result = DateUtils.format(date, 'dd/MM/yyyy HH:mm:ss');

      expect(result).toBe('05/01/2024 09:05:03');
    });
  });

  describe('addDays', () => {
    it('should add days to date', () => {
      const date = new Date(2024, 0, 15);
      const result = DateUtils.addDays(date, 5);

      expect(result.getDate()).toBe(20);
    });

    it('should handle month overflow', () => {
      const date = new Date(2024, 0, 30);
      const result = DateUtils.addDays(date, 5);

      expect(result.getMonth()).toBe(1); // February
      expect(result.getDate()).toBe(4);
    });

    it('should not mutate original date', () => {
      const date = new Date(2024, 0, 15);
      const original = new Date(date);
      DateUtils.addDays(date, 5);

      expect(date).toEqual(original);
    });
  });

  describe('subtractDays', () => {
    it('should subtract days from date', () => {
      const date = new Date(2024, 0, 15);
      const result = DateUtils.subtractDays(date, 5);

      expect(result.getDate()).toBe(10);
    });
  });

  describe('isToday', () => {
    it('should return true for today', () => {
      const today = new Date();
      const result = DateUtils.isToday(today);

      expect(result).toBe(true);
    });

    it('should return false for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const result = DateUtils.isToday(yesterday);

      expect(result).toBe(false);
    });
  });

  describe('isPast', () => {
    it('should return true for past dates', () => {
      const past = new Date(2020, 0, 1);
      const result = DateUtils.isPast(past);

      expect(result).toBe(true);
    });

    it('should return false for future dates', () => {
      const future = new Date(2030, 0, 1);
      const result = DateUtils.isPast(future);

      expect(result).toBe(false);
    });
  });

  describe('isFuture', () => {
    it('should return true for future dates', () => {
      const future = new Date(2030, 0, 1);
      const result = DateUtils.isFuture(future);

      expect(result).toBe(true);
    });

    it('should return false for past dates', () => {
      const past = new Date(2020, 0, 1);
      const result = DateUtils.isFuture(past);

      expect(result).toBe(false);
    });
  });

  describe('daysBetween', () => {
    it('should calculate days between dates', () => {
      const date1 = new Date(2024, 0, 1);
      const date2 = new Date(2024, 0, 11);
      const result = DateUtils.daysBetween(date1, date2);

      expect(result).toBe(10);
    });

    it('should return absolute value', () => {
      const date1 = new Date(2024, 0, 11);
      const date2 = new Date(2024, 0, 1);
      const result = DateUtils.daysBetween(date1, date2);

      expect(result).toBe(10);
    });

    it('should return 0 for same date', () => {
      const date = new Date(2024, 0, 1);
      const result = DateUtils.daysBetween(date, date);

      expect(result).toBe(0);
    });
  });
});
