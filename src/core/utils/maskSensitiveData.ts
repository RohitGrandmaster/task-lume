/**
 * RESPONSIBILITY: Enterprise PII & Sensitive Financial Data Masking Utility (≤120 lines).
 * FLOW: Consumed by list cards, summaries, and telemetry sanitizers per Rule 30 to prevent raw PII exposure.
 */

export type MaskDataType = 'phone' | 'email' | 'account' | 'currency';

/**
 * Masks sensitive personal or financial data according to Rule 30.
 * @param value - The raw sensitive string or number
 * @param type - The data type classification ('phone' | 'email' | 'account' | 'currency')
 */
export function maskSensitiveData(value: string | number | null | undefined, type: MaskDataType = 'phone'): string {
  if (value === null || value === undefined) {
    return '—';
  }

  const str = String(value).trim();
  if (!str) {
    return '—';
  }

  switch (type) {
    case 'phone': {
      // Rule 30: show first 2 + last 4 digits (e.g., 98****2310)
      const digits = str.replace(/\D/g, '');
      if (digits.length <= 6) {
        return '******';
      }
      const first2 = digits.slice(0, 2);
      const last4 = digits.slice(-4);
      const stars = '*'.repeat(Math.max(4, digits.length - 6));
      return `${first2}${stars}${last4}`;
    }

    case 'email': {
      const parts = str.split('@');
      if (parts.length !== 2) {
        return '***@***.***';
      }
      const [name, domain] = parts;
      if (name.length <= 2) {
        return `${name[0]}***@${domain}`;
      }
      return `${name[0]}***${name[name.length - 1]}@${domain}`;
    }

    case 'account': {
      // Show last 4 digits only
      if (str.length <= 4) {
        return '****';
      }
      return `****${str.slice(-4)}`;
    }

    case 'currency': {
      return '••••••';
    }

    default:
      return '******';
  }
}
