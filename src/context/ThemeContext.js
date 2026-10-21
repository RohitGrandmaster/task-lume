import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import createTheme from '../theme';
import {THEME_PALETTES} from '../constants/colors';
import {
  getItem,
  setItem,
} from '../storage/storage';

import APP_CONFIG from '../constants/appConfig';

const THEME_ACCENT_KEY = '@todomaster/accent_color';

const ThemeContext = createContext(null);

function ThemeProvider({children}) {
  const [mode, setMode] = useState('light');
  const [accentColor, setAccentColor] = useState('blue');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTheme() {
      try {
        const savedMode = await getItem(
          APP_CONFIG.STORAGE_KEYS.THEME,
          'light',
        );

        if (savedMode === 'dark' || savedMode === 'light') {
          setMode(savedMode);
        }

        const savedAccent = await getItem(THEME_ACCENT_KEY, 'blue');
        if (typeof savedAccent === 'string' && THEME_PALETTES.some(p => p.id === savedAccent)) {
          setAccentColor(savedAccent);
        }
      } catch (_) {}

      setLoading(false);
    }

    loadTheme();
  }, []);

  useEffect(() => {
    if (!loading) {
      setItem(
        APP_CONFIG.STORAGE_KEYS.THEME,
        mode,
      );
    }
  }, [mode, loading]);

  useEffect(() => {
    if (!loading) {
      setItem(THEME_ACCENT_KEY, accentColor);
    }
  }, [accentColor, loading]);

  const theme = useMemo(
    () => createTheme(mode, accentColor),
    [mode, accentColor],
  );

  function toggleTheme() {
    setMode(current =>
      current === 'light' ? 'dark' : 'light',
    );
  }

  function changeAccentColor(colorId) {
    if (THEME_PALETTES.some(p => p.id === colorId)) {
      setAccentColor(colorId);
    }
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        mode,
        toggleTheme,
        accentColor,
        setAccentColor: changeAccentColor,
        palettes: THEME_PALETTES,
        loading,
      }}>
      {children}
    </ThemeContext.Provider>
  );
}

function useThemeContext() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      'useThemeContext must be used inside ThemeProvider.',
    );
  }

  return context;
}

export {
  ThemeProvider,
  useThemeContext,
};