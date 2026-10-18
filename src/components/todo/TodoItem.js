import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  PanResponder,
  useWindowDimensions,
} from 'react-native';

import {memo, useEffect, useRef, useState} from 'react';

import {
  Pencil,
  Trash2,
  Star,
  Pin,
  Bell,
  Timer,
  Check,
} from 'lucide-react-native';

import useTheme from '../../hooks/useTheme';
import useSettings from '../../hooks/useSettings';
import StrikeText from '../common/StrikeText';

/* ------------------------------ CONSTANTS ----------------------------- */

const ACTION_WIDTH = 80;
const SWIPE_ACTIVATION_X = 22;
const SWIPE_ACTIVATION_RATIO = 1.6;

/* ------------------------------ HELPERS ------------------------------ */

const pad = v => String(v).padStart(2, '0');

function formatRemaining(ms) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;

  if (h > 0) return `${h}h ${pad(m)}m`;
  return `${pad(m)}:${pad(s)}`;
}

function getDueDateInfo(dueDate, theme) {
  if (!dueDate || dueDate === 'No date') return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const c = theme.colors;

  if (dueDate === 'Today') {
    return {label: 'Today', color: c.chipTodayText, bg: c.chipTodayBg};
  }
  if (dueDate === 'Tomorrow') {
    return {label: 'Tomorrow', color: c.chipTomorrowText, bg: c.chipTomorrowBg};
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
    const parsed = new Date(`${dueDate}T12:00:00`);
    parsed.setHours(0, 0, 0, 0);

    if (parsed < today) {
      return {label: 'Overdue', color: c.chipOverdueText, bg: c.chipOverdueBg};
    }
    if (parsed.getTime() === today.getTime()) {
      return {label: 'Today', color: c.chipTodayText, bg: c.chipTodayBg};
    }
    if (parsed.getTime() === tomorrow.getTime()) {
      return {
        label: 'Tomorrow',
        color: c.chipTomorrowText,
        bg: c.chipTomorrowBg,
      };
    }

    const label = parsed.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
    });
    return {label, color: c.chipDefaultText, bg: c.chipDefaultBg};
  }

  return {label: dueDate, color: c.chipDefaultText, bg: c.chipDefaultBg};
}

function getPriorityColor(priority, theme) {
  if (priority === 'high') return theme.colors.danger;
  if (priority === 'medium') return theme.colors.warning;
  return theme.colors.success;
}

/* ------------------------------ COMPONENT ---------------------------- */

