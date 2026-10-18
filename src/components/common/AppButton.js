import {
  ActivityIndicator,
  Pressable,
  Text,
  StyleSheet,
} from 'react-native';

import useTheme from '../../hooks/useTheme';

function AppButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
}) {
  const {theme} = useTheme();
  const styles = createStyles(theme);
  const isDisabled = disabled || loading;

  return (
    <Pressable
      style={({pressed}) => [
        styles.button,
        styles[`${variant}Button`],
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{disabled: isDisabled}}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === 'secondary' || variant === 'ghost'
              ? theme.colors.primary
              : theme.colors.white
          }
        />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text`]]}>{title}</Text>
      )}
    </Pressable>
  );
}

function createStyles(theme) {
  const isDark = theme.mode === 'dark';

  return StyleSheet.create({
    button: {
      minHeight: 48,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 18,
    },

    primaryButton: {
      backgroundColor: theme.colors.primary,
    },

    secondaryButton: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
      borderWidth: 1.5,
      borderColor: theme.colors.border,
    },

    dangerButton: {
      backgroundColor: theme.colors.danger,
    },

    ghostButton: {
      backgroundColor: 'transparent',
    },

    text: {
      fontSize: 15,
      fontWeight: '700',
      letterSpacing: 0.15,
    },

    primaryText: {
      color: theme.colors.white,
    },

    secondaryText: {
      color: theme.colors.text,
    },

    dangerText: {
      color: theme.colors.white,
    },

    ghostText: {
      color: theme.colors.primary,
    },

    pressed: {
      opacity: 0.82,
    },

    disabled: {
      opacity: 0.48,
    },
  });
}

export default AppButton;
