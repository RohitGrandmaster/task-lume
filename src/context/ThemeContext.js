import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import colors, {THEME_PALETTES} from '../constants/colors';

const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 };
const typography = { title: 32, heading: 24, subheading: 20, body: 16, bodySmall: 14, caption: 12 };
const radius = { sm: 8, md: 12, lg: 16, xl: 20, xxl: 28, round: 999 };
const shadows = {
  card: { shadowColor: '#000000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 },
  elevated: { shadowColor: '#000000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 24, elevation: 10 },
  soft: { shadowColor: '#000000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
};

function createTheme(mode = 'light', accentId = 'blue') {
  const baseColors = colors[mode] || colors.light;
  const palette = THEME_PALETTES.find(p => p.id === accentId) || THEME_PALETTES[0];
  const primaryColor = mode === 'dark' ? palette.dark : palette.light;
  const primarySoft = mode === 'dark' ? `${palette.dark}2E` : `${palette.light}1F`;
  return {
    mode,
    accentId: palette.id,
    colors: { ...baseColors, primary: primaryColor, primarySoft },
    spacing,
    typography,
    radius,
    shadows,
  };
}
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