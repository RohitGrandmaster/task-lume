/**
 * RESPONSIBILITY: Public TypeScript contract for the existing local TodoContext provider.
 * FLOW: Feature hooks consume this shape while the underlying legacy JS provider remains the runtime owner.
 */

import type { ComponentType, ReactNode } from 'react';

export interface TodoContextTask {
  id: string | number;
  title: string;
  description?: string;
  completed: boolean;
  category: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  reminder: boolean;
  favorite: boolean;
  deleted: boolean;
  pinned: boolean;
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
  timerEndAt?: string | number | null;
  timerNotificationId?: string | null;
  color?: string | null;
  status?: 'pending' | 'in_progress' | 'completed';
  startedAt?: number | null;
  reminderTime?: string | null;
  snoozedUntil?: number | null;
  createdAt: number;
  completedAt?: number | null;
  deletedAt?: number | null;
}

export interface TodoContextValue {
  tasks: TodoContextTask[];
  loading: boolean;
  loadTodos: () => Promise<TodoContextTask[]>;
  TRASH_RETENTION_DAYS: number;
  autoCleanTrash: (retentionDays?: number) => number;
  customCategories: string[];
  addCategory: (name: string) => boolean;
  renameCategory: (oldName: string, newName: string) => boolean;
  deleteCategory: (name: string) => boolean;
  addTodo: (todo: Partial<TodoContextTask>) => string | number | void;
  updateTodo: (id: string, patch: Partial<TodoContextTask>) => void;
  importTodos: (tasks: unknown[]) => Promise<void> | void;
  toggleTodo: (id: string) => void;
  toggleFavorite: (id: string) => void;
  togglePinTodo: (id: string) => void;
  setTodoPinned: (id: string, pinned: boolean) => void;
  toggleTodoReminder: (id: string) => void;
  setTodoTimer: (id: string, durationSeconds: number) => void;
  clearTodoTimer: (id: string) => void;
  startTodoTimer: (id: string) => void;
  deleteTodo: (id: string) => void;
  restoreTodo: (id: string) => void;
  permanentlyDeleteTodo: (id: string) => void;
  batchPermanentlyDelete: (ids: Array<string | number>) => number;
  clearTodos: (scope?: 'all' | 'completed') => number;
  getTodoById: (id: string) => TodoContextTask | undefined;
  getActiveTodos: () => TodoContextTask[];
  getCompletedTodos: () => TodoContextTask[];
  getFavoriteTodos: () => TodoContextTask[];
  getPinnedTodos: () => TodoContextTask[];
  getTrashTodos: () => TodoContextTask[];
}

export const TodoProvider: ComponentType<{ children?: ReactNode }>;
export function useTodoContext(): TodoContextValue;
export const TRASH_RETENTION_DAYS: number;
export const TRASH_RETENTION_MS: number;
