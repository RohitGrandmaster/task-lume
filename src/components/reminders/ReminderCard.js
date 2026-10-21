import React from 'react';
import {View, Text, Pressable} from 'react-native';
import {CheckCircle2, AlarmClock, ChevronRight} from 'lucide-react-native';
import StrikeText from '../common/StrikeText';

export default function ReminderCard({
  task,
  theme,
  styles,
  onPress,
  onToggleComplete,
  onLongPress,
  completed = false,
  getBucket,
  formatTimeUntil,
  priorityColors = {},
  categoryColors = {},
}) {
  const priorityColor = priorityColors[task.priority] || theme.colors.primary;
  const categoryColor =
    categoryColors[task.category] || theme.colors.textSecondary;

  const bucket = typeof getBucket === 'function' ? getBucket(task) : 'later';
  const isOverdue = !completed && bucket === 'overdue';
  const timeLabel =
    typeof formatTimeUntil === 'function' ? formatTimeUntil(task) : '';

  const timeColor = completed
    ? theme.colors.textLight
    : isOverdue
    ? '#EF4444'
    : bucket === 'today'
    ? '#6366F1'
    : theme.colors.textSecondary;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={350}
      style={({pressed}) => [
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: isOverdue ? '#EF444440' : theme.colors.border,
          opacity: pressed ? 0.88 : completed ? 0.55 : 1,
        },
      ]}>
      <View style={[styles.cardLeftBar, {backgroundColor: priorityColor}]} />

      {/* Checkbox */}
      <Pressable
        onPress={onToggleComplete}
        hitSlop={10}
        style={styles.checkboxWrap}>
        <View
          style={[
            styles.checkbox,
            {
              borderColor: completed
                ? theme.colors.success || '#10B981'
                : priorityColor,
              backgroundColor: completed
                ? theme.colors.success || '#10B981'
                : 'transparent',
            },
          ]}>
          {completed && (
            <CheckCircle2 size={13} color="#FFFFFF" strokeWidth={3} />
          )}
        </View>
      </Pressable>

      <View style={styles.cardContent}>
        <StrikeText
          text={task.title}
          completed={completed}
          style={[styles.cardTitle, {color: theme.colors.text}]}
          completedStyle={{color: theme.colors.textLight}}
          strikeColor={theme.colors.textSecondary || '#6B7280'}
          strikeHeight={2.2}
          numberOfLines={2}
        />

        <View style={styles.cardMetaRow}>
          {task.category ? (
            <>
              <View
                style={[styles.categoryDot, {backgroundColor: categoryColor}]}
              />
              <Text
                style={[
                  styles.cardMeta,
                  {color: theme.colors.textSecondary},
                ]}
                numberOfLines={1}>
                {task.category}
              </Text>
              <Text
                style={[styles.cardMetaDot, {color: theme.colors.textLight}]}>
                •
              </Text>
            </>
          ) : null}

          <Text style={[styles.cardTime, {color: timeColor}]}>
            {timeLabel}
          </Text>

          {isOverdue && (
            <>
              <Text
                style={[styles.cardMetaDot, {color: theme.colors.textLight}]}>
                •
              </Text>
              <Text style={styles.overdueTag}>LATE</Text>
            </>
          )}
        </View>
      </View>

      {!completed && (
        <Pressable
          onPress={onLongPress}
          hitSlop={10}
          style={[
            styles.snoozeBtn,
            {backgroundColor: theme.colors.background},
          ]}>
          <AlarmClock
            size={14}
            color={theme.colors.textSecondary}
            strokeWidth={2.6}
          />
        </Pressable>
      )}

      {completed && (
        <ChevronRight
          size={16}
          color={theme.colors.textLight}
          strokeWidth={2.4}
        />
      )}
    </Pressable>
  );
}
