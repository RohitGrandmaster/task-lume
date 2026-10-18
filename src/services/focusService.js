import {getItem, setItem} from '../storage/storage';

export const FOCUS_SESSIONS_STORAGE_KEY = '@todomaster/focus_sessions_history';
const MAX_SAVED_SESSIONS = 100;

/**
 * Format a date object to YYYY-MM-DD
 */
export function getFocusDateKey(date = new Date()) {
  const d = new Date(date);
  const pad = v => String(v).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * Load all recorded focus sessions
 */
export async function getFocusSessions() {
  try {
    const list = await getItem(FOCUS_SESSIONS_STORAGE_KEY, []);
    return Array.isArray(list) ? list : [];
  } catch (error) {
    console.warn('Failed to load focus sessions:', error);
    return [];
  }
}

/**
 * Save a newly completed focus session
 */
export async function recordFocusSession(session) {
  try {
    const current = await getFocusSessions();
    const newSession = {
      id: session.id || `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      mode: session.mode || 'work',
      durationMinutes: Number(session.durationMinutes) || 25,
      taskTitle: session.taskTitle || null,
      taskId: session.taskId || null,
      preset: session.preset || 'classic',
      completedAt: session.completedAt || new Date().toISOString(),
      dateKey: getFocusDateKey(session.completedAt ? new Date(session.completedAt) : new Date()),
    };

    const updated = [newSession, ...current].slice(0, MAX_SAVED_SESSIONS);
    await setItem(FOCUS_SESSIONS_STORAGE_KEY, updated);
    return updated;
  } catch (error) {
    console.warn('Failed to save focus session:', error);
    return [];
  }
}

/**
 * Clear focus sessions history
 */
export async function clearFocusSessions() {
  try {
    await setItem(FOCUS_SESSIONS_STORAGE_KEY, []);
    return true;
  } catch (error) {
    console.warn('Failed to clear focus sessions:', error);
    return false;
  }
}

/**
 * Calculate aggregated focus statistics
 */
export function calculateFocusStats(sessions = []) {
  const todayKey = getFocusDateKey(new Date());

  // Only count 'work' / 'focus' sessions toward focus time
  const focusOnly = sessions.filter(
    s => s.mode === 'work' || s.mode === 'focus' || !s.mode,
  );

  let totalMinutes = 0;
  let todayMinutes = 0;
  let todaySessionsCount = 0;
  let weekMinutes = 0;

  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Group by day for streak calculation
  const daySet = new Set();

  focusOnly.forEach(s => {
    const mins = Number(s.durationMinutes) || 0;
    totalMinutes += mins;

    const sDate = s.completedAt ? new Date(s.completedAt) : null;
    const sDateKey = s.dateKey || (sDate ? getFocusDateKey(sDate) : null);

    if (sDateKey) {
      daySet.add(sDateKey);
    }

    if (sDateKey === todayKey) {
      todayMinutes += mins;
      todaySessionsCount += 1;
    }

    if (sDate && sDate >= oneWeekAgo) {
      weekMinutes += mins;
    }
  });

  // Calculate consecutive days streak
  let streak = 0;
  const checkDate = new Date(now);

  // Check if today or yesterday has a session
  const checkKey = getFocusDateKey(checkDate);
  if (!daySet.has(checkKey)) {
    // If not today, check yesterday before declaring 0 streak
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (daySet.has(getFocusDateKey(checkDate))) {
    streak += 1;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  const avgMinutesPerSession =
    focusOnly.length > 0
      ? Math.round(totalMinutes / focusOnly.length)
      : 0;

  return {
    totalSessions: focusOnly.length,
    totalMinutes,
    totalHours: (totalMinutes / 60).toFixed(1),
    todaySessionsCount,
    todayMinutes,
    weekMinutes,
    avgMinutesPerSession,
    streak,
    recentSessions: sessions.slice(0, 10),
  };
}
