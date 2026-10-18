import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import {getItem, setItem} from '../storage/storage';
import {setHapticsEnabled} from '../utils/haptics';
import {setNotificationsEnabled, setReminderNotificationsEnabled} from '../utils/todoTimerNotifications';

export const SETTINGS_STORAGE_KEY = '@todomaster/settings';

const DEFAULT_SETTINGS = {
  notificationsEnabled: true,
  remindersEnabled: true,
  use24Hour: false,
  weekStartsMonday: false,
  hapticsEnabled: true,
  language: 'en',
  snoozeDuration: 10,
  swipeActionsEnabled: true,
};

const SettingsContext = createContext(null);

export function SettingsProvider({children}) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  // Load settings on startup
  useEffect(() => {
    async function load() {
      try {
        const saved = await getItem(SETTINGS_STORAGE_KEY, null);
        if (saved && typeof saved === 'object') {
          const merged = {...DEFAULT_SETTINGS, ...saved};
          setSettings(merged);
          setHapticsEnabled(merged.hapticsEnabled);
          setNotificationsEnabled(merged.notificationsEnabled);
          setReminderNotificationsEnabled(merged.remindersEnabled);
        } else {
          setHapticsEnabled(true);
          setNotificationsEnabled(true);
          setReminderNotificationsEnabled(true);
        }
      } catch (e) {
        console.log('[SettingsContext] load error:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Sync to haptics and notification services whenever they change
  useEffect(() => {
    if (!loading) {
      setHapticsEnabled(settings.hapticsEnabled);
      setNotificationsEnabled(settings.notificationsEnabled);
      setReminderNotificationsEnabled(settings.remindersEnabled);
      setItem(SETTINGS_STORAGE_KEY, settings).catch(() => {});
    }
  }, [settings, loading]);

  const updateSetting = useCallback((key, value) => {
    setSettings(prev => ({...prev, [key]: value}));
  }, []);

  const updateSettings = useCallback(patch => {
    setSettings(prev => ({...prev, ...patch}));
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        ...settings,
        updateSetting,
        updateSettings,
        loading,
      }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used inside SettingsProvider');
  }
  return ctx;
}

export default SettingsContext;
