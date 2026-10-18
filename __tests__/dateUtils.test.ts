import {parseTaskDueDate, toDateOnlyTimestamp} from '../src/utils/dateUtils';

describe('parseTaskDueDate', () => {
  const now = new Date(2026, 0, 15, 17, 45, 0, 0);

  it('parses relative labels into local calendar days', () => {
    expect(parseTaskDueDate('Today', now)).toEqual(new Date(2026, 0, 15));
    expect(parseTaskDueDate('Tomorrow', now)).toEqual(new Date(2026, 0, 16));
    expect(parseTaskDueDate('Next week', now)).toEqual(new Date(2026, 0, 22));
  });

  it('parses ISO date-only values without a UTC date shift', () => {
    expect(parseTaskDueDate('2026-02-03', now)).toEqual(new Date(2026, 1, 3));
  });

  it('supports legacy India-style dates and rejects invalid dates', () => {
    expect(parseTaskDueDate('31/01/2026', now)).toEqual(new Date(2026, 0, 31));
    expect(parseTaskDueDate('31/02/2026', now)).toBeNull();
    expect(parseTaskDueDate('not-a-date', now)).toBeNull();
    expect(parseTaskDueDate('No date', now)).toBeNull();
  });

  it('returns a stable local-day timestamp', () => {
    expect(toDateOnlyTimestamp('2026-02-03', now)).toBe(new Date(2026, 1, 3).getTime());
  });
});
