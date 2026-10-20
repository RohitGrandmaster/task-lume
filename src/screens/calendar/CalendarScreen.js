import {parseTaskDueDate} from '../../utils/dateUtils';
import React,
  {useMemo,
  useState,
  useCallback} from 'react';
import {
  Text,
  View,
  Pressable,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, DrawerActions} from '@react-navigation/native';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CalendarX,
  Plus,
  Check,
  Menu,
} from 'lucide-react-native';

import useTodos from '../../hooks/useTodos';
import useTheme from '../../hooks/useTheme';
import ROUTES from '../../constants/routes';
import StrikeText from '../../components/common/StrikeText';

/* --------------------------- CONSTANTS --------------------------- */

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEKDAYS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const WEEKDAYS_FULL = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday',
  'Thursday', 'Friday', 'Saturday',
];

const PRIORITY_COLORS = {
  low: '#10B981',
  medium: '#F59E0B',
  high: '#EF4444',
};

const PRIORITY_RANK = {high: 3, medium: 2, low: 1};

/* --------------------------- HELPERS --------------------------- */

const pad = v => String(v).padStart(2, '0');

const dateKey = d =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function getTaskDayKey(task) {
  const source =
    Number.isFinite(task?.dueDateTimestamp) && task.dueDateTimestamp > 0
      ? task.dueDateTimestamp
      : task?.dueDate;
  const parsed = parseTaskDueDate(source);
  return parsed ? dateKey(parsed) : null;
}

/* --------------------------- SCREEN --------------------------- */

