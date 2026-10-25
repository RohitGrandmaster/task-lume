/**
 * RESPONSIBILITY: Pure filtering helpers for task clearing and 30-day Trash retention.
 * FLOW: Legacy TodoContext calls these functions before persisting task-list changes.
 */

export const TRASH_RETENTION_DAYS = 30;
export const TRASH_RETENTION_MS = TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000;

/**
 * Removes only expired items from a task collection; items without a deletion timestamp are preserved.
 *
 * @param todoList - Current normalized task list.
 * @param retentionDays - Number of days deleted records remain restorable.
 * @returns A new array with expired trash records excluded.
 */
export function purgeExpiredTrash(todoList, retentionDays = TRASH_RETENTION_DAYS) {
  const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
  return todoList.filter(task => {
    if (!task.deleted || !task.deletedAt) return true;
    return task.deletedAt > cutoff;
  });
}

/**
 * Selects the records requested by a clear action without mutating the source list.
 *
 * @param todoList - Current normalized task list.
 * @param scope - 'completed' preserves active and trashed tasks; 'all' selects every task.
 * @returns The records that the requested clear action is permitted to remove.
 */
export function selectTodosToClear(todoList, scope = 'all') {
  if (scope === 'completed') {
    return todoList.filter(task => task.completed && !task.deleted);
  }
  return todoList;
}
