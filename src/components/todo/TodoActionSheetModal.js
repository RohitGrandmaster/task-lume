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
  {minutes: 25, label: '25 min', sub: 'Pomodoro'},
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
  const [sheetView, setSheetView] = useState('main');
  const [customMinutes, setCustomMinutes] = useState('');
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (visible) {
      setSheetView('main');
      setCustomMinutes('');
    }
  }, [visible]);

  useEffect(() => {
    if (!visible || !actionTodo?.timerEndAt) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [visible, actionTodo?.timerEndAt]);

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
  const pressBg = isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC';

  const iconBg = {
    pin: isDark ? 'rgba(99,102,241,0.22)' : '#EEF2FF',
    timer: isDark ? 'rgba(249,115,22,0.22)' : '#FFF7ED',
    bell: isDark ? 'rgba(59,130,246,0.22)' : '#EFF6FF',
    star: isDark ? 'rgba(245,158,11,0.22)' : '#FFFBEB',
    share: isDark ? 'rgba(16,185,129,0.22)' : '#ECFDF5',
    edit: isDark ? 'rgba(59,130,246,0.18)' : '#EFF6FF',
    delete: isDark ? 'rgba(239,68,68,0.22)' : '#FEF2F2',
  };

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
              {backgroundColor: isDark ? 'rgba(255,255,255,0.18)' : '#CBD5E1'},
            ]}
          />

          <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            contentContainerStyle={styles.sheetScrollContent}>
            {sheetView === 'main' ? (
              <>
                <View style={styles.sheetHeader}>
                  <View style={{flex: 1, paddingRight: 12}}>
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
                  <Pressable
                    onPress={onClose}
                    style={[styles.sheetClose, {backgroundColor: pressBg}]}
                    hitSlop={8}
                    accessibilityLabel="Close">
                    <X
                      size={18}
                      color={theme.colors.textSecondary}
                      strokeWidth={2.4}
                    />
                  </Pressable>
                </View>

                {/* PIN */}
                <Pressable
                  style={({pressed}) => [
                    styles.sheetRow,
                    pressed && {backgroundColor: pressBg},
                  ]}
                  onPress={() => {
                    togglePinTodo(actionTodo.id);
                    onClose();
                  }}>
                  <View style={[styles.sheetIcon, {backgroundColor: iconBg.pin}]}>
                    {actionTodo.pinned ? (
                      <PinOff size={18} color="#6366F1" strokeWidth={2.4} />
                    ) : (
                      <Pin size={18} color="#6366F1" strokeWidth={2.4} />
                    )}
                  </View>
                  <View style={{flex: 1}}>
                    <Text
                      style={[styles.sheetRowTitle, {color: theme.colors.text}]}>
                      {actionTodo.pinned ? 'Unpin from top' : 'Pin to top'}
                    </Text>
                    <Text
                      style={[
                        styles.sheetRowSub,
                        {color: theme.colors.textSecondary},
                      ]}>
                      {actionTodo.pinned
                        ? 'Remove from pinned list'
                        : 'Keep this task at the top'}
                    </Text>
                  </View>
                </Pressable>

                {/* TIMER */}
                <Pressable
                  style={({pressed}) => [
                    styles.sheetRow,
                    pressed && {backgroundColor: pressBg},
                  ]}
                  onPress={() => setSheetView('timer')}>
                  <View
                    style={[styles.sheetIcon, {backgroundColor: iconBg.timer}]}>
                    <Timer size={18} color="#F97316" strokeWidth={2.4} />
                  </View>
                  <View style={{flex: 1}}>
                    <Text
                      style={[styles.sheetRowTitle, {color: theme.colors.text}]}>
                      {actionTodo.timerEndAt ? 'Change timer' : 'Set timer'}
                    </Text>
                    <Text
                      style={[
                        styles.sheetRowSub,
                        {color: theme.colors.textSecondary},
                      ]}>
                      {actionTodo.timerEndAt
                        ? sheetTimerExpired
                          ? 'Timer finished — set a new one'
                          : `${formatRemaining(sheetTimerRemaining)} remaining`
                        : 'Start a focus countdown'}
                    </Text>
                  </View>
                </Pressable>

                {/* REMINDER */}
                <Pressable
                  style={({pressed}) => [
                    styles.sheetRow,
                    pressed && {backgroundColor: pressBg},
                  ]}
                  onPress={() => toggleTodoReminder(actionTodo.id)}>
                  <View
                    style={[styles.sheetIcon, {backgroundColor: iconBg.bell}]}>
                    <Bell
                      size={18}
                      color="#3B82F6"
                      strokeWidth={2.4}
                      fill={actionTodo.reminder ? '#3B82F6' : 'transparent'}
                    />
                  </View>
                  <View style={{flex: 1}}>
                    <Text
                      style={[styles.sheetRowTitle, {color: theme.colors.text}]}>
                      {actionTodo.reminder
                        ? 'Remove reminder'
                        : 'Set reminder'}
                    </Text>
                    <Text
                      style={[
                        styles.sheetRowSub,
                        {color: theme.colors.textSecondary},
                      ]}>
                      {actionTodo.reminder
                        ? 'Turn off alert for this task'
                        : 'Notify on due date'}
                    </Text>
                  </View>
                </Pressable>

                {/* FAVORITE */}
                <Pressable
                  style={({pressed}) => [
                    styles.sheetRow,
                    pressed && {backgroundColor: pressBg},
                  ]}
                  onPress={onFavorite}>
                  <View
                    style={[styles.sheetIcon, {backgroundColor: iconBg.star}]}>
                    <Star
                      size={18}
                      color="#F59E0B"
                      strokeWidth={2.4}
                      fill={actionTodo.favorite ? '#F59E0B' : 'transparent'}
                    />
                  </View>
                  <View style={{flex: 1}}>
                    <Text
                      style={[styles.sheetRowTitle, {color: theme.colors.text}]}>
                      {actionTodo.favorite
                        ? 'Remove from favorites'
                        : 'Add to favorites'}
                    </Text>
                    <Text
                      style={[
                        styles.sheetRowSub,
                        {color: theme.colors.textSecondary},
                      ]}>
                      {actionTodo.favorite
                        ? 'Unmark as favorite'
                        : 'Mark as favorite'}
                    </Text>
                  </View>
                </Pressable>

                {/* SHARE */}
                <Pressable
                  style={({pressed}) => [
                    styles.sheetRow,
                    pressed && {backgroundColor: pressBg},
                  ]}
                  onPress={onShare}>
                  <View
                    style={[styles.sheetIcon, {backgroundColor: iconBg.share}]}>
                    <Share2 size={18} color="#10B981" strokeWidth={2.4} />
                  </View>
                  <View style={{flex: 1}}>
                    <Text
                      style={[styles.sheetRowTitle, {color: theme.colors.text}]}>
                      Share task
                    </Text>
                    <Text
                      style={[
                        styles.sheetRowSub,
                        {color: theme.colors.textSecondary},
                      ]}>
                      Send via WhatsApp, Mail, or any app
                    </Text>
                  </View>
                </Pressable>

                {/* EDIT */}
                <Pressable
                  style={({pressed}) => [
                    styles.sheetRow,
                    pressed && {backgroundColor: pressBg},
                  ]}
                  onPress={onEdit}>
                  <View
                    style={[styles.sheetIcon, {backgroundColor: iconBg.edit}]}>
                    <Pencil size={18} color="#3B82F6" strokeWidth={2.4} />
                  </View>
                  <View style={{flex: 1}}>
                    <Text
                      style={[styles.sheetRowTitle, {color: theme.colors.text}]}>
                      Edit task
                    </Text>
                    <Text
                      style={[
                        styles.sheetRowSub,
                        {color: theme.colors.textSecondary},
                      ]}>
                      Update title, details, priority & more
                    </Text>
                  </View>
                </Pressable>

                {/* DELETE */}
                <Pressable
                  style={({pressed}) => [
                    styles.sheetRow,
                    pressed && {backgroundColor: pressBg},
                  ]}
                  onPress={onDelete}>
                  <View
                    style={[
                      styles.sheetIcon,
                      {backgroundColor: iconBg.delete},
                    ]}>
                    <Trash2 size={18} color="#EF4444" strokeWidth={2.4} />
                  </View>
                  <View style={{flex: 1}}>
                    <Text style={[styles.sheetRowTitle, {color: '#EF4444'}]}>
                      Delete task
                    </Text>
                    <Text
                      style={[
                        styles.sheetRowSub,
                        {color: theme.colors.textSecondary},
                      ]}>
                      Move to Trash
                    </Text>
                  </View>
                </Pressable>

                {/* STOP TIMER */}
                {actionTodo.timerEndAt && !sheetTimerExpired ? (
                  <Pressable
                    style={({pressed}) => [
                      styles.sheetRow,
                      pressed && {backgroundColor: pressBg},
                    ]}
                    onPress={() => {
                      clearTodoTimer(actionTodo.id);
                      onClose();
                    }}>
                    <View
                      style={[
                        styles.sheetIcon,
                        {backgroundColor: iconBg.delete},
                      ]}>
                      <TimerOff size={18} color="#EF4444" strokeWidth={2.4} />
                    </View>
                    <View style={{flex: 1}}>
                      <Text style={[styles.sheetRowTitle, {color: '#EF4444'}]}>
                        Stop timer
                      </Text>
                      <Text
                        style={[
                          styles.sheetRowSub,
                          {color: theme.colors.textSecondary},
                        ]}>
                        Cancel the running countdown
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
                    style={[styles.sheetClose, {backgroundColor: pressBg}]}
                    hitSlop={8}>
                    <ChevronLeft
                      size={20}
                      color={theme.colors.textSecondary}
                      strokeWidth={2.4}
                    />
                  </Pressable>
                  <View style={{flex: 1, marginLeft: 10}}>
                    <Text
                      style={[
                        styles.sheetLabel,
                        {color: theme.colors.textSecondary},
                      ]}>
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
                          backgroundColor: isDark
                            ? 'rgba(255,255,255,0.04)'
                            : '#F8FAFC',
                          borderColor: theme.colors.border,
                        },
                        pressed && {opacity: 0.85},
                      ]}
                      onPress={() => {
                        setTodoTimer(actionTodo.id, preset.minutes);
                        onClose();
                      }}>
                      <View style={{flex: 1}}>
                        <Text
                          style={[
                            styles.presetLabel,
                            {color: theme.colors.text},
                          ]}>
                          {preset.label}
                        </Text>
                        <Text
                          style={[
                            styles.presetSub,
                            {color: theme.colors.textSecondary},
                          ]}>
                          {preset.sub}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </View>

                <View style={styles.customWrap}>
                  <Text
                    style={[
                      styles.customLabel,
                      {color: theme.colors.textSecondary},
                    ]}>
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
                      placeholder="Minutes (max 1440)"
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
                    <Text
                      style={[
                        styles.customUnit,
                        {color: theme.colors.textSecondary},
                      ]}>
                      min
                    </Text>
                    <Pressable
                      style={({pressed}) => [
                        styles.customBtn,
                        {backgroundColor: theme.colors.primary},
                        !customMinutes && {opacity: 0.4},
                        pressed && customMinutes && {opacity: 0.8},
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
                  backgroundColor: isDark
                    ? 'rgba(255,255,255,0.06)'
                    : '#F1F5F9',
                  borderColor: theme.colors.border,
                },
                pressed && {opacity: 0.85},
              ]}
              onPress={onClose}>
              <Text
                style={[styles.sheetCancelText, {color: theme.colors.text}]}>
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
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    maxHeight: '88%',
    paddingTop: 10,
  },
  sheetHandle: {
    width: 40,
    height: 4.5,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 10,
  },
  sheetScrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 36,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingTop: 2,
  },
  sheetLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.9,
    marginBottom: 3,
  },
  sheetTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  sheetClose: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 11,
    paddingHorizontal: 10,
    borderRadius: 14,
    marginBottom: 2,
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
    fontWeight: '700',
    marginBottom: 2,
    letterSpacing: -0.1,
  },
  sheetRowSub: {
    fontSize: 12.5,
    fontWeight: '500',
    lineHeight: 17,
  },
  presetGrid: {
    gap: 8,
    marginBottom: 16,
  },
  preset: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  presetLabel: {
    fontSize: 14.5,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  presetSub: {
    fontSize: 12.5,
    marginTop: 2,
  },
  customWrap: {
    marginBottom: 16,
  },
  customLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.9,
    marginBottom: 8,
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  customInput: {
    flex: 1,
    height: 46,
    borderRadius: 13,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    fontSize: 14.5,
    fontWeight: '500',
  },
  customUnit: {
    fontSize: 13,
    fontWeight: '700',
  },
  customBtn: {
    paddingHorizontal: 18,
    height: 46,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  sheetCancel: {
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    marginTop: 6,
  },
  sheetCancelText: {
    fontSize: 14.5,
    fontWeight: '700',
  },
});
