/**
 * RESPONSIBILITY: Header Card for User Todos Home screen (≤140 lines).
 * FLOW: Renders drawer menu button, greeting pill, action icons, and task progress overview.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Menu, Sparkles, Search, Bell } from 'lucide-react-native';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';
import { getMinTouchTarget } from '../../../../../core/theme/getMinTouchTarget';
import { triggerLightImpact } from '../../../../../core/interaction/haptics';

interface UserTodosHeaderCardProps {
  onOpenDrawer: () => void;
  onPressSearch?: () => void;
  onPressReminders?: () => void;
  totalTasks: number;
  completedTasks: number;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return 'Good Night';
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  if (hour < 21) return 'Good Evening';
  return 'Good Night';
}

export function UserTodosHeaderCard({
  onOpenDrawer,
  onPressSearch,
  onPressReminders,
  totalTasks,
  completedTasks,
}: UserTodosHeaderCardProps) {
  const tokens = useThemeTokens();
  const minTarget = getMinTouchTarget();
  const greeting = getGreeting();
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const styles = StyleSheet.create({
    card: {
      backgroundColor: tokens.color.card,
      marginHorizontal: tokens.space[4],
      marginTop: tokens.space[2],
      marginBottom: tokens.space[3],
      padding: tokens.space[4],
      borderRadius: tokens.radius.xl,
      borderWidth: 1,
      borderColor: tokens.color.border,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: tokens.space[3],
    },
    iconBtn: {
      width: minTarget,
      height: minTarget,
      borderRadius: tokens.radius.md,
      backgroundColor: tokens.color.cardElevated,
      borderWidth: 1,
      borderColor: tokens.color.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    greetingPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: tokens.space[1],
      paddingHorizontal: tokens.space[3],
      paddingVertical: 6,
      borderRadius: tokens.radius.full,
      backgroundColor: tokens.color.primarySubtle,
      borderWidth: 1,
      borderColor: tokens.color.primary,
    },
    greetingText: {
      ...tokens.typography.caption,
      color: tokens.color.primaryText,
      fontWeight: '700',
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: tokens.space[2],
    },
    progressSection: {
      marginTop: tokens.space[1],
    },
    progressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    progressTitle: {
      ...tokens.typography.bodySm,
      fontWeight: '600',
      color: tokens.color.foreground,
    },
    progressStats: {
      ...tokens.typography.caption,
      fontWeight: '700',
      color: tokens.color.primary,
    },
    progressBarBg: {
      height: 6,
      borderRadius: tokens.radius.full,
      backgroundColor: tokens.color.cardElevated,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      borderRadius: tokens.radius.full,
      backgroundColor: tokens.color.primary,
    },
  });

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
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

        <View style={styles.greetingPill}>
          <Sparkles size={13} color={tokens.color.primary} strokeWidth={2.4} />
          <Text style={styles.greetingText}>{greeting}</Text>
        </View>

        <View style={styles.actions}>
          {onPressSearch ? (
            <Pressable
              style={styles.iconBtn}
              onPress={() => {
                triggerLightImpact();
                onPressSearch();
              }}
              accessibilityRole="button"
              accessibilityLabel="Search tasks"
              hitSlop={8}
            >
              <Search size={18} color={tokens.color.foreground} strokeWidth={2.2} />
            </Pressable>
          ) : null}

          {onPressReminders ? (
            <Pressable
              style={styles.iconBtn}
              onPress={() => {
                triggerLightImpact();
                onPressReminders();
              }}
              accessibilityRole="button"
              accessibilityLabel="View reminders"
              hitSlop={8}
            >
              <Bell size={18} color={tokens.color.foreground} strokeWidth={2.2} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Daily Task Progress</Text>
          <Text style={styles.progressStats}>
            {completedTasks}/{totalTasks} ({progressPercent}%)
          </Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
        </View>
      </View>
    </View>
  );
}
