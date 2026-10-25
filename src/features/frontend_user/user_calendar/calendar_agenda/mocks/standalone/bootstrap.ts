/**
 * RESPONSIBILITY: Standalone bootstrap entry point for UserCalendar (≤120 lines).
 * FLOW: Configures mock network interceptors, seeds initial test fixtures, and mounts harness.
 */

import { UserCalendarHarness } from '../../tests/harness/UserCalendarHarness';

export function bootstrapUserCalendar() {
  return {
    mount: UserCalendarHarness,
    status: 'READY',
  };
}
