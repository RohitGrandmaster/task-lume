/**
 * RESPONSIBILITY: Centralized timeout thresholds for network requests (Rule 23).
 * FLOW: Consumed by networkClient, query hooks, and background synchronizers.
 */

export const TIMEOUT_CONFIG = {
  DEFAULT_TIMEOUT_MS: 15_000,
  FAST_QUERY_TIMEOUT_MS: 8_000,
  MUTATION_TIMEOUT_MS: 20_000,
  FILE_UPLOAD_TIMEOUT_MS: 60_000,
  RETRY_COUNT: 2,
  RETRY_BACKOFF_BASE_MS: 1_000,
} as const;

export default TIMEOUT_CONFIG;
