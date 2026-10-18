import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Easing,
  Modal,
  TextInput,
  Share,
  BackHandler,
  ScrollView,
  RefreshControl,
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
  Pin,
  PinOff,
  Timer,
  TimerOff,
  X,
  ChevronLeft,
  Share2,
  Pencil,
  Trash2,
  Search,
} from 'lucide-react-native';

import SearchBar from '../../components/todo/SearchBar';
import FilterTabs from '../../components/todo/FilterTabs';
import TodoList from '../../components/todo/TodoList';
import ConfirmModal from '../../components/common/ConfirmModal';
import Loader from '../../components/common/Loader';
import UnifiedSearchModal from '../../components/common/UnifiedSearchModal';
import OnboardingModal, {
  ONBOARDING_KEY,
} from '../../components/common/OnboardingModal';
import {getItem} from '../../storage/storage';

import useTodos from '../../hooks/useTodos';
import useTheme from '../../hooks/useTheme';
import {useTranslation} from '../../i18n/translations';
import ROUTES from '../../constants/routes';

import {
  vibrateNow,
  parseTaskDueDate,
  calculateReminderTimestamp,
  notifyReminderAlert,
} from '../../utils/todoTimerNotifications';
import {stopSound} from '../../services/soundService';

const pad = value => String(value).padStart(2, '0');
const dateKey = date =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

function getGreeting(t) {
  const hour = new Date().getHours();
  if (hour < 5) return t('goodNight', 'Good Night');
  if (hour < 12) return t('goodMorning', 'Good Morning');
  if (hour < 17) return t('goodAfternoon', 'Good Afternoon');
  if (hour < 21) return t('goodEvening', 'Good Evening');
  return t('goodNight', 'Good Night');
}

