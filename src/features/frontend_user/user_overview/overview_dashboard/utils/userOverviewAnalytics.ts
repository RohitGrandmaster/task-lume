/**
 * RESPONSIBILITY: Pure, feature-local analytics derived from persisted Todo completion timestamps.
 * FLOW: useUserOverview passes task records to these helpers; no API, context or UI dependencies.
 */
export interface OverviewTaskRecord {
  id: string | number;
  completed?: boolean;
  deleted?: boolean;
  completedAt?: number | null;
  category?: string;
}

export interface WeeklyCompletionPoint {
  label: string;
  value: number;
  isCurrent: boolean;
}

/**
 * Creates a local date key to group task completions by calendar day.
 * @param date - Date to normalize.
 * @returns Local YYYY-MM-DD string.
 */
function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/**
 * Calculates a real consecutive completion streak from recorded completion timestamps.
 * @param tasks - Todo records, including completedAt.
 * @param now - Current date, injectable for deterministic tests.
 * @returns Consecutive day count ending today or yesterday.
 */
export function calculateTaskCompletionStreak(tasks: readonly OverviewTaskRecord[], now: Date = new Date()): number {
  const doneDays = new Set(
    tasks.filter((task) => task.completed === true && task.deleted !== true && typeof task.completedAt === 'number')
      .map((task) => localDateKey(new Date(task.completedAt as number))),
  );
  if (doneDays.size === 0) return 0;
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!doneDays.has(localDateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (doneDays.has(localDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/**
 * Builds a 7-day completion series from real task completion records.
 * @param tasks - Todo records, including completedAt.
 * @param now - Current date, injectable for deterministic tests.
 * @returns Last seven calendar days in chronological order; missing activity is zero, not synthesized.
 */
export function buildWeeklyCompletionActivity(tasks: readonly OverviewTaskRecord[], now: Date = new Date()): WeeklyCompletionPoint[] {
  const weekdayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    const dayKey = localDateKey(date);
    const value = tasks.filter((task) =>
      task.completed === true &&
      task.deleted !== true &&
      typeof task.completedAt === 'number' &&
      localDateKey(new Date(task.completedAt)) === dayKey,
    ).length;
    return { label: weekdayLabels[date.getDay()], value, isCurrent: dayKey === localDateKey(today) };
  });
}
