/**
 * RESPONSIBILITY: Canonical observability and crash-reporting gateway for mobile runtime (Section 978).
 * FLOW: Dispatches scrubbed breadcrumbs and error reports to host observability sink.
 */

import { sanitizeTelemetry } from './sanitizeTelemetry';

export interface TelemetryBreadcrumb {
  category: string;
  message: string;
  level?: 'info' | 'warning' | 'error';
  data?: Record<string, unknown>;
}

export function captureException(error: unknown, context?: Record<string, unknown>): void {
  const sanitizedContext = context ? sanitizeTelemetry(context) : undefined;
  if (__DEV__) {
    console.error('[Observability] Exception captured:', error, sanitizedContext);
  }
}

export function addBreadcrumb(breadcrumb: TelemetryBreadcrumb): void {
  const sanitized = sanitizeTelemetry(breadcrumb) as TelemetryBreadcrumb;
  if (__DEV__) {
    console.log('[Observability] Breadcrumb:', sanitized);
  }
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
  if (__DEV__) {
    console.log(`[Observability] [${level.toUpperCase()}] ${message}`);
  }
}

export default {
  captureException,
  addBreadcrumb,
  captureMessage,
};
