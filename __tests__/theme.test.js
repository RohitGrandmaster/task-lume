import createTheme from '../src/theme';
import {THEME_PALETTES} from '../src/constants/colors';

describe('Theme System', () => {
  it('creates light theme by default', () => {
    const theme = createTheme('light', 'indigo');
    expect(theme.mode).toBe('light');
    expect(theme.colors.background).toBeDefined();
    expect(theme.colors.surface).toBeDefined();
    expect(theme.colors.primary).toBeDefined();
    expect(theme.spacing).toBeDefined();
    expect(theme.radius).toBeDefined();
  });

  it('creates dark theme with appropriate contrast', () => {
    const theme = createTheme('dark', 'indigo');
    expect(theme.mode).toBe('dark');
    expect(theme.colors.background).toBe('#0B0F1A');
    expect(theme.colors.surface).toBe('#151A2D');
    expect(theme.colors.text).toBe('#F1F5F9');
  });

  it('supports accent palettes', () => {
    THEME_PALETTES.forEach(palette => {
      const lightTheme = createTheme('light', palette.id);
      expect(lightTheme.accentId).toBe(palette.id);
      expect(lightTheme.colors.primary).toBe(palette.light);

      const darkTheme = createTheme('dark', palette.id);
      expect(darkTheme.colors.primary).toBe(palette.dark);
    });
  });

  it('falls back to default palette if accentId is invalid', () => {
    const theme = createTheme('light', 'non-existent-palette');
    expect(theme.accentId).toBe(THEME_PALETTES[0].id);
  });
});
