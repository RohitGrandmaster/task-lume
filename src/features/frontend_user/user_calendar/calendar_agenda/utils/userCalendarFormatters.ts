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
