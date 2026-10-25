/**
 * RESPONSIBILITY: Canonical feature hook for User Settings & Profile (≤150 lines).
 * FLOW: Manages user preferences, appearance, security PIN, and real data backup actions.
 */

import { useCallback, useMemo } from 'react';
import { Share } from 'react-native';
import { useUserSettingsStore } from '../state/user_settings.store';
import { useSettings } from '../../../../../context/SettingsContext';
import { useAppLock } from '../../../../../context/AppLockContext';
import { useTodoContext } from '../../../../../context/TodoContext';
import useAuth from '../../../../../hooks/useAuth';
import { showToast } from '../../../../../core/toast/showToast';
import type { BackupRestoreMode, BackupTask } from '../types/user_settings.types';


interface SettingsTaskSummary {
  id: string | number;
  title?: string;
  completed?: boolean;
  deleted?: boolean;
  completedAt?: number | null;
  [key: string]: unknown;
}

/**
 * Formats a local calendar date as a stable date-key for streak calculations.
 * @param date - Date to normalize.
 * @returns Local YYYY-MM-DD key.
 */
function localDayKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculates consecutive days from persisted task completion timestamps.
 * @param tasks - Task records with completion state and timestamps.
 * @param now - Current clock value, injectable for deterministic tests.
 * @returns Number of consecutive days ending today or yesterday.
 */
