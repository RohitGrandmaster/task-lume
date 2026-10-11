import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';

import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Pencil,
  Calendar,
  Bell,
  Check,
  AlertCircle,
  User,
  Briefcase,
  GraduationCap,
  ShoppingCart,
  Dumbbell,
  Rocket,
  ArrowDown,
  Minus,
  ArrowUp,
  Folder,
  Timer,
} from 'lucide-react-native';

import AppButton from '../common/AppButton';

import useTheme from '../../hooks/useTheme';
import { getDueDateOptions } from '../../utils/dateUtils';

const PRIORITIES = [
  { key: 'low', label: 'Low', Icon: ArrowDown, color: '#10B981' },
  { key: 'medium', label: 'Medium', Icon: Minus, color: '#F59E0B' },
  { key: 'high', label: 'High', Icon: ArrowUp, color: '#EF4444' },
];

const CATEGORIES = [
  { key: 'Personal', Icon: User },
  { key: 'Work', Icon: Briefcase },
  { key: 'Learning', Icon: GraduationCap },
  { key: 'Shopping', Icon: ShoppingCart },
  { key: 'Health', Icon: Dumbbell },
  { key: 'Project', Icon: Rocket },
];

/* ✅ Timer presets — 1 min se 5 hr tak */
const TIMER_PRESETS = [
  { minutes: 1, label: '1m' },
  { minutes: 5, label: '5m' },
  { minutes: 15, label: '15m' },
  { minutes: 30, label: '30m' },
  { minutes: 60, label: '1h' },
  { minutes: 120, label: '2h' },
  { minutes: 180, label: '3h' },
  { minutes: 240, label: '4h' },
  { minutes: 300, label: '5h' },
];

/* ------------------------------ HELPERS ------------------------------ */

const pad = v => String(v).padStart(2, '0');

function formatRemaining(ms) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;

  if (h > 0) {
    return `${h}h ${pad(m)}m`;
  }
  return `${pad(m)}:${pad(s)}`;
}

/* ------------------------------ COMPONENT ---------------------------- */

