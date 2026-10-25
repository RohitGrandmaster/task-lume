/**
 * RESPONSIBILITY: Feature-local presentation formatters for reminder times, alerts, and recurrence labels.
 * FLOW: Consumed by reminders active cards and screens.
 */

export function formatReminderTimeDisplay(timeStr?: string | null): string {
  if (!timeStr) return 'No time set';
  try {
    const d = new Date(timeStr);
    if (isNaN(d.getTime())) return timeStr;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return timeStr;
  }
}

export function formatRecurrenceLabel(recurrence?: 'none' | 'daily' | 'weekly' | 'monthly'): string {
  switch (recurrence) {
    case 'daily':
      return 'Every Day';
    case 'weekly':
      return 'Every Week';
    case 'monthly':
      return 'Every Month';
    case 'none':
    default:
      return 'One-time';
  }
}
