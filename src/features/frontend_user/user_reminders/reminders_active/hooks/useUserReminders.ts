/**
 * RESPONSIBILITY: Canonical feature hook for User Active Reminders (≤150 lines).
 * FLOW: Filters reminders by active status and manages alarm snooze logic.
 */

import { useMemo, useCallback } from 'react';
import { useTodoContext } from '../../../../../context/TodoContext';
import { showToast } from '../../../../../core/toast/showToast';

export function useUserReminders() {
  const { tasks, updateTodo, toggleTodoReminder } = useTodoContext();

  const activeReminders = useMemo(() => {
    return (tasks || []).filter((t: any) => t.reminder && !t.completed && !t.deleted);
  }, [tasks]);

  const snoozeReminder = useCallback((id: string, minutes: number) => {
    const task = (tasks || []).find((item: any) => String(item.id) === String(id));
    if (!task || !updateTodo || !Number.isFinite(minutes) || minutes <= 0) {
      showToast('This reminder could not be snoozed', 'error', `reminder-snooze-failed-${id}`);
      return false;
    }

    const snoozedUntil = Date.now() + Math.round(minutes) * 60 * 1000;
    updateTodo(String(task.id), {
      reminder: true,
      snoozedUntil,
    });
    showToast(
      `Reminder snoozed for ${Math.round(minutes)} minutes`,
      'success',
      `reminder-snooze-${task.id}`,
    );
    return true;
  }, [tasks, updateTodo]);

  return {
    reminders: activeReminders,
    snoozeReminder,
    toggleTodoReminder,
  };
}
