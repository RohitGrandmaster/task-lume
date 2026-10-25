/**
 * RESPONSIBILITY: Canonical Zod validation schema for task reminders and alarm times (≤150 lines).
 * FLOW: Validates reminder creation payload and snooze interval requests.
 */

import { z } from 'zod';

export const UserReminderCreateSchema = z.object({
  taskId: z.string().min(1, 'Task ID is required'),
  reminderTime: z.string().min(1, 'Reminder datetime is required'),
  repeat: z.enum(['none', 'daily', 'weekly', 'monthly']).default('none'),
});

export const UserReminderSnoozeSchema = z.object({
  reminderId: z.string().min(1),
  minutes: z.number().min(1).max(1440),
});

export type UserReminderCreateValues = z.infer<typeof UserReminderCreateSchema>;
export type UserReminderSnoozeValues = z.infer<typeof UserReminderSnoozeSchema>;