export function calculateTaskCompletionStreak(tasks: readonly SettingsTaskSummary[], now: Date = new Date()): number {
  const completedDays = new Set(
    tasks.filter((task) => task.completed === true && task.deleted !== true && typeof task.completedAt === 'number')
      .map((task) => localDayKey(new Date(task.completedAt as number))),
  );
  if (completedDays.size === 0) return 0;
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!completedDays.has(localDayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (completedDays.has(localDayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function useUserSettings() {
  const store = useUserSettingsStore();
  const settingsCtx = useSettings();
  const appLock = useAppLock();
  const todoCtx = useTodoContext();
  const auth = useAuth();

  const tasks = (todoCtx?.tasks ?? []) as SettingsTaskSummary[];
  const completedTasks = useMemo(() => tasks.filter((task) => task.completed === true && task.deleted !== true).length, [tasks]);
  const activeTasks = useMemo(() => tasks.filter((task) => task.completed !== true && task.deleted !== true).length, [tasks]);
  const streakDays = useMemo(() => calculateTaskCompletionStreak(tasks), [tasks]);

  const toggleAppLock = useCallback(async () => {
    if (!appLock) return;
    if (appLock.isLockEnabled) {
      const ok = await appLock.disableDeviceLock();
      if (ok) showToast('App Lock disabled', 'info');
    } else {
      const ok = await appLock.enableDeviceLock();
      if (ok) showToast('App Lock enabled with biometrics', 'success');
    }
  }, [appLock]);

  const updateProfile = useCallback(async (data: { name: string; email: string; phone: string }): Promise<boolean> => {
    if (!auth?.updateProfile) {
      showToast('Profile update is unavailable in this app session.', 'error', 'user_settings:profile:unavailable');
      return false;
    }
    try {
      await auth.updateProfile(data.name, data.phone, data.email);
      return true;
    } catch {
      showToast('Profile changes could not be saved.', 'error', 'user_settings:profile:failed');
      return false;
    }
  }, [auth]);

  const exportData = useCallback(async (): Promise<boolean> => {
    try {
      const backup = { appName: 'TaskLume', version: '1.0', exportedAt: new Date().toISOString(), tasks };
      const result = await Share.share({ title: 'TaskLume task backup', message: JSON.stringify(backup, null, 2) });
      if (result.action === Share.sharedAction) {
        showToast('Task backup shared successfully.', 'success', 'user_settings:backup:shared');
        return true;
      }
      return false;
    } catch {
      showToast('Task backup could not be shared.', 'error', 'user_settings:backup:failed');
      return false;
    }
  }, [tasks]);

  const importData = useCallback(async (importedTasks: BackupTask[], mode: BackupRestoreMode): Promise<boolean> => {
    if (!Array.isArray(importedTasks) || importedTasks.length === 0) {
      showToast('Choose a valid backup containing at least one task.', 'error', 'user_settings:restore:invalid');
      return false;
    }
    if (!todoCtx?.importTodos) {
      showToast('Task restore is unavailable in the current app session.', 'error', 'user_settings:restore:unavailable');
      return false;
    }
    try {
      await todoCtx.importTodos(importedTasks, mode);
      showToast(`${importedTasks.length} task(s) restored.`, 'success', `user_settings:restore:${mode}`);
      return true;
    } catch {
      showToast('Task restore could not be completed.', 'error', 'user_settings:restore:failed');
      return false;
    }
  }, [todoCtx]);

  const clearCompleted = useCallback(() => {
    const completedIds = tasks.filter((task) => task.completed === true && task.deleted !== true).map((task) => String(task.id));
    if (completedIds.length === 0) {
      showToast('There are no completed tasks to clear.', 'info', 'user_settings:completed:empty');
      return;
    }
    if (!todoCtx?.batchPermanentlyDelete) {
      showToast('Completed tasks could not be cleared.', 'error', 'user_settings:completed:unavailable');
      return;
    }
    // Permanently delete only completed task IDs; never invoke the host's all-task clear operation.
    todoCtx.batchPermanentlyDelete(completedIds);
    showToast('Completed tasks cleared.', 'success', 'user_settings:completed:cleared');
  }, [todoCtx, tasks]);

  const clearTrash = useCallback(() => {
    const trashIds = tasks.filter((task) => task.deleted === true).map((task) => String(task.id));
    if (trashIds.length === 0) {
      showToast('Trash is already empty.', 'info', 'user_settings:trash:empty');
      return;
    }
    if (!todoCtx?.batchPermanentlyDelete) {
      showToast('Trash could not be emptied.', 'error', 'user_settings:trash:unavailable');
      return;
    }
    todoCtx.batchPermanentlyDelete(trashIds);
    showToast('Trash emptied permanently.', 'success', 'user_settings:trash:cleared');
  }, [todoCtx, tasks]);

  const toggleHaptics = useCallback(() => {
    if (settingsCtx) {
      const next = !settingsCtx.hapticsEnabled;
      settingsCtx.updateSetting('hapticsEnabled', next);
      showToast(next ? 'Haptic feedback on' : 'Haptic feedback off', 'info');
    }
  }, [settingsCtx]);

  const toggleNotifications = useCallback(() => {
    if (settingsCtx) {
      const next = !settingsCtx.notificationsEnabled;
      settingsCtx.updateSetting('notificationsEnabled', next);
      showToast(next ? 'Notifications enabled' : 'Notifications disabled', 'info');
    }
  }, [settingsCtx]);

  const toggleReminders = useCallback(() => {
    if (settingsCtx) {
      const next = !settingsCtx.remindersEnabled;
      settingsCtx.updateSetting('remindersEnabled', next);
      showToast(next ? 'Reminders enabled' : 'Reminders disabled', 'info');
    }
  }, [settingsCtx]);

  return {
    settings: settingsCtx?.settings || store.settings,
    hapticsEnabled: settingsCtx?.hapticsEnabled ?? true,
    notificationsEnabled: settingsCtx?.notificationsEnabled ?? true,
    remindersEnabled: settingsCtx?.remindersEnabled ?? true,
    toggleHaptics,
    toggleNotifications,
    toggleReminders,
    profile: {
      name: auth?.user?.name || '',
      email: auth?.user?.email || '',
      phone: auth?.user?.mobile || '',
      completedTasks,
      activeTasks,
      streakDays,
    },
    isLockEnabled: appLock?.isLockEnabled ?? false,
    toggleAppLock,
    updateProfile,
    exportData,
    importData,
    clearCompleted,
    clearTrash,
  };
}

