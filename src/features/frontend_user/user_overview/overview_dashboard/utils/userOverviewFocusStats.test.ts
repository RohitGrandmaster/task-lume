/**
 * RESPONSIBILITY: Verifies overview focus metrics against real stored-session fields.
 * FLOW: Jest feeds deterministic records to the pure calculation helper; no native storage is accessed.
 */

import { calculateUserOverviewFocusStats, getOverviewDateKey } from './userOverviewFocusStats';

describe('calculateUserOverviewFocusStats', () => {
  it('counts work sessions, excludes breaks, and calculates the current consecutive-day streak', () => {
    const now = new Date(2026, 9, 25, 12, 0, 0);
    const today = getOverviewDateKey(now);
    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const twoDaysAgoDate = new Date(now);
    twoDaysAgoDate.setDate(twoDaysAgoDate.getDate() - 2);

    const result = calculateUserOverviewFocusStats([
      { mode: 'work', durationMinutes: 25, dateKey: today },
      { mode: 'shortBreak', durationMinutes: 5, dateKey: today },
      { mode: 'focus', durationMinutes: 30, dateKey: getOverviewDateKey(yesterdayDate) },
      { mode: 'work', durationMinutes: 15, dateKey: getOverviewDateKey(twoDaysAgoDate) },
    ], now);

    expect(result).toEqual({
      totalFocusMinutes: 70,
      todayFocusMinutes: 25,
      currentFocusStreak: 3,
    });
  });

  it('returns zero values when there is no saved focus history', () => {
    expect(calculateUserOverviewFocusStats([], new Date(2026, 9, 25))).toEqual({
      totalFocusMinutes: 0,
      todayFocusMinutes: 0,
      currentFocusStreak: 0,
    });
  });

  it('does not include the previous streak after a gap of two days', () => {
    const now = new Date(2026, 9, 25, 12, 0, 0);
    const twoDaysAgoDate = new Date(now);
    twoDaysAgoDate.setDate(twoDaysAgoDate.getDate() - 2);
    expect(calculateUserOverviewFocusStats([
      { mode: 'work', durationMinutes: 20, dateKey: getOverviewDateKey(twoDaysAgoDate) },
    ], now).currentFocusStreak).toBe(0);
  });
});