function TodoItem({
  todo,
  onPress,
  onLongPress,
  onToggle,
  onEdit,
  onDelete,
  onToggleFavorite,
  isSwipeOpen = false,
  onSwipeOpen,
}) {
  const {theme} = useTheme();
  const {swipeActionsEnabled = true} = useSettings();
  const swipeEnabledRef = useRef(swipeActionsEnabled);
  swipeEnabledRef.current = swipeActionsEnabled;

  const styles = createStyles(theme);
  const {width: windowWidth} = useWindowDimensions();
  const autoTrigger = Math.min(windowWidth, 540) * 0.35;
  const autoTriggerRef = useRef(autoTrigger);
  autoTriggerRef.current = autoTrigger;

  const translateX = useRef(new Animated.Value(0)).current;
  const restingX = useRef(0);

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!todo.timerEndAt) return undefined;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [todo.timerEndAt]);

  useEffect(() => {
    if (!isSwipeOpen && restingX.current !== 0) {
      closeSwipe();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSwipeOpen]);

  const remaining = todo.timerEndAt ? todo.timerEndAt - now : 0;
  const timerExpired = Boolean(todo.timerEndAt) && remaining <= 0;
  const dueInfo = getDueDateInfo(todo.dueDate, theme);

  function closeSwipe() {
    restingX.current = 0;
    onSwipeOpen?.(null);
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 0,
      speed: 22,
    }).start();
  }

  function openSwipe(direction) {
    const target = direction === 'right' ? ACTION_WIDTH : -ACTION_WIDTH;
    restingX.current = target;
    onSwipeOpen?.(todo.id);
    Animated.spring(translateX, {
      toValue: target,
      useNativeDriver: true,
      bounciness: 0,
      speed: 22,
    }).start();
  }

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,

      onMoveShouldSetPanResponder: (_, gesture) => {
        if (!swipeEnabledRef.current) return false;
        const {dx, dy} = gesture;
        const adx = Math.abs(dx);
        const ady = Math.abs(dy);
        return (
          adx > SWIPE_ACTIVATION_X && adx > ady * SWIPE_ACTIVATION_RATIO
        );
      },
      onMoveShouldSetPanResponderCapture: () => false,

      onPanResponderTerminationRequest: () => true,

      onPanResponderMove: (_, gesture) => {
        let dx = restingX.current + gesture.dx;
        if (dx > ACTION_WIDTH) dx = ACTION_WIDTH;
        if (dx < -ACTION_WIDTH) dx = -ACTION_WIDTH;
        translateX.setValue(dx);
      },

      onPanResponderRelease: (_, gesture) => {
        const totalX = restingX.current + gesture.dx;

        if (totalX > autoTriggerRef.current) {
          restingX.current = 0;
          Animated.timing(translateX, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }).start();
          onEdit?.(todo);
          return;
        }

        if (totalX < -autoTriggerRef.current) {
          restingX.current = 0;
          Animated.timing(translateX, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }).start();
          onDelete?.(todo.id);
          return;
        }

        let target = 0;
        if (totalX > ACTION_WIDTH / 2) {
          target = ACTION_WIDTH;
          onSwipeOpen?.(todo.id);
        } else if (totalX < -ACTION_WIDTH / 2) {
          target = -ACTION_WIDTH;
          onSwipeOpen?.(todo.id);
        }

        restingX.current = target;
        Animated.spring(translateX, {
          toValue: target,
          useNativeDriver: true,
          bounciness: 0,
          speed: 22,
        }).start();
      },

      onPanResponderTerminate: () => {
        closeSwipe();
      },
    }),
  ).current;

  function handleEdit() {
    closeSwipe();
    onEdit?.(todo);
  }

  function handleDelete() {
    closeSwipe();
    onDelete?.(todo.id);
  }

  function handleCardPress() {
    if (restingX.current !== 0) {
      closeSwipe();
      return;
    }
    onPress?.(todo);
  }

  function handleCardLongPress() {
    if (restingX.current !== 0) {
      closeSwipe();
      return;
    }
    onLongPress?.(todo);
  }

  function handleStarTap() {
    onToggleFavorite?.(todo.id);
  }

  return (
    <View style={styles.swipeWrap}>
      {/* LEFT ACTION — Edit */}
      <View style={styles.leftActions}>
        <Pressable
          style={[styles.actionBtn, styles.editAction]}
          onPress={handleEdit}
          accessibilityLabel="Edit task">
          <Pencil size={20} color="#FFFFFF" strokeWidth={2.4} />
          <Text style={styles.actionLabel}>Edit</Text>
        </Pressable>
      </View>

      {/* RIGHT ACTION — Delete */}
      <View style={styles.rightActions}>
        <Pressable
          style={[styles.actionBtn, styles.deleteAction]}
          onPress={handleDelete}
          accessibilityLabel="Delete task">
          <Trash2 size={20} color="#FFFFFF" strokeWidth={2.4} />
          <Text style={styles.actionLabel}>Delete</Text>
        </Pressable>
      </View>

      {/* CARD */}
      <Animated.View
        style={[styles.card, {transform: [{translateX}]}]}
        {...panResponder.panHandlers}>
        <Pressable
          style={({pressed}) => [
            styles.cardInner,
            pressed && styles.cardInnerPressed,
          ]}
          onPress={handleCardPress}
          onLongPress={handleCardLongPress}
          delayLongPress={400}
          hitSlop={{top: 4, bottom: 4, left: 4, right: 4}}
          accessibilityRole="button"
          accessibilityLabel={todo.title || 'Task'}>
          <View style={styles.mainRow}>
            {/* Checkbox */}
            <Pressable
              style={[
                styles.checkbox,
                todo.completed && styles.checkboxCompleted,
              ]}
              onPress={() => onToggle?.(todo.id)}
              hitSlop={6}
              accessibilityRole="checkbox"
              accessibilityState={{checked: Boolean(todo.completed)}}>
              {todo.completed ? (
                <Check size={14} color="#FFFFFF" strokeWidth={3} />
              ) : null}
            </Pressable>

            {/* Content */}
            <View style={styles.content}>
              <View style={styles.titleRow}>
                <StrikeText
                  text={todo.title}
                  completed={Boolean(todo.completed)}
                  style={styles.title}
                  completedStyle={styles.completedTitle}
                  containerStyle={styles.titleStrikeWrap}
                  numberOfLines={2}
                  strikeColor={theme.colors.textSecondary}
                  strikeHeight={2.2}
                />

                {todo.pinned ? (
                  <View style={styles.pinBadge}>
                    <Pin
                      size={12}
                      color={theme.colors.primary}
                      strokeWidth={2.6}
                      fill={theme.colors.primary}
                    />
                  </View>
                ) : null}

                <Pressable
                  onPress={handleStarTap}
                  hitSlop={8}
                  style={styles.starBtn}
                  accessibilityRole="button"
                  accessibilityLabel={
                    todo.favorite ? 'Remove from favorites' : 'Add to favorites'
                  }>
                  <Star
                    size={17}
                    color={todo.favorite ? '#F59E0B' : theme.colors.textLight}
                    strokeWidth={2.2}
                    fill={todo.favorite ? '#F59E0B' : 'transparent'}
                  />
                </Pressable>
              </View>

              {todo.description ? (
                <StrikeText
                  text={todo.description}
                  completed={Boolean(todo.completed)}
                  style={styles.description}
                  completedStyle={styles.completedDescription}
                  containerStyle={styles.descStrikeWrap}
                  numberOfLines={1}
                  strikeColor={theme.colors.textSecondary}
                  strikeHeight={2}
                />
              ) : null}

              {/* Meta chips */}
              <View style={styles.metaRow}>
                {dueInfo ? (
                  <View style={[styles.chip, {backgroundColor: dueInfo.bg}]}>
                    <Text style={[styles.chipText, {color: dueInfo.color}]}>
                      {dueInfo.label}
                    </Text>
                  </View>
                ) : null}

                <View style={styles.priorityMini}>
                  <View
                    style={[
                      styles.priorityDot,
                      {backgroundColor: getPriorityColor(todo.priority, theme)},
                    ]}
                  />
                  <Text style={styles.priorityMiniText}>
                    {todo.priority}
                  </Text>
                </View>

                {todo.category ? (
                  <Text style={styles.category} numberOfLines={1}>
                    {todo.category}
                  </Text>
                ) : null}

                {todo.reminder ? (
                  <View
                    style={[
                      styles.chip,
                      styles.chipWithIcon,
                      {backgroundColor: theme.colors.chipReminderBg},
                    ]}>
                    <Bell
                      size={10}
                      color={theme.colors.chipReminderText}
                      strokeWidth={2.6}
                    />
                    <Text
                      style={[
                        styles.chipText,
                        {color: theme.colors.chipReminderText},
                      ]}>
                      Alert
                    </Text>
                  </View>
                ) : null}

                {todo.timerEndAt ? (
                  <View
                    style={[
                      styles.chip,
                      styles.chipWithIcon,
                      {
                        backgroundColor: timerExpired
                          ? theme.colors.chipTimerExpiredBg
                          : theme.colors.chipTimerBg,
                        borderWidth: 1,
                        borderColor: timerExpired
                          ? theme.colors.chipTimerExpiredBorder
                          : theme.colors.chipTimerBorder,
                      },
                    ]}>
                    <Timer
                      size={10}
                      color={
                        timerExpired
                          ? theme.colors.chipTimerExpiredText
                          : theme.colors.chipTimerText
                      }
                      strokeWidth={2.6}
                    />
                    <Text
                      style={[
                        styles.chipText,
                        {
                          color: timerExpired
                            ? theme.colors.chipTimerExpiredText
                            : theme.colors.chipTimerText,
                        },
                      ]}>
                      {timerExpired ? 'Done' : formatRemaining(remaining)}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

/* ------------------------------- STYLES ------------------------------- */

function createStyles(theme) {
  return StyleSheet.create({
    swipeWrap: {
      position: 'relative',
      marginBottom: 10,
    },

    leftActions: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: ACTION_WIDTH,
      borderTopLeftRadius: 16,
      borderBottomLeftRadius: 16,
      overflow: 'hidden',
    },

    rightActions: {
      position: 'absolute',
      right: 0,
      top: 0,
      bottom: 0,
      width: ACTION_WIDTH,
      borderTopRightRadius: 16,
      borderBottomRightRadius: 16,
      overflow: 'hidden',
    },

    actionBtn: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
    },

    editAction: {
      backgroundColor: '#3B82F6',
    },

    deleteAction: {
      backgroundColor: theme.colors.danger,
    },

    actionLabel: {
      fontSize: 10,
      fontWeight: '800',
      color: '#FFFFFF',
      letterSpacing: 0.3,
    },

    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      ...theme.shadows.card,
    },

    cardInner: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      paddingVertical: 13,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },

    cardInnerPressed: {
      opacity: 0.88,
    },

    mainRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },

    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
      marginTop: 1,
    },

    checkboxCompleted: {
      borderColor: theme.colors.success,
      backgroundColor: theme.colors.success,
    },

    content: {
      flex: 1,
    },

    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },

    titleStrikeWrap: {
      flex: 1,
    },

    descStrikeWrap: {
      marginTop: 3,
      alignSelf: 'flex-start',
      maxWidth: '100%',
    },

    title: {
      fontSize: 15,
      fontWeight: '600',
      lineHeight: 21,
      color: theme.colors.text,
      letterSpacing: -0.1,
    },

    completedTitle: {
      color: theme.colors.textLight,
    },

    pinBadge: {
      width: 22,
      height: 22,
      borderRadius: 7,
      backgroundColor: theme.colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },

    starBtn: {
      padding: 2,
    },

    description: {
      fontSize: 13,
      lineHeight: 18,
      color: theme.colors.textSecondary,
    },

    completedDescription: {
      color: theme.colors.textLight,
    },

    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 7,
      marginTop: 9,
    },

    chip: {
      paddingHorizontal: 8,
      paddingVertical: 3.5,
      borderRadius: 7,
    },

    chipWithIcon: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },

    chipText: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.15,
    },

    priorityMini: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },

    priorityDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
    },

    priorityMiniText: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.colors.textSecondary,
      textTransform: 'capitalize',
      letterSpacing: 0.15,
    },

    category: {
      fontSize: 11,
      fontWeight: '600',
      color: theme.colors.textLight,
      letterSpacing: 0.15,
      maxWidth: 90,
    },
  });
}

export default memo(TodoItem);