function CalendarScreen() {
  const {theme} = useTheme();
  const {tasks, loadTodos} = useTodos();
  const navigation = useNavigation();

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (typeof loadTodos === 'function') {
        await loadTodos();
      }
    } catch (_) {}
    setTimeout(() => setRefreshing(false), 600);
  }, [loadTodos]);

  const styles = useMemo(() => createStyles(theme), [theme]);

  const today = useMemo(() => new Date(), []);
  const todayKey = dateKey(today);

  const [viewMonth, setViewMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedKey, setSelectedKey] = useState(todayKey);

  const tasksByDay = useMemo(() => {
    const map = {};
    (tasks || [])
      .filter(t => !t.deleted)
      .forEach(t => {
        const key = getTaskDayKey(t);
        if (!key) return;
        if (!map[key]) map[key] = [];
        map[key].push(t);
      });
    return map;
  }, [tasks]);

  const grid = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [
      ...Array(firstWeekday).fill(null),
      ...Array.from(
        {length: daysInMonth},
        (_, i) => new Date(year, month, i + 1),
      ),
    ];
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [viewMonth]);

  const selectedDate = useMemo(() => {
    const [y, m, d] = selectedKey.split('-').map(Number);
    return new Date(y, m - 1, d);
  }, [selectedKey]);

  const selectedTasks = useMemo(
    () => tasksByDay[selectedKey] || [],
    [tasksByDay, selectedKey],
  );

  const sortedSelectedTasks = useMemo(() => {
    return [...selectedTasks].sort((a, b) => {
      if (!!a.completed !== !!b.completed) return a.completed ? 1 : -1;
      return (
        (PRIORITY_RANK[b.priority] || 0) -
        (PRIORITY_RANK[a.priority] || 0)
      );
    });
  }, [selectedTasks]);

  const isSelectedToday = selectedKey === todayKey;

  const selectedDateLabel = useMemo(() => {
    if (isSelectedToday) return 'Today';

    const tmr = new Date(today);
    tmr.setDate(tmr.getDate() + 1);
    if (dateKey(tmr) === selectedKey) return 'Tomorrow';

    const y = selectedDate.getFullYear();
    const short =
      `${WEEKDAYS_FULL[selectedDate.getDay()]}, ` +
      `${MONTHS[selectedDate.getMonth()].slice(0, 3)} ` +
      `${selectedDate.getDate()}`;

    return y === today.getFullYear() ? short : `${short}, ${y}`;
  }, [selectedDate, selectedKey, isSelectedToday, today]);

  const monthTaskCount = useMemo(() => {
    const y = viewMonth.getFullYear();
    const m = viewMonth.getMonth();
    const prefix = `${y}-${pad(m + 1)}`;
    return Object.keys(tasksByDay)
      .filter(k => k.startsWith(prefix))
      .reduce((sum, k) => sum + tasksByDay[k].length, 0);
  }, [tasksByDay, viewMonth]);

  function goPrevMonth() {
    setViewMonth(
      prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
    );
  }
  function goNextMonth() {
    setViewMonth(
      prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
    );
  }
  function goToday() {
    setViewMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedKey(todayKey);
  }

  function openAddTask() {
    navigation.navigate(ROUTES.ADD_TODO, {presetDueDate: selectedKey});
  }
  function openTask(taskId) {
    navigation.navigate(ROUTES.TODO_DETAIL, {todoId: taskId});
  }

  /* --------------------------- RENDER --------------------------- */
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          {/* ============ HEADER ============ */}
          <View style={styles.header}>
            <Pressable
              style={styles.menuBtn}
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Open drawer menu">
              <Menu size={18} color={theme.colors.text} strokeWidth={2.6} />
            </Pressable>

            <View style={{flex: 1}}>
              <Text style={styles.title}>Calendar</Text>
              <Text style={styles.subtitle}>
                Plan ahead. Stay on track.
              </Text>
            </View>

            <Pressable
              style={styles.todayBtn}
              onPress={goToday}
              hitSlop={6}
              accessibilityLabel="Jump to today">
              <CalendarIcon
                size={13}
                color={theme.colors.primary}
                strokeWidth={2.6}
              />
              <Text style={styles.todayBtnText}>Today</Text>
            </Pressable>
          </View>

          {/* ============ MONTH NAV CARD ============ */}
          <View style={styles.monthCard}>
            <Pressable
              style={styles.arrowBtn}
              onPress={goPrevMonth}
              hitSlop={6}
              accessibilityLabel="Previous month">
              <ChevronLeft
                size={20}
                color={theme.colors.text}
                strokeWidth={2.6}
              />
            </Pressable>

            <View style={styles.monthCenter}>
              <Text style={styles.monthTitle}>
                {MONTHS[viewMonth.getMonth()]}
              </Text>
              <View style={styles.monthSubRow}>
                <Text style={styles.monthYear}>
                  {viewMonth.getFullYear()}
                </Text>
                {monthTaskCount > 0 && (
                  <>
                    <View style={styles.monthDot} />
                    <Text style={styles.monthTaskCount}>
                      {monthTaskCount}{' '}
                      {monthTaskCount === 1 ? 'task' : 'tasks'}
                    </Text>
                  </>
                )}
              </View>
            </View>

            <Pressable
              style={styles.arrowBtn}
              onPress={goNextMonth}
              hitSlop={6}
              accessibilityLabel="Next month">
              <ChevronRight
                size={20}
                color={theme.colors.text}
                strokeWidth={2.6}
              />
            </Pressable>
          </View>

          {/* ============ CALENDAR BODY ============ */}
          <View style={styles.calendarCard}>
            {/* Weekday header */}
            <View style={styles.weekRow}>
              {WEEKDAYS_SHORT.map((d, i) => (
                <View key={i} style={styles.weekCell}>
                  <Text style={styles.weekLabel}>{d}</Text>
                </View>
              ))}
            </View>

            {/* Grid */}
            <View style={styles.grid}>
              {grid.map((date, index) => {
                if (!date) {
                  return (
                    <View key={`e-${index}`} style={styles.dayCell} />
                  );
                }

                const key = dateKey(date);
                const selected = key === selectedKey;
                const isToday = key === todayKey;
                const dayTasks = tasksByDay[key] || [];
                const pendingCount = dayTasks.filter(
                  t => !t.completed,
                ).length;
                const hasPending = pendingCount > 0;
                const allDone =
                  dayTasks.length > 0 && pendingCount === 0;

                return (
                  <Pressable
                    key={key}
                    style={styles.dayCell}
                    onPress={() => setSelectedKey(key)}
                    accessibilityLabel={`Select ${key}`}>
                    <View
                      style={[
                        styles.dayCircle,
                        isToday && !selected && styles.todayRing,
                        selected && styles.selectedDayCircle,
                      ]}>
                      <Text
                        style={[
                          styles.dayText,
                          isToday && !selected && styles.todayText,
                          selected && styles.selectedDayText,
                        ]}>
                        {date.getDate()}
                      </Text>
                    </View>

                    <View style={styles.dotRow}>
                      {allDone ? (
                        <View
                          style={[
                            styles.dot,
                            {
                              backgroundColor: selected
                                ? '#FFFFFF'
                                : theme.colors.success || '#10B981',
                            },
                          ]}
                        />
                      ) : hasPending ? (
                        Array.from({
                          length: Math.min(pendingCount, 3),
                        }).map((_, i) => (
                          <View
                            key={i}
                            style={[
                              styles.dot,
                              {
                                backgroundColor: selected
                                  ? '#FFFFFF'
                                  : theme.colors.primary,
                              },
                            ]}
                          />
                        ))
                      ) : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* ============ SELECTED HEADER ============ */}
          <View style={styles.selectedHeader}>
            <View style={{flex: 1}}>
              <Text style={styles.selectedLabel}>SELECTED</Text>
              <Text style={styles.selectedTitle} numberOfLines={1}>
                {selectedDateLabel}
              </Text>
            </View>

            <View
              style={[
                styles.countBadge,
                {
                  backgroundColor: theme.colors.primary + '18',
                  borderColor: theme.colors.primary + '35',
                },
              ]}>
              <Text
                style={[
                  styles.countBadgeNum,
                  {color: theme.colors.primary},
                ]}>
                {selectedTasks.length}
              </Text>
              <Text
                style={[
                  styles.countBadgeLabel,
                  {color: theme.colors.primary},
                ]}>
                {selectedTasks.length === 1 ? 'task' : 'tasks'}
              </Text>
            </View>
          </View>

          {/* ============ TASK LIST / EMPTY ============ */}
          {selectedTasks.length === 0 ? (
            <View style={styles.empty}>
              <View style={styles.emptyIconWrap}>
                <CalendarX
                  size={30}
                  color={theme.colors.textLight}
                  strokeWidth={1.8}
                />
              </View>
              <Text style={styles.emptyTitle}>No tasks for this day</Text>
              <Text style={styles.emptyText}>
                Your schedule is clear. Enjoy the free time.
              </Text>

              <Pressable
                style={[
                  styles.addBtn,
                  {
                    backgroundColor: theme.colors.primary,
                    shadowColor: theme.colors.primary,
                  },
                ]}
                onPress={openAddTask}>
                <Plus size={15} color="#FFFFFF" strokeWidth={2.8} />
                <Text style={styles.addBtnText}>Add task</Text>
              </Pressable>
            </View>
          ) : (
            <>
              {sortedSelectedTasks.map(task => {
                const priorityColor =
                  PRIORITY_COLORS[task.priority] || theme.colors.primary;
                const completed = !!task.completed;

                return (
                  <Pressable
                    key={task.id}
                    style={({pressed}) => [
                      styles.taskCard,
                      completed && styles.taskCardDone,
                      {opacity: pressed ? 0.85 : 1},
                    ]}
                    onPress={() => openTask(task.id)}>
                    <View
                      style={[
                        styles.taskIndicator,
                        {backgroundColor: priorityColor},
                      ]}
                    />

                    <View style={styles.taskContent}>
                      <StrikeText
                        text={task.title}
                        completed={completed}
                        style={styles.taskTitle}
                        completedStyle={styles.taskTitleDone}
                        strikeColor={theme.colors.textSecondary || '#6B7280'}
                        strikeHeight={2.2}
                        numberOfLines={1}
                      />

                      <View style={styles.taskMetaRow}>
                        {task.category ? (
                          <Text
                            style={styles.taskMeta}
                            numberOfLines={1}>
                            {task.category}
                          </Text>
                        ) : null}

                        {task.category && task.priority ? (
                          <Text style={styles.taskMetaDot}>•</Text>
                        ) : null}

                        {task.priority ? (
                          <Text
                            style={[
                              styles.taskMeta,
                              {
                                color: priorityColor,
                                textTransform: 'capitalize',
                              },
                            ]}>
                            {task.priority}
                          </Text>
                        ) : null}
                      </View>
                    </View>

                    {completed && (
                      <View
                        style={[
                          styles.doneTick,
                          {
                            backgroundColor:
                              theme.colors.success || '#10B981',
                          },
                        ]}>
                        <Check size={11} color="#FFFFFF" strokeWidth={3} />
                      </View>
                    )}
                  </Pressable>
                );
              })}

              <Pressable
                style={[
                  styles.inlineAddBtn,
                  {
                    borderColor: theme.colors.primary + '40',
                    backgroundColor: theme.colors.primary + '0D',
                  },
                ]}
                onPress={openAddTask}>
                <Plus
                  size={14}
                  color={theme.colors.primary}
                  strokeWidth={2.8}
                />
                <Text
                  style={[
                    styles.inlineAddText,
                    {color: theme.colors.primary},
                  ]}>
                  Add task on this day
                </Text>
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* --------------------------- STYLES --------------------------- */

function createStyles(theme) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: 120,
    },
    container: {
      paddingHorizontal: theme.spacing.xl,
      paddingTop: theme.spacing.md || 12,
    },

    /* ============ HEADER ============ */
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    menuBtn: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    title: {
      fontSize: 26,
      fontWeight: '900',
      color: theme.colors.text,
      letterSpacing: -0.6,
    },
    subtitle: {
      marginTop: 2,
      fontSize: 12.5,
      fontWeight: '500',
      color: theme.colors.textSecondary,
    },
    todayBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      backgroundColor: theme.colors.primary + '14',
      borderWidth: 1,
      borderColor: theme.colors.primary + '30',
    },
    todayBtnText: {
      fontSize: 12.5,
      fontWeight: '800',
      color: theme.colors.primary,
    },

    /* ============ MONTH CARD ============ */
    monthCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingVertical: 14,
      paddingHorizontal: 10,
      marginBottom: 14,
    },
    arrowBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background,
    },
    monthCenter: {
      flex: 1,
      alignItems: 'center',
    },
    monthTitle: {
      fontSize: 18,
      fontWeight: '900',
      color: theme.colors.text,
      letterSpacing: -0.3,
    },
    monthSubRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 3,
      gap: 6,
    },
    monthYear: {
      fontSize: 12.5,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    monthDot: {
      width: 3,
      height: 3,
      borderRadius: 2,
      backgroundColor: theme.colors.textLight,
    },
    monthTaskCount: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },

    /* ============ CALENDAR ============ */
    calendarCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 12,
      marginBottom: 18,
    },
    weekRow: {
      flexDirection: 'row',
      marginBottom: 8,
    },
    weekCell: {
      flex: 1,
      alignItems: 'center',
    },
    weekLabel: {
      fontSize: 11.5,
      fontWeight: '800',
      color: theme.colors.textLight,
      letterSpacing: 0.4,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    dayCell: {
      width: '14.28%',
      alignItems: 'center',
      paddingVertical: 6,
    },
    dayCircle: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
    },
    todayRing: {
      borderWidth: 1.5,
      borderColor: theme.colors.primary,
    },
    selectedDayCircle: {
      backgroundColor: theme.colors.primary,
    },
    dayText: {
      fontSize: 13.5,
      fontWeight: '700',
      color: theme.colors.text,
    },
    todayText: {
      color: theme.colors.primary,
      fontWeight: '900',
    },
    selectedDayText: {
      color: '#FFFFFF',
      fontWeight: '900',
    },
    dotRow: {
      flexDirection: 'row',
      gap: 2,
      marginTop: 3,
      minHeight: 5,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dot: {
      width: 4,
      height: 4,
      borderRadius: 2,
    },

    /* ============ SELECTED HEADER ============ */
    selectedHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    selectedLabel: {
      fontSize: 10.5,
      fontWeight: '800',
      color: theme.colors.textLight,
      letterSpacing: 0.8,
    },
    selectedTitle: {
      fontSize: 18,
      fontWeight: '900',
      color: theme.colors.text,
      letterSpacing: -0.3,
      marginTop: 1,
    },
    countBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 12,
      borderWidth: 1,
    },
    countBadgeNum: {
      fontSize: 14,
      fontWeight: '900',
    },
    countBadgeLabel: {
      fontSize: 11.5,
      fontWeight: '700',
    },

    /* ============ TASK CARDS ============ */
    taskCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: 8,
      overflow: 'hidden',
      paddingRight: 12,
    },
    taskCardDone: {
      opacity: 0.72,
    },
    taskIndicator: {
      width: 4,
      alignSelf: 'stretch',
      marginRight: 12,
    },
    taskContent: {
      flex: 1,
      paddingVertical: 12,
    },
    taskTitle: {
      fontSize: 14.5,
      fontWeight: '700',
      color: theme.colors.text,
    },
    taskTitleDone: {
      color: theme.colors.textLight,
    },
    taskMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
      gap: 4,
    },
    taskMeta: {
      fontSize: 11.5,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    taskMetaDot: {
      fontSize: 11,
      color: theme.colors.textLight,
    },
    doneTick: {
      width: 22,
      height: 22,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
    },

    /* ============ EMPTY ============ */
    empty: {
      alignItems: 'center',
      paddingVertical: 36,
      paddingHorizontal: 20,
    },
    emptyIconWrap: {
      width: 64,
      height: 64,
      borderRadius: 20,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 14,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: theme.colors.text,
      marginBottom: 6,
    },
    emptyText: {
      fontSize: 13,
      fontWeight: '500',
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 19,
      marginBottom: 18,
    },
    addBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 18,
      paddingVertical: 12,
      borderRadius: 14,
      shadowOffset: {width: 0, height: 6},
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 6,
    },
    addBtnText: {
      fontSize: 14,
      fontWeight: '800',
      color: '#FFFFFF',
    },
    inlineAddBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 14,
      borderRadius: 14,
      borderWidth: 1.5,
      borderStyle: 'dashed',
      marginTop: 4,
      marginBottom: 8,
    },
    inlineAddText: {
      fontSize: 13.5,
      fontWeight: '700',
    },
  });
}

export default CalendarScreen;
