/**
 * RESPONSIBILITY: Canonical feature hook for User Settings & Profile (≤150 lines).
 * FLOW: Manages user preferences, appearance, security PIN, and real data backup actions.
 */

import { useState, useCallback, useMemo } from 'react';
import { useUserSettingsStore } from '../state/user_settings.store';
import { useSettings } from '../../../../../context/SettingsContext';
import { useAppLock } from '../../../../../context/AppLockContext';
import { useTodoContext } from '../../../../../context/TodoContext';
import useAuth from '../../../../../hooks/useAuth';
import { showToast } from '../../../../../core/toast/showToast';

export function useUserSettings() {
  const store = useUserSettingsStore();
  const settingsCtx = useSettings();
  const appLock = useAppLock();
  const todoCtx = useTodoContext();
  const auth = useAuth();

  const tasks = todoCtx?.tasks || [];
  const completedTasks = useMemo(() => tasks.filter((t: any) => t.completed && !t.deleted).length, [tasks]);
  const activeTasks = useMemo(() => tasks.filter((t: any) => !t.completed && !t.deleted).length, [tasks]);

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

  const updateProfile = useCallback(async (data: { name: string; email: string; phone: string }) => {
    if (auth?.updateProfile) {
      await auth.updateProfile(data.name, data.phone, data.email);
    }
  }, [auth]);

  const exportData = useCallback(async () => {
    try {
      const json = JSON.stringify(tasks, null, 2);
      showToast(`${tasks.length} tasks exported successfully`, 'success');
      return json;
    } catch {
      showToast('Export failed', 'error');
    }
  }, [tasks]);

  const importData = useCallback(async (importedTasks?: any[]) => {
    try {
      if (!Array.isArray(importedTasks)) {
        showToast('Choose a valid backup before restoring', 'error', 'settings-restore-invalid-backup');
        return false;
      }
      if (todoCtx?.importTodos) {
        await todoCtx.importTodos(importedTasks);
        showToast('Tasks restored successfully', 'success', 'settings-restore-success');
        return true;
      }
      showToast('Backup restore is unavailable right now', 'error', 'settings-restore-unavailable');
      return false;
    } catch {
      showToast('Restore failed', 'error', 'settings-restore-failed');
      return false;
    }
  }, [todoCtx]);

  const clearCompleted = useCallback(() => {
    if (!todoCtx?.clearTodos) {
      showToast('Unable to clear completed tasks', 'error', 'settings-clear-completed-failed');
      return 0;
    }
    const removedCount = todoCtx.clearTodos('completed');
    showToast(
      removedCount > 0 ? `${removedCount} completed task(s) cleared` : 'There are no completed tasks to clear',
      removedCount > 0 ? 'success' : 'info',
      'settings-clear-completed',
    );
    return removedCount;
  }, [todoCtx]);

  const clearTrash = useCallback(() => {
    if (!todoCtx?.batchPermanentlyDelete) {
      showToast('Unable to empty trash right now', 'error', 'settings-clear-trash-failed');
      return 0;
    }
    const trashIds = tasks.filter((t: any) => t.deleted).map((t: any) => t.id);
    const removedCount = todoCtx.batchPermanentlyDelete(trashIds) || 0;
    showToast(
      removedCount > 0 ? `${removedCount} trashed task(s) permanently deleted` : 'Trash is already empty',
      removedCount > 0 ? 'success' : 'info',
      'settings-clear-trash',
    );
    return removedCount;
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
    settings: settingsCtx?.settings ?? ({ hapticsEnabled: store.hapticsEnabled, notificationsEnabled: store.notificationsEnabled, soundEnabled: store.soundEnabled, autoArchiveCompleted: store.autoArchiveCompleted }),
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
      streakDays: completedTasks > 0 ? Math.min(completedTasks, 7) : 0,
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

