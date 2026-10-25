/**
 * RESPONSIBILITY: Local canonical type definitions for active reminders (Strict WET Principle).
 * FLOW: Consumed by UserRemindersMainView and UserRemindersScreen; zero sibling imports.
 */

export interface ReminderTaskEntity {
  id: string | number;
  title: string;
  reminder: boolean;
  reminderTime?: string | null;
  dueDate?: string;
  completed: boolean;
  deleted: boolean;
  priority?: string;
  category?: string;
}
