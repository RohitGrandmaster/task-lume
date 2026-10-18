/**
 * Tasklume Core Type Definitions
 * Unifies TypeScript and JavaScript across the application
 */

export type Priority = 'low' | 'medium' | 'high';

export type Category =
  | 'Personal'
  | 'Work'
  | 'Learning'
  | 'Shopping'
  | 'Health'
  | 'Project'
  | 'Finance'
  | 'Family'
  | 'Home'
  | 'Travel'
  | 'Other'
  | string;

export interface TodoItem {
  id: string | number;
  title: string;
  description?: string;
  completed: boolean;
  category: Category;
  priority: Priority;
  dueDate: string;
  reminder: boolean;
  favorite: boolean;
  deleted: boolean;
  pinned: boolean;
  timerEndAt?: string | number | null;
  timerNotificationId?: string | null;
  color?: string | null;
  status?: 'pending' | 'in_progress' | 'completed';
  startedAt?: number | null;
  createdAt: number;
  completedAt?: number | null;
  deletedAt?: number | null;
}

export type FocusMode = 'work' | 'shortBreak' | 'longBreak';

export interface FocusSession {
  id: string;
  type: 'focus' | 'break';
  mode: FocusMode;
  minutes: number;
  durationMinutes: number;
  task?: string | null;
  taskTitle?: string | null;
  taskId?: string | number | null;
  finishedAt: string;
  completedAt: string;
}

export interface FocusStats {
  totalMinutes: number;
  totalSessions: number;
  todayMinutes: number;
  todaySessionsCount: number;
  currentStreakDays: number;
}

export interface NoteItem {
  id: string | number;
  title: string;
  body: string;
  color?: string;
  pinned?: boolean;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

export type ThemeMode = 'light' | 'dark';

export interface PaletteOption {
  id: string;
  name: string;
  light: string;
  dark: string;
}

export interface AppSettings {
  notificationsEnabled: boolean;
  remindersEnabled: boolean;
  use24Hour: boolean;
  weekStartsMonday: boolean;
  hapticsEnabled: boolean;
  swipeActionsEnabled: boolean;
  language: 'en' | 'hi';
  snoozeDuration: number;
}
