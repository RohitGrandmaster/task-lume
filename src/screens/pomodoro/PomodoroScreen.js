import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  AppState,
  Modal,
  FlatList,
  Vibration,
  Animated,
  Alert,
  useWindowDimensions,
  RefreshControl,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {useNavigation, DrawerActions} from '@react-navigation/native';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import {
  Play,
  Pause,
  RotateCcw,
  X,
  CheckCircle2,
  Sparkles,
  Clock,
  ListTodo,
  ChevronRight,
  Zap,
  SkipForward,
  Flame,
  TrendingUp,
  Award,
  Coffee,
  Rocket,
  Menu,
} from 'lucide-react-native';

import useTheme from '../../hooks/useTheme';
import useTodos from '../../hooks/useTodos';

/* --------------------------- CONSTANTS --------------------------- */

const FOCUS_MINUTES = [1, 2, 3, 5, 10, 15, 20, 25, 30, 45, 50, 60];
const BREAK_MINUTES = [1, 2, 3, 5, 10, 15];

const MODES = {
  work: {label: 'Focus', color: '#6366F1', icon: Zap},
  shortBreak: {label: 'Short', color: '#10B981', icon: Coffee},
  longBreak: {label: 'Long', color: '#F59E0B', icon: Sparkles},
};

const PRESETS = [
  {
    key: 'classic',
    label: 'Classic',
    focus: 25,
    short: 5,
    long: 15,
    icon: Award,
    color: '#6366F1',
  },
  {
    key: 'deep',
    label: 'Deep Work',
    focus: 50,
    short: 10,
    long: 30,
    icon: Rocket,
    color: '#8B5CF6',
  },
  {
    key: 'sprint',
    label: 'Sprint',
    focus: 15,
    short: 3,
    long: 10,
    icon: TrendingUp,
    color: '#EC4899',
  },
];

const PRIORITY_COLORS = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#10B981',
};

const LONG_BREAK_AFTER = 4; // 4 focus sessions → long break

/* --------------------------- VIBRATION PRESETS --------------------------- */

const VIBRATE_FOCUS_END = [0, 350, 150, 350, 150, 500];
const VIBRATE_BREAK_END = [0, 250, 200, 250];
const VIBRATE_TICK = [0, 40];

/* --------------------------- SCREEN --------------------------- */

