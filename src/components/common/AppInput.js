import {LocalizedText, LocalizedTextInput} from '../../i18n/LocalizedText';
import {
  View,
  Pressable,
  StyleSheet
} from 'react-native';

import useTheme from '../../hooks/useTheme';

function AppInput({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  multiline = false,
  maxLength,
  rightLabel,
  onRightPress,
  error,
}) {
  const {theme} = useTheme();

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      {label ? (
        <View style={styles.labelRow}>
          <LocalizedText style={styles.label}>
            {label}
          </LocalizedText>

          {rightLabel ? (
            <Pressable onPress={onRightPress}>
              <LocalizedText style={styles.rightLabel}>
                {rightLabel}
              </LocalizedText>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <LocalizedTextInput
        style={[
          styles.input,
          multiline && styles.textArea,
          error && styles.inputError,
        ]}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textLight}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        multiline={multiline}
        maxLength={maxLength}
        textAlignVertical={
          multiline ? 'top' : 'center'
        }
      />

      {error ? (
        <LocalizedText style={styles.error}>
          {error}
        </LocalizedText>
      ) : null}
    </View>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    container: {
      width: '100%',
      marginBottom: theme.spacing.lg,
    },

    labelRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },

    label: {
      fontSize: theme.typography.bodySmall,
      fontWeight: '700',
      color: theme.colors.text,
    },

    rightLabel: {
      fontSize: theme.typography.caption,
      fontWeight: '700',
      color: theme.colors.primary,
    },

    input: {
      minHeight: 52,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.lg,
      paddingHorizontal: theme.spacing.lg,
      fontSize: theme.typography.body,
      color: theme.colors.text,
      backgroundColor: theme.colors.surface,
    },

    textArea: {
      minHeight: 130,
      paddingTop: theme.spacing.lg,
    },

    inputError: {
      borderColor: theme.colors.danger,
    },

    error: {
      marginTop: theme.spacing.xs,
      fontSize: theme.typography.caption,
      lineHeight: 18,
      color: theme.colors.danger,
    },
  });
}

export default AppInput;