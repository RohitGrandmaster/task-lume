import React, {useEffect, useRef, useState, useMemo, useCallback} from 'react';
import {
  View, Text, Pressable, StyleSheet, ScrollView, AppState, Alert,
  Vibration, Animated, useWindowDimensions, Modal, FlatList,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation, DrawerActions} from '@react-navigation/native';
import Svg, {Circle} from 'react-native-svg';
import {
  Play, Pause, RotateCcw, Zap, Menu, Square, ListTodo, ChevronRight, X, CheckCircle2,
} from 'lucide-react-native';
import useTheme from '../../hooks/useTheme';
import useTodos from '../../hooks/useTodos';
import Toast from 'react-native-toast-message';
import {FOCUS_MINUTES, BREAK_MINUTES} from '../../constants/focusDurations';
import {initSoundService, stopSound} from '../../services/soundService';
import {
  scheduleFocusTimerNotification,
  cancelFocusTimerNotification,
  notifyFocusCompleted,
  prepareTodoTimerNotifications,
} from '../../utils/todoTimerNotifications';

const MODES = {
  work: {label: 'Focus', color: '#6366F1'},
  shortBreak: {label: 'Short', color: '#10B981'},
  longBreak: {label: 'Long', color: '#F59E0B'},
};

const PRIORITY_COLORS = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#10B981',
};

