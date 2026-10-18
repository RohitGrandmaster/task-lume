import {parseTaskDueDate} from '../../utils/dateUtils';
import {LocalizedText} from '../../i18n/LocalizedText';
import React, {useMemo, useState, useCallback} from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  ScrollView,
  RefreshControl
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
              <LocalizedText style={styles.title}>Calendar</LocalizedText>
              <LocalizedText style={styles.subtitle}>
                Plan ahead. Stay on track.
              </LocalizedText>
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
              <LocalizedText style={styles.todayBtnText}>Today</LocalizedText>
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
              <LocalizedText style={styles.monthTitle}>
                {MONTHS[viewMonth.getMonth()]}
              </LocalizedText>
              <View style={styles.monthSubRow}>
                <LocalizedText style={styles.monthYear}>
                  {viewMonth.getFullYear()}
                </LocalizedText>
                {monthTaskCount > 0 && (
                  <>
                    <View style={styles.monthDot} />
                    <LocalizedText style={styles.monthTaskCount}>
                      {monthTaskCount}{' '}
                      {monthTaskCount === 1 ? 'task' : 'tasks'}
                    </LocalizedText>
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
                  <LocalizedText style={styles.weekLabel}>{d}</LocalizedText>
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
                      <LocalizedText
                        style={[
                          styles.dayText,
                          isToday && !selected && styles.todayText,
                          selected && styles.selectedDayText,
                        ]}>
                        {date.getDate()}
                      </LocalizedText>
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
              <LocalizedText style={styles.selectedLabel}>SELECTED</LocalizedText>
              <LocalizedText style={styles.selectedTitle} numberOfLines={1}>
                {selectedDateLabel}
              </LocalizedText>
            </View>

            <View
              style={[
                styles.countBadge,
                {
                  backgroundColor: theme.colors.primary + '18',
                  borderColor: theme.colors.primary + '35',
                },
              ]}>
              <LocalizedText
                style={[
                  styles.countBadgeNum,
                  {color: theme.colors.primary},
                ]}>
                {selectedTasks.length}
              </LocalizedText>
              <LocalizedText
                style={[
                  styles.countBadgeLabel,
                  {color: theme.colors.primary},
                ]}>
                {selectedTasks.length === 1 ? 'task' : 'tasks'}
              </LocalizedText>
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
              <LocalizedText style={styles.emptyTitle}>No tasks for this day</LocalizedText>
              <LocalizedText style={styles.emptyText}>
                Your schedule is clear. Enjoy the free time.
              </LocalizedText>

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
                <LocalizedText style={styles.addBtnText}>Add task</LocalizedText>
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
                          <LocalizedText
                            style={styles.taskMeta}
                            numberOfLines={1}>
                            {task.category}
                          </LocalizedText>
                        ) : null}

                        {task.category && task.priority ? (
                          <LocalizedText style={styles.taskMetaDot}>•</LocalizedText>
                        ) : null}

                        {task.priority ? (
                          <LocalizedText
                            style={[
                              styles.taskMeta,
                              {
                                color: priorityColor,
                                textTransform: 'capitalize',
                              },
                            ]}>
                            {task.priority}
                          </LocalizedText>
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
                <LocalizedText
                  style={[
                    styles.inlineAddText,
                    {color: theme.colors.primary},
                  ]}>
                  Add task on this day
                </LocalizedText>
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
      letterSpacing: 0.1,
    },
    todayBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 12,
      backgroundColor: theme.colors.primary + '14',
      borderWidth: 1,
      borderColor: theme.colors.primary + '40',
    },
    todayBtnText: {
      fontSize: 12,
      fontWeight: '800',
      color: theme.colors.primary,
      letterSpacing: 0.2,
    },

    /* ============ MONTH NAV ============ */
    monthCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 10,
      paddingVertical: 12,
      borderRadius: 20,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 3,
    },
    arrowBtn: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    monthCenter: {
      alignItems: 'center',
      flex: 1,
    },
    monthTitle: {
      fontSize: 22,
      fontWeight: '900',
      color: theme.colors.text,
      letterSpacing: -0.6,
      lineHeight: 26,
    },
    monthSubRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 3,
    },
    monthYear: {
      fontSize: 12,
      fontWeight: '800',
      color: theme.colors.textSecondary,
      letterSpacing: 1,
    },
    monthDot: {
      width: 3,
      height: 3,
      borderRadius: 1.5,
      backgroundColor: theme.colors.textLight,
    },
    monthTaskCount: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.colors.primary,
      letterSpacing: 0.3,
    },

    /* ============ CALENDAR CARD ============ */
    calendarCard: {
      paddingHorizontal: 8,
      paddingTop: 8,
      paddingBottom: 14,
      borderRadius: 20,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: 18,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 6},
      shadowOpacity: 0.06,
      shadowRadius: 14,
      elevation: 3,
    },

    /* ============ WEEKDAYS ============ */
    weekRow: {
      flexDirection: 'row',
      paddingVertical: 10,
      marginBottom: 2,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    weekCell: {
      width: `${100 / 7}%`,
      alignItems: 'center',
    },
    weekLabel: {
      fontSize: 12,
      fontWeight: '900',
      color: theme.colors.textLight,
      letterSpacing: 0.8,
    },

    /* ============ GRID ============ */
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingTop: 6,
    },
    dayCell: {
      width: `${100 / 7}%`,
      height: 64,
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingTop: 5,
    },
    dayCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: 'transparent',
    },
    todayRing: {
      borderColor: theme.colors.primary,
      borderWidth: 1.8,
      backgroundColor: theme.colors.primary + '0A',
    },
    selectedDayCircle: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
      shadowColor: theme.colors.primary,
      shadowOffset: {width: 0, height: 6},
      shadowOpacity: 0.4,
      shadowRadius: 10,
      elevation: 8,
    },
    dayText: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.colors.text,
      letterSpacing: -0.2,
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
      gap: 3,
      marginTop: 3,
      height: 6,
      alignItems: 'center',
    },
    dot: {
      width: 5,
      height: 5,
      borderRadius: 2.5,
    },

    /* ============ SELECTED HEADER ============ */
    selectedHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      paddingHorizontal: 2,
    },
    selectedLabel: {
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 1.4,
      color: theme.colors.textLight,
      marginBottom: 3,
    },
    selectedTitle: {
      fontSize: 19,
      fontWeight: '900',
      color: theme.colors.text,
      letterSpacing: -0.5,
    },
    countBadge: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 4,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 13,
      borderWidth: 1,
    },
    countBadgeNum: {
      fontSize: 16,
      fontWeight: '900',
      letterSpacing: -0.4,
    },
    countBadgeLabel: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.2,
    },

    /* ============ TASK CARD ============ */
    taskCard: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      paddingVertical: 13,
      paddingHorizontal: 13,
      borderRadius: 15,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    taskCardDone: {
      opacity: 0.55,
    },
    taskIndicator: {
      width: 4,
      height: 36,
      borderRadius: 2,
      marginRight: 12,
    },
    taskContent: {
      flex: 1,
    },
    taskTitle: {
      fontSize: 14.5,
      fontWeight: '800',
      color: theme.colors.text,
      letterSpacing: -0.2,
    },
    taskTitleDone: {
      color: theme.colors.textSecondary,
    },
    taskMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      marginTop: 4,
    },
    taskMeta: {
      fontSize: 11.5,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      letterSpacing: 0.1,
    },
    taskMetaDot: {
      fontSize: 11,
      color: theme.colors.textLight,
    },
    doneTick: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 10,
    },

    /* ============ EMPTY STATE ============ */
    empty: {
      alignItems: 'center',
      paddingVertical: 30,
      paddingHorizontal: 22,
      borderRadius: 20,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    emptyIconWrap: {
      width: 72,
      height: 72,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: theme.colors.text,
      letterSpacing: -0.3,
      marginBottom: 5,
      textAlign: 'center',
    },
    emptyText: {
      fontSize: 13,
      fontWeight: '500',
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 19,
      maxWidth: 250,
      marginBottom: 20,
    },
    addBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 14,
      shadowOffset: {width: 0, height: 6},
      shadowOpacity: 0.32,
      shadowRadius: 12,
      elevation: 5,
    },
    addBtnText: {
      color: '#FFFFFF',
      fontSize: 13.5,
      fontWeight: '800',
      letterSpacing: 0.2,
    },

    /* ============ INLINE ADD ============ */
    inlineAddBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      paddingVertical: 13,
      borderRadius: 15,
      borderWidth: 1.5,
      borderStyle: 'dashed',
      marginTop: 6,
    },
    inlineAddText: {
      fontSize: 13,
      fontWeight: '800',
      letterSpacing: 0.2,
    },
  });
}

export default CalendarScreen;