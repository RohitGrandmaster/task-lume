/**
 * RESPONSIBILITY: Canonical telemetry sanitizer stripping PII and credentials prior to logging/dispatch (Rule 18).
 * FLOW: Recursively scans objects and masks sensitive keys (password, token, secret, auth, pin, ssn).
 */

const SENSITIVE_KEY_PATTERN = /password|token|secret|authorization|api[-_]?key|credit[-_]?card|pin|cvv/i;

export function sanitizeTelemetry(data: unknown): unknown {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeTelemetry);
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (SENSITIVE_KEY_PATTERN.test(key)) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeTelemetry(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

export default sanitizeTelemetry;
