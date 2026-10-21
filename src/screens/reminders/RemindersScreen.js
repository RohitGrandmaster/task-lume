import React, {
  useMemo,
  useState,
  useRef,
  useEffect,
} from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  SectionList,
  ScrollView,
  RefreshControl,
  LayoutAnimation,
  UIManager,
  Platform,
  Animated,
} from 'react-native';
import {parseTaskDueDate} from '../../utils/dateUtils';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {DrawerActions} from '@react-navigation/native';
import {
  Menu,
  BellRing,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Plus,
  Calendar,
  Sun,
  CalendarDays,
  CalendarClock,
  Search,
  X,
  BellOff,
  Clock,
  Undo2,
} from 'lucide-react-native';

import useTodos from '../../hooks/useTodos';
import useTheme from '../../hooks/useTheme';
import ROUTES from '../../constants/routes';
import ReminderCard from '../../components/reminders/ReminderCard';
import ReminderSnoozeModal from '../../components/reminders/ReminderSnoozeModal';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental &&
  !global._Bridgeless &&
  !global.RN$Bridgeless
) {
  try {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  } catch (e) {}
}

/* --------------------------- CONSTANTS --------------------------- */

const PRIORITY_COLORS = {
  low: '#10B981',
  medium: '#F59E0B',
  high: '#EF4444',
};

const PRIORITY_RANK = {high: 3, medium: 2, low: 1};

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
};

const BUCKET_CONFIG = {
  overdue: {title: 'OVERDUE', accent: '#EF4444', Icon: AlertCircle},
  today: {title: 'TODAY', accent: '#6366F1', Icon: Sun},
  tomorrow: {title: 'TOMORROW', accent: '#8B5CF6', Icon: Calendar},
  thisWeek: {title: 'THIS WEEK', accent: '#06B6D4', Icon: CalendarDays},
  later: {title: 'LATER', accent: '#64748B', Icon: CalendarClock},
};

const FILTERS = [
  {key: 'all', label: 'All'},
  {key: 'overdue', label: 'Overdue'},
  {key: 'today', label: 'Today'},
  {key: 'week', label: 'Week'},
  {key: 'done', label: 'Done'},
];

const SNOOZE_OPTIONS = [
  {key: '15min', label: '15 minutes', offsetMinutes: 15, Icon: Clock},
  {key: '1hour', label: '1 hour', offsetMinutes: 60, Icon: Clock},
  {key: '3hours', label: '3 hours', offsetMinutes: 180, Icon: Clock},
  {key: 'tomorrow', label: 'Tomorrow', offsetDays: 1, Icon: Calendar},
  {key: 'nextweek', label: 'Next week', offsetDays: 7, Icon: CalendarDays},
];

/* --------------------------- HELPERS --------------------------- */

const pad = v => String(v).padStart(2, '0');
const dateKey = d =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function getTaskDueDate(task) {
  const source =
    Number.isFinite(task?.dueDateTimestamp) && task.dueDateTimestamp > 0
      ? task.dueDateTimestamp
      : task?.dueDate;
  return parseTaskDueDate(source);
}

function getBucket(task) {
  const date = getTaskDueDate(task);
  if (!date) return 'later';

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const endOfWeek = new Date(today);
  endOfWeek.setDate(endOfWeek.getDate() + 7);

  const taskDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (taskDay < today) return 'overdue';
  if (taskDay.getTime() === today.getTime()) return 'today';
  if (taskDay.getTime() === tomorrow.getTime()) return 'tomorrow';
  if (taskDay < endOfWeek) return 'thisWeek';
  return 'later';
}

