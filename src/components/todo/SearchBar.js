import React from 'react';
import {
  View,
  TextInput,
  Pressable,
  Text,
  StyleSheet,
} from 'react-native';
import {Search, X, Layers} from 'lucide-react-native';
import useTheme from '../../hooks/useTheme';

function SearchBar({
  value,
  onChangeText,
  onClear,
  onOpenUnified,
}) {
  const {theme} = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <Pressable
        onPress={onOpenUnified}
        hitSlop={6}
        style={styles.searchIconBtn}
        accessibilityRole="button"
        accessibilityLabel="Open unified search">
        <Search
          size={18}
          color={theme.colors.primary}
          strokeWidth={2.4}
        />
      </Pressable>

      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder="Search todos or notes..."
        placeholderTextColor={theme.colors.textLight}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />

      {value ? (
        <Pressable
          style={styles.clearButton}
          onPress={onClear || (() => onChangeText(''))}
          hitSlop={8}
          accessibilityLabel="Clear search text">
          <X size={16} color={theme.colors.textSecondary} strokeWidth={2.4} />
        </Pressable>
      ) : null}

      {typeof onOpenUnified === 'function' ? (
        <Pressable
          onPress={onOpenUnified}
          style={styles.unifiedBtn}
          accessibilityRole="button"
          accessibilityLabel="Open unified search for todos and notes">
          <Layers size={13} color={theme.colors.primary} strokeWidth={2.4} />
          <Text style={styles.unifiedText}>All</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    container: {
      minHeight: 48,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.lg ?? 16,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 12,
      marginBottom: 10,
    },
    searchIconBtn: {
      padding: 4,
      marginRight: 4,
    },
    input: {
      flex: 1,
      minHeight: 48,
      paddingHorizontal: 6,
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text,
    },
    clearButton: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    unifiedBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius: 8,
      backgroundColor: `${theme.colors.primary}16`,
      marginLeft: 4,
    },
    unifiedText: {
      fontSize: 11,
      fontWeight: '800',
      color: theme.colors.primary,
      letterSpacing: 0.2,
    },
  });
}

export default SearchBar;