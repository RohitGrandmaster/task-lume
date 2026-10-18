/**
 * Recurrence helpers for Tasklume
 *
 * Supported rules:
 *  - none
 *  - daily
 *  - weekly
 *  - monthly
 *
 * dueDate is stored as ISO YYYY-MM-DD or "No date".
 */

export const RECURRENCE_OPTIONS = [
  {key: 'none', label: 'Does not repeat'},
  {key: 'daily', label: 'Daily'},
  {key: 'weekly', label: 'Weekly'},
  {key: 'monthly', label: 'Monthly'},
];

const pad = v => String(v).padStart(2, '0');

export function toDateKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}`;
}

export function parseDueDate(dueDate) {
  if (!dueDate || dueDate === 'No date' || dueDate === 'no date') {
    return null;
  }

  const dd = String(dueDate).trim();
  const lower = dd.toLowerCase();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (lower === 'today') return today;
  if (lower === 'tomorrow') {
    const t = new Date(today);
    t.setDate(t.getDate() + 1);
    return t;
  }
  if (lower === 'next week' || lower === 'nextweek') {
    const t = new Date(today);
    t.setDate(t.getDate() + 7);
    return t;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(dd)) {
    const [y, m, d] = dd.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  const parsed = new Date(dd);
  if (!isNaN(parsed.getTime())) {
    return new Date(
      parsed.getFullYear(),
      parsed.getMonth(),
      parsed.getDate(),
    );
  }

  return null;
}

/**
 * Compute the next due date after completing a recurring task.
 * Falls back to tomorrow / +7 days / +1 month from today if no valid dueDate.
 */
export function getNextDueDate(currentDueDate, recurrence) {
  if (!recurrence || recurrence === 'none') return null;

  const base = parseDueDate(currentDueDate) || new Date();
  // Advance from the later of base and today so we never schedule in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = base < today ? today : base;

  const next = new Date(start);

  switch (recurrence) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'monthly': {
      const day = next.getDate();
      next.setMonth(next.getMonth() + 1);
      // Handle month overflow (e.g. Jan 31 → Feb)
      if (next.getDate() !== day) {
        next.setDate(0); // last day of previous month
      }
      break;
    }
    default:
      return null;
  }

  return toDateKey(next);
}

export function getRecurrenceLabel(recurrence) {
  const found = RECURRENCE_OPTIONS.find(o => o.key === recurrence);
  return found ? found.label : 'Does not repeat';
}

export function isRecurring(todo) {
  return Boolean(todo?.recurrence && todo.recurrence !== 'none');
}
