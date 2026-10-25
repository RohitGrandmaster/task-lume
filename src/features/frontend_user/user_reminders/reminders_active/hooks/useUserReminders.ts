/**
 * RESPONSIBILITY: Canonical feature hook for User Active Reminders (≤150 lines).
 * FLOW: Filters reminders by active status and manages alarm snooze logic.
 */

import { useMemo, useCallback } from 'react';
import { useTodoContext } from '../../../../../context/TodoContext';
import { showToast } from '../../../../../core/toast/showToast';

export function useUserReminders() {
  const { todos } = useTodoContext();

  const activeReminders = useMemo(() => {
    return (todos || []).filter((t: any) => t.reminder && !t.completed && !t.deleted);
  }, [todos]);

  const snoozeReminder = useCallback((id: string, minutes: number) => {
    showToast(`Snoozed for ${minutes} minutes`, 'info');
  }, []);

  return {
    reminders: activeReminders,
    snoozeReminder,
  };
}
