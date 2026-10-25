/**
 * RESPONSIBILITY: Canonical type definitions for active reminders and snooze options.
 * FLOW: Consumed by reminder cards and snooze sheets.
 */

export interface ActiveReminder {
  id: string;
  taskId: string;
  title: string;
  reminderTime: string;
  dueDate: string;
  priority: string;
}
