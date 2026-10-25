/**
 * RESPONSIBILITY: Canonical 400 validation error transformer for forms and API responses (Rule 23, Section 976).
 * FLOW: Extracts field errors from backend error payloads or Zod validation errors and returns key-value error map.
 */

export interface ValidationErrorPayload {
  message?: string;
  errors?: Record<string, string | string[]> | Array<{ field: string; message: string }>;
}

export function handleValidationErrors(
  errorPayload: unknown
): Record<string, string> {
  const result: Record<string, string> = {};

  if (!errorPayload || typeof errorPayload !== 'object') {
    return result;
  }

  const payload = errorPayload as ValidationErrorPayload;

  if (Array.isArray(payload.errors)) {
    payload.errors.forEach((err) => {
      if (err.field && err.message) {
        result[err.field] = err.message;
      }
    });
    return result;
  }

  if (payload.errors && typeof payload.errors === 'object') {
    Object.entries(payload.errors).forEach(([field, msg]) => {
      if (Array.isArray(msg) && msg.length > 0) {
        result[field] = String(msg[0]);
      } else if (typeof msg === 'string') {
        result[field] = msg;
      }
    });
    return result;
  }

  if (payload.message) {
    result._root = payload.message;
  }

  return result;
}

export default handleValidationErrors;
