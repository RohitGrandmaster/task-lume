import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Share,
  BackHandler,
  ScrollView,
  RefreshControl,
  AppState,
} from 'react-native';
import {useState, useRef, useEffect, useMemo, useCallback} from 'react';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {DrawerActions, useFocusEffect} from '@react-navigation/native';
import {
  Menu,
  Bell,
  Plus,
  Calendar,
  Flame,
  Star,
  Inbox,
  Sparkles,
  Search,
  CheckCircle2,
} from 'lucide-react-native';

import FilterTabs from '../../components/todo/FilterTabs';
import TodoList from '../../components/todo/TodoList';
import TodoActionSheetModal from '../../components/todo/TodoActionSheetModal';
import ConfirmModal from '../../components/common/ConfirmModal';
import Loader from '../../components/common/Loader';
import UnifiedSearchModal from '../../components/common/UnifiedSearchModal';
import OnboardingModal, {
  ONBOARDING_KEY,
} from '../../components/common/OnboardingModal';
import {getItem} from '../../storage/storage';

import useTodos from '../../hooks/useTodos';
import useTheme from '../../hooks/useTheme';
import ROUTES from '../../constants/routes';

import {
  parseTaskDueDate,
  calculateReminderTimestamp,
  notifyReminderAlert,
} from '../../utils/todoTimerNotifications';
import {
  stopSound,
  playAlarmSound,
  initSoundService,
} from '../../services/soundService';

const pad = value => String(value).padStart(2, '0');
const dateKey = date =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const EXPIRY_GRACE_MS = 60 * 1000;

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 5) return 'Good Night';
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  if (hour < 21) return 'Good Evening';
  return 'Good Night';
}

function buildShareMessage(todo) {
  const lines = [];
  lines.push(`${todo.title || 'Untitled task'}`);
  if (todo.description) {
    lines.push('');
    lines.push(todo.description);
  }
  lines.push('');
  if (todo.category) lines.push(`Category: ${todo.category}`);
  if (todo.priority) {
    const p = todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1);
    lines.push(`Priority: ${p}`);
  }
  if (todo.dueDate && todo.dueDate !== 'No date') {
    lines.push(`Due: ${todo.dueDate}`);
  }
  if (todo.completed) lines.push('Status: Completed');
  if (todo.timerEndAt) {
    const remaining = todo.timerEndAt - Date.now();
    if (remaining > 0) {
      const mins = Math.round(remaining / 60000);
      lines.push(`Timer: ${mins} min left`);
    }
  }
  lines.push('');
  lines.push('— Shared from Todo App');
  return lines.join('\n');
}

async function shareTodo(todo) {
  if (!todo) return;
  try {
    await Share.share({
      message: buildShareMessage(todo),
      title: todo.title || 'Task',
    });
  } catch {}
}

const QUICK_FILTERS = [
  {key: 'today', label: 'Today', Icon: Calendar, color: '#0EA5E9'},
  {key: 'high', label: 'High Priority', Icon: Flame, color: '#EF4444'},
  {key: 'fav', label: 'Favorites', Icon: Star, color: '#F59E0B'},
];

