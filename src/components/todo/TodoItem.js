import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';

import {useEffect, useRef, useState} from 'react';

import {Pencil, Trash2, Star} from 'lucide-react-native';

import useTheme from '../../hooks/useTheme';
import StrikeText from '../common/StrikeText';

/* ------------------------------ CONSTANTS ----------------------------- */

const ACTION_WIDTH = 80;
const SCREEN_WIDTH = Dimensions.get('window').width;
const AUTO_TRIGGER = SCREEN_WIDTH * 0.35; // ~35% swipe = auto trigger

// ✅ FIX: Long press ko protect karne ke liye threshold badhaya
const SWIPE_ACTIVATION_X = 22; // pehle 8 tha — yehi bug tha
const SWIPE_ACTIVATION_RATIO = 1.6; // dx, dy se 1.6x bada hona chahiye

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

function getDueDateInfo(dueDate) {
  if (!dueDate || dueDate === 'No date') return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (dueDate === 'Today')
    return {label: 'Today', color: '#EA580C', bg: '#FFF7ED'};
  if (dueDate === 'Tomorrow')
    return {label: 'Tomorrow', color: '#0284C7', bg: '#E0F2FE'};

  if (/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
    const parsed = new Date(`${dueDate}T12:00:00`);
    parsed.setHours(0, 0, 0, 0);

    if (parsed < today)
      return {label: 'Overdue', color: '#DC2626', bg: '#FEE2E2'};
    if (parsed.getTime() === today.getTime())
      return {label: 'Today', color: '#EA580C', bg: '#FFF7ED'};
    if (parsed.getTime() === tomorrow.getTime())
      return {label: 'Tomorrow', color: '#0284C7', bg: '#E0F2FE'};

    const label = parsed.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
    });
    return {label, color: '#6B7280', bg: '#F3F4F6'};
  }

  return {label: dueDate, color: '#6B7280', bg: '#F3F4F6'};
}

