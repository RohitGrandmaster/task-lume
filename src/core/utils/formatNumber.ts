/**
 * RESPONSIBILITY: Canonical locale-aware number formatting primitive (≤120 lines).
 * FLOW: Consumed across features to format counts, metrics, and KPI values consistently.
 */

/**
 * Formats a number with locale-aware separators.
 * @param value - Numeric value or string representation of a number
 * @param locale - BCP 47 language tag (defaults to 'en-US')
 */
export function formatNumber(value: number | string | null | undefined, locale: string = 'en-US'): string {
  if (value === null || value === undefined) {
    return '0';
  }

  const num = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(num)) {
    return '0';
  }

  try {
    return new Intl.NumberFormat(locale).format(num);
  } catch {
    return num.toLocaleString();
  }
}

/**
 * Formats a number as a localized percentage string.
 * @param value - Fraction value (0.75) or whole percentage
 * @param isFraction - True if value is a 0..1 fraction
 * @param locale - BCP 47 language tag (defaults to 'en-US')
 */
export function formatPercent(
  value: number | string | null | undefined,
  isFraction: boolean = true,
  locale: string = 'en-US'
): string {
  if (value === null || value === undefined) {
    return '0%';
  }

  const num = typeof value === 'number' ? value : Number(value);
  if (Number.isNaN(num)) {
    return '0%';
  }

  const percentage = isFraction ? num : num / 100;

  try {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      maximumFractionDigits: 1,
    }).format(percentage);
  } catch {
    return `${Math.round(isFraction ? num * 100 : num)}%`;
  }
}
