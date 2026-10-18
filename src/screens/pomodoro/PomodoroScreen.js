import {LocalizedText} from '../../i18n/LocalizedText';
import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from 'react';
import {
  View,
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
  RefreshControl
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
  Volume2,
  VolumeX,
  Bell,
  BellOff,
  Vibrate as VibrateIcon,
} from 'lucide-react-native';

import useTheme from '../../hooks/useTheme';
import useTodos from '../../hooks/useTodos';
import {getItem, setItem} from '../../storage/storage';
import Toast from 'react-native-toast-message';
import {initSoundService, stopSound, playTickSound} from '../../services/soundService';
import {
  scheduleFocusTimerNotification,
  cancelFocusTimerNotification,
  notifyFocusCompleted,
  prepareTodoTimerNotifications,
} from '../../utils/todoTimerNotifications';

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
const FOCUS_HISTORY_KEY = '@todomaster/focus_session_history';
const MAX_SAVED_SESSIONS = 500;

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
  const [sessionHistory, setSessionHistory] = useState([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState('classic');

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrateEnabled, setVibrateEnabled] = useState(true);
  const [notificationEnabled, setNotificationEnabled] = useState(true);

  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [completionModalVisible, setCompletionModalVisible] = useState(false);
  const [completionInfo, setCompletionInfo] = useState(null);

  const endTimeRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    initSoundService();
    prepareTodoTimerNotifications();
    return () => {
      cancelFocusTimerNotification();
    };
  }, []);

  useEffect(() => {
    let active = true;
    getItem(FOCUS_HISTORY_KEY, [])
      .then(saved => {
        if (!active) return;
        const history = Array.isArray(saved)
          ? saved
              .filter(item => item && ['focus', 'break'].includes(item.type) && Number.isFinite(Number(item.minutes)))
              .map(item => ({
                ...item,
                id: item.id ?? Date.now() + Math.random(),
                finishedAt: item.finishedAt ?? new Date().toISOString(),
              }))
              .slice(0, MAX_SAVED_SESSIONS)
          : [];
        setSessionHistory(history);

        const today = new Date();
        const todaysHistory = history.filter(item => {
          const finishedAt = new Date(item.finishedAt);
          return !Number.isNaN(finishedAt.getTime()) &&
            finishedAt.getFullYear() === today.getFullYear() &&
            finishedAt.getMonth() === today.getMonth() &&
            finishedAt.getDate() === today.getDate();
        });
        const focusSessions = todaysHistory.filter(item => item.type === 'focus');
        setTotalSessionsToday(focusSessions.length);
        setFocusMinutesToday(focusSessions.reduce((sum, item) => sum + Number(item.minutes || 0), 0));
        setCompletedSessions(focusSessions.length);
      })
      .catch(error => {
        console.warn('[Pomodoro] failed to load focus history:', error);
      })
      .finally(() => {
        if (active) setHistoryLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (historyLoaded) {
      setItem(FOCUS_HISTORY_KEY, sessionHistory.slice(0, MAX_SAVED_SESSIONS)).catch(error => {
        console.warn('[Pomodoro] failed to save focus history:', error);
      });
    }
  }, [sessionHistory, historyLoaded]);

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
  const oneThirdCircumference = circumference / 3;

  const totalSeconds = selectedMinutes * 60;
  const progress =
    totalSeconds > 0
      ? Math.min(Math.max(1 - secondsLeft / totalSeconds, 0), 1)
      : 0;

  const dashOffset = circumference * (1 - progress);

  /* --------------------------- 3-COLOR SEQUENTIAL ZONES --------------------------- */
  // Zone 1: Green (0 to 1/3 progress) -> starts at top (-90°)
  const zone1Progress = Math.min(Math.max(progress / (1 / 3), 0), 1);
  const zone1Length = zone1Progress * oneThirdCircumference;

  // Zone 2: Yellow (1/3 to 2/3 progress) -> starts at 120° clockwise (30°)
  const zone2Progress = Math.min(
    Math.max((progress - 1 / 3) / (1 / 3), 0),
    1,
  );
  const zone2Length = zone2Progress * oneThirdCircumference;

  // Zone 3: Red (2/3 to 1.0 progress) -> starts at 240° clockwise (150°)
  const zone3Progress = Math.min(
    Math.max((progress - 2 / 3) / (1 / 3), 0),
    1,
  );
  const zone3Length = zone3Progress * oneThirdCircumference;

  // Dynamic active color for glow shadow, play button & indicators
  const activePhaseColor = useMemo(() => {
    if (mode !== 'work') return modeColor;
    if (progress <= 1 / 3) return '#10B981'; // Fresh Green
    if (progress <= 2 / 3) return '#F59E0B'; // Focused Amber/Yellow
    return '#EF4444'; // Urgent Red
  }, [mode, modeColor, progress]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  /* --------------------------- INTERVAL --------------------------- */
  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      updateFromClock();
    }, 250);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    // Alert sound + vibration + upper heads-up notification
    notifyFocusCompleted({
      mode,
      durationMinutes: selectedMinutes,
      taskTitle: selectedTask?.title || null,
      soundEnabled,
      vibrateEnabled,
      notificationEnabled,
    });

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
        ].slice(0, MAX_SAVED_SESSIONS),
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
  }, [
    mode,
    completedSessions,
    selectedMinutes,
    selectedTask,
    notificationEnabled,
    soundEnabled,
    vibrateEnabled,
  ]);

  function startTimer() {
    if (running) return;
    endTimeRef.current = Date.now() + secondsLeft * 1000;
    setRunning(true);

    scheduleFocusTimerNotification({
      mode,
      durationMinutes: selectedMinutes,
      secondsLeft,
      taskTitle: selectedTask?.title || null,
    });
  }

  function pauseTimer() {
    if (!running) return;
    updateFromClock();
    endTimeRef.current = null;
    setRunning(false);
    cancelFocusTimerNotification();
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
            cancelFocusTimerNotification();
            stopSound();
          },
        },
      ],
      {cancelable: true},
    );
  }

  function changeMode(nextMode) {
    cancelFocusTimerNotification();
    stopSound();
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
    stopSound();
    cancelFocusTimerNotification();
    setCompletionModalVisible(false);
    setTimeout(() => changeMode('work'), 100);
  }

  function startSuggestedBreak() {
    if (!completionInfo) return;
    stopSound();
    cancelFocusTimerNotification();
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
            <LocalizedText style={styles.title}>Focus</LocalizedText>
            <LocalizedText style={styles.subtitle}>
              Focus deeply. Break intentionally.
            </LocalizedText>
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
            <LocalizedText style={[styles.statMiniValue, {color: theme.colors.text}]}>
              {focusMinutesToday}
            </LocalizedText>
            <LocalizedText
              style={[
                styles.statMiniLabel,
                {color: theme.colors.textSecondary},
              ]}>
              min today
            </LocalizedText>
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
            <LocalizedText style={[styles.statMiniValue, {color: theme.colors.text}]}>
              {totalSessionsToday}
            </LocalizedText>
            <LocalizedText
              style={[
                styles.statMiniLabel,
                {color: theme.colors.textSecondary},
              ]}>
              sessions
            </LocalizedText>
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
            <LocalizedText style={[styles.statMiniValue, {color: theme.colors.text}]}>
              {completedSessions}
            </LocalizedText>
            <LocalizedText
              style={[
                styles.statMiniLabel,
                {color: theme.colors.textSecondary},
              ]}>
              cycle
            </LocalizedText>
          </View>
        </View>

        {/* ============ PRESETS ============ */}
        <LocalizedText
          style={[
            styles.durationLabel,
            {color: theme.colors.textSecondary},
          ]}>
          ROUTINE
        </LocalizedText>

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
                <LocalizedText
                  style={[
                    styles.presetChipText,
                    {
                      color: active ? '#FFFFFF' : theme.colors.text,
                    },
                  ]}>
                  {preset.label}
                </LocalizedText>
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
                <LocalizedText
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
                </LocalizedText>
              </Pressable>
            );
          })}
        </View>

        {/* ============ ALERTS & FEEDBACK ROW ============ */}
        <View style={styles.feedbackRow}>
          <Pressable
            onPress={() => {
              setSoundEnabled(s => {
                const next = !s;
                if (next) playTickSound();
                return next;
              });
            }}
            style={[
              styles.feedbackChip,
              {
                backgroundColor: soundEnabled
                  ? theme.mode === 'dark'
                    ? '#6366F126'
                    : '#EEF2FF'
                  : theme.colors.surface,
                borderColor: soundEnabled ? '#6366F1' : theme.colors.border,
              },
            ]}>
            {soundEnabled ? (
              <Volume2 size={13} color="#6366F1" strokeWidth={2.4} />
            ) : (
              <VolumeX size={13} color={theme.colors.textLight} strokeWidth={2.4} />
            )}
            <LocalizedText
              style={[
                styles.feedbackChipText,
                {color: soundEnabled ? '#6366F1' : theme.colors.textSecondary},
              ]}>
              Sound {soundEnabled ? 'ON' : 'OFF'}
            </LocalizedText>
          </Pressable>

          <Pressable
            onPress={() => {
              setVibrateEnabled(v => {
                const next = !v;
                if (next) {
                  try {
                    Vibration.vibrate([0, 80, 40, 100]);
                  } catch (_) {}
                }
                return next;
              });
            }}
            style={[
              styles.feedbackChip,
              {
                backgroundColor: vibrateEnabled
                  ? theme.mode === 'dark'
                    ? '#F59E0B26'
                    : '#FEF3C7'
                  : theme.colors.surface,
                borderColor: vibrateEnabled ? '#F59E0B' : theme.colors.border,
              },
            ]}>
            <VibrateIcon
              size={13}
              color={vibrateEnabled ? '#F59E0B' : theme.colors.textLight}
              strokeWidth={2.4}
            />
            <LocalizedText
              style={[
                styles.feedbackChipText,
                {color: vibrateEnabled ? '#F59E0B' : theme.colors.textSecondary},
              ]}>
              Vibrate {vibrateEnabled ? 'ON' : 'OFF'}
            </LocalizedText>
          </Pressable>

          <Pressable
            onPress={() => {
              setNotificationEnabled(n => {
                const next = !n;
                if (next) {
                  Toast.show({
                    type: 'info',
                    position: 'top',
                    text1: '🔔 Alert Banner ON',
                    text2: 'Focus notifications and top banners are active.',
                    visibilityTime: 2500,
                    topOffset: 45,
                  });
                }
                return next;
              });
            }}
            style={[
              styles.feedbackChip,
              {
                backgroundColor: notificationEnabled
                  ? theme.mode === 'dark'
                    ? '#10B98126'
                    : '#D1FAE5'
                  : theme.colors.surface,
                borderColor: notificationEnabled ? '#10B981' : theme.colors.border,
              },
            ]}>
            {notificationEnabled ? (
              <Bell size={13} color="#10B981" strokeWidth={2.4} />
            ) : (
              <BellOff size={13} color={theme.colors.textLight} strokeWidth={2.4} />
            )}
            <LocalizedText
              style={[
                styles.feedbackChipText,
                {
                  color: notificationEnabled
                    ? '#10B981'
                    : theme.colors.textSecondary,
                },
              ]}>
              Alert {notificationEnabled ? 'ON' : 'OFF'}
            </LocalizedText>
          </Pressable>
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
              <LocalizedText
                style={[
                  styles.taskChipEyebrow,
                  {color: theme.colors.textLight},
                ]}>
                FOCUSING ON
              </LocalizedText>
              <LocalizedText
                style={[
                  styles.taskChipTitle,
                  {color: theme.colors.text},
                ]}
                numberOfLines={1}>
                {selectedTask.title}
              </LocalizedText>
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
              <LocalizedText
                style={[
                  styles.taskChipEmptyTitle,
                  {color: theme.colors.text},
                ]}>
                Select a task to focus on
              </LocalizedText>
              <LocalizedText
                style={[
                  styles.taskChipEmptySub,
                  {color: theme.colors.textSecondary},
                ]}
                numberOfLines={1}>
                Optional — but highly recommended
              </LocalizedText>
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
                shadowColor: activePhaseColor,
                transform: [{scale: pulseAnim}],
              },
            ]}>
            <Svg width={ringSize} height={ringSize}>
              <Defs>
                {/* Fallback / Break Gradient */}
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

                {/* Zone 1: Green Gradient */}
                <LinearGradient
                  id="zone1GreenGrad"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="1">
                  <Stop offset="0" stopColor="#10B981" stopOpacity="1" />
                  <Stop offset="1" stopColor="#059669" stopOpacity="0.9" />
                </LinearGradient>

                {/* Zone 2: Amber Yellow Gradient */}
                <LinearGradient
                  id="zone2YellowGrad"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="1">
                  <Stop offset="0" stopColor="#F59E0B" stopOpacity="1" />
                  <Stop offset="1" stopColor="#D97706" stopOpacity="0.9" />
                </LinearGradient>

                {/* Zone 3: Coral Red Gradient */}
                <LinearGradient
                  id="zone3RedGrad"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="1">
                  <Stop offset="0" stopColor="#EF4444" stopOpacity="1" />
                  <Stop offset="1" stopColor="#DC2626" stopOpacity="0.9" />
                </LinearGradient>
              </Defs>

              {/* Background Track Circle */}
              <Circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={radius}
                stroke={theme.colors.border}
                strokeWidth={strokeWidth}
                fill="transparent"
              />

              {mode === 'work' ? (
                <>
                  {/* Zone 1: Green (0% - 33% / 0° to 120°, starts at top -90°) */}
                  {zone1Length > 0.5 && (
                    <Circle
                      cx={ringSize / 2}
                      cy={ringSize / 2}
                      r={radius}
                      stroke="url(#zone1GreenGrad)"
                      strokeWidth={strokeWidth}
                      fill="transparent"
                      strokeDasharray={`${zone1Length} ${circumference}`}
                      strokeDashoffset={0}
                      strokeLinecap="round"
                      transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
                    />
                  )}

                  {/* Zone 2: Yellow (33% - 66% / 120° to 240°, starts at 30°) */}
                  {zone2Length > 0.5 && (
                    <Circle
                      cx={ringSize / 2}
                      cy={ringSize / 2}
                      r={radius}
                      stroke="url(#zone2YellowGrad)"
                      strokeWidth={strokeWidth}
                      fill="transparent"
                      strokeDasharray={`${zone2Length} ${circumference}`}
                      strokeDashoffset={0}
                      strokeLinecap="round"
                      transform={`rotate(30 ${ringSize / 2} ${ringSize / 2})`}
                    />
                  )}

                  {/* Zone 3: Red (66% - 100% / 240° to 360°, starts at 150°) */}
                  {zone3Length > 0.5 && (
                    <Circle
                      cx={ringSize / 2}
                      cy={ringSize / 2}
                      r={radius}
                      stroke="url(#zone3RedGrad)"
                      strokeWidth={strokeWidth}
                      fill="transparent"
                      strokeDasharray={`${zone3Length} ${circumference}`}
                      strokeDashoffset={0}
                      strokeLinecap="round"
                      transform={`rotate(150 ${ringSize / 2} ${ringSize / 2})`}
                    />
                  )}
                </>
              ) : (
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
              )}
            </Svg>

            <View style={styles.timerCenter} pointerEvents="box-none">
              <LocalizedText
                style={[
                  styles.timerText,
                  {color: theme.colors.text},
                ]}
                numberOfLines={1}>
                {formatTime(secondsLeft)}
              </LocalizedText>

              <Pressable
                onPress={toggleTimer}
                style={({pressed}) => [
                  styles.playBtn,
                  {
                    backgroundColor: activePhaseColor,
                    shadowColor: activePhaseColor,
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
                        ? activePhaseColor
                        : theme.colors.textLight,
                    },
                  ]}
                />
                <LocalizedText
                  style={[
                    styles.statusText,
                    {
                      color: running
                        ? activePhaseColor
                        : theme.colors.textLight,
                    },
                  ]}>
                  {running
                    ? 'FOCUSING'
                    : progress > 0
                    ? 'PAUSED'
                    : 'READY'}
                </LocalizedText>
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
            <LocalizedText
              style={[
                styles.resetLinkText,
                {color: theme.colors.textSecondary},
              ]}>
              Reset timer
            </LocalizedText>
          </Pressable>

          {/* 3-Color Zone Flow Indicator */}
          {mode === 'work' && (
            <View style={styles.tricolorLegend}>
              <View style={styles.tricolorLegendItem}>
                <View
                  style={[
                    styles.tricolorLegendDot,
                    {
                      backgroundColor: '#10B981',
                      opacity: progress > 0 ? 1 : 0.35,
                    },
                  ]}
                />
                <LocalizedText
                  style={[
                    styles.tricolorLegendText,
                    {
                      color:
                        progress > 0 && progress <= 1 / 3
                          ? '#10B981'
                          : theme.colors.textSecondary,
                      fontWeight:
                        progress > 0 && progress <= 1 / 3 ? '800' : '600',
                    },
                  ]}>
                  Green (0-33%)
                </LocalizedText>
              </View>

              <View
                style={[
                  styles.tricolorLegendDivider,
                  {backgroundColor: theme.colors.border},
                ]}
              />

              <View style={styles.tricolorLegendItem}>
                <View
                  style={[
                    styles.tricolorLegendDot,
                    {
                      backgroundColor: '#F59E0B',
                      opacity: progress > 1 / 3 ? 1 : 0.35,
                    },
                  ]}
                />
                <LocalizedText
                  style={[
                    styles.tricolorLegendText,
                    {
                      color:
                        progress > 1 / 3 && progress <= 2 / 3
                          ? '#F59E0B'
                          : theme.colors.textSecondary,
                      fontWeight:
                        progress > 1 / 3 && progress <= 2 / 3 ? '800' : '600',
                    },
                  ]}>
                  Yellow (33-66%)
                </LocalizedText>
              </View>

              <View
                style={[
                  styles.tricolorLegendDivider,
                  {backgroundColor: theme.colors.border},
                ]}
              />

              <View style={styles.tricolorLegendItem}>
                <View
                  style={[
                    styles.tricolorLegendDot,
                    {
                      backgroundColor: '#EF4444',
                      opacity: progress > 2 / 3 ? 1 : 0.35,
                    },
                  ]}
                />
                <LocalizedText
                  style={[
                    styles.tricolorLegendText,
                    {
                      color:
                        progress > 2 / 3
                          ? '#EF4444'
                          : theme.colors.textSecondary,
                      fontWeight: progress > 2 / 3 ? '800' : '600',
                    },
                  ]}>
                  Red (66-100%)
                </LocalizedText>
              </View>
            </View>
          )}
        </View>

        {/* ============ DURATION CHIPS ============ */}
        <LocalizedText
          style={[
            styles.durationLabel,
            {color: theme.colors.textSecondary},
          ]}>
          DURATION
        </LocalizedText>

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
                <LocalizedText
                  style={[
                    styles.chipText,
                    {
                      color: selected
                        ? '#FFFFFF'
                        : theme.colors.text,
                    },
                  ]}>
                  {mins}
                </LocalizedText>
                <LocalizedText
                  style={[
                    styles.chipSub,
                    {
                      color: selected
                        ? 'rgba(255,255,255,0.75)'
                        : theme.colors.textLight,
                    },
                  ]}>
                  min
                </LocalizedText>
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
              <LocalizedText
                style={[
                  styles.historyTitle,
                  {color: theme.colors.text},
                ]}>
                Recent sessions
              </LocalizedText>
              <LocalizedText
                style={[
                  styles.historyCount,
                  {color: theme.colors.textSecondary},
                ]}>
                {sessionHistory.length}
              </LocalizedText>
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
                  <LocalizedText
                    style={[
                      styles.historyRowText,
                      {color: theme.colors.text},
                    ]}
                    numberOfLines={1}>
                    {isFocus
                      ? session.task || 'Focus session'
                      : 'Break'}
                  </LocalizedText>
                  <LocalizedText
                    style={[
                      styles.historyMeta,
                      {color: theme.colors.textSecondary},
                    ]}>
                    {session.minutes}m · {formatTimeAgo(session.finishedAt)}
                  </LocalizedText>
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
            <LocalizedText style={styles.tipTitle}>PRO TIP</LocalizedText>
          </View>
          <LocalizedText style={styles.tipText}>
            After 4 focus sessions, take a long break. Your brain needs real
            rest to sustain deep focus.
          </LocalizedText>
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
                <LocalizedText
                  style={[
                    styles.modalTitle,
                    {color: theme.colors.text},
                  ]}>
                  Choose a task
                </LocalizedText>
                <LocalizedText
                  style={[
                    styles.modalSubtitle,
                    {color: theme.colors.textSecondary},
                  ]}>
                  {availableTasks.length} pending
                </LocalizedText>
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
                      <LocalizedText
                        style={[
                          styles.taskRowTitle,
                          {color: theme.colors.text},
                        ]}
                        numberOfLines={1}>
                        {item.title}
                      </LocalizedText>
                      <View style={styles.taskRowMetaRow}>
                        {item.category ? (
                          <LocalizedText
                            style={[
                              styles.taskRowMeta,
                              {color: theme.colors.textSecondary},
                            ]}
                            numberOfLines={1}>
                            {item.category}
                          </LocalizedText>
                        ) : null}
                        {item.category && item.priority ? (
                          <LocalizedText
                            style={[
                              styles.taskRowMetaDot,
                              {color: theme.colors.textLight},
                            ]}>
                            •
                          </LocalizedText>
                        ) : null}
                        {item.priority ? (
                          <LocalizedText
                            style={[
                              styles.taskRowMeta,
                              {
                                color: priorityColor,
                                textTransform: 'capitalize',
                              },
                            ]}>
                            {item.priority}
                          </LocalizedText>
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
                  <LocalizedText
                    style={[
                      styles.emptyTitle,
                      {color: theme.colors.text},
                    ]}>
                    No pending tasks
                  </LocalizedText>
                  <LocalizedText
                    style={[
                      styles.emptyDesc,
                      {color: theme.colors.textSecondary},
                    ]}>
                    Add a task first to focus on it
                  </LocalizedText>
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
        onRequestClose={() => {
          stopSound();
          setCompletionModalVisible(false);
        }}>
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
            <LocalizedText
              style={[
                styles.celebrationTitle,
                {color: theme.colors.text},
              ]}>
              {completionInfo?.type === 'focus'
                ? 'Focus complete!'
                : 'Break over!'}
            </LocalizedText>

            <LocalizedText
              style={[
                styles.celebrationSub,
                {color: theme.colors.textSecondary},
              ]}>
              {completionInfo?.type === 'focus'
                ? `You focused for ${completionInfo?.minutes} minutes`
                : `You rested for ${completionInfo?.minutes} minutes`}
            </LocalizedText>

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
                <LocalizedText
                  style={[
                    styles.celebrationTaskText,
                    {color: theme.colors.text},
                  ]}
                  numberOfLines={1}>
                  {completionInfo.task}
                </LocalizedText>
              </View>
            )}

            {/* Stats grid */}
            {completionInfo?.type === 'focus' && (
              <View style={styles.celebrationStats}>
                <View style={styles.celebrationStat}>
                  <LocalizedText
                    style={[
                      styles.celebrationStatValue,
                      {color: theme.colors.text},
                    ]}>
                    {totalSessionsToday}
                  </LocalizedText>
                  <LocalizedText
                    style={[
                      styles.celebrationStatLabel,
                      {color: theme.colors.textSecondary},
                    ]}>
                    today
                  </LocalizedText>
                </View>
                <View style={styles.celebrationDivider} />
                <View style={styles.celebrationStat}>
                  <LocalizedText
                    style={[
                      styles.celebrationStatValue,
                      {color: theme.colors.text},
                    ]}>
                    {focusMinutesToday}
                  </LocalizedText>
                  <LocalizedText
                    style={[
                      styles.celebrationStatLabel,
                      {color: theme.colors.textSecondary},
                    ]}>
                    min total
                  </LocalizedText>
                </View>
                <View style={styles.celebrationDivider} />
                <View style={styles.celebrationStat}>
                  <LocalizedText
                    style={[
                      styles.celebrationStatValue,
                      {color: theme.colors.text},
                    ]}>
                    {completedSessions % LONG_BREAK_AFTER || LONG_BREAK_AFTER}
                    /{LONG_BREAK_AFTER}
                  </LocalizedText>
                  <LocalizedText
                    style={[
                      styles.celebrationStatLabel,
                      {color: theme.colors.textSecondary},
                    ]}>
                    cycle
                  </LocalizedText>
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
                    <LocalizedText style={styles.celebrationPrimaryText}>
                      Start{' '}
                      {completionInfo.nextBreak === 'longBreak'
                        ? 'long break'
                        : 'short break'}
                    </LocalizedText>
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
                    <LocalizedText
                      style={[
                        styles.celebrationSecondaryText,
                        {color: theme.colors.text},
                      ]}>
                      Skip break
                    </LocalizedText>
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
                  <LocalizedText style={styles.celebrationPrimaryText}>
                    Back to focus
                  </LocalizedText>
                </Pressable>
              )}

              <Pressable
                onPress={() => {
                  stopSound();
                  cancelFocusTimerNotification();
                  setCompletionModalVisible(false);
                }}
                style={styles.celebrationDismiss}>
                <LocalizedText
                  style={[
                    styles.celebrationDismissText,
                    {color: theme.colors.textSecondary},
                  ]}>
                  Dismiss
                </LocalizedText>
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
    tricolorLegend: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginTop: 10,
      paddingVertical: 5,
      paddingHorizontal: 12,
      borderRadius: 16,
      backgroundColor:
        theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    tricolorLegendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    tricolorLegendDot: {
      width: 7,
      height: 7,
      borderRadius: 3.5,
    },
    tricolorLegendText: {
      fontSize: 10.5,
      letterSpacing: 0.1,
    },
    tricolorLegendDivider: {
      width: 1,
      height: 10,
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
    feedbackRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      marginHorizontal: 16,
      marginTop: 12,
      marginBottom: 6,
    },
    feedbackChip: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
      paddingVertical: 8,
      paddingHorizontal: 8,
      borderRadius: 12,
      borderWidth: 1,
    },
    feedbackChipText: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.2,
    },
  });
}

export default PomodoroScreen;