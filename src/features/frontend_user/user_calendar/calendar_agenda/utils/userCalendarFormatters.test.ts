/**
 * RESPONSIBILITY: Tests local date-key formatting to prevent UTC calendar-day shifts.
 * FLOW: Provide local Date values → assert the formatter uses local year/month/day fields.
 */
import { formatCalendarDateKey } from './userCalendarFormatters';

describe('formatCalendarDateKey', () => {
  it('formats a local calendar date without converting it to UTC first', () => {
    const localDate = new Date(2026, 9, 25, 0, 15, 0);
    expect(formatCalendarDateKey(localDate)).toBe(
      `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, '0')}-${String(localDate.getDate()).padStart(2, '0')}`,
    );
  });
});