function getPriorityColor(priority) {
  if (priority === 'high') return '#EF4444';
  if (priority === 'medium') return '#F59E0B';
  return '#10B981';
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
  // ✅ Single swipe open support
  isSwipeOpen = false,
  onSwipeOpen,
}) {
  const {theme} = useTheme();
  const styles = createStyles(theme);

  const translateX = useRef(new Animated.Value(0)).current;
  const restingX = useRef(0);

  const [now, setNow] = useState(() => Date.now());

  // Live timer
  useEffect(() => {
    if (!todo.timerEndAt) return undefined;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [todo.timerEndAt]);

  // ✅ Jab parent bole ki yeh swipe close karo
  useEffect(() => {
    if (!isSwipeOpen && restingX.current !== 0) {
      closeSwipe();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSwipeOpen]);

  const remaining = todo.timerEndAt ? todo.timerEndAt - now : 0;
  const timerExpired = Boolean(todo.timerEndAt) && remaining <= 0;
  const dueInfo = getDueDateInfo(todo.dueDate);

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
      // ✅ Start pe responder claim mat karo — Pressable ko touch lene do
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,

      // ✅ YEH HAI ASLI FIX:
      // Pehle threshold 8px tha — long press ke waqt finger jitter se
      // PanResponder activate ho jata tha aur Pressable ka long press
      // timer cancel ho jata tha. Ab 22px + 1.6x ratio.
      onMoveShouldSetPanResponder: (_, gesture) => {
        const {dx, dy} = gesture;
        const adx = Math.abs(dx);
        const ady = Math.abs(dy);
        return (
          adx > SWIPE_ACTIVATION_X &&
          adx > ady * SWIPE_ACTIVATION_RATIO
        );
      },
      onMoveShouldSetPanResponderCapture: () => false,

      // ✅ Pressable ko long press claim karne do
      onPanResponderTerminationRequest: () => true,

      onPanResponderMove: (_, gesture) => {
        let dx = restingX.current + gesture.dx;
        if (dx > ACTION_WIDTH) dx = ACTION_WIDTH;
        if (dx < -ACTION_WIDTH) dx = -ACTION_WIDTH;
        translateX.setValue(dx);
      },

      onPanResponderRelease: (_, gesture) => {
        const totalX = restingX.current + gesture.dx;

        // FULL SWIPE RIGHT → Auto Edit
        if (totalX > AUTO_TRIGGER) {
          restingX.current = 0;
          Animated.timing(translateX, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }).start();
          onEdit?.(todo);
          return;
        }

        // FULL SWIPE LEFT → Auto Delete
        if (totalX < -AUTO_TRIGGER) {
          restingX.current = 0;
          Animated.timing(translateX, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }).start();
          onDelete?.(todo.id);
          return;
        }

        // Halka swipe → button reveal
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
    // Debug log — fix confirm karne ke baad hata sakte ho
    console.log('🔥 TodoItem LONG PRESS fired:', todo.id);

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
      {/* LEFT ACTION — Edit (revealed by right swipe) */}
      <View style={styles.leftActions}>
        <Pressable
          style={[styles.actionBtn, styles.editAction]}
          onPress={handleEdit}>
          <Pencil size={20} color="#FFFFFF" strokeWidth={2.4} />
          <Text style={styles.actionLabel}>Edit</Text>
        </Pressable>
      </View>

      {/* RIGHT ACTION — Delete (revealed by left swipe) */}
      <View style={styles.rightActions}>
        <Pressable
          style={[styles.actionBtn, styles.deleteAction]}
          onPress={handleDelete}>
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
          // ✅ Touch target thoda bada — long press zyada reliable
          hitSlop={{top: 4, bottom: 4, left: 4, right: 4}}>
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
                <Text style={styles.checkmark}>✓</Text>
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
                  strikeColor={theme.colors.textSecondary || '#6B7280'}
                  strikeHeight={2.2}
                />

                {todo.pinned ? (
                  <Text style={styles.pinEmoji}>📌</Text>
                ) : null}

                {/* ★ Star always visible + tappable */}
                <Pressable
                  onPress={handleStarTap}
                  hitSlop={8}
                  style={styles.starBtn}>
                  <Star
                    size={18}
                    color={todo.favorite ? '#F59E0B' : '#D1D5DB'}
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
                  strikeColor={theme.colors.textSecondary || '#6B7280'}
                  strikeHeight={2}
                />
              ) : null}

              <View style={styles.metaRow}>
                {dueInfo ? (
                  <View
                    style={[
                      styles.dueChip,
                      {backgroundColor: dueInfo.bg},
                    ]}>
                    <Text
                      style={[
                        styles.dueChipText,
                        {color: dueInfo.color},
                      ]}>
                      {dueInfo.label}
                    </Text>
                  </View>
                ) : null}

                <View style={styles.priorityMini}>
                  <View
                    style={[
                      styles.priorityDot,
                      {
                        backgroundColor: getPriorityColor(todo.priority),
                      },
                    ]}
                  />
                  <Text style={styles.priorityMiniText}>
                    {todo.priority}
                  </Text>
                </View>

                {todo.category ? (
                  <Text style={styles.category}>{todo.category}</Text>
                ) : null}

                {todo.reminder ? (
                  <View style={styles.reminderChip}>
                    <Text style={styles.reminderIcon}>🔔</Text>
                    <Text style={styles.reminderText}>Alert</Text>
                  </View>
                ) : null}

                {todo.timerEndAt ? (
                  <View
                    style={[
                      styles.timerChip,
                      timerExpired && styles.timerChipExpired,
                    ]}>
                    <Text
                      style={[
                        styles.timerChipText,
                        timerExpired && styles.timerChipTextExpired,
                      ]}>
                      {timerExpired
                        ? '⏱ Done'
                        : `⏱ ${formatRemaining(remaining)}`}
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
      borderTopLeftRadius: 14,
      borderBottomLeftRadius: 14,
      overflow: 'hidden',
    },

    rightActions: {
      position: 'absolute',
      right: 0,
      top: 0,
      bottom: 0,
      width: ACTION_WIDTH,
      borderTopRightRadius: 14,
      borderBottomRightRadius: 14,
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
      backgroundColor: '#EF4444',
    },

    actionLabel: {
      fontSize: 10,
      fontWeight: '800',
      color: '#FFFFFF',
      letterSpacing: 0.3,
    },

    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 14,
      ...theme.shadows.card,
    },

    cardInner: {
      backgroundColor: theme.colors.surface,
      borderRadius: 14,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },

    cardInnerPressed: {
      opacity: 0.85,
    },

    mainRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },

    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 7,
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

    checkmark: {
      color: theme.colors.white,
      fontSize: 14,
      fontWeight: '900',
    },

    content: {
      flex: 1,
    },

    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
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
      lineHeight: 20,
      color: theme.colors.text || '#1F2937',
    },

    completedTitle: {
      color: theme.colors.textLight || '#9CA3AF',
    },

    pinEmoji: {
      fontSize: 13,
    },

    starBtn: {
      padding: 2,
    },

    description: {
      fontSize: 13,
      lineHeight: 18,
      color: theme.colors.textSecondary || '#6B7280',
    },

    completedDescription: {
      color: theme.colors.textLight || '#9CA3AF',
    },

    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 8,
    },

    dueChip: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },

    dueChipText: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.2,
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
      color: '#6B7280',
      textTransform: 'capitalize',
      letterSpacing: 0.2,
    },

    category: {
      fontSize: 11,
      fontWeight: '600',
      color: '#9CA3AF',
      letterSpacing: 0.2,
    },

    reminderChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#EFF6FF',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
      gap: 3,
    },

    reminderIcon: {
      fontSize: 10,
    },

    reminderText: {
      fontSize: 10,
      fontWeight: '700',
      color: '#2563EB',
    },

    timerChip: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      backgroundColor: '#FFF7ED',
    },

    timerChipText: {
      fontSize: 11,
      fontWeight: '800',
      color: '#EA580C',
      letterSpacing: 0.2,
    },

    timerChipExpired: {
      backgroundColor: '#FEE2E2',
    },

    timerChipTextExpired: {
      color: '#B91C1C',
    },
  });
}

export default TodoItem;