function HomeScreen({navigation}) {
  const {theme} = useTheme();
  const insets = useSafeAreaInsets();

  const {
    tasks,
    loading,
    loadTodos,
    toggleTodo,
    deleteTodo,
    toggleFavorite,
    togglePinTodo,
    toggleTodoReminder,
    setTodoTimer,
    clearTodoTimer,
    startTodoTimer,
  } = useTodos();

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (typeof loadTodos === 'function') await loadTodos();
    } catch (_) {}
    setTimeout(() => setRefreshing(false), 600);
  }, [loadTodos]);

  const [selectedFilter, setSelectedFilter] = useState('all');
  const [quickFilter, setQuickFilter] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [unifiedSearchVisible, setUnifiedSearchVisible] = useState(false);
  const [onboardingVisible, setOnboardingVisible] = useState(false);

  useEffect(() => {
    async function checkFirstRun() {
      try {
        const hasSeen = await getItem(ONBOARDING_KEY, false);
        if (!hasSeen) setOnboardingVisible(true);
      } catch (_) {}
    }
    checkFirstRun();
    initSoundService().catch(() => {});
  }, []);

  const [actionTodoId, setActionTodoId] = useState(null);
  const [openSwipeId, setOpenSwipeId] = useState(null);
  const [now, setNow] = useState(() => Date.now());

  const styles = createStyles(theme, insets);
  const greeting = useMemo(() => getGreeting(), []);

  const actionTodo =
    actionTodoId != null
      ? tasks.find(x => String(x.id) === String(actionTodoId)) || null
      : null;

  // AppState — foreground aate hi now refresh
  const appStateRef = useRef(AppState.currentState);
  useEffect(() => {
    const sub = AppState.addEventListener('change', next => {
      const wasBg = /inactive|background/.test(appStateRef.current);
      if (wasBg && next === 'active') {
        setNow(Date.now());
      }
      appStateRef.current = next;
    });
    return () => sub.remove();
  }, []);

  // Ticker — ANY timer hone par
  useEffect(() => {
    const hasAnyTimer = (tasks || []).some(x => x.timerEndAt);
    if (!hasAnyTimer && !actionTodo?.timerEndAt) return undefined;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [tasks, actionTodo?.timerEndAt]);

  // Expiry detection — 5 second sound + vibration + clear timer
  const expiredTimerIdsRef = useRef(new Set());
  useEffect(() => {
    if (!tasks?.length) return;

    tasks.forEach(x => {
      if (x.timerEndAt && x.timerEndAt > Date.now()) {
        expiredTimerIdsRef.current.delete(String(x.id));
      }
    });

    const nowMs = Date.now();
    const expiredTasks = tasks.filter(
      x =>
        x.timerEndAt &&
        x.timerEndAt <= nowMs &&
        !expiredTimerIdsRef.current.has(String(x.id)),
    );
    if (expiredTasks.length === 0) return;

    expiredTasks.forEach(x => {
      const idStr = String(x.id);
      expiredTimerIdsRef.current.add(idStr);
      const isRecentlyExpired = nowMs - x.timerEndAt < EXPIRY_GRACE_MS;
      if (isRecentlyExpired) {
        // 5 second alarm sound + 5 second rhythmic vibration
        playAlarmSound(true, 5000, 'todo_timer');
      }
      try {
        const r = clearTodoTimer(x.id, isRecentlyExpired);
        if (r && typeof r.catch === 'function') r.catch(() => {});
      } catch (_) {}
    });
  }, [now, tasks, clearTodoTimer]);

  // Reminder alerts
  const alertedIdsRef = useRef(new Set());
  useEffect(() => {
    if (!tasks?.length) return;
    const nowMs = Date.now();
    tasks.forEach(task => {
      if (!task.reminder || task.completed || task.deleted) return;
      if (alertedIdsRef.current.has(task.id)) return;
      const dateObj = parseTaskDueDate(task.dueDate);
      if (!dateObj) return;
      const isToday =
        dateObj.getFullYear() === new Date().getFullYear() &&
        dateObj.getMonth() === new Date().getMonth() &&
        dateObj.getDate() === new Date().getDate();
      if (isToday) {
        const remTime = calculateReminderTimestamp(task);
        if (remTime && nowMs >= remTime && nowMs - remTime < 60000) {
          alertedIdsRef.current.add(task.id);
          notifyReminderAlert(task);
        }
      }
    });
  }, [now, tasks]);

  useFocusEffect(
    useCallback(() => {
      const onBack = () => {
        if (actionTodoId != null) {
          closeSheet();
          return true;
        }
        return false;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
      return () => sub.remove();
    }, [actionTodoId]),
  );

  function openDrawer() {
    navigation.dispatch(DrawerActions.openDrawer());
  }

  function confirmDelete() {
    if (deleteId !== null) {
      deleteTodo(deleteId);
      setDeleteId(null);
    }
  }

  function handleTodoLongPress(todo) {
    setOpenSwipeId(null);
    setActionTodoId(todo.id);
  }

  function closeSheet() {
    stopSound();
    setActionTodoId(null);
  }

  function handleShareFromSheet() {
    if (actionTodo) shareTodo(actionTodo);
    closeSheet();
  }

  function handleEditFromSheet() {
    if (actionTodo) {
      const id = actionTodo.id;
      closeSheet();
      navigation.navigate(ROUTES.EDIT_TODO, {todoId: id});
    }
  }

  function handleDeleteFromSheet() {
    if (actionTodo) {
      const id = actionTodo.id;
      closeSheet();
      setTimeout(() => setDeleteId(id), 220);
    }
  }

  function handleFavoriteFromSheet() {
    if (actionTodo) toggleFavorite(actionTodo.id);
  }

  const activeTasks = (tasks || []).filter(task => !task.deleted);
  const completedCount = activeTasks.filter(x => x.completed).length;
  const pendingCount = activeTasks.length - completedCount;
  const progressPercent =
    activeTasks.length === 0
      ? 0
      : Math.round((completedCount / activeTasks.length) * 100);
  const todayKey = dateKey(new Date());

  const filteredTasks = activeTasks.filter(task => {
    const matchFilter =
      selectedFilter === 'all' ||
      (selectedFilter === 'active' && !task.completed) ||
      (selectedFilter === 'completed' && task.completed);
    const matchQuick =
      !quickFilter ||
      (quickFilter === 'today' &&
        (task.dueDate === todayKey ||
          task.dueDate === 'Today' ||
          (() => {
            const d = parseTaskDueDate(task.dueDate);
            return Boolean(
              d &&
                d.getFullYear() === new Date().getFullYear() &&
                d.getMonth() === new Date().getMonth() &&
                d.getDate() === new Date().getDate(),
            );
          })())) ||
      (quickFilter === 'high' && task.priority === 'high') ||
      (quickFilter === 'fav' && task.favorite);
    return matchFilter && matchQuick;
  });

  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return 0;
    });
  }, [filteredTasks]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Loader fullScreen />
      </SafeAreaView>
    );
  }

  const isEmpty = sortedTasks.length === 0;
  const allDone =
    activeTasks.length > 0 && pendingCount === 0 && !quickFilter;

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <View style={styles.container}>
        <View style={styles.headerCard}>
          <View style={styles.decorCircle1} />
          <View style={styles.decorCircle2} />
          <View style={styles.decorCircle3} />

          <View style={styles.headerTopRow}>
            <Pressable
              onPress={openDrawer}
              style={styles.iconBtn}
              hitSlop={8}
              accessibilityLabel="Open menu">
              <Menu size={17} color="#FFFFFF" strokeWidth={2.5} />
            </Pressable>

            <View style={styles.greetingPill}>
              <Sparkles size={11} color="#FFFFFF" strokeWidth={2.6} />
              <Text style={styles.greetingText}>{greeting}</Text>
            </View>

            <View style={styles.headerActions}>
              <Pressable
                style={styles.iconBtn}
                hitSlop={8}
                onPress={() => setUnifiedSearchVisible(true)}
                accessibilityLabel="Search">
                <Search size={16} color="#FFFFFF" strokeWidth={2.5} />
              </Pressable>
              <Pressable
                style={styles.iconBtn}
                hitSlop={8}
                onPress={() => navigation.navigate(ROUTES.REMINDERS)}
                accessibilityLabel="Reminders">
                <Bell size={16} color="#FFFFFF" strokeWidth={2.5} />
                {activeTasks.filter(x => x.reminder && !x.completed).length >
                  0 && <View style={styles.bellDot} />}
              </Pressable>
            </View>
          </View>

          <View style={styles.titleRow}>
            <View style={styles.titleBlock}>
              <Text style={styles.headerTitle}>My Tasks</Text>
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                {activeTasks.length === 0
                  ? 'Ready when you are'
                  : pendingCount === 0
                  ? 'All done. Nice!'
                  : `${pendingCount} tasks to focus on`}
              </Text>
            </View>

            {activeTasks.length > 0 && (
              <View style={styles.progressPill}>
                <Text style={styles.progressPillPercent}>
                  {progressPercent}%
                </Text>
                <Text style={styles.progressPillLabel}>
                  {completedCount}/{activeTasks.length}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.contentPad}>
          <FilterTabs
            selectedFilter={selectedFilter}
            onChange={setSelectedFilter}
          />

          <View style={styles.quickRow}>
            {QUICK_FILTERS.map(qf => {
              const active = quickFilter === qf.key;
              const Icon = qf.Icon;
              return (
                <Pressable
                  key={qf.key}
                  style={[
                    styles.quickChip,
                    active && {
                      backgroundColor: qf.color + '18',
                      borderColor: qf.color,
                    },
                  ]}
                  onPress={() =>
                    setQuickFilter(prev => (prev === qf.key ? null : qf.key))
                  }
                  accessibilityRole="button"
                  accessibilityState={{selected: active}}>
                  <Icon
                    size={13}
                    color={active ? qf.color : theme.colors.textSecondary}
                    strokeWidth={2.5}
                    fill={active && qf.key === 'fav' ? qf.color : 'transparent'}
                  />
                  <Text
                    style={[
                      styles.quickChipText,
                      {
                        color: active
                          ? qf.color
                          : theme.colors.textSecondary,
                      },
                    ]}>
                    {qf.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.list}>
          {isEmpty ? (
            <ScrollView
              contentContainerStyle={styles.emptyScroll}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[theme.colors.primary]}
                  tintColor={theme.colors.primary}
                />
              }>
              <View style={styles.emptyState}>
                <View
                  style={[
                    styles.emptyIconWrap,
                    allDone && {
                      backgroundColor: theme.colors.successSoft,
                    },
                  ]}>
                  {allDone ? (
                    <CheckCircle2
                      size={36}
                      color={theme.colors.success}
                      strokeWidth={1.8}
                    />
                  ) : (
                    <Inbox
                      size={34}
                      color={theme.colors.textLight}
                      strokeWidth={1.6}
                    />
                  )}
                </View>

                <Text style={styles.emptyTitle}>
                  {allDone ? 'All caught up!' : 'No tasks yet'}
                </Text>
                <Text style={styles.emptyDesc}>
                  {allDone
                    ? 'You have completed everything. Time to relax or add more.'
                    : 'Add your first task and start being productive.'}
                </Text>

                <Pressable
                  style={[
                    styles.emptyBtn,
                    {backgroundColor: theme.colors.primary},
                  ]}
                  onPress={() => navigation.navigate(ROUTES.ADD_TODO)}
                  accessibilityLabel="Add new task">
                  <Plus size={16} color="#FFFFFF" strokeWidth={2.6} />
                  <Text style={styles.emptyBtnText}>
                    {allDone ? 'Add another' : 'Add Task'}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          ) : (
            <TodoList
              tasks={sortedTasks}
              onToggle={toggleTodo}
              onDelete={id => setDeleteId(id)}
              onFavorite={toggleFavorite}
              onPin={togglePinTodo}
              onLongPress={handleTodoLongPress}
              onPress={todo =>
                navigation.navigate(ROUTES.TODO_DETAIL, {todoId: todo.id})
              }
              openSwipeId={openSwipeId}
              setOpenSwipeId={setOpenSwipeId}
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          )}
        </View>

        <Pressable
          style={[styles.fab, {backgroundColor: theme.colors.primary}]}
          onPress={() => navigation.navigate(ROUTES.ADD_TODO)}
          accessibilityLabel="Add new task">
          <Plus size={24} color="#FFFFFF" strokeWidth={2.8} />
        </Pressable>

        <TodoActionSheetModal
          visible={actionTodoId != null}
          actionTodo={actionTodo}
          onClose={closeSheet}
          togglePinTodo={togglePinTodo}
          setTodoTimer={setTodoTimer}
          clearTodoTimer={clearTodoTimer}
          startTodoTimer={startTodoTimer}
          toggleTodoReminder={toggleTodoReminder}
          onFavorite={handleFavoriteFromSheet}
          onShare={handleShareFromSheet}
          onEdit={handleEditFromSheet}
          onDelete={handleDeleteFromSheet}
          theme={theme}
        />

        <ConfirmModal
          visible={deleteId != null}
          title="Delete Task"
          message="Move this task to trash?"
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteId(null)}
        />

        <UnifiedSearchModal
          visible={unifiedSearchVisible}
          onClose={() => setUnifiedSearchVisible(false)}
          navigation={navigation}
        />

        <OnboardingModal
          visible={onboardingVisible}
          onClose={() => setOnboardingVisible(false)}
        />
      </View>
    </SafeAreaView>
  );
}

