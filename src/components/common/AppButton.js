import {LocalizedText} from '../../i18n/LocalizedText';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet
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

        pressed &&
          !isDisabled &&
          styles.pressed,

        isDisabled &&
          styles.disabled,
      ]}
      onPress={onPress}
      disabled={isDisabled}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={theme.colors.white}
        />
      ) : (
        <LocalizedText
          style={[
            styles.text,
            styles[`${variant}Text`],
          ]}>
          {title}
        </LocalizedText>
      )}
    </Pressable>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    button: {
      minHeight: 52,
      borderRadius: theme.radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.xl,
    },

    primaryButton: {
      backgroundColor: theme.colors.primary,
    },

    secondaryButton: {
      backgroundColor: theme.colors.border,
    },

    dangerButton: {
      backgroundColor: theme.colors.danger,
    },

    ghostButton: {
      backgroundColor: 'transparent',
    },

    text: {
      fontSize: theme.typography.body,
      fontWeight: '700',
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
      opacity: 0.5,
    },
  });
}

export default AppButton;