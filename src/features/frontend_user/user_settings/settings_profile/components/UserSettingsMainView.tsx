/**
 * RESPONSIBILITY: Master Main View for User Settings screen (≤200 lines).
 * FLOW: Composes Profile Card, Appearance, Security, Data Management, and Navigation Links sections.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useThemeTokens } from '../../../../core/theme/useThemeTokens';
import { UserSettingsProfileCard } from './UserSettingsProfileCard';
import { UserSettingsAppearanceSection } from './UserSettingsAppearanceSection';
import { UserSettingsSecuritySection } from './UserSettingsSecuritySection';
import { UserSettingsDataSection } from './UserSettingsDataSection';
import { UserSettingsLinksSection } from './UserSettingsLinksSection';

interface UserSettingsMainViewProps {
  userName: string;
  userEmail: string;
  isLockEnabled: boolean;
  onToggleLock: () => void;
  onOpenProfile: () => void;
  onOpenFaq: () => void;
  onOpenFeedback: () => void;
  onOpenMoreApps: () => void;
  onOpenAbout: () => void;
  onExportData: () => void;
  onImportData: () => void;
  onClearCompleted: () => void;
  onResetAllData: () => void;
}

export function UserSettingsMainView({
  userName,
  userEmail,
  isLockEnabled,
  onToggleLock,
  onOpenProfile,
  onOpenFaq,
  onOpenFeedback,
  onOpenMoreApps,
  onOpenAbout,
  onExportData,
  onImportData,
  onClearCompleted,
  onResetAllData,
}: UserSettingsMainViewProps) {
  const tokens = useThemeTokens();

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
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Preferences & Security</Text>
      </View>

      <UserSettingsProfileCard
        name={userName}
        email={userEmail}
        onPress={onOpenProfile}
      />

      <UserSettingsAppearanceSection />

      <UserSettingsSecuritySection
        isLockEnabled={isLockEnabled}
        onToggleLock={onToggleLock}
      />

      <UserSettingsDataSection
        onExport={onExportData}
        onImport={onImportData}
        onClearCompleted={onClearCompleted}
        onResetAll={onResetAllData}
      />

      <UserSettingsLinksSection
        onOpenFaq={onOpenFaq}
        onOpenFeedback={onOpenFeedback}
        onOpenMoreApps={onOpenMoreApps}
        onOpenAbout={onOpenAbout}
      />

      <View style={styles.footer}>
        <Text style={styles.version}>TaskLume Native · Version 1.0.0 (Build 42)</Text>
      </View>
    </ScrollView>
  );
}
