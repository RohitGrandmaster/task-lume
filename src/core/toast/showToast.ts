/**
 * RESPONSIBILITY: Canonical deduplicated toast emitter for the mobile application (≤120 lines).
 * FLOW: Consumed across features to display transient feedback with stable dedupKey per Rule 40.
 */

import Toast from 'react-native-toast-message';

export type ToastType = 'success' | 'error' | 'info';

const recentToasts = new Map<string, number>();
const DEDUP_WINDOW_MS = 2500;

/**
 * Emits a deduplicated toast notification.
 * @param message - User-facing text to display
 * @param type - Severity type ('success' | 'error' | 'info')
 * @param dedupKey - Stable identifier preventing stacked duplicate toasts
 */
export function showToast(
  message: string,
  type: ToastType = 'info',
  dedupKey?: string
): void {
  const key = dedupKey || `${type}:${message}`;
  const now = Date.now();
  const lastEmitted = recentToasts.get(key) || 0;

  if (now - lastEmitted < DEDUP_WINDOW_MS) {
    return; // Suppress duplicate toast within debounce window
  }

  recentToasts.set(key, now);

  Toast.show({
    type,
    text1: message,
    position: 'bottom',
    visibilityTime: 3000,
    autoHide: true,
    bottomOffset: 60,
  });
}
