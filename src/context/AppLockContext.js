import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import {AppState} from 'react-native';
import * as Keychain from 'react-native-keychain';
import {getItem, setItem, removeItem} from '../storage/storage';

const AppLockContext = createContext(null);

const KEY_ENABLED = '@todomaster/app_lock_enabled';
const KEYCHAIN_SERVICE = 'com.todonative.applock';

export function AppLockProvider({children}) {
  const [isLockEnabled, setIsLockEnabled] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const appStateRef = useRef(AppState.currentState);

  // Authenticate using device's native fingerprint, face, or screen lock (Pattern/PIN)
  const authenticateWithDevice = useCallback(async () => {
    try {
      const creds = await Keychain.getGenericPassword({
        service: KEYCHAIN_SERVICE,
        authenticationPrompt: {
          title: 'Unlock Tasklume',
          subtitle: 'Use your fingerprint, face, or device screen lock',
          description: 'Confirm your identity to open the app',
          cancel: 'Cancel',
        },
        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE,
      });

      if (creds && creds.password) {
        setIsLocked(false);
        return true;
      }
      return false;
    } catch (error) {
      console.log('Biometric auth failed or dismissed', error);
      return false;
    }
  }, []);

  // Load initial lock status
  useEffect(() => {
    async function loadLockConfig() {
      try {
        const enabled = await getItem(KEY_ENABLED, false);
        if (enabled) {
          setIsLockEnabled(true);
          setIsLocked(true); // App starts in locked state
        } else {
          setIsLockEnabled(false);
          setIsLocked(false);
        }
      } catch (e) {
        console.warn('Failed to load app lock config', e);
      } finally {
        setLoading(false);
      }
    }
    loadLockConfig();
  }, []);

  // Auto-prompt device biometric on app start if locked
  useEffect(() => {
    if (isLockEnabled && isLocked) {
      const t = setTimeout(() => {
        authenticateWithDevice();
      }, 400);
      return () => clearTimeout(t);
    }
  }, [isLockEnabled, isLocked, authenticateWithDevice]);

  // Listen to AppState changes (background -> active)
  useEffect(() => {
    const sub = AppState.addEventListener('change', nextState => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextState === 'active'
      ) {
        // App resumed from background
        if (isLockEnabled) {
          setIsLocked(true);
        }
      }
      appStateRef.current = nextState;
    });

    return () => sub.remove();
  }, [isLockEnabled]);

  // Toggle App Lock ON using device lock
  const enableDeviceLock = useCallback(async () => {
    try {
      const res = await Keychain.setGenericPassword('device_user', 'app_locked', {
        service: KEYCHAIN_SERVICE,
        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE,
        // YAHAN SE 'storage: Keychain.STORAGE.KEYSTORE' WALI LINE HATA DI GAYI HAI
        authenticationPrompt: {
          title: 'Enable App Lock',
          subtitle: 'Authenticate to secure Tasklume',
          cancel: 'Cancel',
        },
      });

      if (res) {
        await setItem(KEY_ENABLED, true);
        setIsLockEnabled(true);
        setIsLocked(false);
        return true;
      }
      return false;
    } catch (error) {
      console.log('Failed to enable device lock:', error);
      // Error ko throw karein taaki SettingsScreen asli error dikha sake
      throw new Error(error.message || 'Device lock setup failed'); 
    }
  }, []);

  // Toggle App Lock OFF (verifies device credentials first)
  const disableDeviceLock = useCallback(async () => {
    try {
      const verified = await authenticateWithDevice();
      if (!verified) {
        return false;
      }

      await Keychain.resetGenericPassword({
        service: KEYCHAIN_SERVICE,
      });
      await removeItem(KEY_ENABLED);
      setIsLockEnabled(false);
      setIsLocked(false);
      return true;
    } catch (error) {
      console.log('Failed to disable device lock', error);
      return false;
    }
  }, [authenticateWithDevice]);

  return (
    <AppLockContext.Provider
      value={{
        isLockEnabled,
        isLocked,
        loading,
        authenticateWithDevice,
        enableDeviceLock,
        disableDeviceLock,
      }}>
      {children}
    </AppLockContext.Provider>
  );
}

export function useAppLock() {
  const context = useContext(AppLockContext);
  if (!context) {
    throw new Error('useAppLock must be used within an AppLockProvider');
  }
  return context;
}