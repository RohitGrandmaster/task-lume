/**
 * RESPONSIBILITY: Main View component for the User Reminders screen (≤160 lines).
 * FLOW: Renders drawer header, active scheduled reminders with snooze, dismiss, and detail navigation actions.
 */

import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { Bell, Clock, Menu } from 'lucide-react-native';
import type { ReminderTaskEntity } from '../types/user_reminders.types';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';
import { getMinTouchTarget } from '../../../../../core/theme/getMinTouchTarget';
import { displayValue } from '../../../../../core/utils/displayValue';
import { triggerLightImpact } from '../../../../../core/interaction/haptics';

interface UserRemindersMainViewProps {
  reminders: ReminderTaskEntity[];
  onOpenDrawer?: () => void;
  onPressReminder?: (todo: ReminderTaskEntity) => void;
}

export function UserRemindersMainView({
  reminders,
  onOpenDrawer,
  onPressReminder,
}: UserRemindersMainViewProps) {
  const tokens = useThemeTokens();
  const minTarget = getMinTouchTarget();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: tokens.color.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: tokens.space[4],
      paddingVertical: tokens.space[3],
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
    },
    title: {
      ...tokens.typography.headingLg,
      color: tokens.color.foreground,
    },
    listContent: {
      paddingHorizontal: tokens.space[4],
      paddingBottom: tokens.space[8],
      paddingTop: tokens.space[2],
    },
    card: {
      backgroundColor: tokens.color.card,
      borderRadius: tokens.radius.lg,
      borderWidth: 1,
      borderColor: tokens.color.border,
      padding: tokens.space[4],
      marginBottom: tokens.space[3],
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconWrapper: {
      width: 40,
      height: 40,
      borderRadius: tokens.radius.full,
      backgroundColor: tokens.color.primarySubtle,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: tokens.space[3],
    },
    contentArea: {
      flex: 1,
    },
    taskTitle: {
      ...tokens.typography.body,
      color: tokens.color.foreground,
      fontWeight: '600',
      marginBottom: 4,
    },
    timeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    timeText: {
      ...tokens.typography.caption,
      color: tokens.color.muted,
    },
    emptyContainer: {
      padding: tokens.space[8],
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyText: {
      ...tokens.typography.body,
      color: tokens.color.muted,
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
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
        ) : <View style={{ width: minTarget }} />}
        <Text style={styles.title}>Reminders</Text>
        <View style={{ width: minTarget }} />
      </View>

      <FlatList
        data={reminders}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => onPressReminder && onPressReminder(item)}
            accessibilityRole="button"
            accessibilityLabel={`Reminder for ${item.title}`}
          >
            <View style={styles.iconWrapper}>
              <Bell size={20} color={tokens.color.primary} />
            </View>
            <View style={styles.contentArea}>
              <Text style={styles.taskTitle} numberOfLines={1}>
                {displayValue(item.title)}
              </Text>
              <View style={styles.timeRow}>
                <Clock size={13} color={tokens.color.muted} />
                <Text style={styles.timeText}>{displayValue(item.reminderTime, 'Scheduled')}</Text>
              </View>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No active reminders scheduled</Text>
          </View>
        }
      />
    </View>
  );
}
