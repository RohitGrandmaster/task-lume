/**
 * RESPONSIBILITY: Reads and aggregates the local focus-session history for the Overview domain.
 * FLOW: useUserOverview → this utility → local focus-history storage key used by Pomodoro.
 */

import { getItem } from '../../../../../storage/storage';

interface StoredFocusSession {
  mode?: string;
  durationMinutes?: number | string;
  completedAt?: string;
  dateKey?: string;
}

export interface UserOverviewFocusStats {
  totalFocusMinutes: number;
  todayFocusMinutes: number;
  currentFocusStreak: number;
}

/**
 * Returns an ISO-like local day key for consistent date grouping.
 *
 * @param value - A valid Date object.
 * @returns YYYY-MM-DD in local calendar time.
 */
export function getOverviewDateKey(value: Date): string {
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
}

/**
 * Aggregates persisted work sessions; breaks are not counted as focus time.
 *
 * @param sessions - Previously stored session records.
 * @param now - Clock value injected for deterministic unit testing.
 * @returns Total focus minutes, today's minutes, and the current consecutive-day focus streak.
 */
export function calculateUserOverviewFocusStats(
  sessions: StoredFocusSession[],
  now: Date = new Date(),
): UserOverviewFocusStats {
  const workSessions = sessions.filter((session) =>
    session.mode === 'work' || session.mode === 'focus' || !session.mode,
  );
  const todayKey = getOverviewDateKey(now);
  const sessionDayKeys = new Set<string>();
  let totalFocusMinutes = 0;
  let todayFocusMinutes = 0;

  workSessions.forEach((session) => {
    const parsedMinutes = Number(session.durationMinutes) || 0;
    const durationMinutes = Number.isFinite(parsedMinutes) && parsedMinutes > 0 ? parsedMinutes : 0;
    totalFocusMinutes += durationMinutes;
    const dateKey = session.dateKey || (session.completedAt && !Number.isNaN(Date.parse(session.completedAt))
      ? getOverviewDateKey(new Date(session.completedAt))
      : '');
    if (dateKey) sessionDayKeys.add(dateKey);
    if (dateKey === todayKey) todayFocusMinutes += durationMinutes;
  });

  const cursor = new Date(now);
  if (!sessionDayKeys.has(todayKey)) cursor.setDate(cursor.getDate() - 1);
  let currentFocusStreak = 0;
  while (sessionDayKeys.has(getOverviewDateKey(cursor))) {
    currentFocusStreak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return { totalFocusMinutes, todayFocusMinutes, currentFocusStreak };
}

/**
 * Loads focus records from the existing local storage key without fabricating metric values.
 *
 * @returns Aggregated local focus-session statistics, or zeros when history is empty/unreadable.
 */
export async function loadUserOverviewFocusStats(): Promise<UserOverviewFocusStats> {
  try {
    const records = await getItem('@todomaster/focus_sessions_history', []);
    return calculateUserOverviewFocusStats(Array.isArray(records) ? records : []);
  } catch {
    return { totalFocusMinutes: 0, todayFocusMinutes: 0, currentFocusStreak: 0 };
  }
}
