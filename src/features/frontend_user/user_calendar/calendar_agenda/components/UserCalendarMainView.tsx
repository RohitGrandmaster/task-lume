/**
 * RESPONSIBILITY: Main View component for the User Calendar Agenda screen.
 * FLOW: Renders interactive day horizontal strip, selected date header, and scheduled tasks.
 */

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import { Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react-native';
import type { TodoEntity } from '../../user_todos/todos_management/types/user_todos.types';
import { useThemeTokens } from '../../../../core/theme/useThemeTokens';
import { getMinTouchTarget } from '../../../../core/theme/getMinTouchTarget';
import { displayValue } from '../../../../core/utils/displayValue';
import { triggerLightImpact } from '../../../../core/interaction/haptics';

interface UserCalendarMainViewProps {
  todos: TodoEntity[];
  onPressTask?: (task: TodoEntity) => void;
}

export function UserCalendarMainView({ todos, onPressTask }: UserCalendarMainViewProps) {
  const tokens = useThemeTokens();
  const minTarget = getMinTouchTarget();
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    return new Date().toISOString().slice(0, 10);
  });

  // Generate 14 days around today
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
      paddingHorizontal: tokens.space[4],
      paddingVertical: tokens.space[3],
    },
    title: {
      ...tokens.typography.headingLg,
      color: tokens.color.foreground,
      marginBottom: 2,
    },
    daysScroll: {
      paddingHorizontal: tokens.space[4],
      paddingBottom: tokens.space[4],
      gap: tokens.space[2],
    },
    dayPill: {
      width: 48,
      height: 64,
      borderRadius: tokens.radius.lg,
      backgroundColor: tokens.color.card,
      borderWidth: 1,
      borderColor: tokens.color.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dayPillActive: {
      backgroundColor: tokens.color.primary,
      borderColor: tokens.color.primary,
    },
    dayName: {
      ...tokens.typography.caption,
      color: tokens.color.muted,
      marginBottom: 2,
    },
    dayNameActive: {
      color: tokens.color.onPrimary,
      fontWeight: '600',
    },
    dayNum: {
      ...tokens.typography.body,
      fontWeight: '700',
      color: tokens.color.foreground,
    },
    dayNumActive: {
      color: tokens.color.onPrimary,
    },
    listContent: {
      paddingHorizontal: tokens.space[4],
      paddingBottom: tokens.space[8],
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
        <Text style={styles.title}>Calendar Agenda</Text>
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={daysList}
        keyExtractor={(item) => item.dateStr}
        contentContainerStyle={styles.daysScroll}
        renderItem={({ item }) => {
          const isActive = item.dateStr === selectedDateStr;
          return (
            <Pressable
              style={[styles.dayPill, isActive ? styles.dayPillActive : null]}
              onPress={() => {
                triggerLightImpact();
                setSelectedDateStr(item.dateStr);
              }}
              accessibilityRole="button"
              accessibilityLabel={`Select date ${item.dayName} ${item.dayNum}`}
            >
              <Text style={[styles.dayName, isActive ? styles.dayNameActive : null]}>
                {item.dayName}
              </Text>
              <Text style={[styles.dayNum, isActive ? styles.dayNumActive : null]}>
                {item.dayNum}
              </Text>
            </Pressable>
          );
        }}
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
