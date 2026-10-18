import {
  recordFocusSession,
  getFocusSessions,
  clearFocusSessions,
  calculateFocusStats,
  getFocusDateKey,
} from '../src/services/focusService';

describe('Focus Service & Session Analytics', () => {
  beforeEach(async () => {
    await clearFocusSessions();
  });

  it('getFocusDateKey formats dates as YYYY-MM-DD', () => {
    const testDate = new Date(2026, 4, 15); // May 15, 2026
    expect(getFocusDateKey(testDate)).toBe('2026-05-15');
  });

  it('records a new focus session and retrieves it', async () => {
    const session = {
      mode: 'work',
      durationMinutes: 25,
      taskTitle: 'Unit Test Task',
      preset: 'classic',
    };

    const savedList = await recordFocusSession(session);
    expect(savedList.length).toBe(1);
    expect(savedList[0].taskTitle).toBe('Unit Test Task');
    expect(savedList[0].durationMinutes).toBe(25);

    const retrieved = await getFocusSessions();
    expect(retrieved.length).toBe(1);
    expect(retrieved[0].id).toBeDefined();
  });

  it('calculates focus statistics correctly', () => {
    const today = new Date();
    const todayKey = getFocusDateKey(today);

    const sessions = [
      {
        id: '1',
        mode: 'work',
        durationMinutes: 25,
        dateKey: todayKey,
        completedAt: today.toISOString(),
      },
      {
        id: '2',
        mode: 'work',
        durationMinutes: 50,
        dateKey: todayKey,
        completedAt: today.toISOString(),
      },
      {
        id: '3',
        mode: 'break',
        durationMinutes: 5,
        dateKey: todayKey,
        completedAt: today.toISOString(),
      },
    ];

    const stats = calculateFocusStats(sessions);

    // Only work sessions counted toward focus time
    expect(stats.totalSessions).toBe(2);
    expect(stats.totalMinutes).toBe(75);
    expect(stats.totalHours).toBe('1.3');
    expect(stats.todayMinutes).toBe(75);
    expect(stats.todaySessionsCount).toBe(2);
    expect(stats.streak).toBeGreaterThanOrEqual(1);
  });

  it('handles empty sessions safely', () => {
    const stats = calculateFocusStats([]);
    expect(stats.totalSessions).toBe(0);
    expect(stats.totalMinutes).toBe(0);
    expect(stats.totalHours).toBe('0.0');
    expect(stats.todayMinutes).toBe(0);
    expect(stats.streak).toBe(0);
  });

  it('clears all sessions when requested', async () => {
    await recordFocusSession({durationMinutes: 25, mode: 'work'});
    const beforeClear = await getFocusSessions();
    expect(beforeClear.length).toBe(1);

    await clearFocusSessions();
    const afterClear = await getFocusSessions();
    expect(afterClear.length).toBe(0);
  });
});
