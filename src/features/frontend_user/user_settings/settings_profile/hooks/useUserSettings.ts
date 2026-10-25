/**
 * RESPONSIBILITY: Provides profile summary, preference toggles and device lock state (≤150 lines).
 * FLOW: Manages user preferences, appearance, security PIN, and real data backup actions.
 */

import { useCallback, useMemo } from 'react';
import { useUserSettingsStore } from '../state/user_settings.store';
import { useSettings } from '../../../../../context/SettingsContext';
import { useAppLock } from '../../../../../context/AppLockContext';
import { useTodoContext } from '../../../../../context/TodoContext';
import useAuth from '../../../../../hooks/useAuth';
import { showToast } from '../../../../../core/toast/showToast';
import { useUserSettingsData } from './useUserSettingsData';
import { calculateTaskCompletionStreak, type SettingsTaskSummary } from '../utils/userSettingsTaskStats';


export function useUserSettings() {
  const store = useUserSettingsStore();
  const settingsCtx = useSettings() as any;
  const appLock = useAppLock() as any;
  const todoCtx = useTodoContext() as any;
  const dataActions = useUserSettingsData();
  const auth = useAuth() as any;

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
    settings: settingsCtx?.settings || {},
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
    exportData: dataActions.exportData,
    importData: dataActions.importData,
    clearCompleted: dataActions.clearCompleted,
    clearTrash: dataActions.clearTrash,
  };
}