function PomodoroScreen() {
  const navigation = useNavigation();
  const {theme} = useTheme();
  const {tasks} = useTodos();
  const insets = useSafeAreaInsets();
  const {width} = useWindowDimensions();

  const [mode, setMode] = useState('work');
  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskModalVisible, setTaskModalVisible] = useState(false);

  const endTimeRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const modeColor = MODES[mode].color;
  const minuteOptions = mode === 'work' ? FOCUS_MINUTES : BREAK_MINUTES;

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

  const ringSize = width < 375 ? 230 : width < 414 ? 250 : 270;
  const strokeWidth = 14;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const totalSeconds = Math.round(selectedMinutes * 60);
  const progress = totalSeconds > 0 ? Math.min(Math.max(1 - secondsLeft / totalSeconds, 0), 1) : 0;
  const dashOffset = circumference * (1 - progress);

  useEffect(() => {
    initSoundService();
    prepareTodoTimerNotifications();
    return () => cancelFocusTimerNotification();
  }, []);

  useEffect(() => {
    if (running) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {toValue: 1.04, duration: 1400, useNativeDriver: true}),
          Animated.timing(pulseAnim, {toValue: 1, duration: 1400, useNativeDriver: true}),
        ]),
      );
      loop.start();
      return () => loop.stop();
    }
    pulseAnim.setValue(1);
  }, [running, pulseAnim]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', next => {
      const wasBg = appStateRef.current === 'background' || appStateRef.current === 'inactive';
      if (wasBg && next === 'active' && running) updateFromClock();
      appStateRef.current = next;
    });
    return () => sub.remove();
  }, [running]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(updateFromClock, 250);
    return () => clearInterval(id);
  }, [running]);

  function updateFromClock() {
    if (!endTimeRef.current) return;
    const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
    setSecondsLeft(remaining);
    if (remaining === 0) handleComplete();
  }

  function handleComplete() {
    endTimeRef.current = null;
    setRunning(false);
    notifyFocusCompleted({
      mode,
      durationMinutes: selectedMinutes,
      taskTitle: selectedTask?.title || null,
      soundEnabled: true,
      vibrateEnabled: true,
      notificationEnabled: true,
    });
    try { Vibration.vibrate([0, 350, 150, 350]); } catch (_) {}
    Toast.show({
      type: 'success',
      text1: mode === 'work' ? 'Focus complete!' : 'Break over',
      text2: selectedTask?.title
        ? `Done: ${selectedTask.title}`
        : 'Great work.',
      position: 'top',
    });
  }

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

  function stopTimerNow() {
    endTimeRef.current = null;
    setRunning(false);
    cancelFocusTimerNotification();
    stopSound();
  }

  function confirmReset() {
    Alert.alert('Reset timer?', 'Current progress will be lost.', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => {
          endTimeRef.current = null;
          setRunning(false);
          setSecondsLeft(Math.round(selectedMinutes * 60));
          cancelFocusTimerNotification();
          stopSound();
        },
      },
    ]);
  }

  function changeMode(next) {
    cancelFocusTimerNotification();
    stopSound();
    endTimeRef.current = null;
    setRunning(false);
    setMode(next);
    const def = next === 'work' ? 25 : next === 'shortBreak' ? 5 : 15;
    setSelectedMinutes(def);
    setSecondsLeft(def * 60);
  }

  function selectMinutes(mins) {
    if (running) return;
    setSelectedMinutes(mins);
    setSecondsLeft(Math.round(mins * 60));
  }

  function pickTask(task) {
    setSelectedTask(task);
    setTaskModalVisible(false);
  }

  function clearTask() {
    setSelectedTask(null);
  }

  function formatTime(total) {
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  const styles = useMemo(() => StyleSheet.create({
    safe: {flex: 1, backgroundColor: theme.colors.background},
    scroll: {paddingBottom: insets.bottom + 24},
    header: {flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12},
    menuBtn: {
      width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
      backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border,
    },
    title: {fontSize: 22, fontWeight: '900', color: theme.colors.text, letterSpacing: -0.4},
    subtitle: {fontSize: 12, color: theme.colors.textSecondary, marginTop: 2, fontWeight: '500'},
    modeTabs: {
      flexDirection: 'row', marginHorizontal: 16, marginBottom: 12, padding: 4,
      borderRadius: 14, backgroundColor: theme.colors.border,
    },
    modeTab: {flex: 1, paddingVertical: 10, borderRadius: 11, alignItems: 'center'},
    modeText: {fontSize: 13, fontWeight: '700'},
    taskCard: {
      marginHorizontal: 16, marginBottom: 12, padding: 14, borderRadius: 14, borderWidth: 1,
      flexDirection: 'row', alignItems: 'center', gap: 12,
    },
    taskIcon: {
      width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    },
    taskTitle: {fontSize: 14, fontWeight: '800'},
    taskSub: {fontSize: 11, marginTop: 2, fontWeight: '500'},
    clearTask: {padding: 6},
    ringWrap: {alignItems: 'center', marginVertical: 8},
    timerCenter: {position: 'absolute', alignItems: 'center', justifyContent: 'center'},
    timerText: {fontSize: 42, fontWeight: '900', letterSpacing: -1, color: theme.colors.text},
    playBtn: {
      width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center',
      marginTop: 10, elevation: 4,
    },
    statusText: {fontSize: 11, fontWeight: '800', letterSpacing: 1, marginTop: 8},
    actions: {flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 12},
    stopBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8,
      borderRadius: 99, borderWidth: 1.5, borderColor: '#EF4444', backgroundColor: '#EF444418',
    },
    stopText: {fontSize: 13, fontWeight: '800', color: '#EF4444'},
    resetLink: {flexDirection: 'row', alignItems: 'center', gap: 6},
    resetText: {fontSize: 13, fontWeight: '600', color: theme.colors.textSecondary},
    label: {
      fontSize: 10, fontWeight: '800', letterSpacing: 1.2, color: theme.colors.textLight,
      marginHorizontal: 16, marginTop: 16, marginBottom: 8,
    },
    chipsRow: {paddingHorizontal: 16, gap: 8, paddingBottom: 8},
    chip: {
      minWidth: 52, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12,
      borderWidth: 1.5, alignItems: 'center',
    },
    chipText: {fontSize: 15, fontWeight: '800'},
    chipSub: {fontSize: 10, fontWeight: '600', marginTop: 1},
    modalOverlay: {
      flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end',
    },
    modalSheet: {
      borderTopLeftRadius: 22, borderTopRightRadius: 22, borderWidth: 1,
      maxHeight: '70%', paddingBottom: insets.bottom + 12,
    },
    modalHeader: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: 18, paddingVertical: 16, borderBottomWidth: 1,
    },
    modalTitle: {fontSize: 17, fontWeight: '900', letterSpacing: -0.3},
    taskRow: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth,
    },
    priorityDot: {width: 8, height: 8, borderRadius: 4},
    emptyTasks: {padding: 32, alignItems: 'center'},
  }), [theme, insets]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Pressable
            style={styles.menuBtn}
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            hitSlop={8}>
            <Menu size={18} color={theme.colors.text} strokeWidth={2.6} />
          </Pressable>
          <View style={{flex: 1}}>
            <Text style={styles.title}>Focus</Text>
            <Text style={styles.subtitle}>Pick a task · custom time · stop anytime</Text>
          </View>
          <View style={{backgroundColor: modeColor + '18', padding: 10, borderRadius: 12}}>
            <Zap size={18} color={modeColor} strokeWidth={2.6} />
          </View>
        </View>

        <View style={styles.modeTabs}>
          {Object.entries(MODES).map(([key, item]) => {
            const selected = mode === key;
            return (
              <Pressable
                key={key}
                style={[styles.modeTab, selected && {backgroundColor: theme.colors.surface}]}
                onPress={() => changeMode(key)}>
                <Text style={[styles.modeText, {color: selected ? item.color : theme.colors.textSecondary}]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Task picker */}
        <Pressable
          onPress={() => !running && setTaskModalVisible(true)}
          disabled={running}
          style={[
            styles.taskCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: selectedTask ? modeColor : theme.colors.border,
              opacity: running ? 0.7 : 1,
            },
          ]}>
          <View style={[styles.taskIcon, {backgroundColor: modeColor + '18'}]}>
            <ListTodo size={18} color={modeColor} strokeWidth={2.4} />
          </View>
          <View style={{flex: 1}}>
            <Text style={[styles.taskTitle, {color: theme.colors.text}]} numberOfLines={1}>
              {selectedTask?.title || 'Select a task'}
            </Text>
            <Text style={[styles.taskSub, {color: theme.colors.textLight}]}>
              {selectedTask
                ? (selectedTask.priority ? `${selectedTask.priority} priority · ` : '') + 'Focus with this task'
                : 'Optional — link timer to a todo'}
            </Text>
          </View>
          {selectedTask ? (
            <Pressable
              onPress={e => {
                e.stopPropagation?.();
                if (!running) clearTask();
              }}
              hitSlop={8}
              style={styles.clearTask}
              disabled={running}>
              <X size={16} color={theme.colors.textSecondary} />
            </Pressable>
          ) : (
            <ChevronRight size={18} color={theme.colors.textLight} />
          )}
        </Pressable>

        <View style={styles.ringWrap}>
          <Animated.View style={{transform: [{scale: pulseAnim}]}}>
            <Svg width={ringSize} height={ringSize}>
              <Circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={radius}
                stroke={theme.colors.border}
                strokeWidth={strokeWidth}
                fill="none"
              />
              <Circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={radius}
                stroke={modeColor}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
              />
            </Svg>
            <View style={[styles.timerCenter, {width: ringSize, height: ringSize, top: 0, left: 0}]}>
              <Text style={styles.timerText}>{formatTime(secondsLeft)}</Text>
              <Pressable
                onPress={toggleTimer}
                style={[styles.playBtn, {backgroundColor: modeColor, shadowColor: modeColor}]}>
                {running ? (
                  <Pause size={28} color="#FFF" fill="#FFF" strokeWidth={2.6} />
                ) : (
                  <Play size={28} color="#FFF" fill="#FFF" strokeWidth={2.6} style={{marginLeft: 3}} />
                )}
              </Pressable>
              <Text style={[styles.statusText, {color: running ? modeColor : theme.colors.textLight}]}>
                {running ? 'RUNNING' : progress > 0 ? 'PAUSED' : 'READY'}
              </Text>
            </View>
          </Animated.View>

          <View style={styles.actions}>
            {(running || secondsLeft < totalSeconds) ? (
              <Pressable onPress={stopTimerNow} style={styles.stopBtn} hitSlop={8}>
                <Square size={14} color="#EF4444" fill="#EF4444" strokeWidth={2.6} />
                <Text style={styles.stopText}>Stop</Text>
              </Pressable>
            ) : null}
            <Pressable onPress={confirmReset} style={styles.resetLink} hitSlop={8}>
              <RotateCcw size={13} color={theme.colors.textSecondary} strokeWidth={2.6} />
              <Text style={styles.resetText}>Reset</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.label}>
          DURATION — 30 sec · 1–{mode === 'work' ? '180' : '30'} min
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
          {minuteOptions.map(mins => {
            const selected = selectedMinutes === mins;
            return (
              <Pressable
                key={String(mins)}
                disabled={running}
                onPress={() => selectMinutes(mins)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: selected ? modeColor : theme.colors.surface,
                    borderColor: selected ? modeColor : theme.colors.border,
                    opacity: running && !selected ? 0.45 : 1,
                  },
                ]}>
                <Text style={[styles.chipText, {color: selected ? '#FFF' : theme.colors.text}]}>
                  {mins < 1 ? '30' : mins}
                </Text>
                <Text style={[styles.chipSub, {color: selected ? 'rgba(255,255,255,0.8)' : theme.colors.textLight}]}>
                  {mins < 1 ? 'sec' : 'min'}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </ScrollView>

      {/* Task selection modal */}
      <Modal
        visible={taskModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setTaskModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setTaskModalVisible(false)}>
          <Pressable
            style={[styles.modalSheet, {backgroundColor: theme.colors.surface, borderColor: theme.colors.border}]}
            onPress={e => e.stopPropagation()}>
            <View style={[styles.modalHeader, {borderBottomColor: theme.colors.border}]}>
              <Text style={[styles.modalTitle, {color: theme.colors.text}]}>Select a task</Text>
              <Pressable onPress={() => setTaskModalVisible(false)} hitSlop={8}>
                <X size={20} color={theme.colors.textSecondary} />
              </Pressable>
            </View>
            {availableTasks.length === 0 ? (
              <View style={styles.emptyTasks}>
                <ListTodo size={36} color={theme.colors.textLight} />
                <Text style={{marginTop: 12, color: theme.colors.textSecondary, fontWeight: '600'}}>
                  No open tasks
                </Text>
                <Text style={{marginTop: 4, color: theme.colors.textLight, fontSize: 12, textAlign: 'center'}}>
                  Add a todo first, then pick it here for focused work.
                </Text>
              </View>
            ) : (
              <FlatList
                data={availableTasks}
                keyExtractor={item => String(item.id)}
                renderItem={({item}) => {
                  const isSelected = selectedTask?.id === item.id;
                  return (
                    <Pressable
                      onPress={() => pickTask(item)}
                      style={[
                        styles.taskRow,
                        {
                          borderBottomColor: theme.colors.border,
                          backgroundColor: isSelected ? modeColor + '12' : 'transparent',
                        },
                      ]}>
                      <View
                        style={[
                          styles.priorityDot,
                          {backgroundColor: PRIORITY_COLORS[item.priority] || theme.colors.textLight},
                        ]}
                      />
                      <View style={{flex: 1}}>
                        <Text
                          style={{color: theme.colors.text, fontWeight: '700', fontSize: 14}}
                          numberOfLines={1}>
                          {item.title}
                        </Text>
                        {item.category ? (
                          <Text style={{color: theme.colors.textLight, fontSize: 11, marginTop: 2}}>
                            {item.category}
                          </Text>
                        ) : null}
                      </View>
                      {isSelected ? (
                        <CheckCircle2 size={18} color={modeColor} strokeWidth={2.4} />
                      ) : null}
                    </Pressable>
                  );
                }}
              />
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

export default PomodoroScreen;
