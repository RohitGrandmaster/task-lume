/**
 * RESPONSIBILITY: Tests deterministic reminder snooze date/time math including day boundaries.
 * FLOW: Inject known local instants and intervals → assert the exact scheduled date and time.
 */
import { calculateSnoozedReminderSchedule } from './userRemindersSnooze';

describe('calculateSnoozedReminderSchedule', () => {
  it('moves the reminder by the requested number of minutes', () => {
    expect(calculateSnoozedReminderSchedule(10, new Date(2026, 9, 25, 10, 15)))
      .toEqual({ dueDate: '2026-10-25', reminderTime: '10:25' });
  });

  it('moves a snoozed reminder into the next calendar day', () => {
    expect(calculateSnoozedReminderSchedule(60, new Date(2026, 9, 25, 23, 30)))
      .toEqual({ dueDate: '2026-10-26', reminderTime: '00:30' });
  });

  it('rejects invalid, zero and negative snooze intervals', () => {
    expect(() => calculateSnoozedReminderSchedule(0, new Date(2026, 9, 25))).toThrow();
    expect(() => calculateSnoozedReminderSchedule(-5, new Date(2026, 9, 25))).toThrow();
    expect(() => calculateSnoozedReminderSchedule(Number.NaN, new Date(2026, 9, 25))).toThrow();
  });
});
