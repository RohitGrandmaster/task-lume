/**
 * RESPONSIBILITY: Owns Settings task export, restore, and cleanup actions. No UI rendering lives here.
 * FLOW: UserSettingsDataSection → this hook → TodoContext data operations / native Share UI.
 */
import { useCallback } from 'react';
import { Share } from 'react-native';
import { useTodoContext } from '../../../../../context/TodoContext';
import { showToast } from '../../../../../core/toast/showToast';
import type { BackupRestoreMode, BackupTask } from '../types/user_settings.types';
import { selectCompletedTaskIds, selectTrashedTaskIds, type SettingsTaskSummary } from '../utils/userSettingsTaskStats';

/**
 * Provides confirmed task-data operations used by the Settings data-management section.
 * @returns Export/import handlers and cleanup actions that target the intended task subset.
 * @sideEffects Uses the operating-system Share UI and the host TodoContext.
 */
export function useUserSettingsData() {
  const todoCtx = useTodoContext();
  const tasks = (todoCtx?.tasks ?? []) as SettingsTaskSummary[];

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
    const ids = selectCompletedTaskIds(tasks);
    if (!ids.length) {
      showToast('There are no completed tasks to clear.', 'info', 'user_settings:completed:empty');
      return;
    }
    if (!todoCtx?.batchPermanentlyDelete) {
      showToast('Completed tasks could not be cleared.', 'error', 'user_settings:completed:unavailable');
      return;
    }
    // Delete only eligible IDs; the legacy clearTodos operation clears all tasks regardless of its argument.
    todoCtx.batchPermanentlyDelete(ids);
    showToast('Completed tasks cleared.', 'success', 'user_settings:completed:cleared');
  }, [todoCtx, tasks]);

  const clearTrash = useCallback(() => {
    const ids = selectTrashedTaskIds(tasks);
    if (!ids.length) {
      showToast('Trash is already empty.', 'info', 'user_settings:trash:empty');
      return;
    }
    if (!todoCtx?.batchPermanentlyDelete) {
      showToast('Trash could not be emptied.', 'error', 'user_settings:trash:unavailable');
      return;
    }
    todoCtx.batchPermanentlyDelete(ids);
    showToast('Trash emptied permanently.', 'success', 'user_settings:trash:cleared');
  }, [todoCtx, tasks]);

  return { exportData, importData, clearCompleted, clearTrash };
}
