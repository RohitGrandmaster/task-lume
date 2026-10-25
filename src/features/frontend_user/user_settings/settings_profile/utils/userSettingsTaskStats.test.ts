/**
 * RESPONSIBILITY: Tests pure Settings task selectors and completion-streak calculations.
 * FLOW: Supply representative task records → assert only eligible IDs and recorded dates are counted.
 */
import {
  calculateTaskCompletionStreak,
  selectCompletedTaskIds,
  selectTrashedTaskIds,
  type SettingsTaskSummary,
} from './userSettingsTaskStats';

describe('Settings task data helpers', () => {
  it('selects only completed tasks that are not already in Trash', () => {
    const tasks: SettingsTaskSummary[] = [
      { id: 'done-1', completed: true, deleted: false },
      { id: 'active-1', completed: false, deleted: false },
      { id: 'trashed-done', completed: true, deleted: true },
    ];
    expect(selectCompletedTaskIds(tasks)).toEqual(['done-1']);
  });

  it('selects only tasks already in Trash', () => {
    const tasks: SettingsTaskSummary[] = [
      { id: 'active-1', completed: false, deleted: false },
      { id: 'trashed-1', completed: false, deleted: true },
      { id: 'trashed-2', completed: true, deleted: true },
    ];
    expect(selectTrashedTaskIds(tasks)).toEqual(['trashed-1', 'trashed-2']);
  });

  it('computes streak from actual completedAt dates, not total completed count', () => {
    const today = new Date(2026, 9, 25, 12, 0, 0);
    const yesterday = new Date(2026, 9, 24, 12, 0, 0);
    const dayBefore = new Date(2026, 9, 23, 12, 0, 0);
    const tasks: SettingsTaskSummary[] = [
      { id: '1', completed: true, deleted: false, completedAt: today.getTime() },
      { id: '2', completed: true, deleted: false, completedAt: yesterday.getTime() },
      { id: '3', completed: true, deleted: false, completedAt: dayBefore.getTime() },
      { id: 'trash', completed: true, deleted: true, completedAt: today.getTime() },
    ];
    expect(calculateTaskCompletionStreak(tasks, today)).toBe(3);
    expect(calculateTaskCompletionStreak([], today)).toBe(0);
  });
});
