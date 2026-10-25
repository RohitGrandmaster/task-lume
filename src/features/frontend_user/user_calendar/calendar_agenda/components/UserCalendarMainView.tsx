/**
 * RESPONSIBILITY: Main View component for the User Calendar Agenda screen (≤180 lines).
 * FLOW: Renders drawer header, interactive horizontal day strip, and scheduled task cards.
 */

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import { CheckCircle2, Menu } from 'lucide-react-native';
import type { CalendarTaskEntity } from '../types/user_calendar.types';
import { UserCalendarDayPill } from './UserCalendarDayPill';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';
import { getMinTouchTarget } from '../../../../../core/theme/getMinTouchTarget';
import { displayValue } from '../../../../../core/utils/displayValue';
import { triggerLightImpact } from '../../../../../core/interaction/haptics';

interface UserCalendarMainViewProps {
  todos: CalendarTaskEntity[];
  onOpenDrawer?: () => void;
  onPressTask?: (task: CalendarTaskEntity) => void;
}

export function UserCalendarMainView({
  todos,
  onOpenDrawer,
  onPressTask,
}: UserCalendarMainViewProps) {
  const tokens = useThemeTokens();
  const minTarget = getMinTouchTarget();
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    return new Date().toISOString().slice(0, 10);
  });

  const daysList = useMemo(() => {
    const list = [];
    const base = new Date();
    for (let i = -3; i < 11; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      list.push({
        dateStr: d.toISOString().slice(0, 10),
        dayNum: d.getDate(),
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      });
    }
    return list;
  }, []);

  const tasksOnSelectedDate = useMemo(() => {
    return todos.filter((t) => !t.deleted && t.dueDate === selectedDateStr);
  }, [todos, selectedDateStr]);

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
    title: {
      ...tokens.typography.headingLg,
      color: tokens.color.foreground,
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
    daysScroll: {
      paddingHorizontal: tokens.space[4],
      paddingBottom: tokens.space[3],
      gap: tokens.space[2],
    },
    listContent: {
      paddingHorizontal: tokens.space[4],
      paddingBottom: 110,
    },
    agendaCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: tokens.color.card,
      borderRadius: tokens.radius.lg,
      borderWidth: 1,
      borderColor: tokens.color.border,
      padding: tokens.space[4],
      marginBottom: tokens.space[3],
    },
    taskTitle: {
      ...tokens.typography.body,
      color: tokens.color.foreground,
      flex: 1,
      marginLeft: tokens.space[3],
    },
    emptyState: {
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
        <Text style={styles.title}>Calendar</Text>
        <View style={{ width: minTarget }} />
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={daysList}
        keyExtractor={(item) => item.dateStr}
        contentContainerStyle={styles.daysScroll}
        renderItem={({ item }) => (
          <UserCalendarDayPill
            dateStr={item.dateStr}
            dayNum={item.dayNum}
            dayName={item.dayName}
            isActive={item.dateStr === selectedDateStr}
            onSelect={setSelectedDateStr}
          />
        )}
      />

      <FlatList
        data={tasksOnSelectedDate}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable
            style={styles.agendaCard}
            onPress={() => onPressTask && onPressTask(item)}
            accessibilityRole="button"
            accessibilityLabel={`Task ${item.title}`}
          >
            <CheckCircle2
              size={20}
              color={item.completed ? tokens.color.primary : tokens.color.muted}
            />
            <Text
              style={[
                styles.taskTitle,
                item.completed ? { textDecorationLine: 'line-through', color: tokens.color.muted } : null,
              ]}
              numberOfLines={2}
            >
              {displayValue(item.title)}
            </Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No tasks scheduled for {selectedDateStr}</Text>
          </View>
        }
      />
    </View>
  );
}
