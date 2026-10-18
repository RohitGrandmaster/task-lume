import { Vibration } from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

const map = {
  light: 'impactLight',
  medium: 'impactMedium',
  success: 'notificationSuccess',
  error: 'notificationError',
};

let _hapticsEnabled = true;

export const setHapticsEnabled = (enabled) => {
  _hapticsEnabled = Boolean(enabled);
};

export const isHapticsEnabled = () => _hapticsEnabled;

export const haptic = (type = 'light') => {
  if (!_hapticsEnabled) return;

  try {
    if (
      ReactNativeHapticFeedback &&
      typeof ReactNativeHapticFeedback.trigger === 'function'
    ) {
      ReactNativeHapticFeedback.trigger(map[type] ?? 'impactLight', {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
      });
      return;
    }
  } catch (_) {}

  // Safe fallback if native module fails or device doesn't support custom haptics
  try {
    Vibration.vibrate(type === 'light' ? 20 : 40);
  } catch (_) {}
};