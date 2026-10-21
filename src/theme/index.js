import colors, {THEME_PALETTES} from '../constants/colors';

const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

const typography = {
  title: 32,
  heading: 24,
  subheading: 20,
  body: 16,
  bodySmall: 14,
  caption: 12,
};

const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  round: 999,
};

const shadows = {
  card: {
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  elevated: {
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
  },
  soft: {
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
};

function createTheme(mode = 'light', accentId = 'blue') {
  const baseColors = colors[mode] || colors.light;
  const palette =
    THEME_PALETTES.find(p => p.id === accentId) || THEME_PALETTES[0];

  const primaryColor = mode === 'dark' ? palette.dark : palette.light;
  const primarySoft =
    mode === 'dark' ? `${palette.dark}2E` : `${palette.light}1F`;

  return {
    mode,
    accentId: palette.id,
    colors: {
      ...baseColors,
      primary: primaryColor,
      primarySoft: primarySoft,
    },
    spacing,
    typography,
    radius,
    shadows,
  };
}

export default createTheme;
