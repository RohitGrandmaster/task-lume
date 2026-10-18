import {
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
} from 'react-native';

import useTheme from '../../hooks/useTheme';

function Loader({
  size = 'large',
  fullScreen = false,
  message,
}) {
  const {theme} = useTheme();
  const styles = createStyles(theme);

  return (
    <View
      style={[
        styles.container,
        fullScreen && styles.fullScreen,
      ]}>
      <View style={styles.inner}>
        <ActivityIndicator
          size={size}
          color={theme.colors.primary}
        />
        {message ? (
          <Text style={styles.message}>{message}</Text>
        ) : null}
      </View>
    </View>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.lg,
    },

    fullScreen: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },

    inner: {
      alignItems: 'center',
      gap: 14,
    },

    message: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      letterSpacing: 0.2,
    },
  });
}

export default Loader;
