/**
 * RESPONSIBILITY: User preferences section for sound, haptics, and notifications (≤200 lines).
 * FLOW: Toggles system feedback and reminder alerts with active theme tokens.
 */

import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { Vibrate, Bell, Clock } from 'lucide-react-native';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';
import { getMinTouchTarget } from '../../../../../core/theme/getMinTouchTarget';
import { triggerLightImpact } from '../../../../../core/interaction/haptics';

interface UserSettingsPreferencesSectionProps {
  hapticsEnabled: boolean;
  notificationsEnabled: boolean;
  remindersEnabled: boolean;
  onToggleHaptics: () => void;
  onToggleNotifications: () => void;
  onToggleReminders: () => void;
}

export function UserSettingsPreferencesSection({
  hapticsEnabled,
  notificationsEnabled,
  remindersEnabled,
  onToggleHaptics,
  onToggleNotifications,
  onToggleReminders,
}: UserSettingsPreferencesSectionProps) {
  const tokens = useThemeTokens();
  const minTarget = getMinTouchTarget();

  const handleToggle = (action: () => void) => {
    triggerLightImpact();
    action();
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
      minHeight: minTarget,
      borderBottomWidth: 1,
      borderBottomColor: tokens.color.border,
    },
    lastRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: tokens.space[4],
      minHeight: minTarget,
    },
    leftContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: tokens.space[3],
    },
    label: {
      ...tokens.typography.body,
      color: tokens.color.foreground,
      fontWeight: '500',
    },
  });

  return (
    <View style={styles.section}>
      <View style={styles.row}>
        <View style={styles.leftContent}>
          <Vibrate size={18} color={tokens.color.primary} />
          <Text style={styles.label}>Haptic Feedback</Text>
        </View>
        <Switch
          value={hapticsEnabled}
          onValueChange={() => handleToggle(onToggleHaptics)}
          trackColor={{ false: tokens.color.border, true: tokens.color.primary }}
          thumbColor={tokens.color.foreground}
          accessibilityLabel="Toggle Haptic Feedback"
        />
      </View>

      <View style={styles.row}>
        <View style={styles.leftContent}>
          <Bell size={18} color={tokens.color.primary} />
          <Text style={styles.label}>Push Notifications</Text>
        </View>
        <Switch
          value={notificationsEnabled}
          onValueChange={() => handleToggle(onToggleNotifications)}
          trackColor={{ false: tokens.color.border, true: tokens.color.primary }}
          thumbColor={tokens.color.foreground}
          accessibilityLabel="Toggle Notifications"
        />
      </View>

      <View style={styles.lastRow}>
        <View style={styles.leftContent}>
          <Clock size={18} color={tokens.color.primary} />
          <Text style={styles.label}>Task Reminders & Alarms</Text>
        </View>
        <Switch
          value={remindersEnabled}
          onValueChange={() => handleToggle(onToggleReminders)}
          trackColor={{ false: tokens.color.border, true: tokens.color.primary }}
          thumbColor={tokens.color.foreground}
          accessibilityLabel="Toggle Reminders"
        />
      </View>
    </View>
  );
}
