/**
 * RESPONSIBILITY: Main View component for the User Settings screen.
 * FLOW: Renders theme mode switch, Keychain biometrics lock toggle, notification controls, and legal/developer sheets.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Pressable } from 'react-native';
import { Moon, Shield, Bell, HelpCircle, ChevronRight, User } from 'lucide-react-native';
import { useThemeTokens } from '../../../../core/theme/useThemeTokens';
import { useThemeContext } from '../../../../core/theme/ThemeProvider';
import { getMinTouchTarget } from '../../../../core/theme/getMinTouchTarget';
import { triggerLightImpact } from '../../../../core/interaction/haptics';

interface UserSettingsMainViewProps {
  isLockEnabled: boolean;
  onToggleLock: () => void;
  notificationsEnabled: boolean;
  onToggleNotifications: () => void;
  onOpenLegal?: () => void;
}

export function UserSettingsMainView({
  isLockEnabled,
  onToggleLock,
  notificationsEnabled,
  onToggleNotifications,
  onOpenLegal,
}: UserSettingsMainViewProps) {
  const tokens = useThemeTokens();
  const { isDarkMode, toggleTheme } = useThemeContext();
  const minTarget = getMinTouchTarget();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: tokens.color.background,
    },
    scrollContent: {
      padding: tokens.space[4],
      paddingBottom: tokens.space[9],
    },
    header: {
      marginBottom: tokens.space[5],
    },
    title: {
      ...tokens.typography.headingLg,
      color: tokens.color.foreground,
      marginBottom: 2,
    },
    subtitle: {
      ...tokens.typography.bodySm,
      color: tokens.color.muted,
    },
    section: {
      backgroundColor: tokens.color.card,
      borderRadius: tokens.radius.lg,
      borderWidth: 1,
      borderColor: tokens.color.border,
      marginBottom: tokens.space[4],
      overflow: 'hidden',
    },
    sectionTitle: {
      ...tokens.typography.labelUppercase,
      color: tokens.color.muted,
      marginBottom: tokens.space[2],
      marginLeft: tokens.space[1],
    },
    row: {
      minHeight: minTarget,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: tokens.space[4],
      paddingVertical: tokens.space[3],
      borderBottomWidth: 1,
      borderBottomColor: tokens.color.border,
    },
    rowLast: {
      borderBottomWidth: 0,
    },
    rowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: tokens.space[3],
      flex: 1,
    },
    rowLabel: {
      ...tokens.typography.body,
      color: tokens.color.foreground,
    },
    rowSublabel: {
      ...tokens.typography.caption,
      color: tokens.color.muted,
      marginTop: 2,
    },
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Preferences & Security</Text>
      </View>

      <Text style={styles.sectionTitle}>APPEARANCE</Text>
      <View style={styles.section}>
        <View style={[styles.row, styles.rowLast]}>
          <View style={styles.rowLeft}>
            <Moon size={20} color={tokens.color.primary} />
            <View>
              <Text style={styles.rowLabel}>Dark Mode</Text>
              <Text style={styles.rowSublabel}>Luxury Premium Gold theme</Text>
            </View>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={() => {
              triggerLightImpact();
              toggleTheme();
            }}
            trackColor={{ false: tokens.color.border, true: tokens.color.primary }}
            thumbColor={isDarkMode ? tokens.color.onPrimary : tokens.color.card}
            accessibilityRole="switch"
            accessibilityLabel="Toggle dark mode"
          />
        </View>
      </View>

      <Text style={styles.sectionTitle}>SECURITY & PRIVACY</Text>
      <View style={styles.section}>
        <View style={[styles.row, styles.rowLast]}>
          <View style={styles.rowLeft}>
            <Shield size={20} color={tokens.color.primary} />
            <View>
              <Text style={styles.rowLabel}>App Lock (Biometrics)</Text>
              <Text style={styles.rowSublabel}>Hardware Keychain protection</Text>
            </View>
          </View>
          <Switch
            value={isLockEnabled}
            onValueChange={() => {
              triggerLightImpact();
              onToggleLock();
            }}
            trackColor={{ false: tokens.color.border, true: tokens.color.primary }}
            thumbColor={isLockEnabled ? tokens.color.onPrimary : tokens.color.card}
            accessibilityRole="switch"
            accessibilityLabel="Toggle biometric app lock"
          />
        </View>
      </View>

      <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>
      <View style={styles.section}>
        <View style={[styles.row, styles.rowLast]}>
          <View style={styles.rowLeft}>
            <Bell size={20} color={tokens.color.primary} />
            <View>
              <Text style={styles.rowLabel}>Task Reminders</Text>
              <Text style={styles.rowSublabel}>Foreground audio & background alerts</Text>
            </View>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={() => {
              triggerLightImpact();
              onToggleNotifications();
            }}
            trackColor={{ false: tokens.color.border, true: tokens.color.primary }}
            thumbColor={notificationsEnabled ? tokens.color.onPrimary : tokens.color.card}
            accessibilityRole="switch"
            accessibilityLabel="Toggle reminders"
          />
        </View>
      </View>

      <Text style={styles.sectionTitle}>ABOUT</Text>
      <View style={styles.section}>
        <Pressable
          style={[styles.row, styles.rowLast]}
          onPress={onOpenLegal}
          accessibilityRole="button"
          accessibilityLabel="Privacy Policy and Terms"
        >
          <View style={styles.rowLeft}>
            <HelpCircle size={20} color={tokens.color.muted} />
            <Text style={styles.rowLabel}>Privacy Policy & Terms</Text>
          </View>
          <ChevronRight size={18} color={tokens.color.muted} />
        </Pressable>
      </View>
    </ScrollView>
  );
}
