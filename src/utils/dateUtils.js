const DAY_IN_MS = 24 * 60 * 60 * 1000;

function startOfLocalDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function validDate(year, month, day) {
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

export function parseTaskDueDate(dueDate, now = new Date()) {
  if (dueDate instanceof Date) {
    return Number.isNaN(dueDate.getTime()) ? null : startOfLocalDay(dueDate);
  }

  if (typeof dueDate === 'number') {
    const numericDate = new Date(dueDate);
    return Number.isNaN(numericDate.getTime()) ? null : startOfLocalDay(numericDate);
  }

  if (typeof dueDate !== 'string') return null;
  const value = dueDate.trim();
  if (!value || /^(no date|none|null|undefined)$/i.test(value)) return null;

  const today = startOfLocalDay(now);
  const lower = value.toLowerCase();

  if (lower === 'today') return today;
  if (lower === 'tomorrow') return new Date(today.getTime() + DAY_IN_MS);
  if (lower === 'next week' || lower === 'nextweek') {
    return new Date(today.getTime() + 7 * DAY_IN_MS);
  }

  if (lower === 'weekend') {
    const daysUntilSaturday = (6 - today.getDay() + 7) % 7 || 7;
    return new Date(today.getTime() + daysUntilSaturday * DAY_IN_MS);
  }

  // Keep ISO date-only values local to avoid timezone shifts.
  let match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) return validDate(Number(match[1]), Number(match[2]), Number(match[3]));

  // Legacy DD/MM/YYYY or DD-MM-YYYY values (app's default locale is India).
  match = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (match) {
    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
      return validDate(year, month, day);
    }
  }

  // Compatibility for legacy ISO timestamps and platform date labels.
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : startOfLocalDay(parsed);
}

export function toDateOnlyTimestamp(dueDate, now = new Date()) {
  const parsed = parseTaskDueDate(dueDate, now);
  return parsed ? parsed.getTime() : null;
}

function getTodayLabel() {
  return 'Today';
}

function getTomorrowLabel() {
  return 'Tomorrow';
}

function getNextWeekLabel() {
  return 'Next week';
}

function getDueDateOptions() {
  return [
    'No date',
    getTodayLabel(),
    getTomorrowLabel(),
    getNextWeekLabel(),
  ];
}

export {
  getTodayLabel,
  getTomorrowLabel,
  getNextWeekLabel,
  getDueDateOptions,
};
