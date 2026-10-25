/**
 * RESPONSIBILITY: Canonical Zod validation schema for Pomodoro focus session settings (≤150 lines).
 * FLOW: Validates session interval durations and auto-break settings.
 */

import { z } from 'zod';

export const UserPomodoroConfigSchema = z.object({
  workDuration: z.number().min(1).max(120).default(25),
  shortBreakDuration: z.number().min(1).max(30).default(5),
  longBreakDuration: z.number().min(1).max(60).default(15),
  autoStartBreaks: z.boolean().default(false),
  soundEnabled: z.boolean().default(true),
});

export type UserPomodoroConfigValues = z.infer<typeof UserPomodoroConfigSchema>;
