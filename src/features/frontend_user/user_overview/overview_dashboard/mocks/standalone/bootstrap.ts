/**
 * RESPONSIBILITY: Standalone bootstrap entry point for UserOverview (≤120 lines).
 * FLOW: Configures mock network interceptors, seeds initial test fixtures, and mounts harness.
 */

import { UserOverviewHarness } from '../../tests/harness/UserOverviewHarness';

export function bootstrapUserOverview() {
  return {
    mount: UserOverviewHarness,
    status: 'READY',
  };
}