function TodoForm({
  title = 'New Todo',
  subtitle = 'Add something you want to get done.',
  initialTodo = null,
  onSubmit,
  onCancel,
  onChange,
}) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const [todoTitle, setTodoTitle] = useState(initialTodo?.title || '');
  const [description, setDescription] = useState(initialTodo?.description || '');
  const [category, setCategory] = useState(initialTodo?.category || 'Personal');
  const [priority, setPriority] = useState(initialTodo?.priority || 'medium');
  const [dueDate, setDueDate] = useState(initialTodo?.dueDate || 'No date');
  const [reminder, setReminder] = useState(Boolean(initialTodo?.reminder));

  // ✅ Timer state
  const [timerEndAt, setTimerEndAt] = useState(initialTodo?.timerEndAt || null);
  const [now, setNow] = useState(() => Date.now());

  // ✅ Custom timer input
  const [customMinutes, setCustomMinutes] = useState('');

  const [showCategory, setShowCategory] = useState(false);
  const [showDueDate, setShowDueDate] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [titleFocused, setTitleFocused] = useState(false);
  const [descFocused, setDescFocused] = useState(false);

  const isEdit = Boolean(initialTodo);

  const primaryColor = theme.colors.primary ?? '#7C3AED';
  const textColor = theme.colors.text ?? '#111';
  const textLight = theme.colors.textLight ?? '#999';
  const textSecondary = theme.colors.textSecondary ?? '#666';
  const borderColor = theme.colors.border ?? '#E5E7EB';
  const surfaceColor = theme.colors.surface ?? '#FAFAFA';

  // 🎯 Sync with initialTodo
  useEffect(() => {
    setTodoTitle(initialTodo?.title || '');
    setDescription(initialTodo?.description || '');
    setCategory(initialTodo?.category || 'Personal');
    setPriority(initialTodo?.priority || 'medium');
    setDueDate(initialTodo?.dueDate || 'No date');
    setReminder(Boolean(initialTodo?.reminder));
    setTimerEndAt(initialTodo?.timerEndAt || null);
    setCustomMinutes('');
  }, [initialTodo]);

  // ✅ Timer live tick
  useEffect(() => {
    if (!timerEndAt) return undefined;

    // ✅ Timer set hote hi `now` refresh — countdown sahi se start hoga
    setNow(Date.now());

    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [timerEndAt]);

  const notifyChange = () => {
    if (typeof onChange === 'function') onChange();
  };

  // ✅ Custom minutes apply
  const applyCustomTimer = () => {
    const m = parseInt(customMinutes, 10);
    if (Number.isFinite(m) && m > 0) {
      setTimerEndAt(Date.now() + m * 60 * 1000);
      setCustomMinutes('');
      notifyChange();
    }
  };

  async function handleSubmit() {
    setError('');

    const cleanTitle = todoTitle.trim();
    const cleanDescription = description.trim();

    if (!cleanTitle) {
      setError('Please enter a todo title.');
      return;
    }

    if (cleanTitle.length < 2) {
      setError('Todo title must be at least 2 characters.');
      return;
    }

    setLoading(true);

    try {
      await onSubmit({
        title: cleanTitle,
        description: cleanDescription,
        category,
        priority,
        dueDate,
        reminder,
        timerEndAt,
      });
    } catch {
      setError('Unable to save todo. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const titleRemaining = 100 - todoTitle.length;
  const descRemaining = 500 - description.length;
  const titleNearLimit = titleRemaining <= 10;
  const descNearLimit = descRemaining <= 20;

  const SelectedCategoryIcon =
    CATEGORIES.find(c => c.key === category)?.Icon || Folder;

  const timerActive = Boolean(timerEndAt) && timerEndAt - now > 0;
  const timerExpired = Boolean(timerEndAt) && timerEndAt - now <= 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            {/* ---------- Header ---------- */}
            <View style={styles.header}>
              <Pressable
                style={({ pressed }) => [
                  styles.backButton,
                  pressed && styles.backButtonPressed,
                ]}
                onPress={onCancel}
                hitSlop={10}
                android_ripple={{ color: borderColor, borderless: true }}
              >
                <ChevronLeft size={24} color={textColor} strokeWidth={2.5} />
              </Pressable>

              <View style={styles.headerContent}>
                <Text style={styles.headerTitle}>{title}</Text>
                <Text style={styles.headerSubtitle}>{subtitle}</Text>
              </View>
            </View>

            {/* ---------- Title ---------- */}
            <View style={styles.field}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Title</Text>
                <Text
                  style={[
                    styles.counter,
                    titleNearLimit && styles.counterWarning,
                  ]}
                >
                  {todoTitle.length}/100
                </Text>
              </View>

              <View
                style={[
                  styles.inputWrap,
                  titleFocused && styles.inputWrapFocused,
                ]}
              >
                <Pencil
                  size={18}
                  color={titleFocused ? primaryColor : textLight}
                  strokeWidth={2}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Learn React Native"
                  placeholderTextColor={textLight}
                  value={todoTitle}
                  onChangeText={text => {
                    setTodoTitle(text);
                    notifyChange();
                  }}
                  onFocus={() => setTitleFocused(true)}
                  onBlur={() => setTitleFocused(false)}
                  maxLength={100}
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* ---------- Description ---------- */}
            <View style={styles.field}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Description</Text>
                <Text
                  style={[
                    styles.counter,
                    descNearLimit && styles.counterWarning,
                  ]}
                >
                  {description.length}/500
                </Text>
              </View>

              <View
                style={[
                  styles.inputWrap,
                  styles.textAreaWrap,
                  descFocused && styles.inputWrapFocused,
                ]}
              >
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Add some details... (optional)"
                  placeholderTextColor={textLight}
                  value={description}
                  onChangeText={text => {
                    setDescription(text);
                    notifyChange();
                  }}
                  onFocus={() => setDescFocused(true)}
                  onBlur={() => setDescFocused(false)}
                  multiline
                  maxLength={500}
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* ---------- Priority ---------- */}
            <View style={styles.field}>
              <Text style={styles.label}>Priority</Text>

              <View style={styles.priorityRow}>
                {PRIORITIES.map(item => {
                  const selected = priority === item.key;
                  const IconComp = item.Icon;
                  return (
                    <Pressable
                      key={item.key}
                      style={({ pressed }) => [
                        styles.priorityOption,
                        selected && {
                          borderColor: item.color,
                          backgroundColor: item.color + '15',
                        },
                        pressed && { opacity: 0.85 },
                      ]}
                      onPress={() => {
                        setPriority(item.key);
                        notifyChange();
                      }}
                      android_ripple={{ color: item.color + '30' }}
                    >
                      <IconComp
                        size={22}
                        color={selected ? item.color : textLight}
                        strokeWidth={2.5}
                      />
                      <Text
                        style={[
                          styles.priorityText,
                          selected && {
                            color: item.color,
                            fontWeight: '800',
                          },
                        ]}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* ---------- Category ---------- */}
            <View style={styles.field}>
              <Text style={styles.label}>Category</Text>

              <Pressable
                style={({ pressed }) => [
                  styles.select,
                  pressed && { opacity: 0.85 },
                ]}
                onPress={() => {
                  setShowCategory(curr => !curr);
                  setShowDueDate(false);
                }}
              >
                <View style={styles.selectLeft}>
                  <SelectedCategoryIcon
                    size={20}
                    color={primaryColor}
                    strokeWidth={2}
                  />
                  <Text style={styles.selectText}>{category}</Text>
                </View>
                {showCategory ? (
                  <ChevronUp size={20} color={textSecondary} strokeWidth={2} />
                ) : (
                  <ChevronDown size={20} color={textSecondary} strokeWidth={2} />
                )}
              </Pressable>

              {showCategory && (
                <View style={styles.dropdown}>
                  {CATEGORIES.map(item => {
                    const selected = item.key === category;
                    const IconComp = item.Icon;
                    return (
                      <Pressable
                        key={item.key}
                        style={({ pressed }) => [
                          styles.dropdownItem,
                          selected && styles.selectedDropdownItem,
                          pressed && styles.dropdownItemPressed,
                        ]}
                        onPress={() => {
                          setCategory(item.key);
                          setShowCategory(false);
                          notifyChange();
                        }}
                      >
                        <IconComp
                          size={20}
                          color={selected ? primaryColor : textSecondary}
                          strokeWidth={2}
                        />
                        <Text
                          style={[
                            styles.dropdownText,
                            selected && styles.selectedDropdownText,
                          ]}
                        >
                          {item.key}
                        </Text>
                        {selected && (
                          <Check
                            size={20}
                            color={primaryColor}
                            strokeWidth={3}
                            style={styles.checkIcon}
                          />
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>

            {/* ---------- Due Date ---------- */}
            <View style={styles.field}>
              <Text style={styles.label}>Due Date</Text>

              <Pressable
                style={({ pressed }) => [
                  styles.select,
                  pressed && { opacity: 0.85 },
                ]}
                onPress={() => {
                  setShowDueDate(curr => !curr);
                  setShowCategory(false);
                }}
              >
                <View style={styles.selectLeft}>
                  <Calendar size={20} color={primaryColor} strokeWidth={2} />
                  <Text style={styles.selectText}>{dueDate}</Text>
                </View>
                {showDueDate ? (
                  <ChevronUp size={20} color={textSecondary} strokeWidth={2} />
                ) : (
                  <ChevronDown size={20} color={textSecondary} strokeWidth={2} />
                )}
              </Pressable>

              {showDueDate && (
                <View style={styles.dropdown}>
                  {getDueDateOptions().map(item => {
                    const selected = item === dueDate;
                    return (
                      <Pressable
                        key={item}
                        style={({ pressed }) => [
                          styles.dropdownItem,
                          selected && styles.selectedDropdownItem,
                          pressed && styles.dropdownItemPressed,
                        ]}
                        onPress={() => {
                          setDueDate(item);
                          setShowDueDate(false);
                          notifyChange();
                        }}
                      >
                        <Text
                          style={[
                            styles.dropdownText,
                            selected && styles.selectedDropdownText,
                          ]}
                        >
                          {item}
                        </Text>
                        {selected && (
                          <Check
                            size={20}
                            color={primaryColor}
                            strokeWidth={3}
                            style={styles.checkIcon}
                          />
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>

            {/* ---------- Reminder ---------- */}
            <View style={styles.reminderRow}>
              <View style={styles.reminderLeft}>
                <View style={styles.reminderIconWrap}>
                  <Bell size={20} color={primaryColor} strokeWidth={2} />
                </View>
                <View style={styles.reminderContent}>
                  <Text style={styles.label}>Reminder</Text>
                  <Text style={styles.reminderDescription}>
                    Get notified about this task
                  </Text>
                </View>
              </View>

              <Switch
                value={reminder}
                onValueChange={value => {
                  setReminder(value);
                  notifyChange();
                }}
                trackColor={{
                  false: borderColor,
                  true: primaryColor,
                }}
                thumbColor="#fff"
              />
            </View>

            {/* ---------- Focus Timer ---------- */}
            <View style={styles.field}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Focus Timer</Text>
                {timerActive ? (
                  <Text style={styles.timerRemaining}>
                    ⏱ {formatRemaining(timerEndAt - now)} left
                  </Text>
                ) : null}
                {timerExpired ? (
                  <Text style={styles.timerExpired}>⏱ Done</Text>
                ) : null}
              </View>

              <View style={styles.timerRow}>
                {TIMER_PRESETS.map(preset => (
                  <Pressable
                    key={preset.minutes}
                    style={({ pressed }) => [
                      styles.timerChip,
                      pressed && { opacity: 0.85 },
                    ]}
                    onPress={() => {
                      setTimerEndAt(Date.now() + preset.minutes * 60 * 1000);
                      notifyChange();
                    }}
                  >
                    <Timer size={13} color={textSecondary} strokeWidth={2.4} />
                    <Text style={styles.timerChipText}>
                      {preset.label}
                    </Text>
                  </Pressable>
                ))}

                {timerEndAt ? (
                  <Pressable
                    style={({ pressed }) => [
                      styles.timerClear,
                      pressed && { opacity: 0.7 },
                    ]}
                    onPress={() => {
                      setTimerEndAt(null);
                      notifyChange();
                    }}
                  >
                    <Text style={styles.timerClearText}>Stop</Text>
                  </Pressable>
                ) : null}
              </View>

              {/* ✅ Custom minutes input */}
              <View style={styles.customTimerRow}>
                <TextInput
                  style={styles.customTimerInput}
                  placeholder="Custom — e.g. 2, 7, 45"
                  placeholderTextColor={textLight}
                  value={customMinutes}
                  onChangeText={text =>
                    setCustomMinutes(text.replace(/[^0-9]/g, ''))
                  }
                  keyboardType="number-pad"
                  maxLength={4}
                  returnKeyType="done"
                  onSubmitEditing={applyCustomTimer}
                />

                <Text style={styles.customTimerUnit}>min</Text>

                <Pressable
                  style={({ pressed }) => [
                    styles.customTimerBtn,
                    !customMinutes && { opacity: 0.4 },
                    pressed && { opacity: 0.78 },
                  ]}
                  disabled={!customMinutes}
                  onPress={applyCustomTimer}
                >
                  <Text style={styles.customTimerBtnText}>Set</Text>
                </Pressable>
              </View>

              <Text style={styles.timerHint}>
                {timerEndAt
                  ? 'Countdown starts from now. Tap another chip to restart.'
                  : 'Optional — pick a duration or enter custom minutes.'}
              </Text>
            </View>

            {/* ---------- Error ---------- */}
            {error ? (
              <View style={styles.errorBox}>
                <AlertCircle size={20} color="#EF4444" strokeWidth={2.5} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* ---------- Actions ---------- */}
            <AppButton
              title={isEdit ? 'Save Changes' : 'Save Todo'}
              onPress={handleSubmit}
              loading={loading}
            />

            <Pressable
              style={({ pressed }) => [
                styles.cancelButton,
                pressed && { opacity: 0.6 },
              ]}
              onPress={onCancel}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ------------------------------ STYLES ------------------------------- */

function createStyles(theme) {
  const colors = theme?.colors ?? {};
  const spacing = theme?.spacing ?? {};
  const typography = theme?.typography ?? {};
  const radius = theme?.radius ?? {};

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background ?? '#fff',
    },
    keyboard: { flex: 1 },
    scrollContent: { flexGrow: 1 },

    container: {
      padding: spacing.xl ?? 24,
      paddingBottom: spacing.xxl ?? 32,
    },

    /* ---------- Header ---------- */
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.xxl ?? 32,
    },
    backButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface ?? '#F3F4F6',
      marginRight: spacing.md ?? 12,
    },
    backButtonPressed: { opacity: 0.7 },
    headerContent: { flex: 1 },
    headerTitle: {
      fontSize: typography.heading ?? 24,
      fontWeight: '800',
      color: colors.text ?? '#111',
      letterSpacing: -0.3,
    },
    headerSubtitle: {
      marginTop: 4,
      fontSize: typography.bodySmall ?? 14,
      lineHeight: 20,
      color: colors.textSecondary ?? '#666',
    },

    /* ---------- Fields ---------- */
    field: { marginBottom: spacing.xl ?? 24 },

    labelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.sm ?? 8,
    },

    label: {
      fontSize: typography.bodySmall ?? 14,
      fontWeight: '700',
      color: colors.text ?? '#111',
      letterSpacing: 0.2,
    },

    counter: {
      fontSize: typography.caption ?? 12,
      color: colors.textLight ?? '#999',
    },
    counterWarning: {
      color: '#EF4444',
      fontWeight: '700',
    },

    /* ---------- Inputs ---------- */
    inputWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 56,
      borderWidth: 1.5,
      borderColor: colors.border ?? '#E5E7EB',
      borderRadius: radius.lg ?? 14,
      paddingHorizontal: spacing.lg ?? 16,
      backgroundColor: colors.surface ?? '#FAFAFA',
    },
    textAreaWrap: {
      alignItems: 'flex-start',
      paddingTop: spacing.md ?? 12,
      minHeight: 130,
    },
    inputWrapFocused: {
      borderColor: colors.primary ?? '#7C3AED',
      backgroundColor: colors.background ?? '#fff',
      shadowColor: colors.primary ?? '#7C3AED',
      shadowOpacity: 0.12,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    inputIcon: {
      marginRight: spacing.sm ?? 8,
    },
    input: {
      flex: 1,
      fontSize: typography.body ?? 16,
      color: colors.text ?? '#111',
      paddingVertical: 0,
    },
    textArea: {
      minHeight: 100,
      paddingTop: 0,
    },

    /* ---------- Priority ---------- */
    priorityRow: {
      flexDirection: 'row',
      gap: spacing.sm ?? 8,
    },
    priorityOption: {
      flex: 1,
      minHeight: 60,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      borderWidth: 1.5,
      borderColor: colors.border ?? '#E5E7EB',
      borderRadius: radius.md ?? 12,
      backgroundColor: colors.surface ?? '#FAFAFA',
    },
    priorityText: {
      fontSize: typography.caption ?? 12,
      fontWeight: '600',
      color: colors.textSecondary ?? '#666',
      textTransform: 'capitalize',
    },

    /* ---------- Select / Dropdown ---------- */
    select: {
      minHeight: 56,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg ?? 16,
      borderWidth: 1.5,
      borderColor: colors.border ?? '#E5E7EB',
      borderRadius: radius.lg ?? 14,
      backgroundColor: colors.surface ?? '#FAFAFA',
    },
    selectLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm ?? 8,
      flex: 1,
    },
    selectText: {
      fontSize: typography.body ?? 16,
      color: colors.text ?? '#111',
      fontWeight: '500',
    },

    dropdown: {
      marginTop: spacing.sm ?? 8,
      overflow: 'hidden',
      borderWidth: 1.5,
      borderColor: colors.border ?? '#E5E7EB',
      borderRadius: radius.lg ?? 14,
      backgroundColor: colors.surface ?? '#fff',
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
    dropdownItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm ?? 8,
      minHeight: 52,
      paddingHorizontal: spacing.lg ?? 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border ?? '#F3F4F6',
    },
    dropdownItemPressed: {
      backgroundColor: colors.background ?? '#F9FAFB',
    },
    selectedDropdownItem: {
      backgroundColor: (colors.primary ?? '#7C3AED') + '12',
    },
    dropdownText: {
      flex: 1,
      fontSize: typography.bodySmall ?? 14,
      color: colors.text ?? '#111',
      fontWeight: '500',
    },
    selectedDropdownText: {
      fontWeight: '800',
      color: colors.primary ?? '#7C3AED',
    },
    checkIcon: {
      marginLeft: 'auto',
    },

    /* ---------- Reminder ---------- */
    reminderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.xl ?? 24,
      padding: spacing.md ?? 12,
      borderWidth: 1.5,
      borderColor: colors.border ?? '#E5E7EB',
      borderRadius: radius.lg ?? 14,
      backgroundColor: colors.surface ?? '#FAFAFA',
    },
    reminderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: spacing.md ?? 12,
    },
    reminderIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: (colors.primary ?? '#7C3AED') + '15',
    },
    reminderContent: { flex: 1 },
    reminderDescription: {
      marginTop: 2,
      fontSize: typography.caption ?? 12,
      color: colors.textSecondary ?? '#666',
    },

    /* ---------- Focus Timer ---------- */
    timerRemaining: {
      fontSize: typography.caption ?? 12,
      fontWeight: '800',
      color: '#EA580C',
      letterSpacing: 0.3,
    },

    timerExpired: {
      fontSize: typography.caption ?? 12,
      fontWeight: '800',
      color: '#B91C1C',
      letterSpacing: 0.3,
    },

    timerRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm ?? 8,
    },

    timerChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: spacing.md ?? 12,
      paddingVertical: 10,
      borderRadius: radius.md ?? 12,
      borderWidth: 1.5,
      borderColor: colors.border ?? '#E5E7EB',
      backgroundColor: colors.surface ?? '#FAFAFA',
    },

    timerChipText: {
      fontSize: typography.caption ?? 12,
      fontWeight: '700',
      color: colors.textSecondary ?? '#666',
    },

    timerClear: {
      paddingHorizontal: spacing.md ?? 12,
      paddingVertical: 10,
      borderRadius: radius.md ?? 12,
      backgroundColor: '#FEE2E2',
    },

    timerClearText: {
      fontSize: typography.caption ?? 12,
      fontWeight: '800',
      color: '#B91C1C',
    },

    /* ✅ Custom timer input */
    customTimerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm ?? 8,
      marginTop: spacing.md ?? 12,
    },

    customTimerInput: {
      flex: 1,
      minHeight: 46,
      paddingHorizontal: spacing.md ?? 12,
      borderRadius: radius.md ?? 12,
      borderWidth: 1.5,
      borderColor: colors.border ?? '#E5E7EB',
      backgroundColor: colors.surface ?? '#FAFAFA',
      fontSize: typography.bodySmall ?? 14,
      fontWeight: '600',
      color: colors.text ?? '#111',
    },

    customTimerUnit: {
      fontSize: typography.caption ?? 12,
      fontWeight: '800',
      color: colors.textSecondary ?? '#666',
      letterSpacing: 0.4,
    },

    customTimerBtn: {
      paddingHorizontal: spacing.lg ?? 16,
      minHeight: 46,
      borderRadius: radius.md ?? 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F97316',
    },

    customTimerBtnText: {
      fontSize: typography.caption ?? 12,
      fontWeight: '800',
      color: '#FFFFFF',
      letterSpacing: 0.3,
    },

    timerHint: {
      marginTop: spacing.sm ?? 8,
      fontSize: typography.caption ?? 12,
      color: colors.textLight ?? '#999',
      lineHeight: 16,
    },

    /* ---------- Error ---------- */
    errorBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm ?? 8,
      marginBottom: spacing.lg ?? 16,
      padding: spacing.md ?? 12,
      borderRadius: radius.md ?? 12,
      backgroundColor: '#FEE2E2',
      borderWidth: 1,
      borderColor: '#FECACA',
    },
    errorText: {
      flex: 1,
      fontSize: typography.bodySmall ?? 14,
      lineHeight: 20,
      color: '#B91C1C',
      fontWeight: '500',
    },

    /* ---------- Cancel ---------- */
    cancelButton: {
      alignItems: 'center',
      paddingVertical: spacing.lg ?? 16,
      marginTop: spacing.sm ?? 8,
    },
    cancelText: {
      fontSize: typography.bodySmall ?? 14,
      fontWeight: '700',
      color: colors.textSecondary ?? '#666',
      letterSpacing: 0.3,
    },
  });
}

export default TodoForm;