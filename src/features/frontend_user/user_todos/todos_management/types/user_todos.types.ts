/**
 * RESPONSIBILITY: Canonical TypeScript definitions for the user_todos domain and todos_management sub-module.
 * FLOW: Consumed by schemas, components, hooks, stores, and screens within this autonomous feature sub-module.
 */

export type TodoPriority = 'low' | 'medium' | 'high';

export type TodoRecurrence = 'none' | 'daily' | 'weekly' | 'monthly';

export type TodoCategory =
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

export interface TodoEntity {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  category: TodoCategory;
  priority: TodoPriority;
  dueDate: string;
  reminder: boolean;
  favorite: boolean;
  deleted: boolean;
  pinned: boolean;
  recurrence?: TodoRecurrence;
  timerEndAt?: string | number | null;
  timerNotificationId?: string | null;
  color?: string | null;
  status?: 'pending' | 'in_progress' | 'completed';
  startedAt?: number | null;
  reminderTime?: string | null;
  createdAt: number;
  completedAt?: number | null;
  deletedAt?: number | null;
}

export type TodoFilterType = 'all' | 'today' | 'upcoming' | 'completed' | 'starred';

export interface TodoFilterOptions {
  activeTab: TodoFilterType;
  selectedCategory: string | null;
  searchQuery: string;
}
