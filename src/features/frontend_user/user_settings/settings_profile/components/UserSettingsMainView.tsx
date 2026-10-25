/**
 * RESPONSIBILITY: Master Main View for User Settings screen (≤200 lines).
 * FLOW: Composes drawer header, Profile Card, Appearance, Security, Data Management, and Navigation Links sections.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Menu } from 'lucide-react-native';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';
import { getMinTouchTarget } from '../../../../../core/theme/getMinTouchTarget';
import { triggerLightImpact } from '../../../../../core/interaction/haptics';
import { UserSettingsProfileCard } from './UserSettingsProfileCard';
import { UserSettingsAppearanceSection } from './UserSettingsAppearanceSection';
import { UserSettingsPreferencesSection } from './UserSettingsPreferencesSection';
import { UserSettingsSecuritySection } from './UserSettingsSecuritySection';
import { UserSettingsDataSection } from './UserSettingsDataSection';
import { UserSettingsLinksSection } from './UserSettingsLinksSection';

interface UserSettingsMainViewProps {
  userName: string;
  userEmail: string;
  isLockEnabled: boolean;
  hapticsEnabled: boolean;
  notificationsEnabled: boolean;
  remindersEnabled: boolean;
  onToggleLock: () => void;
  onToggleHaptics: () => void;
  onToggleNotifications: () => void;
  onToggleReminders: () => void;
  onOpenProfile: () => void;
  onOpenFaq: () => void;
  onOpenFeedback: () => void;
  onOpenMoreApps: () => void;
  onOpenAbout: () => void;
  onExportData: () => void;
  onImportData: (tasks: unknown[]) => boolean | void | Promise<boolean | void>;
  onClearCompleted: () => void;
  onEmptyTrash: () => void;
  onOpenDrawer?: () => void;
}

export function UserSettingsMainView({
  userName,
  userEmail,
  isLockEnabled,
  hapticsEnabled,
  notificationsEnabled,
  remindersEnabled,
  onToggleLock,
  onToggleHaptics,
  onToggleNotifications,
  onToggleReminders,
  onOpenProfile,
  onOpenFaq,
  onOpenFeedback,
  onOpenMoreApps,
  onOpenAbout,
  onExportData,
  onImportData,
  onClearCompleted,
  onEmptyTrash,
  onOpenDrawer,
}: UserSettingsMainViewProps) {
  const tokens = useThemeTokens();
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
      marginBottom: tokens.space[4],
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconBtn: {
      width: minTarget,
      height: minTarget,
      borderRadius: tokens.radius.md,
      backgroundColor: tokens.color.card,
      borderWidth: 1,
      borderColor: tokens.color.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: tokens.space[3],
    },
    title: {
      ...tokens.typography.headingLg,
      color: tokens.color.foreground,
    },
    subtitle: {
      ...tokens.typography.bodySm,
      color: tokens.color.muted,
      marginTop: 2,
    },
    footer: {
      alignItems: 'center',
      marginTop: tokens.space[5],
      marginBottom: tokens.space[6],
    },
    version: {
      ...tokens.typography.caption,
      color: tokens.color.muted,
    },
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          {onOpenDrawer ? (
            <Pressable
              style={styles.iconBtn}
              onPress={() => {
                triggerLightImpact();
                onOpenDrawer();
              }}
              accessibilityRole="button"
              accessibilityLabel="Open navigation drawer"
              hitSlop={8}
            >
              <Menu size={20} color={tokens.color.foreground} strokeWidth={2.2} />
            </Pressable>
          ) : null}
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>Preferences & Security</Text>
          </View>
        </View>
      </View>

      <UserSettingsProfileCard
        name={userName}
        email={userEmail}
        onPress={onOpenProfile}
      />

      <UserSettingsAppearanceSection />

      <UserSettingsPreferencesSection
        hapticsEnabled={hapticsEnabled}
        notificationsEnabled={notificationsEnabled}
        remindersEnabled={remindersEnabled}
        onToggleHaptics={onToggleHaptics}
        onToggleNotifications={onToggleNotifications}
        onToggleReminders={onToggleReminders}
      />

      <UserSettingsSecuritySection
        isLockEnabled={isLockEnabled}
        onToggleLock={onToggleLock}
      />

      <UserSettingsDataSection
        onExport={onExportData}
        onImport={onImportData}
        onClearCompleted={onClearCompleted}
        onEmptyTrash={onEmptyTrash}
      />

      <UserSettingsLinksSection
        onOpenFeedback={onOpenFeedback}
        onOpenFaq={onOpenFaq}
        onOpenMoreApps={onOpenMoreApps}
        onOpenAbout={onOpenAbout}
      />

      <View style={styles.footer}>
        <Text style={styles.version}>Tasklume • v1.0.0</Text>
      </View>
    </ScrollView>
  );
}