function PomodoroScreen() {
  const navigation = useNavigation();
  const {theme} = useTheme();
  const {tasks, loadTodos} = useTodos();
  const insets = useSafeAreaInsets();
  const {width} = useWindowDimensions();

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

  const styles = useMemo(
    () => createStyles(theme, insets),
    [theme, insets],
  );

  /* --------------------------- STATE --------------------------- */
  const [mode, setMode] = useState('work');
  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0); // current cycle count
  const [totalSessionsToday, setTotalSessionsToday] = useState(0);
  const [focusMinutesToday, setFocusMinutesToday] = useState(0);
  const [sessionHistory, setSessionHistory] = useState([]); // last sessions
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState('classic');

  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [completionModalVisible, setCompletionModalVisible] = useState(false);
  const [completionInfo, setCompletionInfo] = useState(null);

  const endTimeRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);

  const modeColor = MODES[mode].color;
  const minuteOptions = mode === 'work' ? FOCUS_MINUTES : BREAK_MINUTES;

  /* --------------------------- RING SIZE --------------------------- */
  const ringSize = useMemo(() => {
    if (width < 340) return 210;
    if (width < 375) return 230;
    if (width < 414) return 250;
    return 270;
  }, [width]);

  const strokeWidth = 14;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const totalSeconds = selectedMinutes * 60;
  const progress =
    totalSeconds > 0
      ? Math.min(Math.max(1 - secondsLeft / totalSeconds, 0), 1)
      : 0;

  const dashOffset = circumference * (1 - progress);

  /* --------------------------- PULSE ANIMATION --------------------------- */
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (running) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.04,
            duration: 1400,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1400,
            useNativeDriver: true,
          }),
        ]),
      );
      loop.start();
      return () => loop.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [running, pulseAnim]);

  /* --------------------------- APP STATE --------------------------- */
  useEffect(() => {
    const sub = AppState.addEventListener('change', nextState => {
      const wasBackground =
        appStateRef.current === 'background' ||
        appStateRef.current === 'inactive';

      if (wasBackground && nextState === 'active' && running) {
        updateFromClock();
      }
      appStateRef.current = nextState;
    });

    return () => sub.remove();
  }, [running]);

  /* --------------------------- INTERVAL --------------------------- */
  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      updateFromClock();
    }, 250);
    return () => clearInterval(interval);
  }, [running]);

  /* --------------------------- TIMER LOGIC --------------------------- */
  function updateFromClock() {
    if (!endTimeRef.current) return;
    const remaining = Math.max(
      0,
      Math.ceil((endTimeRef.current - Date.now()) / 1000),
    );
    setSecondsLeft(remaining);
    if (remaining === 0) handleTimerComplete();
  }

  const handleTimerComplete = useCallback(() => {
    endTimeRef.current = null;
    setRunning(false);

    // Vibration
    if (mode === 'work') {
      Vibration.vibrate(VIBRATE_FOCUS_END);
    } else {
      Vibration.vibrate(VIBRATE_BREAK_END);
    }

    if (mode === 'work') {
      const newCycle = completedSessions + 1;
      setCompletedSessions(newCycle);
      setTotalSessionsToday(n => n + 1);
      setFocusMinutesToday(m => m + selectedMinutes);

      // Log session
      setSessionHistory(prev =>
        [
          {
            id: Date.now(),
            type: 'focus',
            minutes: selectedMinutes,
            task: selectedTask?.title || null,
            finishedAt: new Date(),
          },
          ...prev,
        ].slice(0, 8),
      );

      // Show completion modal
      const goLong = newCycle % LONG_BREAK_AFTER === 0;
      setCompletionInfo({
        type: 'focus',
        minutes: selectedMinutes,
        task: selectedTask?.title || null,
        nextBreak: goLong ? 'longBreak' : 'shortBreak',
        cycleCount: newCycle,
      });
      setCompletionModalVisible(true);
    } else {
      // Break completed
      setSessionHistory(prev =>
        [
          {
            id: Date.now(),
            type: 'break',
            minutes: selectedMinutes,
            finishedAt: new Date(),
          },
          ...prev,
        ].slice(0, 8),
      );

      setCompletionInfo({
        type: 'break',
        minutes: selectedMinutes,
      });
      setCompletionModalVisible(true);
    }
  }, [mode, completedSessions, selectedMinutes, selectedTask]);

  function startTimer() {
    if (running) return;
    endTimeRef.current = Date.now() + secondsLeft * 1000;
    setRunning(true);
  }

  function pauseTimer() {
    if (!running) return;
    updateFromClock();
    endTimeRef.current = null;
    setRunning(false);
  }

  function toggleTimer() {
    if (running) pauseTimer();
    else startTimer();
  }

  function confirmReset() {
    Alert.alert(
      'Reset timer?',
      'Current progress will be lost.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            endTimeRef.current = null;
            setRunning(false);
            setSecondsLeft(selectedMinutes * 60);
          },
        },
      ],
      {cancelable: true},
    );
  }

  function changeMode(nextMode) {
    endTimeRef.current = null;
    setRunning(false);
    setMode(nextMode);
    const defaultMin =
      nextMode === 'work'
        ? PRESETS.find(p => p.key === selectedPreset)?.focus || 25
        : nextMode === 'shortBreak'
        ? PRESETS.find(p => p.key === selectedPreset)?.short || 5
        : PRESETS.find(p => p.key === selectedPreset)?.long || 15;
    setSelectedMinutes(defaultMin);
    setSecondsLeft(defaultMin * 60);
  }

  function selectMinutes(mins) {
    if (running) return;
    setSelectedMinutes(mins);
    setSecondsLeft(mins * 60);
  }

  function applyPreset(preset) {
    if (running) return;
    setSelectedPreset(preset.key);
    const target = mode === 'work' ? preset.focus : mode === 'shortBreak' ? preset.short : preset.long;
    setSelectedMinutes(target);
    setSecondsLeft(target * 60);
  }

  function skipBreak() {
    setCompletionModalVisible(false);
    setTimeout(() => changeMode('work'), 100);
  }

  function startSuggestedBreak() {
    if (!completionInfo) return;
    const nextMode = completionInfo.nextBreak || 'shortBreak';
    setCompletionModalVisible(false);
    setTimeout(() => changeMode(nextMode), 100);
  }

  function formatTime(totalSecondsVal) {
    const minutes = Math.floor(totalSecondsVal / 60);
    const seconds = totalSecondsVal % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
      2,
      '0',
    )}`;
  }

  function formatTimeAgo(date) {
    const diff = Math.floor((Date.now() - date.getTime()) / 60000);
    if (diff < 1) return 'just now';
    if (diff < 60) return `${diff}m ago`;
    const hrs = Math.floor(diff / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  /* --------------------------- TASK SELECTION --------------------------- */
  const availableTasks = useMemo(
    () =>
      (tasks || [])
        .filter(t => !t.deleted && !t.completed)
        .sort((a, b) => {
          const rank = {high: 3, medium: 2, low: 1};
          return (rank[b.priority] || 0) - (rank[a.priority] || 0);
        }),
    [tasks],
  );

  useEffect(() => {
    if (!selectedTask) return;
    const stillExists = availableTasks.some(t => t.id === selectedTask.id);
    if (!stillExists) setSelectedTask(null);
  }, [availableTasks, selectedTask]);

  function pickTask(task) {
    setSelectedTask(task);
    setTaskModalVisible(false);
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
          <View style={{flex: 1, minWidth: 0}}>
            <Text style={styles.title}>Focus</Text>
            <Text style={styles.subtitle}>
              Focus deeply. Break intentionally.
            </Text>
          </View>
          <View
            style={[
              styles.headerIcon,
              {backgroundColor: modeColor + '14'},
            ]}>
            <Zap size={18} color={modeColor} strokeWidth={2.6} />
          </View>
        </View>

        {/* ============ TODAY'S STATS ROW ============ */}
        <View style={styles.statsRow}>
          <View
            style={[
              styles.statMini,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}>
            <Clock size={12} color={modeColor} strokeWidth={2.6} />
            <Text style={[styles.statMiniValue, {color: theme.colors.text}]}>
              {focusMinutesToday}
            </Text>
            <Text
              style={[
                styles.statMiniLabel,
                {color: theme.colors.textSecondary},
              ]}>
              min today
            </Text>
          </View>

          <View
            style={[
              styles.statMini,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}>
            <Award size={12} color="#8B5CF6" strokeWidth={2.6} />
            <Text style={[styles.statMiniValue, {color: theme.colors.text}]}>
              {totalSessionsToday}
            </Text>
            <Text
              style={[
                styles.statMiniLabel,
                {color: theme.colors.textSecondary},
              ]}>
              sessions
            </Text>
          </View>

          <View
            style={[
              styles.statMini,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}>
            <Flame size={12} color="#F97316" strokeWidth={2.6} />
            <Text style={[styles.statMiniValue, {color: theme.colors.text}]}>
              {completedSessions}
            </Text>
            <Text
              style={[
                styles.statMiniLabel,
                {color: theme.colors.textSecondary},
              ]}>
              cycle
            </Text>
          </View>
        </View>

        {/* ============ PRESETS ============ */}
        <Text
          style={[
            styles.durationLabel,
            {color: theme.colors.textSecondary},
          ]}>
          ROUTINE
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.presetRow}>
          {PRESETS.map(preset => {
            const Icon = preset.icon;
            const active = selectedPreset === preset.key;
            return (
              <Pressable
                key={preset.key}
                onPress={() => applyPreset(preset)}
                disabled={running}
                style={[
                  styles.presetChip,
                  {
                    backgroundColor: active
                      ? preset.color
                      : theme.colors.surface,
                    borderColor: active
                      ? preset.color
                      : theme.colors.border,
                    opacity: running && !active ? 0.5 : 1,
                  },
                ]}>
                <Icon
                  size={13}
                  color={active ? '#FFFFFF' : preset.color}
                  strokeWidth={2.6}
                />
                <Text
                  style={[
                    styles.presetChipText,
                    {
                      color: active ? '#FFFFFF' : theme.colors.text,
                    },
                  ]}>
                  {preset.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ============ MODE TABS ============ */}
        <View
          style={[
            styles.modeTabs,
            {backgroundColor: theme.colors.border},
          ]}>
          {Object.entries(MODES).map(([key, item]) => {
            const selected = mode === key;
            return (
              <Pressable
                key={key}
                style={[
                  styles.modeTab,
                  selected && {
                    backgroundColor: theme.colors.surface,
                  },
                ]}
                onPress={() => changeMode(key)}>
                <Text
                  style={[
                    styles.modeText,
                    {
                      color: selected
                        ? item.color
                        : theme.colors.textSecondary,
                      fontWeight: selected ? '900' : '600',
                    },
                  ]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* ============ TASK CHIP ============ */}
        {selectedTask ? (
          <View
            style={[
              styles.taskChipFilled,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}>
            <View
              style={[
                styles.taskChipDot,
                {
                  backgroundColor:
                    PRIORITY_COLORS[selectedTask.priority] || modeColor,
                },
              ]}
            />
            <View style={{flex: 1, minWidth: 0}}>
              <Text
                style={[
                  styles.taskChipEyebrow,
                  {color: theme.colors.textLight},
                ]}>
                FOCUSING ON
              </Text>
              <Text
                style={[
                  styles.taskChipTitle,
                  {color: theme.colors.text},
                ]}
                numberOfLines={1}>
                {selectedTask.title}
              </Text>
            </View>

            <Pressable
              onPress={() => setSelectedTask(null)}
              hitSlop={10}
              style={[
                styles.taskChipClose,
                {backgroundColor: theme.colors.background},
              ]}>
              <X
                size={14}
                color={theme.colors.textSecondary}
                strokeWidth={2.6}
              />
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={() => setTaskModalVisible(true)}
            style={[
              styles.taskChipEmpty,
              {
                borderColor: modeColor + '50',
                backgroundColor: modeColor + '0D',
              },
            ]}>
            <View
              style={[
                styles.taskChipEmptyIcon,
                {backgroundColor: modeColor + '18'},
              ]}>
              <ListTodo size={16} color={modeColor} strokeWidth={2.6} />
            </View>
            <View style={{flex: 1, minWidth: 0}}>
              <Text
                style={[
                  styles.taskChipEmptyTitle,
                  {color: theme.colors.text},
                ]}>
                Select a task to focus on
              </Text>
              <Text
                style={[
                  styles.taskChipEmptySub,
                  {color: theme.colors.textSecondary},
                ]}
                numberOfLines={1}>
                Optional — but highly recommended
              </Text>
            </View>
            <ChevronRight
              size={18}
              color={modeColor}
              strokeWidth={2.4}
            />
          </Pressable>
        )}

        {/* ============ TIMER RING ============ */}
        <View style={styles.timerWrap}>
          <Animated.View
            style={[
              styles.timerCardOuter,
              {
                shadowColor: modeColor,
                transform: [{scale: pulseAnim}],
              },
            ]}>
            <Svg width={ringSize} height={ringSize}>
              <Defs>
                <LinearGradient
                  id="ringGrad"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="1">
                  <Stop
                    offset="0"
                    stopColor={modeColor}
                    stopOpacity="1"
                  />
                  <Stop
                    offset="1"
                    stopColor={modeColor}
                    stopOpacity="0.65"
                  />
                </LinearGradient>
              </Defs>

              <Circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={radius}
                stroke={theme.colors.border}
                strokeWidth={strokeWidth}
                fill="transparent"
              />

              <Circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={radius}
                stroke="url(#ringGrad)"
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
              />
            </Svg>

            <View style={styles.timerCenter} pointerEvents="box-none">
              <Text
                style={[
                  styles.timerText,
                  {color: theme.colors.text},
                ]}
                numberOfLines={1}>
                {formatTime(secondsLeft)}
              </Text>

              <Pressable
                onPress={toggleTimer}
                style={({pressed}) => [
                  styles.playBtn,
                  {
                    backgroundColor: modeColor,
                    shadowColor: modeColor,
                    transform: [{scale: pressed ? 0.94 : 1}],
                  },
                ]}
                accessibilityRole="button"
                accessibilityLabel={running ? 'Pause timer' : 'Start timer'}>
                {running ? (
                  <Pause
                    size={30}
                    color="#FFFFFF"
                    strokeWidth={2.6}
                    fill="#FFFFFF"
                  />
                ) : (
                  <Play
                    size={30}
                    color="#FFFFFF"
                    strokeWidth={2.6}
                    fill="#FFFFFF"
                    style={{marginLeft: 3}}
                  />
                )}
              </Pressable>

              <View style={styles.statusRow}>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: running
                        ? modeColor
                        : theme.colors.textLight,
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.statusText,
                    {
                      color: running
                        ? modeColor
                        : theme.colors.textLight,
                    },
                  ]}>
                  {running
                    ? 'FOCUSING'
                    : progress > 0
                    ? 'PAUSED'
                    : 'READY'}
                </Text>
              </View>
            </View>
          </Animated.View>

          <Pressable
            onPress={confirmReset}
            style={styles.resetLink}
            hitSlop={8}>
            <RotateCcw
              size={13}
              color={theme.colors.textSecondary}
              strokeWidth={2.6}
            />
            <Text
              style={[
                styles.resetLinkText,
                {color: theme.colors.textSecondary},
              ]}>
              Reset timer
            </Text>
          </Pressable>
        </View>

        {/* ============ DURATION CHIPS ============ */}
        <Text
          style={[
            styles.durationLabel,
            {color: theme.colors.textSecondary},
          ]}>
          DURATION
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}>
          {minuteOptions.map(mins => {
            const selected = selectedMinutes === mins;
            return (
              <Pressable
                key={mins}
                disabled={running}
                onPress={() => selectMinutes(mins)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: selected
                      ? modeColor
                      : theme.colors.surface,
                    borderColor: selected
                      ? modeColor
                      : theme.colors.border,
                    opacity: running && !selected ? 0.5 : 1,
                  },
                ]}>
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: selected
                        ? '#FFFFFF'
                        : theme.colors.text,
                    },
                  ]}>
                  {mins}
                </Text>
                <Text
                  style={[
                    styles.chipSub,
                    {
                      color: selected
                        ? 'rgba(255,255,255,0.75)'
                        : theme.colors.textLight,
                    },
                  ]}>
                  min
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ============ SESSION HISTORY ============ */}
        {sessionHistory.length > 0 && (
          <View
            style={[
              styles.historyCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}>
            <View style={styles.historyHeader}>
              <Text
                style={[
                  styles.historyTitle,
                  {color: theme.colors.text},
                ]}>
                Recent sessions
              </Text>
              <Text
                style={[
                  styles.historyCount,
                  {color: theme.colors.textSecondary},
                ]}>
                {sessionHistory.length}
              </Text>
            </View>

            {sessionHistory.slice(0, 4).map(session => {
              const isFocus = session.type === 'focus';
              const color = isFocus ? '#6366F1' : '#10B981';
              return (
                <View key={session.id} style={styles.historyRow}>
                  <View
                    style={[
                      styles.historyDot,
                      {backgroundColor: color},
                    ]}
                  />
                  <Text
                    style={[
                      styles.historyRowText,
                      {color: theme.colors.text},
                    ]}
                    numberOfLines={1}>
                    {isFocus
                      ? session.task || 'Focus session'
                      : 'Break'}
                  </Text>
                  <Text
                    style={[
                      styles.historyMeta,
                      {color: theme.colors.textSecondary},
                    ]}>
                    {session.minutes}m · {formatTimeAgo(session.finishedAt)}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* ============ PRO TIP ============ */}
        <View
          style={[
            styles.tipCard,
            {backgroundColor: modeColor},
          ]}>
          <View style={styles.tipDecor} pointerEvents="none" />
          <View style={styles.tipHeader}>
            <Sparkles size={13} color="#FFFFFF" strokeWidth={2.6} />
            <Text style={styles.tipTitle}>PRO TIP</Text>
          </View>
          <Text style={styles.tipText}>
            After 4 focus sessions, take a long break. Your brain needs real
            rest to sustain deep focus.
          </Text>
        </View>
      </ScrollView>

      {/* ============ TASK PICKER MODAL ============ */}
      <Modal
        visible={taskModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setTaskModalVisible(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setTaskModalVisible(false)}>
          <Pressable
            style={[
              styles.modalSheet,
              {backgroundColor: theme.colors.background},
            ]}
            onPress={() => {}}>
            <View style={styles.modalHeader}>
              <View>
                <Text
                  style={[
                    styles.modalTitle,
                    {color: theme.colors.text},
                  ]}>
                  Choose a task
                </Text>
                <Text
                  style={[
                    styles.modalSubtitle,
                    {color: theme.colors.textSecondary},
                  ]}>
                  {availableTasks.length} pending
                </Text>
              </View>
              <Pressable
                onPress={() => setTaskModalVisible(false)}
                hitSlop={10}
                style={[
                  styles.modalCloseBtn,
                  {backgroundColor: theme.colors.surface},
                ]}>
                <X
                  size={18}
                  color={theme.colors.text}
                  strokeWidth={2.6}
                />
              </Pressable>
            </View>

            <FlatList
              data={availableTasks}
              keyExtractor={item => String(item.id)}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalList}
              renderItem={({item}) => {
                const selected = selectedTask?.id === item.id;
                const priorityColor =
                  PRIORITY_COLORS[item.priority] || modeColor;

                return (
                  <Pressable
                    onPress={() => pickTask(item)}
                    style={[
                      styles.taskRow,
                      {
                        backgroundColor: theme.colors.surface,
                        borderColor: selected
                          ? modeColor
                          : theme.colors.border,
                        borderWidth: selected ? 1.5 : 1,
                      },
                    ]}>
                    <View
                      style={[
                        styles.taskRowIndicator,
                        {backgroundColor: priorityColor},
                      ]}
                    />
                    <View style={{flex: 1, minWidth: 0}}>
                      <Text
                        style={[
                          styles.taskRowTitle,
                          {color: theme.colors.text},
                        ]}
                        numberOfLines={1}>
                        {item.title}
                      </Text>
                      <View style={styles.taskRowMetaRow}>
                        {item.category ? (
                          <Text
                            style={[
                              styles.taskRowMeta,
                              {color: theme.colors.textSecondary},
                            ]}
                            numberOfLines={1}>
                            {item.category}
                          </Text>
                        ) : null}
                        {item.category && item.priority ? (
                          <Text
                            style={[
                              styles.taskRowMetaDot,
                              {color: theme.colors.textLight},
                            ]}>
                            •
                          </Text>
                        ) : null}
                        {item.priority ? (
                          <Text
                            style={[
                              styles.taskRowMeta,
                              {
                                color: priorityColor,
                                textTransform: 'capitalize',
                              },
                            ]}>
                            {item.priority}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                    {selected && (
                      <CheckCircle2
                        size={20}
                        color={modeColor}
                        strokeWidth={2.6}
                      />
                    )}
                  </Pressable>
                );
              }}
              ListEmptyComponent={() => (
                <View style={styles.emptyWrap}>
                  <View
                    style={[
                      styles.emptyIconWrap,
                      {backgroundColor: theme.colors.surface},
                    ]}>
                    <ListTodo
                      size={32}
                      color={theme.colors.textLight}
                      strokeWidth={1.8}
                    />
                  </View>
                  <Text
                    style={[
                      styles.emptyTitle,
                      {color: theme.colors.text},
                    ]}>
                    No pending tasks
                  </Text>
                  <Text
                    style={[
                      styles.emptyDesc,
                      {color: theme.colors.textSecondary},
                    ]}>
                    Add a task first to focus on it
                  </Text>
                </View>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>

      {/* ============ COMPLETION CELEBRATION MODAL ============ */}
      <Modal
        visible={completionModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCompletionModalVisible(false)}>
        <View style={styles.celebrationOverlay}>
          <View
            style={[
              styles.celebrationCard,
              {backgroundColor: theme.colors.background},
            ]}>
            {/* Icon */}
            <View
              style={[
                styles.celebrationIconWrap,
                {
                  backgroundColor:
                    completionInfo?.type === 'focus'
                      ? '#6366F1'
                      : '#10B981',
                },
              ]}>
              {completionInfo?.type === 'focus' ? (
                <CheckCircle2
                  size={38}
                  color="#FFFFFF"
                  strokeWidth={2.4}
                />
              ) : (
                <Coffee size={34} color="#FFFFFF" strokeWidth={2.4} />
              )}
            </View>

            {/* Title */}
            <Text
              style={[
                styles.celebrationTitle,
                {color: theme.colors.text},
              ]}>
              {completionInfo?.type === 'focus'
                ? 'Focus complete!'
                : 'Break over!'}
            </Text>

            <Text
              style={[
                styles.celebrationSub,
                {color: theme.colors.textSecondary},
              ]}>
              {completionInfo?.type === 'focus'
                ? `You focused for ${completionInfo?.minutes} minutes`
                : `You rested for ${completionInfo?.minutes} minutes`}
            </Text>

            {/* Task line */}
            {completionInfo?.task && (
              <View
                style={[
                  styles.celebrationTaskChip,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}>
                <CheckCircle2
                  size={13}
                  color="#10B981"
                  strokeWidth={2.6}
                />
                <Text
                  style={[
                    styles.celebrationTaskText,
                    {color: theme.colors.text},
                  ]}
                  numberOfLines={1}>
                  {completionInfo.task}
                </Text>
              </View>
            )}

            {/* Stats grid */}
            {completionInfo?.type === 'focus' && (
              <View style={styles.celebrationStats}>
                <View style={styles.celebrationStat}>
                  <Text
                    style={[
                      styles.celebrationStatValue,
                      {color: theme.colors.text},
                    ]}>
                    {totalSessionsToday}
                  </Text>
                  <Text
                    style={[
                      styles.celebrationStatLabel,
                      {color: theme.colors.textSecondary},
                    ]}>
                    today
                  </Text>
                </View>
                <View style={styles.celebrationDivider} />
                <View style={styles.celebrationStat}>
                  <Text
                    style={[
                      styles.celebrationStatValue,
                      {color: theme.colors.text},
                    ]}>
                    {focusMinutesToday}
                  </Text>
                  <Text
                    style={[
                      styles.celebrationStatLabel,
                      {color: theme.colors.textSecondary},
                    ]}>
                    min total
                  </Text>
                </View>
                <View style={styles.celebrationDivider} />
                <View style={styles.celebrationStat}>
                  <Text
                    style={[
                      styles.celebrationStatValue,
                      {color: theme.colors.text},
                    ]}>
                    {completedSessions % LONG_BREAK_AFTER || LONG_BREAK_AFTER}
                    /{LONG_BREAK_AFTER}
                  </Text>
                  <Text
                    style={[
                      styles.celebrationStatLabel,
                      {color: theme.colors.textSecondary},
                    ]}>
                    cycle
                  </Text>
                </View>
              </View>
            )}

            {/* Actions */}
            <View style={styles.celebrationActions}>
              {completionInfo?.type === 'focus' ? (
                <>
                  <Pressable
                    style={[
                      styles.celebrationPrimary,
                      {
                        backgroundColor:
                          completionInfo.nextBreak === 'longBreak'
                            ? '#F59E0B'
                            : '#10B981',
                      },
                    ]}
                    onPress={startSuggestedBreak}>
                    <Coffee
                      size={16}
                      color="#FFFFFF"
                      strokeWidth={2.6}
                    />
                    <Text style={styles.celebrationPrimaryText}>
                      Start{' '}
                      {completionInfo.nextBreak === 'longBreak'
                        ? 'long break'
                        : 'short break'}
                    </Text>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.celebrationSecondary,
                      {
                        borderColor: theme.colors.border,
                        backgroundColor: theme.colors.surface,
                      },
                    ]}
                    onPress={skipBreak}>
                    <SkipForward
                      size={15}
                      color={theme.colors.text}
                      strokeWidth={2.6}
                    />
                    <Text
                      style={[
                        styles.celebrationSecondaryText,
                        {color: theme.colors.text},
                      ]}>
                      Skip break
                    </Text>
                  </Pressable>
                </>
              ) : (
                <Pressable
                  style={[
                    styles.celebrationPrimary,
                    {backgroundColor: '#6366F1'},
                  ]}
                  onPress={skipBreak}>
                  <Zap size={16} color="#FFFFFF" strokeWidth={2.6} />
                  <Text style={styles.celebrationPrimaryText}>
                    Back to focus
                  </Text>
                </Pressable>
              )}

              <Pressable
                onPress={() => setCompletionModalVisible(false)}
                style={styles.celebrationDismiss}>
                <Text
                  style={[
                    styles.celebrationDismissText,
                    {color: theme.colors.textSecondary},
                  ]}>
                  Dismiss
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
      paddingBottom: Math.max(insets.bottom, 12) + 110,
    },

    /* Header */
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
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
      marginTop: 3,
      fontSize: 12.5,
      fontWeight: '500',
      color: theme.colors.textSecondary,
      letterSpacing: 0.1,
    },
    headerIcon: {
      width: 40,
      height: 40,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 10,
    },

    /* Stats row */
    statsRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 18,
    },
    statMini: {
      flex: 1,
      minWidth: 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
      paddingVertical: 10,
      paddingHorizontal: 8,
      borderRadius: 13,
      borderWidth: 1,
    },
    statMiniValue: {
      fontSize: 14,
      fontWeight: '900',
      letterSpacing: -0.3,
    },
    statMiniLabel: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 0.2,
    },

    /* Presets */
    durationLabel: {
      marginTop: 6,
      marginBottom: 10,
      fontSize: 10.5,
      fontWeight: '900',
      letterSpacing: 1.4,
    },
    presetRow: {
      gap: 8,
      paddingRight: 8,
      paddingBottom: 16,
    },
    presetChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 13,
      paddingVertical: 9,
      borderRadius: 12,
      borderWidth: 1.5,
    },
    presetChipText: {
      fontSize: 12.5,
      fontWeight: '800',
      letterSpacing: 0.1,
    },

    /* Mode tabs */
    modeTabs: {
      flexDirection: 'row',
      padding: 4,
      borderRadius: 14,
      marginBottom: 14,
    },
    modeTab: {
      flex: 1,
      minHeight: 40,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 11,
    },
    modeText: {
      fontSize: 13,
      letterSpacing: 0.2,
    },

    /* Task chip - empty */
    taskChipEmpty: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 12,
      paddingVertical: 12,
      borderRadius: 16,
      borderWidth: 1.5,
      borderStyle: 'dashed',
      marginBottom: 16,
    },
    taskChipEmptyIcon: {
      width: 36,
      height: 36,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    taskChipEmptyTitle: {
      fontSize: 13.5,
      fontWeight: '800',
      letterSpacing: -0.1,
    },
    taskChipEmptySub: {
      fontSize: 11,
      fontWeight: '600',
      marginTop: 2,
      letterSpacing: 0.1,
    },

    /* Task chip - filled */
    taskChipFilled: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 12,
      paddingVertical: 12,
      borderRadius: 16,
      borderWidth: 1,
      marginBottom: 16,
    },
    taskChipDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    taskChipEyebrow: {
      fontSize: 9.5,
      fontWeight: '900',
      letterSpacing: 1.2,
    },
    taskChipTitle: {
      fontSize: 14,
      fontWeight: '800',
      letterSpacing: -0.2,
      marginTop: 2,
    },
    taskChipClose: {
      width: 28,
      height: 28,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },

    /* Timer */
    timerWrap: {
      alignItems: 'center',
      marginBottom: 18,
      marginTop: 6,
    },
    timerCardOuter: {
      alignItems: 'center',
      justifyContent: 'center',
      shadowOffset: {width: 0, height: 8},
      shadowOpacity: 0.16,
      shadowRadius: 24,
      elevation: 4,
    },
    timerCenter: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    timerText: {
      fontSize: 52,
      fontWeight: '900',
      letterSpacing: -1.5,
      lineHeight: 58,
      includeFontPadding: false,
      marginBottom: 14,
    },
    playBtn: {
      width: 72,
      height: 72,
      borderRadius: 36,
      alignItems: 'center',
      justifyContent: 'center',
      shadowOffset: {width: 0, height: 8},
      shadowOpacity: 0.4,
      shadowRadius: 14,
      elevation: 8,
      marginBottom: 12,
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    statusText: {
      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 1.6,
    },
    resetLink: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      marginTop: 14,
      paddingVertical: 6,
      paddingHorizontal: 10,
    },
    resetLinkText: {
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.2,
    },

    /* Duration chips */
    chipsRow: {
      paddingRight: 8,
      gap: 8,
      paddingBottom: 4,
    },
    chip: {
      minWidth: 56,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 13,
      borderWidth: 1.5,
      alignItems: 'center',
      justifyContent: 'center',
    },
    chipText: {
      fontSize: 15,
      fontWeight: '900',
      letterSpacing: -0.3,
      lineHeight: 17,
    },
    chipSub: {
      fontSize: 9,
      fontWeight: '700',
      letterSpacing: 0.3,
      marginTop: 2,
    },

    /* Session history */
    historyCard: {
      marginTop: 20,
      padding: 14,
      borderRadius: 18,
      borderWidth: 1,
    },
    historyHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    historyTitle: {
      fontSize: 13.5,
      fontWeight: '900',
      letterSpacing: -0.2,
    },
    historyCount: {
      fontSize: 11.5,
      fontWeight: '800',
      letterSpacing: 0.2,
    },
    historyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 8,
    },
    historyDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    historyRowText: {
      flex: 1,
      minWidth: 0,
      fontSize: 12.5,
      fontWeight: '700',
      letterSpacing: -0.1,
    },
    historyMeta: {
      fontSize: 10.5,
      fontWeight: '700',
      letterSpacing: 0.2,
    },

    /* Tip */
    tipCard: {
      marginTop: 14,
      padding: 16,
      borderRadius: 18,
      overflow: 'hidden',
    },
    tipDecor: {
      position: 'absolute',
      width: 140,
      height: 140,
      borderRadius: 70,
      backgroundColor: 'rgba(255,255,255,0.08)',
      top: -50,
      right: -40,
    },
    tipHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    tipTitle: {
      fontSize: 10.5,
      fontWeight: '900',
      color: '#FFFFFF',
      letterSpacing: 1.4,
    },
    tipText: {
      marginTop: 8,
      fontSize: 13,
      lineHeight: 19,
      color: 'rgba(255,255,255,0.92)',
      fontWeight: '600',
    },

    /* ============ MODAL ============ */
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'flex-end',
    },
    modalSheet: {
      maxHeight: '80%',
      borderTopLeftRadius: 26,
      borderTopRightRadius: 26,
      paddingTop: 18,
      paddingBottom: Math.max(insets.bottom, 16) + 8,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      marginBottom: 14,
    },
    modalTitle: {
      fontSize: 19,
      fontWeight: '900',
      letterSpacing: -0.4,
    },
    modalSubtitle: {
      fontSize: 12,
      fontWeight: '600',
      marginTop: 2,
    },
    modalCloseBtn: {
      width: 36,
      height: 36,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalList: {
      paddingHorizontal: 20,
      paddingBottom: 8,
      gap: 8,
    },
    taskRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderRadius: 14,
      gap: 12,
    },
    taskRowIndicator: {
      width: 4,
      height: 32,
      borderRadius: 2,
      flexShrink: 0,
    },
    taskRowTitle: {
      fontSize: 14,
      fontWeight: '800',
      letterSpacing: -0.2,
    },
    taskRowMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      marginTop: 3,
    },
    taskRowMeta: {
      fontSize: 11,
      fontWeight: '600',
      letterSpacing: 0.1,
    },
    taskRowMetaDot: {
      fontSize: 11,
    },

    /* Empty */
    emptyWrap: {
      alignItems: 'center',
      paddingVertical: 30,
    },
    emptyIconWrap: {
      width: 72,
      height: 72,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 14,
    },
    emptyTitle: {
      fontSize: 15,
      fontWeight: '800',
      letterSpacing: -0.2,
      marginBottom: 4,
    },
    emptyDesc: {
      fontSize: 12.5,
      fontWeight: '500',
      textAlign: 'center',
      maxWidth: 240,
      lineHeight: 18,
    },

    /* ============ CELEBRATION ============ */
    celebrationOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.55)',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
    },
    celebrationCard: {
      width: '100%',
      maxWidth: 360,
      borderRadius: 26,
      padding: 24,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 20},
      shadowOpacity: 0.35,
      shadowRadius: 40,
      elevation: 20,
    },
    celebrationIconWrap: {
      width: 78,
      height: 78,
      borderRadius: 26,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 18,
      shadowOffset: {width: 0, height: 8},
      shadowOpacity: 0.35,
      shadowRadius: 16,
      elevation: 6,
    },
    celebrationTitle: {
      fontSize: 23,
      fontWeight: '900',
      letterSpacing: -0.6,
      textAlign: 'center',
      marginBottom: 6,
    },
    celebrationSub: {
      fontSize: 13,
      fontWeight: '600',
      textAlign: 'center',
      lineHeight: 19,
      marginBottom: 16,
    },
    celebrationTaskChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      borderWidth: 1,
      marginBottom: 18,
      maxWidth: '100%',
    },
    celebrationTaskText: {
      fontSize: 12.5,
      fontWeight: '700',
      letterSpacing: -0.1,
      maxWidth: 220,
    },
    celebrationStats: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      paddingVertical: 14,
      paddingHorizontal: 6,
      borderRadius: 16,
      backgroundColor: 'rgba(127,127,127,0.06)',
      marginBottom: 20,
    },
    celebrationStat: {
      flex: 1,
      alignItems: 'center',
    },
    celebrationStatValue: {
      fontSize: 20,
      fontWeight: '900',
      letterSpacing: -0.6,
      lineHeight: 22,
    },
    celebrationStatLabel: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 0.3,
      marginTop: 3,
      textTransform: 'uppercase',
    },
    celebrationDivider: {
      width: 1,
      height: 28,
      backgroundColor: 'rgba(127,127,127,0.2)',
    },
    celebrationActions: {
      width: '100%',
      gap: 10,
    },
    celebrationPrimary: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 15,
      borderRadius: 15,
      shadowOffset: {width: 0, height: 6},
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 5,
    },
    celebrationPrimaryText: {
      color: '#FFFFFF',
      fontSize: 14.5,
      fontWeight: '900',
      letterSpacing: 0.2,
    },
    celebrationSecondary: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 13,
      borderRadius: 15,
      borderWidth: 1.5,
    },
    celebrationSecondaryText: {
      fontSize: 13.5,
      fontWeight: '800',
      letterSpacing: 0.2,
    },
    celebrationDismiss: {
      alignItems: 'center',
      paddingVertical: 10,
    },
    celebrationDismissText: {
      fontSize: 12.5,
      fontWeight: '700',
      letterSpacing: 0.2,
    },
  });
}

export default PomodoroScreen;