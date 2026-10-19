import {
  ActivityIndicator,
  Pressable,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import {useRef} from 'react';

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
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (isDisabled) return;
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 6,
    }).start();
  };

  return (
    <Animated.View style={{transform: [{scale}]}}>
      <Pressable
        style={[
          styles.button,
          styles[`${variant}Button`],
          isDisabled && styles.disabled,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
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
    </Animated.View>
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

    disabled: {
      opacity: 0.48,
    },
  });
}

export default AppButton;
