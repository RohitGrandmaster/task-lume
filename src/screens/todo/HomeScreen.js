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
} from 'lucide-react-native';

import SearchBar from '../../components/todo/SearchBar';
import FilterTabs from '../../components/todo/FilterTabs';
import TodoList from '../../components/todo/TodoList';
import ConfirmModal from '../../components/common/ConfirmModal';
import Loader from '../../components/common/Loader';

import useTodos from '../../hooks/useTodos';
import useTheme from '../../hooks/useTheme';
import ROUTES from '../../constants/routes';

// ✅ NEW: Timer & Reminder notifications
import {
  vibrateNow,
  parseTaskDueDate,
  calculateReminderTimestamp,
  notifyReminderAlert,
} from '../../utils/todoTimerNotifications';

/* --------------------------- HELPERS --------------------------- */

const pad = value => String(value).padStart(2, '0');

const dateKey = date =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}`;

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 5) return 'Good Night';
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  if (hour < 21) return 'Good Evening';
  return 'Good Night';
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
  } catch {
    // user cancelled
  }
}

const QUICK_FILTERS = [
  {key: 'today', label: 'Today', Icon: Calendar, color: '#0EA5E9'},
  {key: 'high', label: 'High', Icon: Flame, color: '#EF4444'},
  {key: 'fav', label: 'Favorites', Icon: Star, color: '#F59E0B'},
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

/* --------------------------- COMPONENT ------------------------- */

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
  } = useTodos();

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (typeof loadTodos === 'function') {
        await loadTodos();
      }
    } catch (_) {}
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  }, [loadTodos]);

  const [search, setSearch] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [quickFilter, setQuickFilter] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // Bottom sheet
  const [actionTodoId, setActionTodoId] = useState(null);
  const [sheetView, setSheetView] = useState('main'); // 'main' | 'timer'
  const [customMinutes, setCustomMinutes] = useState('');

  // ✅ Single swipe open
  const [openSwipeId, setOpenSwipeId] = useState(null);

  // Live clock for sheet remaining time
  const [now, setNow] = useState(() => Date.now());

  const styles = createStyles(theme, insets);
  const greeting = useMemo(() => getGreeting(), []);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const actionTodo =
    actionTodoId != null
      ? tasks.find(t => String(t.id) === String(actionTodoId)) || null
      : null;

  // ✅ Global timer tick — jab bhi koi active timer ho YA sheet open ho
  useEffect(() => {
    const hasActiveTimer = (tasks || []).some(
      t => t.timerEndAt && t.timerEndAt > Date.now(),
    );
    if (!hasActiveTimer && !actionTodo?.timerEndAt) {
      return undefined;
    }
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [tasks, actionTodo?.timerEndAt]);

  // ✅ Timer expire → Upper notification + Alarm sound + vibrate + clear
  useEffect(() => {
    if (!tasks?.length) return;
    const expiredTasks = tasks.filter(
      t => t.timerEndAt && t.timerEndAt <= Date.now(),
    );

    if (expiredTasks.length === 0) return;

    // isExpired = true triggers upper notification + alarm sound + vibration
    expiredTasks.forEach(t => clearTodoTimer(t.id, true));
  }, [now, tasks, clearTodoTimer]);

  // ✅ Live check for task reminders due today / alert time
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

  // ✅ Android back button hierarchy
  useFocusEffect(
    useCallback(() => {
      const onBack = () => {
        if (actionTodoId != null) {
          if (sheetView === 'timer') {
            setSheetView('main');
          } else {
            closeSheet();
          }
          return true; // handled
        }
        return false; // default back
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
    setOpenSwipeId(null); // swipe band karo
    setSheetView('main');
    setActionTodoId(todo.id);
    setCustomMinutes('');
  }

  function closeSheet() {
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
    if (actionTodo) {
      toggleFavorite(actionTodo.id);
    }
    // sheet open rehne do taaki user dekh sake
  }

  function applyCustomTimer() {
    const m = parseInt(customMinutes, 10);
    if (actionTodo && Number.isFinite(m) && m > 0 && m <= 1440) {
      // max 24 hours
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

  // ✅ Pinned todos always on top
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

  // Remaining time for sheet
  const sheetRemaining =
    actionTodo?.timerEndAt != null
      ? actionTodo.timerEndAt - now
      : 0;
  const sheetTimerExpired =
    Boolean(actionTodo?.timerEndAt) && sheetRemaining <= 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.headerCard}>
          <View style={styles.decorCircle1} />
          <View style={styles.decorCircle2} />

          <View style={styles.headerTopRow}>
            <Pressable
              onPress={openDrawer}
              style={styles.iconBtn}
              hitSlop={8}
              accessibilityLabel="Open menu">
              <Menu size={16} color="#FFFFFF" strokeWidth={2.6} />
            </Pressable>

            <View style={styles.greetingPill}>
              <Sparkles size={11} color="#FFFFFF" strokeWidth={2.6} />
              <Text style={styles.greetingText}>{greeting}</Text>
            </View>

            <Pressable
              style={styles.iconBtn}
              hitSlop={8}
              onPress={() => navigation.navigate(ROUTES.REMINDERS || 'Reminders')}
              accessibilityLabel="Reminders and alerts">
              <Bell size={16} color="#FFFFFF" strokeWidth={2.6} />
              {activeTasks.filter(t => t.reminder && !t.completed).length > 0 && (
                <View style={styles.bellDot} />
              )}
            </Pressable>
          </View>

          <View style={styles.titleRow}>
            <View style={{flex: 1}}>
              <Text style={styles.headerTitle}>My Tasks</Text>
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                {activeTasks.length === 0
                  ? 'Ready when you are'
                  : pendingCount === 0
                  ? 'All done. Nice!'
                  : `${pendingCount} task${
                      pendingCount !== 1 ? 's' : ''
                    } to focus on`}
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

        {/* SEARCH */}
        <SearchBar value={search} onChangeText={setSearch} />

        {/* FILTER TABS */}
        <FilterTabs
          selectedFilter={selectedFilter}
          onChange={setSelectedFilter}
        />

        {/* QUICK FILTERS */}
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
                  fill={
                    active && qf.key === 'fav' ? qf.color : 'transparent'
                  }
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

        {/* TODO LIST / EMPTY STATE */}
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
                  <Inbox
                    size={34}
                    color={theme.colors.textLight}
                    strokeWidth={1.8}
                  />
                </View>
                <Text style={styles.emptyTitle}>
                  {search.trim() || quickFilter
                    ? 'No matches found'
                    : selectedFilter === 'completed'
                    ? 'No completed tasks yet'
                    : selectedFilter === 'active'
                    ? 'All caught up!'
                    : 'Your list is empty'}
                </Text>
                <Text style={styles.emptyDesc}>
                  {search.trim() || quickFilter
                    ? 'Try changing the filter or search keyword.'
                    : 'Add your first task and start getting things done.'}
                </Text>
                {!search.trim() && !quickFilter && (
                  <Pressable
                    style={[
                      styles.emptyBtn,
                      {backgroundColor: theme.colors.primary},
                    ]}
                    onPress={() => navigation.navigate(ROUTES.ADD_TODO)}>
                    <Plus size={15} color="#FFFFFF" strokeWidth={2.8} />
                    <Text style={styles.emptyBtnText}>
                      Add your first task
                    </Text>
                  </Pressable>
                )}
              </View>
            </ScrollView>
          ) : (
            <TodoList
              todos={sortedTasks}
              onTodoPress={todo =>
                navigation.navigate(ROUTES.TODO_DETAIL, {
                  todoId: todo.id,
                })
              }
              onTodoLongPress={handleTodoLongPress}
              onToggleTodo={toggleTodo}
              onEditTodo={todo =>
                navigation.navigate(ROUTES.EDIT_TODO, {
                  todoId: todo.id,
                })
              }
              onDeleteTodo={setDeleteId}
              onToggleFavorite={toggleFavorite}
              // ✅ Single swipe support
              openSwipeId={openSwipeId}
              onSwipeOpen={setOpenSwipeId}
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          )}
        </View>

        {/* ADD TODO BUTTON */}
        <Pressable
          style={styles.addButton}
          onPress={() => navigation.navigate(ROUTES.ADD_TODO)}
          accessibilityRole="button"
          accessibilityLabel="Add new task">
          <Plus size={24} color="#FFFFFF" strokeWidth={2.9} />
        </Pressable>
      </View>

      {/* ==================== ACTION BOTTOM SHEET ==================== */}
      <Modal
        visible={actionTodo !== null}
        transparent
        animationType="slide"
        onRequestClose={() => {
          // Android back handled by BackHandler, but keep this too
          if (sheetView === 'timer') {
            setSheetView('main');
          } else {
            closeSheet();
          }
        }}
        statusBarTranslucent>
        <View style={styles.sheetRoot}>
          <Pressable style={styles.sheetBackdrop} onPress={closeSheet} />

          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <ScrollView
              showsVerticalScrollIndicator={false}
              bounces={false}
              contentContainerStyle={styles.sheetScrollContent}>

            {sheetView === 'main' ? (
              <>
                <View style={styles.sheetHeader}>
                  <View style={{flex: 1}}>
                    <Text style={styles.sheetLabel}>ACTIONS</Text>
                    <Text style={styles.sheetTitle} numberOfLines={1}>
                      {actionTodo?.title || 'Untitled task'}
                    </Text>
                  </View>
                  <Pressable
                    onPress={closeSheet}
                    style={styles.sheetClose}
                    hitSlop={10}>
                    <X
                      size={18}
                      color={theme.colors.textSecondary}
                      strokeWidth={2.4}
                    />
                  </Pressable>
                </View>

                {/* PIN / UNPIN */}
                <Pressable
                  style={({pressed}) => [
                    styles.sheetRow,
                    pressed && styles.sheetRowPressed,
                  ]}
                  onPress={() => {
                    if (actionTodo) togglePinTodo(actionTodo.id);
                    closeSheet();
                  }}>
                  <View
                    style={[
                      styles.sheetIcon,
                      {backgroundColor: '#EEF2FF'},
                    ]}>
                    {actionTodo?.pinned ? (
                      <PinOff
                        size={18}
                        color="#4F46E5"
                        strokeWidth={2.4}
                      />
                    ) : (
                      <Pin size={18} color="#4F46E5" strokeWidth={2.4} />
                    )}
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={styles.sheetRowTitle}>
                      {actionTodo?.pinned
                        ? 'Unpin from top'
                        : 'Pin to top'}
                    </Text>
                    <Text style={styles.sheetRowSub}>
                      {actionTodo?.pinned
                        ? 'Remove this task from the pinned list'
                        : 'Keep this task on top of your list'}
                    </Text>
                  </View>
                </Pressable>

                {/* SET / CHANGE TIMER */}
                <Pressable
                  style={({pressed}) => [
                    styles.sheetRow,
                    pressed && styles.sheetRowPressed,
                  ]}
                  onPress={() => setSheetView('timer')}>
                  <View
                    style={[
                      styles.sheetIcon,
                      {backgroundColor: '#FFF7ED'},
                    ]}>
                    <Timer size={18} color="#F97316" strokeWidth={2.4} />
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={styles.sheetRowTitle}>
                      {actionTodo?.timerEndAt
                        ? 'Change timer'
                        : 'Set timer'}
                    </Text>
                    <Text style={styles.sheetRowSub}>
                      {actionTodo?.timerEndAt
                        ? sheetTimerExpired
                          ? 'Timer finished — set a new one'
                          : `⏱ ${formatRemaining(sheetRemaining)} left`
                        : 'Start a focus countdown'}
                    </Text>
                  </View>
                </Pressable>

                {/* REMINDER / ALERT */}
                <Pressable
                  style={({pressed}) => [
                    styles.sheetRow,
                    pressed && styles.sheetRowPressed,
                  ]}
                  onPress={() => {
                    if (actionTodo) {
                      toggleTodoReminder(actionTodo.id);
                    }
                  }}>
                  <View
                    style={[
                      styles.sheetIcon,
                      {backgroundColor: '#EFF6FF'},
                    ]}>
                    <Bell
                      size={18}
                      color="#3B82F6"
                      strokeWidth={2.4}
                      fill={actionTodo?.reminder ? '#3B82F6' : 'transparent'}
                    />
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={styles.sheetRowTitle}>
                      {actionTodo?.reminder
                        ? 'Remove alert / reminder'
                        : 'Set alert / reminder'}
                    </Text>
                    <Text style={styles.sheetRowSub}>
                      {actionTodo?.reminder
                        ? 'Turn off alert notification for this task'
                        : 'Sound alert and notify on due date'}
                    </Text>
                  </View>
                </Pressable>

                {/* FAVORITE */}
                <Pressable
                  style={({pressed}) => [
                    styles.sheetRow,
                    pressed && styles.sheetRowPressed,
                  ]}
                  onPress={handleFavoriteFromSheet}>
                  <View
                    style={[
                      styles.sheetIcon,
                      {backgroundColor: '#FFFBEB'},
                    ]}>
                    <Star
                      size={18}
                      color="#F59E0B"
                      strokeWidth={2.4}
                      fill={
                        actionTodo?.favorite ? '#F59E0B' : 'transparent'
                      }
                    />
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={styles.sheetRowTitle}>
                      {actionTodo?.favorite
                        ? 'Remove from favorites'
                        : 'Add to favorites'}
                    </Text>
                    <Text style={styles.sheetRowSub}>
                      {actionTodo?.favorite
                        ? 'Unmark this task as favorite'
                        : 'Mark this task as favorite'}
                    </Text>
                  </View>
                </Pressable>

                {/* SHARE */}
                <Pressable
                  style={({pressed}) => [
                    styles.sheetRow,
                    pressed && styles.sheetRowPressed,
                  ]}
                  onPress={handleShareFromSheet}>
                  <View
                    style={[
                      styles.sheetIcon,
                      {backgroundColor: '#ECFDF5'},
                    ]}>
                    <Share2
                      size={18}
                      color="#10B981"
                      strokeWidth={2.4}
                    />
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={styles.sheetRowTitle}>Share task</Text>
                    <Text style={styles.sheetRowSub}>
                      Send this task anywhere — WhatsApp, Gmail, Telegram
                    </Text>
                  </View>
                </Pressable>

                {/* EDIT */}
                <Pressable
                  style={({pressed}) => [
                    styles.sheetRow,
                    pressed && styles.sheetRowPressed,
                  ]}
                  onPress={handleEditFromSheet}>
                  <View
                    style={[
                      styles.sheetIcon,
                      {backgroundColor: '#EAF2FF'},
                    ]}>
                    <Pencil
                      size={18}
                      color="#3B82F6"
                      strokeWidth={2.4}
                    />
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={styles.sheetRowTitle}>Edit task</Text>
                    <Text style={styles.sheetRowSub}>
                      Update title, details, priority and more
                    </Text>
                  </View>
                </Pressable>

                {/* DELETE */}
                <Pressable
                  style={({pressed}) => [
                    styles.sheetRow,
                    pressed && styles.sheetRowPressed,
                  ]}
                  onPress={handleDeleteFromSheet}>
                  <View
                    style={[
                      styles.sheetIcon,
                      {backgroundColor: '#FDECEC'},
                    ]}>
                    <Trash2
                      size={18}
                      color="#EF4444"
                      strokeWidth={2.4}
                    />
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={styles.sheetRowTitle}>Delete task</Text>
                    <Text style={styles.sheetRowSub}>
                      Move this task to Trash
                    </Text>
                  </View>
                </Pressable>

                {/* STOP TIMER (only if running) */}
                {actionTodo?.timerEndAt && !sheetTimerExpired ? (
                  <Pressable
                    style={({pressed}) => [
                      styles.sheetRow,
                      pressed && styles.sheetRowPressed,
                    ]}
                    onPress={() => {
                      if (actionTodo) clearTodoTimer(actionTodo.id);
                      closeSheet();
                    }}>
                    <View
                      style={[
                        styles.sheetIcon,
                        {backgroundColor: '#FEF2F2'},
                      ]}>
                      <TimerOff
                        size={18}
                        color="#EF4444"
                        strokeWidth={2.4}
                      />
                    </View>
                    <View style={{flex: 1}}>
                      <Text style={styles.sheetRowTitle}>Stop timer</Text>
                      <Text style={styles.sheetRowSub}>
                        Cancel the running countdown for this task
                      </Text>
                    </View>
                  </Pressable>
                ) : null}
              </>
            ) : (
              <>
                {/* TIMER VIEW */}
                <View style={styles.sheetHeader}>
                  <Pressable
                    onPress={() => setSheetView('main')}
                    style={styles.sheetClose}
                    hitSlop={10}>
                    <ChevronLeft
                      size={20}
                      color={theme.colors.textSecondary}
                      strokeWidth={2.4}
                    />
                  </Pressable>
                  <View style={{flex: 1, marginLeft: 10}}>
                    <Text style={styles.sheetLabel}>TIMER</Text>
                    <Text style={styles.sheetTitle}>
                      {actionTodo?.timerEndAt && !sheetTimerExpired
                        ? `${formatRemaining(sheetRemaining)} left`
                        : 'Choose duration'}
                    </Text>
                  </View>
                </View>

                <View style={styles.presetGrid}>
                  {TIMER_PRESETS.map(preset => (
                    <Pressable
                      key={preset.minutes}
                      style={({pressed}) => [
                        styles.preset,
                        pressed && {opacity: 0.85},
                      ]}
                      onPress={() => {
                        if (actionTodo) {
                          setTodoTimer(actionTodo.id, preset.minutes);
                        }
                        closeSheet();
                      }}>
                      <View style={{flex: 1}}>
                        <Text style={styles.presetLabel}>
                          {preset.label}
                        </Text>
                        <Text style={styles.presetSub}>
                          {preset.sub}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </View>

                {/* CUSTOM TIMER */}
                <View style={styles.customWrap}>
                  <Text style={styles.customLabel}>CUSTOM</Text>
                  <View style={styles.customRow}>
                    <TextInput
                      style={styles.customInput}
                      placeholder="Enter minutes (max 1440)"
                      placeholderTextColor={theme.colors.textLight}
                      value={customMinutes}
                      onChangeText={text =>
                        setCustomMinutes(text.replace(/[^0-9]/g, ''))
                      }
                      keyboardType="number-pad"
                      maxLength={4}
                      returnKeyType="done"
                      onSubmitEditing={applyCustomTimer}
                    />
                    <Text style={styles.customUnit}>min</Text>
                    <Pressable
                      style={({pressed}) => [
                        styles.customBtn,
                        !customMinutes && {opacity: 0.4},
                        pressed && {opacity: 0.78},
                      ]}
                      disabled={!customMinutes}
                      onPress={applyCustomTimer}>
                      <Text style={styles.customBtnText}>Set</Text>
                    </Pressable>
                  </View>
                </View>
              </>
            )}

            <Pressable
              style={({pressed}) => [
                styles.sheetCancel,
                pressed && {opacity: 0.85},
              ]}
              onPress={closeSheet}>
              <Text style={styles.sheetCancelText}>Cancel</Text>
            </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* DELETE CONFIRMATION */}
      <ConfirmModal
        visible={deleteId !== null}
        title="Delete Todo?"
        message="This todo will be moved to Trash."
        confirmText="Delete"
        onCancel={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        danger
      />
    </SafeAreaView>
  );
}

/* --------------------------- STYLES ---------------------------- */

function createStyles(theme, insets) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    container: {
      flex: 1,
      paddingHorizontal: theme.spacing.xl,
    },
    headerCard: {
      backgroundColor: theme.colors.primary,
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingTop: 12,
      paddingBottom: 14,
      marginTop: 8,
      marginBottom: 14,
      overflow: 'hidden',
      shadowColor: theme.colors.primary,
      shadowOffset: {width: 0, height: 6},
      shadowOpacity: 0.28,
      shadowRadius: 14,
      elevation: 7,
    },
    decorCircle1: {
      position: 'absolute',
      width: 130,
      height: 130,
      borderRadius: 65,
      backgroundColor: 'rgba(255,255,255,0.08)',
      top: -50,
      right: -40,
    },
    decorCircle2: {
      position: 'absolute',
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: 'rgba(255,255,255,0.07)',
      bottom: -30,
      left: -20,
    },
    headerTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    iconBtn: {
      width: 34,
      height: 34,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255,255,255,0.18)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.22)',
    },
    bellDot: {
      position: 'absolute',
      top: 7,
      right: 8,
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: '#FBBF24',
      borderWidth: 1.2,
      borderColor: '#FFFFFF',
    },
    greetingPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.18)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.22)',
    },
    greetingText: {
      fontSize: 11,
      fontWeight: '800',
      color: '#FFFFFF',
      letterSpacing: 0.3,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: '900',
      color: '#FFFFFF',
      letterSpacing: -0.5,
      marginBottom: 2,
    },
    headerSubtitle: {
      fontSize: 12,
      fontWeight: '600',
      color: 'rgba(255,255,255,0.88)',
      letterSpacing: 0.1,
    },
    progressPill: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 12,
      backgroundColor: 'rgba(255,255,255,0.18)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.25)',
      minWidth: 56,
    },
    progressPillPercent: {
      fontSize: 14,
      fontWeight: '900',
      color: '#FFFFFF',
      letterSpacing: -0.3,
      lineHeight: 16,
    },
    progressPillLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: 'rgba(255,255,255,0.85)',
      letterSpacing: 0.2,
      marginTop: 1,
    },
    progressTrack: {
      height: 5,
      borderRadius: 4,
      backgroundColor: 'rgba(255,255,255,0.22)',
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: 4,
      backgroundColor: '#FFFFFF',
    },
    quickRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 12,
    },
    quickChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 11,
      paddingVertical: 6,
      borderRadius: 11,
      backgroundColor: theme.colors.surface,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
    },
    quickChipText: {
      fontSize: 11.5,
      fontWeight: '800',
      letterSpacing: 0.2,
    },
    list: {
      flex: 1,
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
      paddingBottom: 80,
    },
    emptyIconWrap: {
      width: 80,
      height: 80,
      borderRadius: 26,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 17,
      fontWeight: '800',
      color: theme.colors.text,
      letterSpacing: -0.3,
      marginBottom: 6,
      textAlign: 'center',
    },
    emptyDesc: {
      fontSize: 12.5,
      fontWeight: '500',
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 18,
      maxWidth: 250,
      marginBottom: 20,
    },
    emptyBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      paddingHorizontal: 18,
      paddingVertical: 12,
      borderRadius: 13,
      shadowColor: theme.colors.primary,
      shadowOffset: {width: 0, height: 5},
      shadowOpacity: 0.28,
      shadowRadius: 10,
      elevation: 5,
    },
    emptyBtnText: {
      color: '#FFFFFF',
      fontSize: 13.5,
      fontWeight: '800',
      letterSpacing: 0.2,
    },
    addButton: {
      position: 'absolute',
      right: theme.spacing.xl,
      bottom: Math.max(insets.bottom, 12) + 90,
      width: 58,
      height: 58,
      borderRadius: 29,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
      shadowColor: theme.colors.primary,
      shadowOffset: {width: 0, height: 8},
      shadowOpacity: 0.42,
      shadowRadius: 14,
      elevation: 10,
      borderWidth: 2,
      borderColor: 'rgba(255,255,255,0.25)',
    },

    /* -------- BOTTOM SHEET -------- */
    sheetRoot: {
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    sheetBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(15,23,42,0.45)',
    },
    sheet: {
      width: '100%',
      maxWidth: 600,
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: 18,
      paddingTop: 10,
      paddingBottom: Math.max(insets.bottom, 16),
      maxHeight: '88%',
    },
    sheetScrollContent: {
      paddingBottom: 6,
    },
    sheetHandle: {
      alignSelf: 'center',
      width: 42,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.border,
      marginBottom: 14,
    },
    sheetHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    sheetLabel: {
      fontSize: 10.5,
      fontWeight: '800',
      letterSpacing: 1,
      color: theme.colors.textLight,
      marginBottom: 3,
    },
    sheetTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: theme.colors.text,
      letterSpacing: -0.3,
    },
    sheetClose: {
      width: 32,
      height: 32,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background,
    },
    sheetRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 11,
      paddingHorizontal: 10,
      borderRadius: 14,
      marginBottom: 3,
    },
    sheetRowPressed: {
      backgroundColor: theme.colors.background,
    },
    sheetIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sheetRowTitle: {
      fontSize: 14.5,
      fontWeight: '800',
      color: theme.colors.text,
      letterSpacing: -0.2,
    },
    sheetRowSub: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    presetGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      rowGap: 10,
    },
    preset: {
      width: '48.5%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      paddingHorizontal: 14,
      borderRadius: 14,
      backgroundColor: '#FFF7ED',
      borderWidth: 1.5,
      borderColor: '#FED7AA',
    },
    presetLabel: {
      fontSize: 15,
      fontWeight: '800',
      color: '#EA580C',
      letterSpacing: -0.2,
    },
    presetSub: {
      fontSize: 11,
      fontWeight: '600',
      color: '#FB923C',
      marginTop: 2,
    },
    customWrap: {
      marginTop: 14,
      paddingTop: 14,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    customLabel: {
      fontSize: 10.5,
      fontWeight: '800',
      letterSpacing: 1,
      color: theme.colors.textLight,
      marginBottom: 8,
    },
    customRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    customInput: {
      flex: 1,
      height: 48,
      paddingHorizontal: 14,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
      fontSize: 15,
      fontWeight: '700',
      color: theme.colors.text,
    },
    customUnit: {
      fontSize: 12,
      fontWeight: '800',
      color: theme.colors.textSecondary,
      letterSpacing: 0.4,
    },
    customBtn: {
      paddingHorizontal: 18,
      height: 48,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F97316',
      shadowColor: '#F97316',
      shadowOffset: {width: 0, height: 3},
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 4,
    },
    customBtnText: {
      fontSize: 13.5,
      fontWeight: '800',
      color: '#FFFFFF',
      letterSpacing: 0.3,
    },
    sheetCancel: {
      marginTop: 14,
      paddingVertical: 14,
      borderRadius: 14,
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    sheetCancelText: {
      fontSize: 14,
      fontWeight: '800',
      color: theme.colors.text,
      letterSpacing: 0.2,
    },
  });
}

export default HomeScreen;