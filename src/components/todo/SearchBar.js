import {LocalizedText, LocalizedTextInput} from '../../i18n/LocalizedText';
import {
  View,
  Pressable,
  StyleSheet
} from 'react-native';

import useTheme from '../../hooks/useTheme';

function SearchBar({
  value,
  onChangeText,
  onClear,
}) {
  const {theme} = useTheme();

  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <LocalizedTextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder="Search todos..."
        placeholderTextColor={theme.colors.textLight}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />

      {value ? (
        <Pressable
          style={styles.clearButton}
          onPress={onClear}>
          <LocalizedText style={styles.clearText}>
            ×
          </LocalizedText>
        </Pressable>
      ) : null}
    </View>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    container: {
      minHeight: 52,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surface,
    },

    input: {
      flex: 1,
      minHeight: 52,
      paddingHorizontal: theme.spacing.lg,
      fontSize: theme.typography.body,
      color: theme.colors.text,
    },

    clearButton: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },

    clearText: {
      fontSize: 28,
      lineHeight: 30,
      color: theme.colors.textSecondary,
    },
  });
}

export default SearchBar;