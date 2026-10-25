/**
 * RESPONSIBILITY: Feature-local presentation formatters for calendar dates, agenda headers, and time ranges.
 * FLOW: Consumed by calendar agenda components and screens.
 */

export function formatCalendarDateHeader(dateStr: string): string {
  if (!dateStr) return '–';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

export function formatMonthYearHeader(year: number, monthIndex: number): string {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${monthNames[monthIndex] || ''} ${year}`;
}


/**
 * Converts a Date into a local-calendar date key without shifting to UTC.
 * @param date - Local date to format.
 * @returns Local YYYY-MM-DD string.
 */
export function formatCalendarDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