function formatRemaining(ms) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${pad(m)}m ${pad(s)}s`;
  return `${pad(m)}:${pad(s)}`;
}

function buildShareMessage(todo) {
  const lines = [];
  lines.push(`📝 ${todo.title || 'Untitled task'}`);
  if (todo.description) {
    lines.push('');
    lines.push(todo.description);
  }
  lines.push('');
  if (todo.category) lines.push(`📂 Category: ${todo.category}`);
  if (todo.priority) {
    const p = todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1);
    lines.push(`⚡ Priority: ${p}`);
  }
  if (todo.dueDate && todo.dueDate !== 'No date') {
    lines.push(`📅 Due: ${todo.dueDate}`);
  }
  if (todo.completed) lines.push('✅ Status: Completed');
  if (todo.timerEndAt) {
    const remaining = todo.timerEndAt - Date.now();
    if (remaining > 0) {
      const mins = Math.round(remaining / 60000);
      lines.push(`⏱ Timer: ${mins} min left`);
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
  {key: 'today', labelKey: 'today', Icon: Calendar, color: '#0EA5E9'},
  {key: 'high', labelKey: 'high', Icon: Flame, color: '#EF4444'},
  {key: 'fav', labelKey: 'favorites', Icon: Star, color: '#F59E0B'},
];

const TIMER_PRESETS = [
  {minutes: 1, label: '1 min', sub: 'Micro'},
  {minutes: 5, label: '5 min', sub: 'Quick'},
  {minutes: 15, label: '15 min', sub: 'Short'},
  {minutes: 30, label: '30 min', sub: 'Half hour'},
  {minutes: 60, label: '1 hr', sub: 'Standard'},
  {minutes: 120, label: '2 hr', sub: 'Extended'},
  {minutes: 180, label: '3 hr', sub: 'Deep work'},
  {minutes: 240, label: '4 hr', sub: 'Long'},
  {minutes: 300, label: '5 hr', sub: 'Marathon'},
];

function HomeScreen({navigation}) {
  const {theme} = useTheme();
  const {t} = useTranslation();
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
  } = useTodos();

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (typeof loadTodos === 'function') await loadTodos();
    } catch (_) {}
    setTimeout(() => setRefreshing(false), 600);
  }, [loadTodos]);

  const [search, setSearch] = useState('');
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
  }, []);

  const [actionTodoId, setActionTodoId] = useState(null);
  const [sheetView, setSheetView] = useState('main');
  const [customMinutes, setCustomMinutes] = useState('');
  const [openSwipeId, setOpenSwipeId] = useState(null);
  const [now, setNow] = useState(() => Date.now());

  const styles = createStyles(theme, insets);
  const greeting = useMemo(() => getGreeting(t), [t]);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const actionTodo =
    actionTodoId != null
      ? tasks.find(t => String(t.id) === String(actionTodoId)) || null
      : null;

  useEffect(() => {
    const hasActiveTimer = (tasks || []).some(
      t => t.timerEndAt && t.timerEndAt > Date.now(),
    );
    if (!hasActiveTimer && !actionTodo?.timerEndAt) return undefined;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [tasks, actionTodo?.timerEndAt]);

  const expiredTimerIdsRef = useRef(new Set());
  useEffect(() => {
    if (!tasks?.length) return;
    tasks.forEach(t => {
      if (t.timerEndAt && t.timerEndAt > Date.now()) {
        expiredTimerIdsRef.current.delete(t.id);
      }
    });
    const expiredTasks = tasks.filter(
      t =>
        t.timerEndAt &&
        t.timerEndAt <= Date.now() &&
        !expiredTimerIdsRef.current.has(t.id),
    );
    if (expiredTasks.length === 0) return;
    expiredTasks.forEach(t => {
      expiredTimerIdsRef.current.add(t.id);
      const isRecentlyExpired = Date.now() - t.timerEndAt < 15000;
      clearTodoTimer(t.id, isRecentlyExpired);
    });
  }, [now, tasks, clearTodoTimer]);

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
          if (sheetView === 'timer') setSheetView('main');
          else closeSheet();
          return true;
        }
        return false;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
      return () => sub.remove();
    }, [actionTodoId, sheetView]),
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
    setSheetView('main');
    setActionTodoId(todo.id);
    setCustomMinutes('');
  }

  function closeSheet() {
    stopSound();
    setActionTodoId(null);
    setSheetView('main');
    setCustomMinutes('');
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

  function applyCustomTimer() {
    const m = parseInt(customMinutes, 10);
    if (actionTodo && Number.isFinite(m) && m > 0 && m <= 1440) {
      setTodoTimer(actionTodo.id, m);
      closeSheet();
    }
  }

  const activeTasks = (tasks || []).filter(task => !task.deleted);
  const completedCount = activeTasks.filter(t => t.completed).length;
  const pendingCount = activeTasks.length - completedCount;
  const progressPercent =
    activeTasks.length === 0
      ? 0
      : Math.round((completedCount / activeTasks.length) * 100);
  const todayKey = dateKey(new Date());

  const filteredTasks = activeTasks.filter(task => {
    const query = search.trim().toLowerCase();
    const matchSearch =
      !query ||
      (task.title || '').toLowerCase().includes(query) ||
      (task.description || '').toLowerCase().includes(query);
    const matchFilter =
      selectedFilter === 'all' ||
      (selectedFilter === 'active' && !task.completed) ||
      (selectedFilter === 'completed' && task.completed);
    const matchQuick =
      !quickFilter ||
      (quickFilter === 'today' && task.dueDate === todayKey) ||
      (quickFilter === 'high' && task.priority === 'high') ||
      (quickFilter === 'fav' && task.favorite);
    return matchSearch && matchFilter && matchQuick;
  });

  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return 0;
    });
  }, [filteredTasks]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progressPercent,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progressPercent, progressAnim]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Loader fullScreen />
      </SafeAreaView>
    );
  }

  const isEmpty = sortedTasks.length === 0;
  const sheetRemaining =
    actionTodo?.timerEndAt != null ? actionTodo.timerEndAt - now : 0;
  const sheetTimerExpired =
    Boolean(actionTodo?.timerEndAt) && sheetRemaining <= 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.headerCard}>
          <View style={styles.decorCircle1} />
          <View style={styles.decorCircle2} />
          <View style={styles.headerTopRow}>
            <Pressable onPress={openDrawer} style={styles.iconBtn} hitSlop={8}>
              <Menu size={16} color="#FFFFFF" strokeWidth={2.6} />
            </Pressable>
            <View style={styles.greetingPill}>
              <Sparkles size={11} color="#FFFFFF" strokeWidth={2.6} />
              <Text style={styles.greetingText}>{greeting}</Text>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
              <Pressable
                style={styles.iconBtn}
                hitSlop={8}
                onPress={() => setUnifiedSearchVisible(true)}>
                <Search size={16} color="#FFFFFF" strokeWidth={2.6} />
              </Pressable>
              <Pressable
                style={styles.iconBtn}
                hitSlop={8}
                onPress={() => navigation.navigate(ROUTES.REMINDERS)}>
                <Bell size={16} color="#FFFFFF" strokeWidth={2.6} />
                {activeTasks.filter(t => t.reminder && !t.completed).length > 0 && (
                  <View style={styles.bellDot} />
                )}
              </Pressable>
            </View>
          </View>
          <View style={styles.titleRow}>
            <View style={{flex: 1}}>
              <Text style={styles.headerTitle}>{t('myTasks', 'My Tasks')}</Text>
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                {activeTasks.length === 0
                  ? t('readyWhenYouAre', 'Ready when you are')
                  : pendingCount === 0
                  ? t('allDoneNice', 'All done. Nice!')
                  : `${pendingCount} ${t('tasksToFocus', 'tasks to focus on')}`}
              </Text>
            </View>
            {activeTasks.length > 0 && (
              <View style={styles.progressPill}>
                <Text style={styles.progressPillPercent}>{progressPercent}%</Text>
                <Text style={styles.progressPillLabel}>
                  {completedCount}/{activeTasks.length}
                </Text>
              </View>
            )}
          </View>
          {activeTasks.length > 0 && (
            <View style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
          )}
        </View>

        <SearchBar
          value={search}
          onChangeText={setSearch}
          onOpenUnified={() => setUnifiedSearchVisible(true)}
        />

        <FilterTabs selectedFilter={selectedFilter} onChange={setSelectedFilter} />

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
                }>
                <Icon
                  size={12}
                  color={active ? qf.color : theme.colors.textSecondary}
                  strokeWidth={2.6}
                  fill={active && qf.key === 'fav' ? qf.color : 'transparent'}
                />
                <Text
                  style={[
                    styles.quickChipText,
                    {
                      color: active ? qf.color : theme.colors.textSecondary,
                    },
                  ]}>
                  {t(qf.labelKey, qf.labelKey)}
                </Text>
              </Pressable>
            );
          })}
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
                <View style={styles.emptyIconWrap}>
                  <Inbox size={34} color={theme.colors.textLight} strokeWidth={1.8} />
                </View>
                <Text style={styles.emptyTitle}>{t('noTasks', 'No tasks yet')}</Text>
                <Text style={styles.emptyDesc}>{t('noTasksDesc', 'Add your first task to get started')}</Text>
                <Pressable
                  style={[styles.emptyBtn, {backgroundColor: theme.colors.primary}]}
                  onPress={() => navigation.navigate(ROUTES.ADD_TODO)}>
                  <Plus size={16} color="#FFFFFF" strokeWidth={2.6} />
                  <Text style={styles.emptyBtnText}>{t('addTask', 'Add Task')}</Text>
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
          onPress={() => navigation.navigate(ROUTES.ADD_TODO)}>
          <Plus size={24} color="#FFFFFF" strokeWidth={2.8} />
        </Pressable>

        <ConfirmModal
          visible={deleteId != null}
          title={t('deleteTask', 'Delete Task')}
          message="Move this task to trash?"
          confirmLabel={t('delete', 'Delete')}
          cancelLabel={t('cancel', 'Cancel')}
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
      paddingHorizontal: 16,
      paddingBottom: 16,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
      overflow: 'hidden',
    },
    decorCircle1: {
      position: 'absolute',
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: 'rgba(255,255,255,0.08)',
      top: -40,
      right: -20,
    },
    decorCircle2: {
      position: 'absolute',
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: 'rgba(255,255,255,0.06)',
      bottom: 10,
      left: -20,
    },
    headerTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    iconBtn: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: 'rgba(255,255,255,0.18)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    greetingPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.18)',
    },
    greetingText: {color: '#FFFFFF', fontSize: 12, fontWeight: '700'},
    titleRow: {flexDirection: 'row', alignItems: 'center'},
    headerTitle: {
      color: '#FFFFFF',
      fontSize: 22,
      fontWeight: '900',
      letterSpacing: -0.3,
    },
    headerSubtitle: {
      color: 'rgba(255,255,255,0.85)',
      fontSize: 12,
      marginTop: 2,
    },
    progressPill: {
      backgroundColor: 'rgba(255,255,255,0.2)',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 12,
      alignItems: 'center',
    },
    progressPillPercent: {color: '#FFFFFF', fontSize: 14, fontWeight: '900'},
    progressPillLabel: {color: 'rgba(255,255,255,0.8)', fontSize: 10},
    progressTrack: {
      height: 4,
      backgroundColor: 'rgba(255,255,255,0.25)',
      borderRadius: 2,
      marginTop: 12,
      overflow: 'hidden',
    },
    progressFill: {height: '100%', backgroundColor: '#FFFFFF', borderRadius: 2},
    quickRow: {
      flexDirection: 'row',
      gap: 8,
      paddingHorizontal: 16,
      marginBottom: 8,
    },
    quickChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    quickChipText: {fontSize: 12, fontWeight: '700'},
    list: {flex: 1, paddingHorizontal: 16},
    emptyScroll: {flexGrow: 1, justifyContent: 'center'},
    emptyState: {alignItems: 'center', padding: 32},
    emptyIconWrap: {
      width: 72,
      height: 72,
      borderRadius: 24,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.colors.text,
      marginBottom: 6,
    },
    emptyDesc: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 20,
    },
    emptyBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
    },
    emptyBtnText: {color: '#FFFFFF', fontSize: 13, fontWeight: '700'},
    fab: {
      position: 'absolute',
      right: 20,
      bottom: (insets?.bottom || 0) + 80,
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 6,
    },
    bellDot: {
      position: 'absolute',
      top: 6,
      right: 6,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#EF4444',
    },
  });
}

export default HomeScreen;