function formatTimeUntil(task) {
  const date = getTaskDueDate(task);
  if (!date) return 'No date';

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const taskDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffDays = Math.round(
    (taskDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return '1d overdue';
  if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
  if (diffDays <= 7) return `In ${diffDays}d`;
  return date.toLocaleDateString(undefined, {month: 'short', day: 'numeric'});
}

function sortTasks(a, b) {
  const pDiff =
    (PRIORITY_RANK[b.priority] || 0) - (PRIORITY_RANK[a.priority] || 0);
  if (pDiff !== 0) return pDiff;
  const aDate = getTaskDueDate(a);
  const bDate = getTaskDueDate(b);
  if (aDate && bDate) return aDate - bDate;
  if (aDate) return -1;
  if (bDate) return 1;
  return 0;
}

function makeFutureDate(offsetMinutes = 0, offsetDays = 0) {
  const d = new Date();
  if (offsetDays) d.setDate(d.getDate() + offsetDays);
  if (offsetMinutes) d.setMinutes(d.getMinutes() + offsetMinutes);
  return dateKey(d);
}

/* --------------------------- SCREEN --------------------------- */

function RemindersScreen({navigation}) {
  const {theme} = useTheme();
  const {tasks, updateTodo, toggleTodo, deleteTodo} = useTodos();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme, insets), [theme, insets]);

  const [filter, setFilter] = useState('all');
  const [showCompleted, setShowCompleted] = useState(true);
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [snoozeTask, setSnoozeTask] = useState(null);
  const [snoozeModalVisible, setSnoozeModalVisible] = useState(false);

  const [undoState, setUndoState] = useState(null);
  const undoTimerRef = useRef(null);
  const undoAnim = useRef(new Animated.Value(0)).current;

  /* ---------------- Cleanup ---------------- */
  useEffect(() => {
    return () => {
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    };
  }, []);

  function openDrawer() {
    navigation.dispatch(DrawerActions.openDrawer());
  }

  /* ---------------- Reminder tasks ---------------- */
  const reminderTasks = useMemo(
    () => (tasks || []).filter(t => t && t.reminder === true && !t.deleted),
    [tasks],
  );

  const activeReminders = useMemo(
    () => reminderTasks.filter(t => !t.completed),
    [reminderTasks],
  );

  const completedReminders = useMemo(
    () => reminderTasks.filter(t => t.completed),
    [reminderTasks],
  );

  /* ---------------- Search ---------------- */
  const searchedActive = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return activeReminders;
    return activeReminders.filter(
      t =>
        (t.title || '').toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q) ||
        (t.category || '').toLowerCase().includes(q),
    );
  }, [activeReminders, search]);

  const searchedCompleted = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return completedReminders;
    return completedReminders.filter(
      t =>
        (t.title || '').toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q) ||
        (t.category || '').toLowerCase().includes(q),
    );
  }, [completedReminders, search]);

  /* ---------------- Filter ---------------- */
  const filteredActive = useMemo(() => {
    if (filter === 'all') return searchedActive;
    if (filter === 'overdue')
      return searchedActive.filter(t => getBucket(t) === 'overdue');
    if (filter === 'today')
      return searchedActive.filter(t => getBucket(t) === 'today');
    if (filter === 'week')
      return searchedActive.filter(t =>
        ['overdue', 'today', 'tomorrow', 'thisWeek'].includes(getBucket(t)),
      );
    if (filter === 'done') return [];
    return searchedActive;
  }, [searchedActive, filter]);

  /* ---------------- Sections ---------------- */
  const sections = useMemo(() => {
    const buckets = {
      overdue: [],
      today: [],
      tomorrow: [],
      thisWeek: [],
      later: [],
    };

    filteredActive.forEach(t => {
      buckets[getBucket(t)].push(t);
    });

    const result = [];

    Object.entries(BUCKET_CONFIG).forEach(([key, config]) => {
      const items = buckets[key];
      if (!items || items.length === 0) return;
      result.push({
        key,
        title: config.title,
        accent: config.accent,
        Icon: config.Icon,
        data: [...items].sort(sortTasks),
        isCompleted: false,
      });
    });

    const shouldShowCompleted =
      (filter === 'done' ||
        (showCompleted &&
          filter !== 'overdue' &&
          filter !== 'today' &&
          filter !== 'week')) &&
      searchedCompleted.length > 0;

    if (shouldShowCompleted) {
      result.push({
        key: 'completed',
        title: 'COMPLETED',
        accent: '#10B981',
        Icon: CheckCircle2,
        data: [...searchedCompleted].sort(sortTasks),
        isCompleted: true,
      });
    }

    return result;
  }, [filteredActive, searchedCompleted, showCompleted, filter]);

  /* ---------------- Counts ---------------- */
  const overdueCount = useMemo(
    () => activeReminders.filter(t => getBucket(t) === 'overdue').length,
    [activeReminders],
  );

  const todayCount = useMemo(
    () => activeReminders.filter(t => getBucket(t) === 'today').length,
    [activeReminders],
  );

  const weekCount = useMemo(
    () =>
      activeReminders.filter(t =>
        ['overdue', 'today', 'tomorrow', 'thisWeek'].includes(getBucket(t)),
      ).length,
    [activeReminders],
  );

  const doneCount = completedReminders.length;

  /* ---------------- Handlers ---------------- */
  function openTask(taskId) {
    navigation.navigate(ROUTES.TODO_DETAIL, {todoId: taskId});
  }

  function toggleCompleted() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowCompleted(v => !v);
  }

  function handleToggleComplete(task) {
    if (typeof toggleTodo === 'function') {
      toggleTodo(task.id);
    }
  }

  function handleSnoozePress(task) {
    setSnoozeTask(task);
    setSnoozeModalVisible(true);
  }

  function applySnooze(option) {
    if (!snoozeTask) return;
    const newDate = makeFutureDate(
      option.offsetMinutes || 0,
      option.offsetDays || 0,
    );

    if (typeof updateTodo === 'function') {
      try {
        updateTodo(snoozeTask.id, {dueDate: newDate});
      } catch (e) {
        console.log('Snooze failed:', e);
      }
    }

    setSnoozeModalVisible(false);
    setSnoozeTask(null);
  }

  function showUndo(taskId, taskTitle) {
    setUndoState({id: taskId, title: taskTitle});
    undoAnim.setValue(0);
    Animated.timing(undoAnim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();

    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    undoTimerRef.current = setTimeout(() => {
      Animated.timing(undoAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => setUndoState(null));
    }, 4000);
  }

  function handleDelete(task) {
    if (typeof deleteTodo !== 'function') return;
    deleteTodo(task.id);
    showUndo(task.id, task.title);
  }

  function handleUndo() {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    Animated.timing(undoAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(() => setUndoState(null));
  }

  function onRefresh() {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 700);
  }

  /* ---------------- Empty state message ---------------- */
  const emptyConfig = useMemo(() => {
    if (search.trim()) {
      return {
        title: 'No matches',
        desc: 'Try a different keyword.',
        showCTA: false,
      };
    }
    if (filter === 'overdue')
      return {
        title: 'No overdue',
        desc: "You're on top of everything. Nice work!",
        showCTA: false,
      };
    if (filter === 'today')
      return {
        title: 'Nothing today',
        desc: 'No reminders scheduled for today.',
        showCTA: false,
      };
    if (filter === 'week')
      return {
        title: 'Clear week ahead',
        desc: 'No reminders due this week.',
        showCTA: false,
      };
    if (filter === 'done')
      return {
        title: 'Nothing completed yet',
        desc: 'Complete a reminder and it will show up here.',
        showCTA: false,
      };
    return {
      title: 'No reminders yet',
      desc: 'Add a reminder to a task and it will appear here.',
      showCTA: true,
    };
  }, [filter, search]);

  const isEmpty = sections.length === 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <SectionList
        sections={sections}
        keyExtractor={item => String(item.id)}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={true}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        ListHeaderComponent={
          <View style={styles.container}>
            {/* ============ HEADER ============ */}
            <View style={styles.header}>
              <Pressable
                onPress={openDrawer}
                style={styles.menuBtn}
                hitSlop={8}>
                <Menu size={18} color={theme.colors.text} strokeWidth={2.6} />
              </Pressable>

              <View style={styles.headerContent}>
                <Text style={styles.title} numberOfLines={1}>
                  Reminders
                </Text>
                <Text style={styles.subtitle} numberOfLines={1}>
                  {activeReminders.length === 0
                    ? 'All caught up'
                    : `${activeReminders.length} active`}
                </Text>
              </View>

              <Pressable
                onPress={() => {
                  LayoutAnimation.configureNext(
                    LayoutAnimation.Presets.easeInEaseOut,
                  );
                  setSearchOpen(v => !v);
                  if (searchOpen) setSearch('');
                }}
                style={styles.headerIconBtn}
                hitSlop={6}>
                <Search size={16} color={theme.colors.text} strokeWidth={2.6} />
              </Pressable>

              <View style={[styles.countBadge, {backgroundColor: '#F97316'}]}>
                <BellRing size={13} color="#FFFFFF" strokeWidth={2.6} />
                <Text style={styles.countNumber}>{activeReminders.length}</Text>
              </View>
            </View>

            {/* ============ SEARCH BAR ============ */}
            {searchOpen && (
              <View
                style={[
                  styles.searchBar,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}>
                <Search
                  size={15}
                  color={theme.colors.textSecondary}
                  strokeWidth={2.4}
                />
                <TextInput
                  style={[styles.searchInput, {color: theme.colors.text}]}
                  placeholder="Search reminders..."
                  placeholderTextColor={theme.colors.textLight}
                  value={search}
                  onChangeText={setSearch}
                  autoFocus
                  returnKeyType="search"
                />
                {search.length > 0 && (
                  <Pressable onPress={() => setSearch('')} hitSlop={8}>
                    <X
                      size={14}
                      color={theme.colors.textSecondary}
                      strokeWidth={2.6}
                    />
                  </Pressable>
                )}
              </View>
            )}

            {/* ============ STATS ROW ============ */}
            <View style={styles.statsRow}>
              <Pressable
                onPress={() => setFilter('overdue')}
                style={[
                  styles.statCard,
                  {
                    backgroundColor:
                      filter === 'overdue' ? '#EF444418' : theme.colors.surface,
                    borderColor:
                      filter === 'overdue' ? '#EF444455' : theme.colors.border,
                  },
                ]}>
                <View
                  style={[styles.statIconWrap, {backgroundColor: '#EF444418'}]}>
                  <AlertCircle size={14} color="#EF4444" strokeWidth={2.6} />
                </View>
                <Text style={[styles.statValue, {color: theme.colors.text}]}>
                  {overdueCount}
                </Text>
                <Text
                  style={[
                    styles.statLabel,
                    {color: theme.colors.textSecondary},
                  ]}
                  numberOfLines={1}>
                  Overdue
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setFilter('today')}
                style={[
                  styles.statCard,
                  {
                    backgroundColor:
                      filter === 'today' ? '#6366F118' : theme.colors.surface,
                    borderColor:
                      filter === 'today' ? '#6366F155' : theme.colors.border,
                  },
                ]}>
                <View
                  style={[styles.statIconWrap, {backgroundColor: '#6366F118'}]}>
                  <Sun size={14} color="#6366F1" strokeWidth={2.6} />
                </View>
                <Text style={[styles.statValue, {color: theme.colors.text}]}>
                  {todayCount}
                </Text>
                <Text
                  style={[
                    styles.statLabel,
                    {color: theme.colors.textSecondary},
                  ]}
                  numberOfLines={1}>
                  Today
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setFilter('week')}
                style={[
                  styles.statCard,
                  {
                    backgroundColor:
                      filter === 'week' ? '#06B6D418' : theme.colors.surface,
                    borderColor:
                      filter === 'week' ? '#06B6D455' : theme.colors.border,
                  },
                ]}>
                <View
                  style={[styles.statIconWrap, {backgroundColor: '#06B6D418'}]}>
                  <CalendarDays size={14} color="#06B6D4" strokeWidth={2.6} />
                </View>
                <Text style={[styles.statValue, {color: theme.colors.text}]}>
                  {weekCount}
                </Text>
                <Text
                  style={[
                    styles.statLabel,
                    {color: theme.colors.textSecondary},
                  ]}
                  numberOfLines={1}>
                  This week
                </Text>
              </Pressable>
            </View>

            {/* ============ FILTER PILLS (HORIZONTAL SCROLL) ============ */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
              style={styles.filterScroll}>
              {FILTERS.map(f => {
                const selected = filter === f.key;
                const count =
                  f.key === 'overdue'
                    ? overdueCount
                    : f.key === 'today'
                    ? todayCount
                    : f.key === 'week'
                    ? weekCount
                    : f.key === 'done'
                    ? doneCount
                    : activeReminders.length;
                return (
                  <Pressable
                    key={f.key}
                    onPress={() => setFilter(f.key)}
                    style={[
                      styles.filterPill,
                      {
                        backgroundColor: selected
                          ? theme.colors.primary
                          : theme.colors.surface,
                        borderColor: selected
                          ? theme.colors.primary
                          : theme.colors.border,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.filterPillText,
                        {
                          color: selected
                            ? '#FFFFFF'
                            : theme.colors.textSecondary,
                        },
                      ]}>
                      {f.label}
                    </Text>
                    {count > 0 && (
                      <View
                        style={[
                          styles.filterBadge,
                          {
                            backgroundColor: selected
                              ? 'rgba(255,255,255,0.22)'
                              : theme.colors.background,
                          },
                        ]}>
                        <Text
                          style={[
                            styles.filterBadgeText,
                            {
                              color: selected
                                ? '#FFFFFF'
                                : theme.colors.textLight,
                            },
                          ]}>
                          {count}
                        </Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        }
        renderSectionHeader={({section}) => {
          const SectionIcon = section.Icon;
          return (
            <View
              style={[
                styles.sectionHeaderWrap,
                {backgroundColor: theme.colors.background},
              ]}>
              <View style={styles.sectionHeader}>
                <View
                  style={[
                    styles.sectionAccent,
                    {backgroundColor: section.accent},
                  ]}
                />
                <SectionIcon
                  size={13}
                  color={section.accent}
                  strokeWidth={2.8}
                />
                <Text
                  style={[styles.sectionTitle, {color: theme.colors.text}]}
                  numberOfLines={1}>
                  {section.title}
                </Text>
                <View
                  style={[
                    styles.sectionCount,
                    {backgroundColor: section.accent + '18'},
                  ]}>
                  <Text
                    style={[
                      styles.sectionCountText,
                      {color: section.accent},
                    ]}>
                    {section.data.length}
                  </Text>
                </View>

                {section.isCompleted && (
                  <Pressable
                    onPress={toggleCompleted}
                    hitSlop={8}
                    style={[
                      styles.sectionToggle,
                      {backgroundColor: theme.colors.surface},
                    ]}>
                    {showCompleted ? (
                      <ChevronUp
                        size={14}
                        color={theme.colors.textSecondary}
                        strokeWidth={2.6}
                      />
                    ) : (
                      <ChevronDown
                        size={14}
                        color={theme.colors.textSecondary}
                        strokeWidth={2.6}
                      />
                    )}
                  </Pressable>
                )}
              </View>
            </View>
          );
        }}
        renderItem={({item, section}) => (
          <View style={styles.cardWrap}>
            <ReminderCard
              task={item}
              theme={theme}
              styles={styles}
              completed={section.isCompleted}
              onPress={() => openTask(item.id)}
              onToggleComplete={() => handleToggleComplete(item)}
              onLongPress={() => handleSnoozePress(item)}
              getBucket={getBucket}
              formatTimeUntil={formatTimeUntil}
              priorityColors={PRIORITY_COLORS}
              categoryColors={CATEGORY_COLORS}
            />
          </View>
        )}
        ListEmptyComponent={
          isEmpty ? (
            <View style={styles.emptyWrap}>
              <View
                style={[
                  styles.emptyIconWrap,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}>
                <BellOff
                  size={34}
                  color={theme.colors.textLight}
                  strokeWidth={1.8}
                />
              </View>
              <Text style={[styles.emptyTitle, {color: theme.colors.text}]}>
                {emptyConfig.title}
              </Text>
              <Text
                style={[
                  styles.emptyDesc,
                  {color: theme.colors.textSecondary},
                ]}>
                {emptyConfig.desc}
              </Text>

              {emptyConfig.showCTA && (
                <Pressable
                  style={[
                    styles.emptyBtn,
                    {
                      backgroundColor: theme.colors.primary,
                      shadowColor: theme.colors.primary,
                    },
                  ]}
                  onPress={() => navigation.navigate(ROUTES.ADD_TODO)}>
                  <Plus size={15} color="#FFFFFF" strokeWidth={2.8} />
                  <Text style={styles.emptyBtnText}>Add a task</Text>
                </Pressable>
              )}
            </View>
          ) : null
        }
      />

      {/* ============ FAB ============ */}
      <Pressable
        onPress={() => navigation.navigate(ROUTES.ADD_TODO)}
        style={[
          styles.fab,
          {
            backgroundColor: theme.colors.primary,
            shadowColor: theme.colors.primary,
            bottom: Math.max(insets.bottom, 12) + 90,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel="Add new reminder">
        <Plus size={26} color="#FFFFFF" strokeWidth={2.9} />
      </Pressable>

      {/* ============ SNOOZE MODAL ============ */}
      <ReminderSnoozeModal
        visible={snoozeModalVisible}
        onClose={() => setSnoozeModalVisible(false)}
        snoozeTask={snoozeTask}
        snoozeOptions={SNOOZE_OPTIONS}
        onApplySnooze={applySnooze}
        onDelete={handleDelete}
        theme={theme}
        styles={styles}
      />

      {/* ============ UNDO SNACKBAR ============ */}
      {undoState && (
        <Animated.View
          style={[
            styles.undoBar,
            {
              backgroundColor: theme.colors.text,
              bottom: Math.max(insets.bottom, 12) + 90,
              opacity: undoAnim,
              transform: [
                {
                  translateY: undoAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}>
          <Text
            style={[styles.undoText, {color: theme.colors.background}]}
            numberOfLines={1}>
            Deleted "{undoState.title}"
          </Text>
          <Pressable
            onPress={handleUndo}
            hitSlop={8}
            style={[styles.undoBtn, {backgroundColor: theme.colors.primary}]}>
            <Undo2 size={12} color="#FFFFFF" strokeWidth={2.8} />
            <Text style={styles.undoBtnText}>Undo</Text>
          </Pressable>
        </Animated.View>
      )}
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
      paddingBottom: 120,
    },
    container: {
      paddingHorizontal: 20,
      paddingTop: 12,
    },

    /* Header */
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 14,
      gap: 8,
    },
    menuBtn: {
      width: 42,
      height: 42,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      flexShrink: 0,
    },
    headerContent: {
      flex: 1,
      minWidth: 0,
    },
    title: {
      fontSize: 22,
      fontWeight: '900',
      color: theme.colors.text,
      letterSpacing: -0.5,
    },
    subtitle: {
      marginTop: 2,
      fontSize: 12,
      fontWeight: '500',
      color: theme.colors.textSecondary,
      letterSpacing: 0.1,
    },
    headerIconBtn: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      flexShrink: 0,
    },
    countBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 12,
      minWidth: 44,
      justifyContent: 'center',
      flexShrink: 0,
    },
    countNumber: {
      fontSize: 14,
      fontWeight: '900',
      color: '#FFFFFF',
      letterSpacing: -0.3,
    },

    /* Search */
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 14,
      borderWidth: 1,
      marginBottom: 14,
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
      fontWeight: '600',
      padding: 0,
      letterSpacing: -0.1,
    },

    /* Stats row */
    statsRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 14,
    },
    statCard: {
      flex: 1,
      minWidth: 0,
      alignItems: 'center',
      paddingVertical: 11,
      paddingHorizontal: 6,
      borderRadius: 15,
      borderWidth: 1,
    },
    statIconWrap: {
      width: 26,
      height: 26,
      borderRadius: 9,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 6,
    },
    statValue: {
      fontSize: 17,
      fontWeight: '900',
      letterSpacing: -0.4,
      lineHeight: 20,
    },
    statLabel: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 0.1,
      marginTop: 2,
      textAlign: 'center',
      alignSelf: 'stretch',
    },

    /* Filter pills — horizontal scroll */
    filterScroll: {
      marginBottom: 16,
      marginHorizontal: -20,
    },
    filterRow: {
      flexDirection: 'row',
      gap: 8,
      paddingHorizontal: 20,
      paddingRight: 24,
    },
    filterPill: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
      paddingVertical: 9,
      paddingHorizontal: 14,
      borderRadius: 12,
      borderWidth: 1.5,
    },
    filterPillText: {
      fontSize: 11.5,
      fontWeight: '800',
      letterSpacing: 0.1,
      flexShrink: 0,
    },
    filterBadge: {
      minWidth: 16,
      height: 16,
      paddingHorizontal: 4,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    filterBadgeText: {
      fontSize: 9.5,
      fontWeight: '900',
      letterSpacing: 0.1,
    },

    /* Section header */
    sectionHeaderWrap: {
      paddingHorizontal: 20,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 10,
      marginTop: 4,
      minWidth: 0,
    },
    sectionAccent: {
      width: 3,
      height: 14,
      borderRadius: 2,
      flexShrink: 0,
    },
    sectionTitle: {
      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 1.2,
      flexShrink: 1,
    },
    sectionCount: {
      minWidth: 22,
      height: 20,
      paddingHorizontal: 6,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    sectionCountText: {
      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 0.2,
    },
    sectionToggle: {
      marginLeft: 'auto',
      width: 26,
      height: 26,
      borderRadius: 9,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      flexShrink: 0,
    },

    /* Card */
    cardWrap: {
      paddingHorizontal: 20,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 12,
      paddingRight: 12,
      paddingLeft: 14,
      marginBottom: 8,
      borderRadius: 15,
      borderWidth: 1,
      overflow: 'hidden',
    },
    cardLeftBar: {
      position: 'absolute',
      left: 0,
      top: 10,
      bottom: 10,
      width: 3,
      borderTopRightRadius: 3,
      borderBottomRightRadius: 3,
    },
    checkboxWrap: {
      padding: 2,
      flexShrink: 0,
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardContent: {
      flex: 1,
      minWidth: 0,
    },
    cardTitle: {
      fontSize: 14,
      fontWeight: '800',
      letterSpacing: -0.2,
      flexShrink: 1,
    },
    cardMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      marginTop: 4,
      flexWrap: 'wrap',
    },
    categoryDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      flexShrink: 0,
    },
    cardMeta: {
      fontSize: 11.5,
      fontWeight: '600',
      letterSpacing: 0.1,
      maxWidth: 90,
      flexShrink: 1,
    },
    cardMetaDot: {
      fontSize: 11,
      flexShrink: 0,
    },
    cardTime: {
      fontSize: 11.5,
      fontWeight: '800',
      letterSpacing: 0.1,
      flexShrink: 0,
    },
    overdueTag: {
      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 0.8,
      color: '#EF4444',
      backgroundColor: '#EF444418',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 5,
      flexShrink: 0,
    },
    snoozeBtn: {
      width: 32,
      height: 32,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },

    /* FAB */
    fab: {
      position: 'absolute',
      right: 20,
      width: 58,
      height: 58,
      borderRadius: 29,
      alignItems: 'center',
      justifyContent: 'center',
      shadowOffset: {width: 0, height: 8},
      shadowOpacity: 0.42,
      shadowRadius: 14,
      elevation: 10,
      borderWidth: 2,
      borderColor: 'rgba(255,255,255,0.25)',
    },

    /* Empty */
    emptyWrap: {
      alignItems: 'center',
      paddingHorizontal: 40,
      paddingTop: 40,
      paddingBottom: 40,
    },
    emptyIconWrap: {
      width: 84,
      height: 84,
      borderRadius: 26,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      marginBottom: 18,
    },
    emptyTitle: {
      fontSize: 17,
      fontWeight: '800',
      letterSpacing: -0.3,
      marginBottom: 6,
      textAlign: 'center',
    },
    emptyDesc: {
      fontSize: 12.5,
      fontWeight: '500',
      textAlign: 'center',
      lineHeight: 18,
      maxWidth: 260,
      marginBottom: 20,
    },
    emptyBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      paddingHorizontal: 18,
      paddingVertical: 12,
      borderRadius: 13,
      shadowOffset: {width: 0, height: 6},
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 5,
    },
    emptyBtnText: {
      color: '#FFFFFF',
      fontSize: 13.5,
      fontWeight: '800',
      letterSpacing: 0.2,
    },

    /* Snooze modal */
    snoozeOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
    },
    snoozeCard: {
      width: '100%',
      maxWidth: 360,
      borderRadius: 24,
      padding: 18,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 20},
      shadowOpacity: 0.35,
      shadowRadius: 40,
      elevation: 20,
    },
    snoozeHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 16,
    },
    snoozeHeaderIcon: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    snoozeHeaderText: {
      flex: 1,
      minWidth: 0,
    },
    snoozeTitle: {
      fontSize: 16,
      fontWeight: '900',
      letterSpacing: -0.3,
    },
    snoozeSubtitle: {
      fontSize: 12,
      fontWeight: '600',
      marginTop: 2,
      letterSpacing: 0.1,
    },
    snoozeClose: {
      width: 32,
      height: 32,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    snoozeOptions: {
      gap: 8,
    },
    snoozeOption: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 11,
      paddingHorizontal: 12,
      borderRadius: 13,
      borderWidth: 1,
    },
    snoozeOptionIcon: {
      width: 32,
      height: 32,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    snoozeOptionText: {
      flex: 1,
      fontSize: 14,
      fontWeight: '700',
      letterSpacing: -0.1,
    },
    snoozeDelete: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      paddingVertical: 12,
      borderRadius: 13,
      marginTop: 14,
    },
    snoozeDeleteText: {
      fontSize: 13.5,
      fontWeight: '800',
      color: '#EF4444',
      letterSpacing: 0.2,
    },

    /* Undo snackbar */
    undoBar: {
      position: 'absolute',
      left: 20,
      right: 20,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 12,
      paddingLeft: 16,
      paddingRight: 8,
      borderRadius: 14,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 8},
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 10,
    },
    undoText: {
      flex: 1,
      minWidth: 0,
      fontSize: 13,
      fontWeight: '700',
      letterSpacing: 0.1,
    },
    undoBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 10,
      flexShrink: 0,
    },
    undoBtnText: {
      fontSize: 12,
      fontWeight: '900',
      color: '#FFFFFF',
      letterSpacing: 0.2,
    },
  });
}

export default RemindersScreen;