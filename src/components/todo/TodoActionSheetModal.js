import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  BackHandler,
} from 'react-native';
import {
  Pin,
  PinOff,
  Timer,
  TimerOff,
  Bell,
  Star,
  Share2,
  Pencil,
  Trash2,
  X,
  ChevronLeft,
} from 'lucide-react-native';

const pad = value => String(value).padStart(2, '0');

function formatRemaining(ms) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${pad(m)}m ${pad(s)}s`;
  return `${pad(m)}:${pad(s)}`;
}

const TIMER_PRESETS = [
  {minutes: 5, label: '5 min', sub: 'Quick focus'},
  {minutes: 15, label: '15 min', sub: 'Short burst'},
  {minutes: 25, label: '25 min', sub: 'Standard Pomodoro'},
  {minutes: 45, label: '45 min', sub: 'Deep work'},
  {minutes: 60, label: '1 hour', sub: 'Sprint'},
];

export default function TodoActionSheetModal({
  visible,
  actionTodo,
  onClose,
  togglePinTodo,
  setTodoTimer,
  clearTodoTimer,
  toggleTodoReminder,
  onFavorite,
  onShare,
  onEdit,
  onDelete,
  theme,
}) {
  const [sheetView, setSheetView] = useState('main'); // 'main' | 'timer'
  const [customMinutes, setCustomMinutes] = useState('');
  const [now, setNow] = useState(Date.now());

  // Reset view when opening/closing
  useEffect(() => {
    if (visible) {
      setSheetView('main');
      setCustomMinutes('');
    }
  }, [visible]);

  // Clock tick for timer preview
  useEffect(() => {
    if (!visible || !actionTodo?.timerEndAt) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [visible, actionTodo?.timerEndAt]);

  // Android Back Handler
  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (sheetView === 'timer') {
        setSheetView('main');
        return true;
      }
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [visible, sheetView, onClose]);

  if (!visible || !actionTodo) return null;

  const sheetTimerRemaining = actionTodo.timerEndAt
    ? Math.max(0, new Date(actionTodo.timerEndAt).getTime() - now)
    : 0;
  const sheetTimerExpired =
    actionTodo.timerEndAt &&
    new Date(actionTodo.timerEndAt).getTime() <= now;

  function applyCustomTimer() {
    const mins = parseInt(customMinutes, 10);
    if (isNaN(mins) || mins <= 0 || mins > 1440) return;
    setTodoTimer(actionTodo.id, mins);
    onClose();
  }

  const isDark = theme.mode === 'dark';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={() => {
        if (sheetView === 'timer') setSheetView('main');
        else onClose();
      }}
      statusBarTranslucent>
      <View style={styles.sheetRoot}>
        <Pressable style={styles.sheetBackdrop} onPress={onClose} />

        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}>
          <View
            style={[
              styles.sheetHandle,
              {backgroundColor: theme.colors.border},
            ]}
          />
          <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            contentContainerStyle={styles.sheetScrollContent}>
            {sheetView === 'main' ? (
              <>
                <View style={styles.sheetHeader}>
                  <View style={{flex: 1}}>
                    <Text
                      style={[
                        styles.sheetLabel,
                        {color: theme.colors.textSecondary},
                      ]}>
                      ACTIONS
                    </Text>
                    <Text
                      style={[styles.sheetTitle, {color: theme.colors.text}]}
                      numberOfLines={1}>
                      {actionTodo.title || 'Untitled task'}
                    </Text>
                  </View>
                  <Pressable onPress={onClose} style={styles.sheetClose} hitSlop={10}>
                    <X size={18} color={theme.colors.textSecondary} strokeWidth={2.4} />
                  </Pressable>
                </View>

                {/* PIN / UNPIN */}
                <Pressable
                  style={({pressed}) => [
                    styles.sheetRow,
                    pressed && {backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC'},
                  ]}
                  onPress={() => {
                    togglePinTodo(actionTodo.id);
                    onClose();
                  }}>
                  <View
                    style={[
                      styles.sheetIcon,
                      {backgroundColor: isDark ? 'rgba(99,102,241,0.2)' : '#EEF2FF'},
                    ]}>
                    {actionTodo.pinned ? (
                      <PinOff size={18} color="#4F46E5" strokeWidth={2.4} />
                    ) : (
                      <Pin size={18} color="#4F46E5" strokeWidth={2.4} />
                    )}
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={[styles.sheetRowTitle, {color: theme.colors.text}]}>
                      {actionTodo.pinned ? 'Unpin from top' : 'Pin to top'}
                    </Text>
                    <Text style={[styles.sheetRowSub, {color: theme.colors.textSecondary}]}>
                      {actionTodo.pinned
                        ? 'Remove this task from the pinned list'
                        : 'Keep this task on top of your list'}
                    </Text>
                  </View>
                </Pressable>

                {/* SET / CHANGE TIMER */}
                <Pressable
                  style={({pressed}) => [
                    styles.sheetRow,
                    pressed && {backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC'},
                  ]}
                  onPress={() => setSheetView('timer')}>
                  <View
                    style={[
                      styles.sheetIcon,
                      {backgroundColor: isDark ? 'rgba(249, 115, 22, 0.2)' : '#FFF7ED'},
                    ]}>
                    <Timer size={18} color="#F97316" strokeWidth={2.4} />
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={[styles.sheetRowTitle, {color: theme.colors.text}]}>
                      {actionTodo.timerEndAt ? 'Change timer' : 'Set timer'}
                    </Text>
                    <Text style={[styles.sheetRowSub, {color: theme.colors.textSecondary}]}>
                      {actionTodo.timerEndAt
                        ? sheetTimerExpired
                          ? 'Timer finished — set a new one'
                          : `⏱ ${formatRemaining(sheetTimerRemaining)} left`
                        : 'Start a focus countdown'}
                    </Text>
                  </View>
                </Pressable>

                {/* REMINDER / ALERT */}
                <Pressable
                  style={({pressed}) => [
                    styles.sheetRow,
                    pressed && {backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC'},
                  ]}
                  onPress={() => toggleTodoReminder(actionTodo.id)}>
                  <View
                    style={[
                      styles.sheetIcon,
                      {backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#EFF6FF'},
                    ]}>
                    <Bell
                      size={18}
                      color="#3B82F6"
                      strokeWidth={2.4}
                      fill={actionTodo.reminder ? '#3B82F6' : 'transparent'}
                    />
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={[styles.sheetRowTitle, {color: theme.colors.text}]}>
                      {actionTodo.reminder
                        ? 'Remove alert / reminder'
                        : 'Set alert / reminder'}
                    </Text>
                    <Text style={[styles.sheetRowSub, {color: theme.colors.textSecondary}]}>
                      {actionTodo.reminder
                        ? 'Turn off alert notification for this task'
                        : 'Sound alert and notify on due date'}
                    </Text>
                  </View>
                </Pressable>

                {/* FAVORITE */}
                <Pressable
                  style={({pressed}) => [
                    styles.sheetRow,
                    pressed && {backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC'},
                  ]}
                  onPress={onFavorite}>
                  <View
                    style={[
                      styles.sheetIcon,
                      {backgroundColor: isDark ? 'rgba(245, 158, 11, 0.2)' : '#FFFBEB'},
                    ]}>
                    <Star
                      size={18}
                      color="#F59E0B"
                      strokeWidth={2.4}
                      fill={actionTodo.favorite ? '#F59E0B' : 'transparent'}
                    />
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={[styles.sheetRowTitle, {color: theme.colors.text}]}>
                      {actionTodo.favorite
                        ? 'Remove from favorites'
                        : 'Add to favorites'}
                    </Text>
                    <Text style={[styles.sheetRowSub, {color: theme.colors.textSecondary}]}>
                      {actionTodo.favorite
                        ? 'Unmark this task as favorite'
                        : 'Mark this task as favorite'}
                    </Text>
                  </View>
                </Pressable>

                {/* SHARE */}
                <Pressable
                  style={({pressed}) => [
                    styles.sheetRow,
                    pressed && {backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC'},
                  ]}
                  onPress={onShare}>
                  <View
                    style={[
                      styles.sheetIcon,
                      {backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#ECFDF5'},
                    ]}>
                    <Share2 size={18} color="#10B981" strokeWidth={2.4} />
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={[styles.sheetRowTitle, {color: theme.colors.text}]}>Share task</Text>
                    <Text style={[styles.sheetRowSub, {color: theme.colors.textSecondary}]}>
                      Send this task anywhere — WhatsApp, Gmail, Telegram
                    </Text>
                  </View>
                </Pressable>

                {/* EDIT */}
                <Pressable
                  style={({pressed}) => [
                    styles.sheetRow,
                    pressed && {backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC'},
                  ]}
                  onPress={onEdit}>
                  <View
                    style={[
                      styles.sheetIcon,
                      {backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#EAF2FF'},
                    ]}>
                    <Pencil size={18} color="#3B82F6" strokeWidth={2.4} />
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={[styles.sheetRowTitle, {color: theme.colors.text}]}>Edit task</Text>
                    <Text style={[styles.sheetRowSub, {color: theme.colors.textSecondary}]}>
                      Update title, details, priority and more
                    </Text>
                  </View>
                </Pressable>

                {/* DELETE */}
                <Pressable
                  style={({pressed}) => [
                    styles.sheetRow,
                    pressed && {backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC'},
                  ]}
                  onPress={onDelete}>
                  <View
                    style={[
                      styles.sheetIcon,
                      {backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FDECEC'},
                    ]}>
                    <Trash2 size={18} color="#EF4444" strokeWidth={2.4} />
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={[styles.sheetRowTitle, {color: '#EF4444'}]}>Delete task</Text>
                    <Text style={[styles.sheetRowSub, {color: theme.colors.textSecondary}]}>
                      Move this task to Trash
                    </Text>
                  </View>
                </Pressable>

                {/* STOP TIMER (only if running) */}
                {actionTodo.timerEndAt && !sheetTimerExpired ? (
                  <Pressable
                    style={({pressed}) => [
                      styles.sheetRow,
                      pressed && {backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC'},
                    ]}
                    onPress={() => {
                      clearTodoTimer(actionTodo.id);
                      onClose();
                    }}>
                    <View
                      style={[
                        styles.sheetIcon,
                        {backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#FEF2F2'},
                      ]}>
                      <TimerOff size={18} color="#EF4444" strokeWidth={2.4} />
                    </View>
                    <View style={{flex: 1}}>
                      <Text style={[styles.sheetRowTitle, {color: '#EF4444'}]}>Stop timer</Text>
                      <Text style={[styles.sheetRowSub, {color: theme.colors.textSecondary}]}>
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
                    <ChevronLeft size={20} color={theme.colors.textSecondary} strokeWidth={2.4} />
                  </Pressable>
                  <View style={{flex: 1, marginLeft: 10}}>
                    <Text
                      style={[styles.sheetLabel, {color: theme.colors.textSecondary}]}>
                      TIMER
                    </Text>
                    <Text
                      style={[styles.sheetTitle, {color: theme.colors.text}]}>
                      {actionTodo.timerEndAt && !sheetTimerExpired
                        ? `${formatRemaining(sheetTimerRemaining)} left`
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
                        {
                          backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                          borderColor: theme.colors.border,
                        },
                        pressed && {opacity: 0.85},
                      ]}
                      onPress={() => {
                        setTodoTimer(actionTodo.id, preset.minutes);
                        onClose();
                      }}>
                      <View style={{flex: 1}}>
                        <Text style={[styles.presetLabel, {color: theme.colors.text}]}>
                          {preset.label}
                        </Text>
                        <Text style={[styles.presetSub, {color: theme.colors.textSecondary}]}>
                          {preset.sub}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </View>

                {/* CUSTOM TIMER */}
                <View style={styles.customWrap}>
                  <Text style={[styles.customLabel, {color: theme.colors.textSecondary}]}>
                    CUSTOM
                  </Text>
                  <View style={styles.customRow}>
                    <TextInput
                      style={[
                        styles.customInput,
                        {
                          backgroundColor: theme.colors.background,
                          borderColor: theme.colors.border,
                          color: theme.colors.text,
                        },
                      ]}
                      placeholder="Enter minutes (max 1440)"
                      placeholderTextColor={theme.colors.textLight}
                      value={customMinutes}
                      onChangeText={text => setCustomMinutes(text.replace(/[^0-9]/g, ''))}
                      keyboardType="number-pad"
                      maxLength={4}
                      returnKeyType="done"
                      onSubmitEditing={applyCustomTimer}
                    />
                    <Text style={[styles.customUnit, {color: theme.colors.textSecondary}]}>
                      min
                    </Text>
                    <Pressable
                      style={({pressed}) => [
                        styles.customBtn,
                        {backgroundColor: theme.colors.primary},
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
                {
                  backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
                  borderColor: theme.colors.border,
                },
                pressed && {opacity: 0.85},
              ]}
              onPress={onClose}>
              <Text style={[styles.sheetCancelText, {color: theme.colors.text}]}>
                Cancel
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheetRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    maxHeight: '85%',
    paddingTop: 12,
  },
  sheetHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 34,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 4,
  },
  sheetLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  sheetClose: {
    padding: 6,
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 4,
  },
  sheetIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetRowTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  sheetRowSub: {
    fontSize: 12,
    fontWeight: '500',
  },
  presetGrid: {
    gap: 8,
    marginBottom: 14,
  },
  preset: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  presetLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  presetSub: {
    fontSize: 12,
    marginTop: 2,
  },
  customWrap: {
    marginBottom: 16,
  },
  customLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  customInput: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  customUnit: {
    fontSize: 13,
    fontWeight: '700',
  },
  customBtn: {
    paddingHorizontal: 18,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  sheetCancel: {
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 8,
  },
  sheetCancelText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
