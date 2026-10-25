/**
 * RESPONSIBILITY: Profile management view for user settings (≤200 lines).
 * FLOW: Displays profile avatar, editable name/email/phone, and delegates stats to UserProfileStatsCards.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { User, ArrowLeft } from 'lucide-react-native';
import { UserProfileStatsCards } from './UserProfileStatsCards';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';
import { useTranslation } from '../../../../../core/i18n/useTranslation';
import { UserProfileEditForm } from './UserProfileEditForm';
import { getMinTouchTarget } from '../../../../../core/theme/getMinTouchTarget';
import { triggerLightImpact } from '../../../../../core/interaction/haptics';

interface UserProfileMainViewProps {
  initialName: string;
  initialEmail: string;
  initialPhone?: string;
  completedTasks: number;
  activeTasks: number;
  streakDays: number;
  onSaveProfile: (profile: { name: string; email: string; phone: string }) => Promise<boolean>;
  onBack?: () => void;
}

export function UserProfileMainView({
  initialName,
  initialEmail,
  initialPhone = '',
  completedTasks,
  activeTasks,
  streakDays,
  onSaveProfile,
  onBack,
}: UserProfileMainViewProps) {
  const tokens = useThemeTokens();
  const { t } = useTranslation();
  const minTarget = getMinTouchTarget();
  const [name, setName] = useState(initialName);
  useEffect(() => setName(initialName), [initialName]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: tokens.color.background,
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: tokens.space[4],
      gap: tokens.space[2],
    },
    backButton: {
      width: minTarget,
      height: minTarget,
      borderRadius: tokens.radius.md,
      backgroundColor: tokens.color.card,
      borderWidth: 1,
      borderColor: tokens.color.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pageTitle: {
      ...tokens.typography.headingLg,
      color: tokens.color.foreground,
    },
    avatarSection: {
      alignItems: 'center',
      marginBottom: tokens.space[5],
    },
    avatarCircle: {
      width: tokens.layout.fabSize + tokens.space[6],
      height: tokens.layout.fabSize + tokens.space[6],
      borderRadius: tokens.radius.full,
      backgroundColor: tokens.color.primarySubtle,
      borderWidth: 2,
      borderColor: tokens.color.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: tokens.space[2],
    },
    title: {
      ...tokens.typography.headingSm,
      color: tokens.color.foreground,
    },
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: tokens.space[4], paddingBottom: tokens.space[9] }}>
      <View style={styles.topBar}>
        {onBack ? (
          <Pressable
            style={styles.backButton}
            onPress={() => {
              triggerLightImpact();
              onBack();
            }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}
          >
            <ArrowLeft size={20} color={tokens.color.foreground} strokeWidth={2.2} />
          </Pressable>
        ) : null}
        <Text style={styles.pageTitle}>{t('user_settings_profile.PROFILE_TITLE')}</Text>
      </View>
      <View style={styles.avatarSection}>
        <View style={styles.avatarCircle}>
          <User size={tokens.icon.lg} color={tokens.color.primary} />
        </View>
        <Text style={styles.title}>{name}</Text>
      </View>

      <UserProfileStatsCards
        completedTasks={completedTasks}
        activeTasks={activeTasks}
        streakDays={streakDays}
      />

      <UserProfileEditForm
        initialName={initialName}
        initialEmail={initialEmail}
        initialPhone={initialPhone}
        onNameChange={setName}
        onSaveProfile={onSaveProfile}
      />
    </ScrollView>
  );
}
