/**
 * RESPONSIBILITY: Selects active reminders and reschedules snoozed reminders through the host task store.
 * FLOW: UserRemindersScreen → useUserReminders → TodoContext.updateTodo → scheduleTodoReminder.
 */
import { useMemo, useCallback } from 'react';
import { useTodoContext } from '../../../../../context/TodoContext';
import { showToast } from '../../../../../core/toast/showToast';
import type { ReminderTaskEntity } from '../types/user_reminders.types';

type ReminderTaskWithDueTime = ReminderTaskEntity & { dueTime?: string | null };

/**
 * Lists active reminders and updates the reminder date/time when the user snoozes one.
 * @returns Active reminders and an action that reschedules an existing reminder.
 * @sideEffects Updates the host task context; its updateTodo path reschedules native notifications.
 */
export function useUserReminders() {
  const todoCtx = useTodoContext();
  const tasks = (todoCtx?.tasks ?? []) as ReminderTaskWithDueTime[];

  const activeReminders = useMemo(
    () => tasks.filter((task) => (task.reminder || task.dueTime) && !task.completed && !task.deleted),
    [tasks],
  );

  const snoozeReminder = useCallback((id: string, minutes: number) => {
    const task = tasks.find((item) => String(item.id) === String(id));
    if (!task || !todoCtx?.updateTodo) {
      showToast('Reminder could not be rescheduled.', 'error', `user_reminders:snooze:unavailable:${id}`);
      return;
    }
    if (!Number.isFinite(minutes) || minutes < 1) {
      showToast('Choose a valid snooze interval.', 'error', `user_reminders:snooze:invalid:${id}`);
      return;
    }

    const target = new Date(Date.now() + Math.ceil(minutes) * 60_000);
    const dueDate = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}`;
    const reminderTime = `${String(target.getHours()).padStart(2, '0')}:${String(target.getMinutes()).padStart(2, '0')}`;

    try {
      todoCtx.updateTodo(id, { dueDate, reminderTime, reminder: true });
      showToast(
        'Reminder time updated.',
        'success',
        `user_reminders:snooze:${id}:${dueDate}:${reminderTime}`,
      );
    } catch {
      showToast('Reminder could not be rescheduled.', 'error', `user_reminders:snooze:failed:${id}`);
    }
  }, [tasks, todoCtx]);

  return { reminders: activeReminders, snoozeReminder };
}
