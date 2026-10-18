import React, {useMemo, useState} from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Share,
  Alert,
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
  Layers,
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

const pad = v => String(v).padStart(2, '0');
const dateKey = d =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function getDueDate(task) {
  if (!task?.dueDate) return null;
  const dd = String(task.dueDate).trim();
  if (!dd) return null;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lower = dd.toLowerCase();

  if (lower === 'today') return today;
  if (lower === 'tomorrow') {
    const t = new Date(today);
    t.setDate(t.getDate() + 1);
    return t;
  }
  if (lower === 'next week' || lower === 'nextweek') {
    const t = new Date(today);
    t.setDate(t.getDate() + 7);
    return t;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(dd)) {
    const [y, m, d] = dd.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  const parsed = new Date(dd);
  if (!isNaN(parsed.getTime())) return parsed;
  return null;
}

function formatDueDate(task) {
  const date = getDueDate(task);
  if (!date) return 'No date';
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year:
      date.getFullYear() !== new Date().getFullYear()
        ? 'numeric'
        : undefined,
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
        style={[
          styles.infoTileIcon,
          {backgroundColor: iconColor + '18'},
        ]}>
        <Icon size={13} color={iconColor} strokeWidth={2.6} />
      </View>
      <Text
        style={[
          styles.infoTileLabel,
          {color: theme.colors.textSecondary},
        ]}
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
          style={[
            styles.infoTileHint,
            {color: iconColor},
          ]}
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

  /* --------------------------- HANDLERS --------------------------- */
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

  /* --------------------------- LOADING --------------------------- */
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Loader fullScreen />
      </SafeAreaView>
    );
  }

  /* --------------------------- NOT FOUND --------------------------- */
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

  /* --------------------------- RENDER --------------------------- */
  const completed = !!todo.completed;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* HEADER */}
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

        {/* HERO CARD */}
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}>
          {/* Left accent bar */}
          <View
            style={[
              styles.heroAccent,
              {backgroundColor: priorityColor},
            ]}
            pointerEvents="none"
          />

          {/* Color tag indicator */}
          {todo.color && (
            <View
              style={[
                styles.colorTag,
                {backgroundColor: todo.color},
              ]}
              pointerEvents="none"
            />
          )}

          {/* Status pill */}
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
                <CheckCheck
                  size={11}
                  color="#10B981"
                  strokeWidth={3}
                />
              ) : isOverdue ? (
                <AlertCircle
                  size={11}
                  color="#EF4444"
                  strokeWidth={3}
                />
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
                {completed
                  ? 'Completed'
                  : isOverdue
                  ? 'Overdue'
                  : 'Active'}
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

          {/* Title */}
          <StrikeText
            text={todo.title || 'Untitled task'}
            completed={completed}
            style={[styles.heroTitle, {color: theme.colors.text}]}
            completedStyle={{color: theme.colors.textLight}}
            strikeColor={theme.colors.textSecondary || '#6B7280'}
            strikeHeight={2.8}
          />

          {/* Category chip */}
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
                  style={[
                    styles.chipDot,
                    {backgroundColor: categoryColor},
                  ]}
                />
                <Text
                  style={[
                    styles.chipText,
                    {color: categoryColor},
                  ]}>
                  {todo.category}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* DESCRIPTION */}
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
            <Text
              style={[
                styles.description,
                {color: theme.colors.text},
              ]}>
              {todo.description}
            </Text>
          </View>
        )}

        {/* INFO GRID */}
        <Text
          style={[
            styles.gridLabel,
            {color: theme.colors.textLight},
          ]}>
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
            value={
              todo.dueDate ? formatDueDate(todo) : 'No date'
            }
            hint={
              todo.dueDate ? dueStatus.label : null
            }
            theme={theme}
            styles={styles}
          />

          <InfoTile
            Icon={todo.reminder ? Bell : BellOff}
            iconColor={todo.reminder ? '#F97316' : theme.colors.textLight}
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

        {/* COLOR TAG PREVIEW */}
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
              <Palette
                size={13}
                color={todo.color}
                strokeWidth={2.6}
              />
            </View>
            <Text
              style={[
                styles.colorRowLabel,
                {color: theme.colors.text},
              ]}>
              Color tag
            </Text>
            <View
              style={[
                styles.colorRowSwatch,
                {backgroundColor: todo.color},
              ]}
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

        {/* TIMESTAMPS */}
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
                <Clock
                  size={11}
                  color={theme.colors.textLight}
                  strokeWidth={2.6}
                />
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
                  {formatTimestamp(todo.createdAt) || 'Unknown'}
                </Text>
              </View>
            )}
            {todo.completedAt && (
              <View style={styles.timestampRow}>
                <CheckCircle2
                  size={11}
                  color="#10B981"
                  strokeWidth={2.6}
                />
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
                    {color: '#10B981'},
                  ]}>
                  {formatTimestamp(todo.completedAt) || 'Unknown'}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ACTIONS */}
        <View style={styles.actions}>
          {/* Primary - Complete */}
          <Pressable
            onPress={handleToggleComplete}
            accessibilityRole="button"
            accessibilityLabel={
              completed ? 'Mark as active' : 'Mark as complete'
            }
            style={({pressed}) => [
              styles.primaryBtn,
              {
                backgroundColor: completed
                  ? '#F59E0B'
                  : theme.colors.primary,
                shadowColor: completed
                  ? '#F59E0B'
                  : theme.colors.primary,
                opacity: pressed ? 0.9 : 1,
              },
            ]}>
            {completed ? (
              <Clock size={17} color="#FFFFFF" strokeWidth={2.8} />
            ) : (
              <CheckCircle2
                size={17}
                color="#FFFFFF"
                strokeWidth={2.8}
              />
            )}
            <Text style={styles.primaryBtnText}>
              {completed ? 'Mark as Active' : 'Mark as Complete'}
            </Text>
          </Pressable>

          {/* Secondary row: Edit + Favorite */}
          <View style={styles.secondaryRow}>
            <Pressable
              onPress={handleEdit}
              accessibilityRole="button"
              accessibilityLabel="Edit task"
              style={({pressed}) => [
                styles.secondaryBtn,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}>
              <Edit3
                size={15}
                color={theme.colors.text}
                strokeWidth={2.6}
              />
              <Text
                style={[
                  styles.secondaryBtnText,
                  {color: theme.colors.text},
                ]}>
                Edit
              </Text>
            </Pressable>

            <Pressable
              onPress={handleToggleFavorite}
              accessibilityRole="button"
              accessibilityLabel={
                todo.favorite
                  ? 'Remove favorite'
                  : 'Add favorite'
              }
              style={({pressed}) => [
                styles.secondaryBtn,
                {
                  backgroundColor: todo.favorite
                    ? '#F59E0B' + '14'
                    : theme.colors.surface,
                  borderColor: todo.favorite
                    ? '#F59E0B' + '40'
                    : theme.colors.border,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}>
              <Star
                size={15}
                color={
                  todo.favorite ? '#F59E0B' : theme.colors.text
                }
                strokeWidth={2.6}
                fill={todo.favorite ? '#F59E0B' : 'transparent'}
              />
              <Text
                style={[
                  styles.secondaryBtnText,
                  {
                    color: todo.favorite
                      ? '#F59E0B'
                      : theme.colors.text,
                  },
                ]}>
                {todo.favorite ? 'Favorited' : 'Favorite'}
              </Text>
            </Pressable>
          </View>

          {/* Delete */}
          <Pressable
            onPress={() => setShowDelete(true)}
            accessibilityRole="button"
            accessibilityLabel="Delete task"
            style={({pressed}) => [
              styles.dangerBtn,
              {
                backgroundColor: theme.colors.danger + '10',
                borderColor: theme.colors.danger + '35',
                opacity: pressed ? 0.85 : 1,
              },
            ]}>
            <Trash2
              size={15}
              color={theme.colors.danger}
              strokeWidth={2.6}
            />
            <Text
              style={[
                styles.dangerBtnText,
                {color: theme.colors.danger},
              ]}>
              Delete Task
            </Text>
          </Pressable>
        </View>

        <View style={{height: 30}} />
      </ScrollView>

      <ConfirmModal
        visible={showDelete}
        title="Delete Todo?"
        message="This todo will be moved to Trash. You can restore it later."
        confirmText="Delete"
        onCancel={() => setShowDelete(false)}
        onConfirm={handleDelete}
        danger
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
      paddingTop: 12,
      paddingBottom: Math.max(insets.bottom, 12) + 30,
    },

    /* Header */
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 18,
    },
    iconBtn: {
      width: 42,
      height: 42,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },

    /* Hero */
    heroCard: {
      paddingVertical: 18,
      paddingLeft: 20,
      paddingRight: 18,
      borderRadius: 20,
      borderWidth: 1,
      marginBottom: 14,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 3,
    },
    heroAccent: {
      position: 'absolute',
      left: 0,
      top: 16,
      bottom: 16,
      width: 4,
      borderTopRightRadius: 4,
      borderBottomRightRadius: 4,
    },
    colorTag: {
      position: 'absolute',
      top: 12,
      right: 12,
      width: 12,
      height: 12,
      borderRadius: 6,
    },
    heroTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap',
      marginBottom: 12,
    },
    statusPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: 9,
      borderWidth: 1,
    },
    statusPillText: {
      fontSize: 10.5,
      fontWeight: '900',
      letterSpacing: 0.4,
      textTransform: 'uppercase',
    },
    favTag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius: 9,
      borderWidth: 1,
    },
    favTagText: {
      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 0.8,
      color: '#F59E0B',
    },
    heroTitle: {
      fontSize: 22,
      fontWeight: '900',
      letterSpacing: -0.5,
      lineHeight: 28,
      marginBottom: 12,
    },
    heroChips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: 8,
      borderWidth: 1,
    },
    chipDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
    },
    chipText: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.2,
    },

    /* Section */
    sectionCard: {
      padding: 16,
      borderRadius: 18,
      borderWidth: 1,
      marginBottom: 14,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 3},
      shadowOpacity: 0.04,
      shadowRadius: 10,
      elevation: 2,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 10,
    },
    sectionIconWrap: {
      width: 26,
      height: 26,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sectionLabel: {
      fontSize: 10.5,
      fontWeight: '900',
      letterSpacing: 1.3,
    },
    description: {
      fontSize: 14.5,
      fontWeight: '500',
      lineHeight: 22,
      letterSpacing: -0.1,
    },

    /* Grid */
    gridLabel: {
      fontSize: 10.5,
      fontWeight: '900',
      letterSpacing: 1.4,
      marginTop: 6,
      marginBottom: 10,
      marginLeft: 4,
    },
    infoGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    infoTile: {
      width: '48.5%',
      padding: 12,
      borderRadius: 15,
      borderWidth: 1,
      marginBottom: 10,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 1,
    },
    infoTileIcon: {
      width: 26,
      height: 26,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    infoTileLabel: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      marginBottom: 3,
    },
    infoTileValue: {
      fontSize: 13.5,
      fontWeight: '800',
      letterSpacing: -0.2,
    },
    infoTileHint: {
      fontSize: 10.5,
      fontWeight: '800',
      letterSpacing: 0.2,
      marginTop: 3,
    },

    /* Color row */
    colorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 15,
      borderWidth: 1,
      marginBottom: 12,
    },
    colorRowLabel: {
      flex: 1,
      fontSize: 13,
      fontWeight: '800',
      letterSpacing: -0.1,
    },
    colorRowSwatch: {
      width: 16,
      height: 16,
      borderRadius: 8,
    },
    colorRowValue: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.5,
    },

    /* Timestamps */
    timestampsCard: {
      padding: 14,
      borderRadius: 15,
      borderWidth: 1,
      marginBottom: 16,
      gap: 10,
    },
    timestampRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    timestampLabel: {
      flex: 1,
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.1,
    },
    timestampValue: {
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 0.1,
    },

    /* Actions */
    actions: {
      gap: 10,
      marginTop: 4,
    },
    primaryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 16,
      borderRadius: 16,
      shadowOffset: {width: 0, height: 6},
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 5,
    },
    primaryBtnText: {
      color: '#FFFFFF',
      fontSize: 14.5,
      fontWeight: '900',
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
      gap: 7,
      paddingVertical: 13,
      borderRadius: 15,
      borderWidth: 1.5,
    },
    secondaryBtnText: {
      fontSize: 13.5,
      fontWeight: '800',
      letterSpacing: 0.2,
    },
    dangerBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 13,
      borderRadius: 15,
      borderWidth: 1.5,
    },
    dangerBtnText: {
      fontSize: 13.5,
      fontWeight: '900',
      letterSpacing: 0.2,
    },

    /* Not found */
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 30,
    },
    notFoundIcon: {
      width: 84,
      height: 84,
      borderRadius: 26,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    notFoundTitle: {
      fontSize: 18,
      fontWeight: '900',
      color: theme.colors.text,
      letterSpacing: -0.4,
      marginBottom: 6,
    },
    notFoundDesc: {
      fontSize: 13,
      fontWeight: '500',
      textAlign: 'center',
      lineHeight: 19,
      maxWidth: 260,
      marginBottom: 22,
    },
    notFoundBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      paddingHorizontal: 18,
      paddingVertical: 12,
      borderRadius: 13,
    },
    notFoundBtnText: {
      color: '#FFFFFF',
      fontSize: 13.5,
      fontWeight: '800',
      letterSpacing: 0.2,
    },
  });
}

export default TodoDetailScreen;