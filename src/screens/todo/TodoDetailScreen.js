import {parseTaskDueDate} from '../../utils/dateUtils';
import React, {useMemo, useState} from 'react';
import {
  Text,
  View,
  Pressable,
  ScrollView,
  StyleSheet,
  Share,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Star,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Tag,
  Flag,
  Bell,
  BellOff,
  Edit3,
  Share2,
  Trash2,
  Palette,
  CheckCheck,
  Info,
  FileText,
} from 'lucide-react-native';

import ConfirmModal from '../../components/common/ConfirmModal';
import Loader from '../../components/common/Loader';
import StrikeText from '../../components/common/StrikeText';

import useTodos from '../../hooks/useTodos';
import useTheme from '../../hooks/useTheme';
import ROUTES from '../../constants/routes';

/* --------------------------- CONSTANTS --------------------------- */

const PRIORITY_COLORS = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#10B981',
};

const CATEGORY_COLORS = {
  Personal: '#6366F1',
  Work: '#3B82F6',
  Learning: '#8B5CF6',
  Shopping: '#EC4899',
  Health: '#10B981',
  Project: '#F59E0B',
  Finance: '#14B8A6',
  Family: '#F97316',
  Home: '#06B6D4',
  Travel: '#A855F7',
  Other: '#64748B',
  General: '#64748B',
};

/* --------------------------- HELPERS --------------------------- */

function getDueDate(task) {
  const source =
    Number.isFinite(task?.dueDateTimestamp) && task.dueDateTimestamp > 0
      ? task.dueDateTimestamp
      : task?.dueDate;
  return parseTaskDueDate(source);
}

function formatDueDate(task) {
  const date = getDueDate(task);
  if (!date) return 'No date';
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year:
      date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}

