/**
 * RESPONSIBILITY: Enforces en-dash ('—') fallback display formatting for nullable or empty data fields.
 * FLOW: Consumed by list cards, detail views, and profile fields to prevent blank, 'null', or 'undefined' outputs.
 */

/**
 * Returns the provided value as string or the specified fallback (defaults to en-dash '—').
 * @param value - The input value to display
 * @param fallback - Fallback string if value is null, undefined, or empty string
 */
export function displayValue(value: unknown, fallback: string = '—'): string {
  if (value === null || value === undefined) {
    return fallback;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : fallback;
  }

  if (typeof value === 'number') {
    if (Number.isNaN(value)) {
      return fallback;
    }
    return String(value);
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  return String(value);
}
