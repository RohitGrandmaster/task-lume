import {createId} from './helpers';
import {toDateOnlyTimestamp} from './dateUtils';

/**
 * Normalize category name (trim + collapse spaces)
 */
export function normalizeCategoryName(name) {
  if (typeof name !== 'string') return '';
  return name.trim().replace(/\s+/g, ' ');
}

/**
 * Normalize and dedupe a list of category names
 */
export function normalizeCategoryList(value) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  const result = [];
  value.forEach(entry => {
    const name = normalizeCategoryName(entry);
    const key = name.toLowerCase();
    if (name && !seen.has(key)) {
      seen.add(key);
      result.push(name);
    }
  });
  return result;
}

/**
 * Normalize dueDate to a consistent value.
 * Keeps "No date", converts Today/Tomorrow to ISO YYYY-MM-DD,
 * and preserves already valid ISO dates.
 */
export function normalizeDueDate(dueDate) {
  if (!dueDate || dueDate === 'No date' || dueDate === 'no date') {
    return 'No date';
  }

  const dd = String(dueDate).trim();
  const lower = dd.toLowerCase();

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (lower === 'today') {
    return today.toISOString().slice(0, 10);
  }

  if (lower === 'tomorrow') {
    const t = new Date(today);
    t.setDate(t.getDate() + 1);
    return t.toISOString().slice(0, 10);
  }

  if (lower === 'next week' || lower === 'nextweek') {
    const t = new Date(today);
    t.setDate(t.getDate() + 7);
    return t.toISOString().slice(0, 10);
  }

  // Already ISO YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dd)) {
    return dd;
  }

  // Try parse other formats
  const parsed = new Date(dd);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  // Fallback – keep original if we can't understand it
  return dd;
}

/**
 * Normalize a todo object with defaults for missing fields
 */
export function normalizeTodo(todo) {
  return {
    id: todo.id ?? createId(),
    title: todo.title ?? '',
    description: todo.description ?? '',
    completed: todo.completed ?? false,
    category: todo.category ?? 'Personal',
    priority: todo.priority ?? 'medium',
    dueDate: normalizeDueDate(todo.dueDate),
    reminder: todo.reminder ?? false,
    favorite: todo.favorite ?? false,
    deleted: todo.deleted ?? false,

    // Pin feature
    pinned: todo.pinned ?? false,

    // Recurrence: none | daily | weekly | monthly
    recurrence: todo.recurrence || 'none',

    // Timer feature
    timerEndAt: todo.timerEndAt ?? null,
    timerNotificationId: todo.timerNotificationId ?? null,

    // Extra fields
    color: todo.color ?? null,
    status: todo.status ?? 'pending',
    startedAt: todo.startedAt ?? null,
    reminderTime: todo.reminderTime ?? null,

    // Timestamps
    createdAt: todo.createdAt ?? Date.now(),
    completedAt: todo.completedAt ?? null,
    deletedAt: todo.deletedAt ?? null,
    dueDateTimestamp: todo.dueDateTimestamp ?? toDateOnlyTimestamp(todo.dueDate),
  };
}

export const TRASH_RETENTION_DAYS = 30;
export const TRASH_RETENTION_MS = TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000;

/**
 * Filter out tasks in trash that have exceeded retention period (30 days)
 */
export function purgeExpiredTrash(todoList, retentionDays = TRASH_RETENTION_DAYS) {
  const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
  return todoList.filter(task => {
    if (!task.deleted) return true;
    if (!task.deletedAt) return true; // keep if no timestamp
    return task.deletedAt > cutoff;
  });
}
