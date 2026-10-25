/**
 * RESPONSIBILITY: Profile management view for user settings (≤200 lines).
 * FLOW: Displays profile avatar, editable name/email/phone, and productivity statistics.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable } from 'react-native';
import { User, Mail, Phone, CheckCircle2, Flame, Award } from 'lucide-react-native';
import { useThemeTokens } from '../../../../core/theme/useThemeTokens';
import { getMinTouchTarget } from '../../../../core/theme/getMinTouchTarget';
import { triggerSuccessNotification } from '../../../../core/interaction/haptics';

interface UserProfileMainViewProps {
  initialName: string;
  initialEmail: string;
  initialPhone?: string;
  completedTasks: number;
  activeTasks: number;
  streakDays: number;
  onSaveProfile: (profile: { name: string; email: string; phone: string }) => void;
}

export function UserProfileMainView({
  initialName,
  initialEmail,
  initialPhone = '',
  completedTasks,
  activeTasks,
  streakDays,
  onSaveProfile,
}: UserProfileMainViewProps) {
  const tokens = useThemeTokens();
  const minTarget = getMinTouchTarget();
  const [name, setName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState(initialPhone);

  const handleSave = () => {
    triggerSuccessNotification();
    onSaveProfile({ name, email, phone });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: tokens.color.background,
    },
    scrollContent: {
      padding: tokens.space[4],
      paddingBottom: tokens.space[9],
    },
    avatarSection: {
      alignItems: 'center',
      marginBottom: tokens.space[5],
    },
    avatarCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
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
    statsRow: {
      flexDirection: 'row',
      gap: tokens.space[3],
      marginBottom: tokens.space[5],
    },
    statCard: {
      flex: 1,
      backgroundColor: tokens.color.card,
      borderRadius: tokens.radius.lg,
      borderWidth: 1,
      borderColor: tokens.color.border,
      padding: tokens.space[3],
      alignItems: 'center',
    },
    statValue: {
      ...tokens.typography.headingSm,
      color: tokens.color.primary,
      marginTop: tokens.space[1],
    },
    statLabel: {
      ...tokens.typography.caption,
      color: tokens.color.muted,
      marginTop: 2,
    },
    formCard: {
      backgroundColor: tokens.color.card,
      borderRadius: tokens.radius.lg,
      borderWidth: 1,
      borderColor: tokens.color.border,
      padding: tokens.space[4],
      marginBottom: tokens.space[5],
    },
    inputGroup: {
      marginBottom: tokens.space[4],
    },
    inputLabel: {
      ...tokens.typography.caption,
      color: tokens.color.muted,
      marginBottom: tokens.space[1],
    },
    input: {
      height: minTarget,
      borderWidth: 1,
      borderColor: tokens.color.border,
      borderRadius: tokens.radius.md,
      paddingHorizontal: tokens.space[3],
      color: tokens.color.foreground,
      ...tokens.typography.body,
    },
    saveButton: {
      height: minTarget,
      backgroundColor: tokens.color.primary,
      borderRadius: tokens.radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    saveButtonText: {
      ...tokens.typography.labelUppercase,
      color: tokens.color.onPrimary,
      fontWeight: '700',
    },
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.avatarSection}>
        <View style={styles.avatarCircle}>
          <User size={36} color={tokens.color.primary} />
        </View>
        <Text style={styles.title}>{name}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <CheckCircle2 size={20} color={tokens.color.primary} />
          <Text style={styles.statValue}>{completedTasks}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statCard}>
          <Award size={20} color={tokens.color.primary} />
          <Text style={styles.statValue}>{activeTasks}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statCard}>
          <Flame size={20} color={tokens.color.primary} />
          <Text style={styles.statValue}>{streakDays}d</Text>
          <Text style={styles.statLabel}>Streak</Text>
        </View>
      </View>

      <View style={styles.formCard}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={tokens.color.muted}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email Address</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholder="Your email"
            placeholderTextColor={tokens.color.muted}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Phone</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="Your mobile"
            placeholderTextColor={tokens.color.muted}
          />
        </View>
        <Pressable
          style={styles.saveButton}
          onPress={handleSave}
          accessibilityRole="button"
          accessibilityLabel="Save profile changes"
        >
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