function createStyles(theme, insets) {
  return StyleSheet.create({
    safeArea: {flex: 1, backgroundColor: theme.colors.background},
    container: {flex: 1},
    headerCard: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 18,
      paddingTop: (insets?.top || 0) + 4,
      paddingBottom: 18,
      borderBottomLeftRadius: 28,
      borderBottomRightRadius: 28,
      overflow: 'hidden',
    },
    decorCircle1: {
      position: 'absolute',
      width: 140,
      height: 140,
      borderRadius: 70,
      backgroundColor: 'rgba(255,255,255,0.07)',
      top: -50,
      right: -30,
    },
    decorCircle2: {
      position: 'absolute',
      width: 90,
      height: 90,
      borderRadius: 45,
      backgroundColor: 'rgba(255,255,255,0.05)',
      bottom: -10,
      left: -25,
    },
    decorCircle3: {
      position: 'absolute',
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: 'rgba(255,255,255,0.06)',
      top: 30,
      left: 80,
    },
    headerTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14,
    },
    iconBtn: {
      width: 38,
      height: 38,
      borderRadius: 13,
      backgroundColor: 'rgba(255,255,255,0.16)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    greetingPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 13,
      paddingVertical: 7,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.16)',
    },
    greetingText: {
      color: '#FFFFFF',
      fontSize: 12.5,
      fontWeight: '700',
      letterSpacing: 0.2,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    titleRow: {flexDirection: 'row', alignItems: 'center'},
    titleBlock: {flex: 1, paddingRight: 12},
    headerTitle: {
      color: '#FFFFFF',
      fontSize: 24,
      fontWeight: '900',
      letterSpacing: -0.4,
    },
    headerSubtitle: {
      color: 'rgba(255,255,255,0.82)',
      fontSize: 13,
      marginTop: 3,
      fontWeight: '500',
    },
    progressPill: {
      backgroundColor: 'rgba(255,255,255,0.18)',
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 14,
      alignItems: 'center',
      minWidth: 58,
    },
    progressPillPercent: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '900',
      letterSpacing: -0.3,
    },
    progressPillLabel: {
      color: 'rgba(255,255,255,0.75)',
      fontSize: 10,
      fontWeight: '600',
      marginTop: 1,
    },
    contentPad: {paddingHorizontal: 16, paddingTop: 12},
    quickRow: {flexDirection: 'row', gap: 8, marginBottom: 6},
    quickChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    quickChipText: {fontSize: 12, fontWeight: '700', letterSpacing: 0.15},
    list: {
      flex: 1,
      paddingHorizontal: 16,
      paddingBottom: (insets?.bottom || 0) + 90,
    },
    emptyScroll: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingBottom: 40,
    },
    emptyState: {
      alignItems: 'center',
      paddingHorizontal: 28,
      paddingVertical: 24,
    },
    emptyIconWrap: {
      width: 80,
      height: 80,
      borderRadius: 28,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
      ...theme.shadows.soft,
    },
    emptyTitle: {
      fontSize: 19,
      fontWeight: '800',
      color: theme.colors.text,
      marginBottom: 8,
      letterSpacing: -0.2,
    },
    emptyDesc: {
      fontSize: 14,
      lineHeight: 20,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 24,
      maxWidth: 280,
    },
    emptyBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 14,
      ...theme.shadows.card,
    },
    emptyBtnText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '700',
      letterSpacing: 0.2,
    },
    fab: {
      position: 'absolute',
      right: 20,
      bottom: (insets?.bottom || 0) + 86,
      width: 58,
      height: 58,
      borderRadius: 29,
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.shadows.elevated,
    },
    bellDot: {
      position: 'absolute',
      top: 7,
      right: 7,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#F87171',
      borderWidth: 1.5,
      borderColor: theme.colors.primary,
    },
  });
}

export default HomeScreen;