/**
 * RESPONSIBILITY: Appearance and Theme configuration section for User Settings.
 * FLOW: Toggles dark/light theme and displays active Luxury Gold color scheme.
 */

import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { Moon, Sparkles } from 'lucide-react-native';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';
import { useThemeContext } from '../../../../../core/theme/ThemeProvider';
import { triggerLightImpact } from '../../../../../core/interaction/haptics';

export function UserSettingsAppearanceSection() {
  const tokens = useThemeTokens();
  const { isDarkMode, toggleTheme } = useThemeContext();

  const handleToggle = () => {
    triggerLightImpact();
    toggleTheme();
  };

  const styles = StyleSheet.create({
    section: {
      backgroundColor: tokens.color.card,
      borderRadius: tokens.radius.lg,
      borderWidth: 1,
      borderColor: tokens.color.border,
      marginBottom: tokens.space[4],
      overflow: 'hidden',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: tokens.space[4],
    },
    leftContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: tokens.space[3],
    },
    label: {
      ...tokens.typography.body,
      color: tokens.color.foreground,
      fontWeight: '600',
    },
    sublabel: {
      ...tokens.typography.bodySm,
      color: tokens.color.muted,
      marginTop: 2,
    },
    badge: {
      backgroundColor: tokens.color.primarySubtle,
      paddingHorizontal: tokens.space[2],
      paddingVertical: 2,
      borderRadius: tokens.radius.sm,
      borderWidth: 1,
      borderColor: tokens.color.primary,
    },
    badgeText: {
      ...tokens.typography.labelUppercase,
      fontSize: 10,
      color: tokens.color.primaryText,
      fontWeight: '700',
    },
  });

  return (
    <View style={styles.section}>
      <View style={styles.row}>
        <View style={styles.leftContent}>
          <Moon size={20} color={tokens.color.primary} />
          <View>
            <Text style={styles.label}>Dark Appearance</Text>
            <Text style={styles.sublabel}>Luxury Gold Theme</Text>
          </View>
        </View>
        <Switch
          value={isDarkMode}
          onValueChange={handleToggle}
          trackColor={{ false: tokens.color.border, true: tokens.color.primary }}
          thumbColor={tokens.color.foreground}
          accessibilityLabel="Toggle Dark Theme"
        />
      </View>
    </View>
  );
}
