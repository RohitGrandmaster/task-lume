/**
 * RESPONSIBILITY: Behavioral tests for real-data overview streak and weekly completion calculations.
 * FLOW: Provide timestamped tasks → assert that only actual non-deleted completions contribute.
 */
import {
  buildWeeklyCompletionActivity,
  calculateTaskCompletionStreak,
  type OverviewTaskRecord,
} from './userOverviewAnalytics';

describe('user overview task analytics', () => {
  it('calculates streak from persisted completion dates only', () => {
    const today = new Date(2026, 9, 25, 13);
    const tasks: OverviewTaskRecord[] = [
      { id: 'today', completed: true, completedAt: today.getTime() },
      { id: 'yesterday', completed: true, completedAt: new Date(2026, 9, 24, 13).getTime() },
      { id: 'previous', completed: true, completedAt: new Date(2026, 9, 23, 13).getTime() },
      { id: 'deleted', completed: true, deleted: true, completedAt: today.getTime() },
      { id: 'no-date', completed: true },
    ];
    expect(calculateTaskCompletionStreak(tasks, today)).toBe(3);
    expect(calculateTaskCompletionStreak([], today)).toBe(0);
  });

  it('reports actual weekly completion counts and zero for days without records', () => {
    const today = new Date(2026, 9, 25, 13);
    const tasks: OverviewTaskRecord[] = [
      { id: 'today-1', completed: true, completedAt: today.getTime() },
      { id: 'today-2', completed: true, completedAt: new Date(2026, 9, 25, 15).getTime() },
      { id: 'yesterday', completed: true, completedAt: new Date(2026, 9, 24, 8).getTime() },
      { id: 'active', completed: false, completedAt: today.getTime() },
    ];
    const points = buildWeeklyCompletionActivity(tasks, today);
    expect(points).toHaveLength(7);
    expect(points[5].value).toBe(1);
    expect(points[6].value).toBe(2);
    expect(points[6].isCurrent).toBe(true);
    expect(points.slice(0, 5).every((point) => point.value === 0)).toBe(true);
  });
});
