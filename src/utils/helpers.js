import {parseTaskDueDate} from './dateUtils';

let idCounter = 0;

/**
 * Produce a collision-resistant local identifier without relying on crypto APIs
 * that may be unavailable in some React Native runtimes. String IDs are already
 * supported by task lookups and notification IDs.
 */
function createId() {
  idCounter = (idCounter + 1) % 0x1000000;
  const time = Date.now().toString(36);
  const sequence = idCounter.toString(36).padStart(5, '0');
  const entropy = Array.from({length: 4}, () =>
    Math.floor(Math.random() * 0x1000000).toString(36).padStart(5, '0'),
  ).join('');
  return `task-${time}-${sequence}-${entropy}`;
}

const TRASH_RETENTION_DAYS = 30;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

/**
 * Purge only deleted tasks with a known deletion timestamp older than the
 * retention window. Legacy trash entries without deletedAt are preserved.
 */
function purgeExpiredTrash(tasks, now = Date.now(), retentionDays = TRASH_RETENTION_DAYS) {
  if (!Array.isArray(tasks)) return [];
  const retentionMs = Math.max(1, Number(retentionDays) || TRASH_RETENTION_DAYS) * DAY_IN_MS;
  return tasks.filter(task => {
    if (!task || task.deleted !== true) return true;
    const deletedAt = Number(task.deletedAt);
    if (!Number.isFinite(deletedAt) || deletedAt <= 0) return true;
    return now - deletedAt < retentionMs;
  });
}

function calculateTodoStats(tasks) {
  // Trash items ignore
  const list = tasks.filter(task => !task.deleted);

  const total = list.length;

  const completed = list.filter(
    task => task.completed,
  ).length;

  const active = total - completed;

  const highPriority = list.filter(
    task =>
      task.priority === 'high' &&
      !task.completed,
  ).length;

  const now = new Date();
  const dueToday = list.filter(task => {
    const dueDate =
      Number.isFinite(task.dueDateTimestamp) && task.dueDateTimestamp > 0
        ? new Date(task.dueDateTimestamp)
        : parseTaskDueDate(task.dueDate);
    return Boolean(dueDate) &&
      dueDate.getFullYear() === now.getFullYear() &&
      dueDate.getMonth() === now.getMonth() &&
      dueDate.getDate() === now.getDate() &&
      !task.completed;
  });

  const favorites = list.filter(
    task => task.favorite,
  ).length;

  const completionPercentage =
    total === 0
      ? 0
      : Math.round((completed / total) * 100);

  return {
    total,
    completed,
    active,
    highPriority,
    dueToday,
    favorites,
    completionPercentage,
  };
}

export {
  createId,
  calculateTodoStats,
  purgeExpiredTrash,
  TRASH_RETENTION_DAYS,
};