function getDueStatus(task) {
  const date = getDueDate(task);
  if (!date) return {key: 'none', label: 'No due date'};

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const taskDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round(
    (taskDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (task.completed) return {key: 'completed', label: 'Completed'};
  if (diffDays < 0)
    return {
      key: 'overdue',
      label: `${Math.abs(diffDays)}d overdue`,
      days: diffDays,
    };
  if (diffDays === 0) return {key: 'today', label: 'Due today'};
  if (diffDays === 1) return {key: 'tomorrow', label: 'Due tomorrow'};
  if (diffDays <= 7) return {key: 'soon', label: `In ${diffDays} days`};
  return {key: 'later', label: `In ${diffDays} days`};
}

function formatTimestamp(ts) {
  if (!ts) return null;
  const d = new Date(ts);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/* --------------------------- INFO TILE --------------------------- */

function InfoTile({
  Icon,
  iconColor,
  label,
  value,
  hint,
  theme,
  styles,
  onPress,
}) {
  const Container = onPress ? Pressable : View;
  return (
    <Container
      onPress={onPress}
      style={[
        styles.infoTile,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}>
      <View
        style={[styles.infoTileIcon, {backgroundColor: iconColor + '18'}]}>
        <Icon size={13} color={iconColor} strokeWidth={2.6} />
      </View>
      <Text
        style={[styles.infoTileLabel, {color: theme.colors.textSecondary}]}
        numberOfLines={1}>
        {label}
      </Text>
      <Text
        style={[styles.infoTileValue, {color: theme.colors.text}]}
        numberOfLines={1}>
        {value}
      </Text>
      {!!hint && (
        <Text
          style={[styles.infoTileHint, {color: iconColor}]}
          numberOfLines={1}>
          {hint}
        </Text>
      )}
    </Container>
  );
}

/* --------------------------- MAIN SCREEN --------------------------- */

function TodoDetailScreen({navigation, route}) {
  const {theme} = useTheme();
  const insets = useSafeAreaInsets();
  const {
    tasks,
    loading,
    toggleTodo,
    toggleFavorite,
    deleteTodo,
    toggleTodoReminder,
  } = useTodos();

  const styles = useMemo(
    () => createStyles(theme, insets),
    [theme, insets],
  );

  const [showDelete, setShowDelete] = useState(false);

  const todo = tasks.find(
    t => String(t.id) === String(route.params?.todoId),
  );

  const dueStatus = useMemo(() => getDueStatus(todo || {}), [todo]);
  const isOverdue = dueStatus.key === 'overdue';
  const priorityColor = todo
    ? PRIORITY_COLORS[todo.priority] || theme.colors.textLight
    : theme.colors.textLight;
  const categoryColor = todo
    ? CATEGORY_COLORS[todo.category] || theme.colors.textSecondary
    : theme.colors.textSecondary;

  function handleBack() {
    navigation.goBack();
  }

  function handleDelete() {
    deleteTodo(todo.id);
    setShowDelete(false);
    navigation.goBack();
  }

  function handleToggleComplete() {
    if (typeof toggleTodo === 'function') toggleTodo(todo.id);
  }

  function handleToggleFavorite() {
    if (typeof toggleFavorite === 'function') toggleFavorite(todo.id);
  }

  function handleEdit() {
    navigation.navigate(ROUTES.EDIT_TODO, {todoId: todo.id});
  }

  async function handleShare() {
    try {
      const lines = [`📝 ${todo.title}`];
      if (todo.description) lines.push(`\n${todo.description}`);
      lines.push('');
      if (todo.category) lines.push(`Category: ${todo.category}`);
      if (todo.priority) lines.push(`Priority: ${todo.priority}`);
      if (todo.dueDate) lines.push(`Due: ${formatDueDate(todo)}`);
      if (todo.completed) lines.push('Status: Completed');

      await Share.share({
        title: todo.title,
        message: lines.join('\n'),
      });
    } catch (e) {
      console.log('Share failed:', e);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Loader fullScreen />
      </SafeAreaView>
    );
  }

  if (!todo) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.center}>
          <View
            style={[
              styles.notFoundIcon,
              {backgroundColor: theme.colors.surface},
            ]}>
            <Info
              size={32}
              color={theme.colors.textLight}
              strokeWidth={1.8}
            />
          </View>
          <Text style={styles.notFoundTitle}>Task not found</Text>
          <Text
            style={[
              styles.notFoundDesc,
              {color: theme.colors.textSecondary},
            ]}>
            It may have been deleted or moved to trash.
          </Text>
          <Pressable
            onPress={handleBack}
            style={[
              styles.notFoundBtn,
              {backgroundColor: theme.colors.primary},
            ]}>
            <ArrowLeft size={15} color="#FFFFFF" strokeWidth={2.8} />
            <Text style={styles.notFoundBtnText}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const completed = !!todo.completed;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <Pressable
            onPress={handleBack}
            style={styles.iconBtn}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back">
            <ArrowLeft
              size={18}
              color={theme.colors.text}
              strokeWidth={2.6}
            />
          </Pressable>

          <View style={{flex: 1}} />

          <Pressable
            onPress={handleToggleFavorite}
            style={[
              styles.iconBtn,
              todo.favorite && {
                backgroundColor: '#F59E0B' + '18',
                borderColor: '#F59E0B' + '40',
              },
            ]}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={
              todo.favorite ? 'Remove favorite' : 'Add favorite'
            }>
            <Star
              size={18}
              color={todo.favorite ? '#F59E0B' : theme.colors.text}
              strokeWidth={2.6}
              fill={todo.favorite ? '#F59E0B' : 'transparent'}
            />
          </Pressable>

          <Pressable
            onPress={handleShare}
            style={styles.iconBtn}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Share task">
            <Share2
              size={17}
              color={theme.colors.text}
              strokeWidth={2.6}
            />
          </Pressable>
        </View>

        {/* ── Hero Card ── */}
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}>
          <View
            style={[styles.heroAccent, {backgroundColor: priorityColor}]}
            pointerEvents="none"
          />

          {todo.color && (
            <View
              style={[styles.colorTag, {backgroundColor: todo.color}]}
              pointerEvents="none"
            />
          )}

          <View style={styles.heroTopRow}>
            <View
              style={[
                styles.statusPill,
                {
                  backgroundColor: completed
                    ? '#10B981' + '18'
                    : isOverdue
                    ? '#EF4444' + '18'
                    : theme.colors.primary + '14',
                  borderColor: completed
                    ? '#10B981' + '40'
                    : isOverdue
                    ? '#EF4444' + '40'
                    : theme.colors.primary + '30',
                },
              ]}>
              {completed ? (
                <CheckCheck size={11} color="#10B981" strokeWidth={3} />
              ) : isOverdue ? (
                <AlertCircle size={11} color="#EF4444" strokeWidth={3} />
              ) : (
                <Clock
                  size={11}
                  color={theme.colors.primary}
                  strokeWidth={3}
                />
              )}
              <Text
                style={[
                  styles.statusPillText,
                  {
                    color: completed
                      ? '#10B981'
                      : isOverdue
                      ? '#EF4444'
                      : theme.colors.primary,
                  },
                ]}>
                {completed ? 'Completed' : isOverdue ? 'Overdue' : 'Active'}
              </Text>
            </View>

            {todo.favorite && (
              <View
                style={[
                  styles.favTag,
                  {
                    backgroundColor: '#F59E0B' + '18',
                    borderColor: '#F59E0B' + '40',
                  },
                ]}>
                <Star
                  size={9}
                  color="#F59E0B"
                  strokeWidth={3}
                  fill="#F59E0B"
                />
                <Text style={styles.favTagText}>FAVORITE</Text>
              </View>
            )}
          </View>

          <StrikeText
            text={todo.title || 'Untitled task'}
            completed={completed}
            style={[styles.heroTitle, {color: theme.colors.text}]}
            completedStyle={{color: theme.colors.textLight}}
            strikeColor={theme.colors.textSecondary || '#6B7280'}
            strikeHeight={2.8}
          />

          {todo.category && (
            <View style={styles.heroChips}>
              <View
                style={[
                  styles.chip,
                  {
                    backgroundColor: categoryColor + '14',
                    borderColor: categoryColor + '30',
                  },
                ]}>
                <View
                  style={[styles.chipDot, {backgroundColor: categoryColor}]}
                />
                <Text style={[styles.chipText, {color: categoryColor}]}>
                  {todo.category}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* ── Description ── */}
        {!!todo.description && (
          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}>
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.sectionIconWrap,
                  {backgroundColor: theme.colors.primary + '18'},
                ]}>
                <FileText
                  size={13}
                  color={theme.colors.primary}
                  strokeWidth={2.6}
                />
              </View>
              <Text
                style={[
                  styles.sectionLabel,
                  {color: theme.colors.textSecondary},
                ]}>
                DESCRIPTION
              </Text>
            </View>
            <Text style={[styles.description, {color: theme.colors.text}]}>
              {todo.description}
            </Text>
          </View>
        )}

        {/* ── Details Grid ── */}
        <Text style={[styles.gridLabel, {color: theme.colors.textLight}]}>
          DETAILS
        </Text>

        <View style={styles.infoGrid}>
          <InfoTile
            Icon={Tag}
            iconColor={categoryColor}
            label="Category"
            value={todo.category || 'General'}
            theme={theme}
            styles={styles}
          />

          <InfoTile
            Icon={Flag}
            iconColor={priorityColor}
            label="Priority"
            value={
              todo.priority
                ? todo.priority.charAt(0).toUpperCase() +
                  todo.priority.slice(1)
                : 'Medium'
            }
            theme={theme}
            styles={styles}
          />

          <InfoTile
            Icon={Calendar}
            iconColor={
              isOverdue
                ? '#EF4444'
                : dueStatus.key === 'today'
                ? theme.colors.primary
                : theme.colors.textSecondary
            }
            label="Due date"
            value={todo.dueDate ? formatDueDate(todo) : 'No date'}
            hint={todo.dueDate ? dueStatus.label : null}
            theme={theme}
            styles={styles}
          />

          <InfoTile
            Icon={todo.reminder ? Bell : BellOff}
            iconColor={
              todo.reminder ? '#F97316' : theme.colors.textLight
            }
            label="Reminder / Alert"
            value={todo.reminder ? 'Enabled' : 'Off'}
            hint={
              todo.reminder
                ? 'Alert active • Tap to turn off'
                : 'Tap to turn on alert'
            }
            theme={theme}
            styles={styles}
            onPress={() => toggleTodoReminder(todo.id)}
          />
        </View>

        {/* ── Color Tag ── */}
        {todo.color && (
          <View
            style={[
              styles.colorRow,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}>
            <View
              style={[
                styles.sectionIconWrap,
                {backgroundColor: todo.color + '18'},
              ]}>
              <Palette size={13} color={todo.color} strokeWidth={2.6} />
            </View>
            <Text
              style={[styles.colorRowLabel, {color: theme.colors.text}]}>
              Color tag
            </Text>
            <View
              style={[styles.colorRowSwatch, {backgroundColor: todo.color}]}
            />
            <Text
              style={[
                styles.colorRowValue,
                {color: theme.colors.textSecondary},
              ]}>
              {todo.color.toUpperCase()}
            </Text>
          </View>
        )}

        {/* ── Timestamps ── */}
        {(todo.createdAt || todo.completedAt) && (
          <View
            style={[
              styles.timestampsCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}>
            {todo.createdAt && (
              <View style={styles.timestampRow}>
                <Text
                  style={[
                    styles.timestampLabel,
                    {color: theme.colors.textSecondary},
                  ]}>
                  Created
                </Text>
                <Text
                  style={[
                    styles.timestampValue,
                    {color: theme.colors.text},
                  ]}>
                  {formatTimestamp(todo.createdAt)}
                </Text>
              </View>
            )}
            {todo.completedAt && (
              <View style={styles.timestampRow}>
                <Text
                  style={[
                    styles.timestampLabel,
                    {color: theme.colors.textSecondary},
                  ]}>
                  Completed
                </Text>
                <Text
                  style={[
                    styles.timestampValue,
                    {color: theme.colors.text},
                  ]}>
                  {formatTimestamp(todo.completedAt)}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ── Actions (Premium layout) ── */}
        <View style={styles.actionsSection}>
          {/* Primary CTA — full width */}
          <Pressable
            onPress={handleToggleComplete}
            style={[
              styles.primaryBtn,
              {
                backgroundColor: completed
                  ? theme.colors.surface
                  : theme.colors.success || '#10B981',
                borderColor: completed
                  ? theme.colors.border
                  : theme.colors.success || '#10B981',
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={
              completed ? 'Mark as active' : 'Mark as complete'
            }>
            <CheckCircle2
              size={17}
              color={completed ? theme.colors.text : '#FFFFFF'}
              strokeWidth={2.6}
            />
            <Text
              style={[
                styles.primaryBtnText,
                {color: completed ? theme.colors.text : '#FFFFFF'},
              ]}>
              {completed ? 'Mark as Active' : 'Mark as Complete'}
            </Text>
          </Pressable>

          {/* Secondary row — equal width */}
          <View style={styles.secondaryRow}>
            <Pressable
              onPress={handleEdit}
              style={[
                styles.secondaryBtn,
                {
                  backgroundColor: theme.colors.primary,
                  borderColor: theme.colors.primary,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Edit task">
              <Edit3 size={16} color="#FFFFFF" strokeWidth={2.6} />
              <Text style={[styles.secondaryBtnText, {color: '#FFFFFF'}]}>
                Edit
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setShowDelete(true)}
              style={[
                styles.secondaryBtn,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.danger || '#EF4444',
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Delete task">
              <Trash2
                size={16}
                color={theme.colors.danger || '#EF4444'}
                strokeWidth={2.6}
              />
              <Text
                style={[
                  styles.secondaryBtnText,
                  {color: theme.colors.danger || '#EF4444'},
                ]}>
                Delete
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <ConfirmModal
        visible={showDelete}
        title="Delete Task"
        message="Move this task to trash?"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </SafeAreaView>
  );
}

/* --------------------------- STYLES --------------------------- */

function createStyles(theme, insets) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 40 + (insets?.bottom || 0),
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    notFoundIcon: {
      width: 72,
      height: 72,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    notFoundTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.colors.text,
      marginBottom: 6,
    },
    notFoundDesc: {
      fontSize: 13.5,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 20,
    },
    notFoundBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 18,
      paddingVertical: 12,
      borderRadius: 14,
    },
    notFoundBtnText: {
      color: '#FFFFFF',
      fontWeight: '800',
      fontSize: 14,
    },

    /* Header */
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: 8,
      marginBottom: 16,
      gap: 8,
    },
    iconBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },

    /* Hero */
    heroCard: {
      borderRadius: 18,
      borderWidth: 1,
      padding: 18,
      marginBottom: 14,
      overflow: 'hidden',
    },
    heroAccent: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 4,
    },
    colorTag: {
      position: 'absolute',
      top: 12,
      right: 12,
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    heroTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
    },
    statusPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 10,
      borderWidth: 1,
    },
    statusPillText: {
      fontSize: 11.5,
      fontWeight: '800',
    },
    favTag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      borderWidth: 1,
    },
    favTagText: {
      fontSize: 10,
      fontWeight: '800',
      color: '#F59E0B',
      letterSpacing: 0.4,
    },
    heroTitle: {
      fontSize: 22,
      fontWeight: '900',
      letterSpacing: -0.4,
      lineHeight: 28,
    },
    heroChips: {
      flexDirection: 'row',
      marginTop: 12,
      gap: 8,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 10,
      borderWidth: 1,
    },
    chipDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
    },
    chipText: {
      fontSize: 12,
      fontWeight: '700',
    },

    /* Description */
    sectionCard: {
      borderRadius: 16,
      borderWidth: 1,
      padding: 16,
      marginBottom: 14,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 10,
    },
    sectionIconWrap: {
      width: 28,
      height: 28,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sectionLabel: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.6,
    },
    description: {
      fontSize: 14.5,
      lineHeight: 22,
      fontWeight: '500',
    },

    /* Details grid */
    gridLabel: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.8,
      marginBottom: 10,
      marginTop: 4,
    },
    infoGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginBottom: 14,
    },
    infoTile: {
      width: '47%',
      flexGrow: 1,
      borderRadius: 14,
      borderWidth: 1,
      padding: 12,
    },
    infoTileIcon: {
      width: 28,
      height: 28,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    infoTileLabel: {
      fontSize: 11,
      fontWeight: '700',
      marginBottom: 2,
    },
    infoTileValue: {
      fontSize: 14,
      fontWeight: '800',
    },
    infoTileHint: {
      fontSize: 11,
      fontWeight: '600',
      marginTop: 3,
    },

    /* Color row */
    colorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      borderRadius: 14,
      borderWidth: 1,
      padding: 12,
      marginBottom: 14,
    },
    colorRowLabel: {
      flex: 1,
      fontSize: 14,
      fontWeight: '700',
    },
    colorRowSwatch: {
      width: 18,
      height: 18,
      borderRadius: 9,
    },
    colorRowValue: {
      fontSize: 12,
      fontWeight: '700',
    },

    /* Timestamps */
    timestampsCard: {
      borderRadius: 14,
      borderWidth: 1,
      padding: 14,
      marginBottom: 20,
      gap: 8,
    },
    timestampRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    timestampLabel: {
      fontSize: 13,
      fontWeight: '600',
    },
    timestampValue: {
      fontSize: 13,
      fontWeight: '700',
    },

    /* ── Actions (Premium) ── */
    actionsSection: {
      marginTop: 4,
      gap: 10,
    },
    primaryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      height: 52,
      borderRadius: 14,
      borderWidth: 1,
      paddingHorizontal: 16,
    },
    primaryBtnText: {
      fontSize: 15,
      fontWeight: '800',
      letterSpacing: 0.2,
    },
    secondaryRow: {
      flexDirection: 'row',
      gap: 10,
    },
    secondaryBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      height: 48,
      borderRadius: 14,
      borderWidth: 1,
      paddingHorizontal: 12,
    },
    secondaryBtnText: {
      fontSize: 14,
      fontWeight: '800',
      letterSpacing: 0.2,
    },
  });
}

export default TodoDetailScreen;