/**
 * RESPONSIBILITY: Pure selectors and task-statistics helpers for User Settings; no React/context side effects.
 * FLOW: Settings hooks pass task records into the helpers to select deletion IDs and derive completion streaks.
 */
export interface SettingsTaskSummary {
  id: string | number;
  title?: string;
  completed?: boolean;
  deleted?: boolean;
  completedAt?: number | null;
  [key: string]: unknown;
}

/**
 * Returns only completed task IDs that are not already in Trash.
 * @param tasks - Current task records.
 * @returns Stable string IDs eligible for the confirmed completed-task cleanup.
 */
export function selectCompletedTaskIds(tasks: readonly SettingsTaskSummary[]): string[] {
  return tasks.filter((task) => task.completed === true && task.deleted !== true).map((task) => String(task.id));
}

/**
 * Returns only IDs of items currently in Trash.
 * @param tasks - Current task records.
 * @returns Stable string IDs eligible for the confirmed Trash cleanup.
 */
export function selectTrashedTaskIds(tasks: readonly SettingsTaskSummary[]): string[] {
  return tasks.filter((task) => task.deleted === true).map((task) => String(task.id));
}

/**
 * Formats a local calendar date as a stable date key.
 * @param date - Date to normalize.
 * @returns Local YYYY-MM-DD key.
 */
function localDayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/**
 * Calculates consecutive completion days from actual persisted completion timestamps.
 * @param tasks - Task records with completion state and timestamps.
 * @param now - Current clock value, injectable for deterministic tests.
 * @returns Consecutive day count ending today or yesterday.
 */
export function calculateTaskCompletionStreak(tasks: readonly SettingsTaskSummary[], now: Date = new Date()): number {
  const completedDays = new Set(
    tasks.filter((task) => task.completed === true && task.deleted !== true && typeof task.completedAt === 'number')
      .map((task) => localDayKey(new Date(task.completedAt as number))),
  );
  if (completedDays.size === 0) return 0;
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!completedDays.has(localDayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (completedDays.has(localDayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
