/**
 * RESPONSIBILITY: Central Progressive Haptic Feedback Adapter.
 * FLOW: Called on significant state transitions (switches, submissions, completions, errors). Safely no-ops on failure.
 */

import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

const HAPTIC_OPTIONS = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

/**
 * Triggers light impact for minor interactive toggles.
 */
export function triggerLightImpact(): void {
  try {
    ReactNativeHapticFeedback.trigger('impactLight', HAPTIC_OPTIONS);
  } catch {
    // Safe no-op on unsupported hardware
  }
}

/**
 * Triggers medium impact for modal dismissals or secondary actions.
 */
export function triggerMediumImpact(): void {
  try {
    ReactNativeHapticFeedback.trigger('impactMedium', HAPTIC_OPTIONS);
  } catch {
    // Safe no-op on unsupported hardware
  }
}

/**
 * Triggers success haptic for completed forms, tasks, or wizard steps.
 */
export function triggerSuccessHaptic(): void {
  try {
    ReactNativeHapticFeedback.trigger('notificationSuccess', HAPTIC_OPTIONS);
  } catch {
    // Safe no-op on unsupported hardware
  }
}

/**
 * Triggers error/warning haptic for validation failures or destructive actions.
 */
export function triggerErrorHaptic(): void {
  try {
    ReactNativeHapticFeedback.trigger('notificationError', HAPTIC_OPTIONS);
  } catch {
    // Safe no-op on unsupported hardware
  }
}

export const triggerSuccessNotification = triggerSuccessHaptic;
export const triggerWarningNotification = triggerErrorHaptic;
export const triggerErrorNotification = triggerErrorHaptic;
