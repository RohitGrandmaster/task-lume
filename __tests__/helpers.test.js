import {
  createId,
  formatDate,
  formatTime,
  truncateText,
  capitalizeFirstLetter,
} from '../src/utils/helpers';
import {
  parseTaskDueDate,
  calculateReminderTimestamp,
} from '../src/utils/todoTimerNotifications';

describe('Helper Utilities', () => {
  describe('createId()', () => {
    it('generates a non-empty string ID', () => {
      const id = createId();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(5);
    });

    it('generates unique IDs without collision over 1000 generations', () => {
      const ids = new Set();
      for (let i = 0; i < 1000; i++) {
        const id = createId();
        expect(ids.has(id)).toBe(false);
        ids.add(id);
      }
      expect(ids.size).toBe(1000);
    });
  });

  describe('truncateText()', () => {
    it('returns original text if shorter than max length', () => {
      expect(truncateText('Hello', 10)).toBe('Hello');
    });

    it('truncates text and appends ellipsis if longer', () => {
      expect(truncateText('Hello World Today', 8)).toBe('Hello Wo...');
    });
  });

  describe('capitalizeFirstLetter()', () => {
    it('capitalizes the first letter of a string', () => {
      expect(capitalizeFirstLetter('urgent')).toBe('Urgent');
      expect(capitalizeFirstLetter('low')).toBe('Low');
    });

    it('handles empty or non-string inputs safely', () => {
      expect(capitalizeFirstLetter('')).toBe('');
      expect(capitalizeFirstLetter(null)).toBe('');
    });
  });

  describe('parseTaskDueDate()', () => {
    it('returns null for empty or null due dates', () => {
      expect(parseTaskDueDate(null)).toBeNull();
      expect(parseTaskDueDate('')).toBeNull();
      expect(parseTaskDueDate('No date')).toBeNull();
    });

    it('parses "today" as today Date object', () => {
      const parsed = parseTaskDueDate('today');
      expect(parsed).toBeInstanceOf(Date);
      expect(parsed.getDate()).toBe(new Date().getDate());
      expect(parsed.getMonth()).toBe(new Date().getMonth());
      expect(parsed.getFullYear()).toBe(new Date().getFullYear());
    });

    it('parses YYYY-MM-DD string correctly', () => {
      const parsed = parseTaskDueDate('2026-12-25');
      expect(parsed).toBeInstanceOf(Date);
      expect(parsed.getFullYear()).toBe(2026);
      expect(parsed.getMonth()).toBe(11); // 0-indexed December
      expect(parsed.getDate()).toBe(25);
    });
  });

  describe('calculateReminderTimestamp()', () => {
    it('returns null if task has no reminder', () => {
      expect(calculateReminderTimestamp({reminder: false})).toBeNull();
    });

    it('calculates reminder timestamp for valid due date', () => {
      const ts = calculateReminderTimestamp({
        reminder: true,
        dueDate: '2026-10-25',
      });
      expect(typeof ts).toBe('number');
      expect(ts).toBeGreaterThan(0);
    });
  });
});
