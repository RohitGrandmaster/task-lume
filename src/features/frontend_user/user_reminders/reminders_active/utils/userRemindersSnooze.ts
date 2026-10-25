/**
 * RESPONSIBILITY: Pure date/time arithmetic for reminder snooze; no platform or storage side effects.
 * FLOW: useUserReminders passes a target delay → helper returns fields for TodoContext.updateTodo.
 */
export interface SnoozedReminderSchedule {
  dueDate: string;
  reminderTime: string;
}

/**
 * Converts a snooze delay into local date and reminder-time fields.
 * @param minutes - Positive delay in minutes.
 * @param from - Start instant, injectable for deterministic tests.
 * @returns Local date and HH:mm time fields.
 * @throws Error if the snooze duration is not a finite positive number.
 */
export function calculateSnoozedReminderSchedule(minutes: number, from: Date = new Date()): SnoozedReminderSchedule {
  if (!Number.isFinite(minutes) || minutes < 1) {
    throw new Error('Snooze duration must be a finite positive number.');
  }
  const target = new Date(from.getTime() + Math.ceil(minutes) * 60_000);
  return {
    dueDate: `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}`,
    reminderTime: `${String(target.getHours()).padStart(2, '0')}:${String(target.getMinutes()).padStart(2, '0')}`,
  };
}
