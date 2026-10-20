import {
  TextInput,
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  LayoutAnimation,
} from 'react-native';

import {SafeAreaView} from 'react-native-safe-area-context';
import {useEffect, useMemo, useState} from 'react';

import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Calendar,
  Bell,
  Check,
  AlertCircle,
  Flag,
  Tag,
  X,
  RefreshCw,
  Type,
  AlignLeft,
} from 'lucide-react-native';

import useTheme from '../../hooks/useTheme';
import useTodos from '../../hooks/useTodos';
import {RECURRENCE_OPTIONS, getRecurrenceLabel} from '../../utils/recurrence';

/* ------------------------------- CONSTANTS ------------------------------- */

const PRIORITIES = [
  {key: 'low', label: 'Low', color: '#10B981'},
  {key: 'medium', label: 'Medium', color: '#F59E0B'},
  {key: 'high', label: 'High', color: '#EF4444'},
];

const DEFAULT_CATEGORIES = [
  {key: 'Personal', icon: '👤'},
  {key: 'Work', icon: '💼'},
  {key: 'Learning', icon: '📚'},
  {key: 'Shopping', icon: '🛒'},
  {key: 'Health', icon: '💪'},
  {key: 'Project', icon: '🚀'},
  {key: 'Finance', icon: '💰'},
  {key: 'Family', icon: '👨‍👩‍👧'},
  {key: 'Home', icon: '🏠'},
  {key: 'Travel', icon: '✈️'},
  {key: 'Other', icon: '📌'},
  {key: 'General', icon: '🏷️'},
];

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/* ------------------------------ DATE HELPERS ------------------------------ */

const pad = value => String(value).padStart(2, '0');

const dateKey = date =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const formatDate = date =>
  date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const startOfToday = () => {
  const t = new Date();
  return new Date(t.getFullYear(), t.getMonth(), t.getDate());
};

const getTomorrow = () => {
  const d = startOfToday();
  d.setDate(d.getDate() + 1);
  return d;
};

const getNextWeek = () => {
  const d = startOfToday();
  d.setDate(d.getDate() + 7);
  return d;
};

const getWeekend = () => {
  const d = startOfToday();
  const day = d.getDay();
  const diff = (6 - day + 7) % 7 || 7;
  d.setDate(d.getDate() + diff);
  return d;
};

function formatDueDateDisplay(dueDate) {
  if (!dueDate || dueDate === 'No date') return 'No date selected';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
    const d = new Date(`${dueDate}T12:00:00`);
    if (!isNaN(d.getTime())) {
      return formatDate(d);
    }
  }
  const parsed = new Date(dueDate);
  if (!isNaN(parsed.getTime())) {
    return formatDate(parsed);
  }
  return dueDate;
}

/* ------------------------------- COMPONENT ------------------------------- */

function TodoForm({
  title = 'Edit Task',
  subtitle = 'Update the details of your task.',
  initialTodo = null,
  onSubmit,
  onCancel,
  onChange,
}) {
  const {theme} = useTheme();
  const {customCategories = []} = useTodos();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const today = useMemo(() => startOfToday(), []);

  const [todoTitle, setTodoTitle] = useState(initialTodo?.title || '');
  const [description, setDescription] = useState(initialTodo?.description || '');
  const [category, setCategory] = useState(initialTodo?.category || 'Personal');
  const [priority, setPriority] = useState(initialTodo?.priority || 'medium');
  const [dueDate, setDueDate] = useState(initialTodo?.dueDate || 'No date');
  const [reminder, setReminder] = useState(Boolean(initialTodo?.reminder));
  const [recurrence, setRecurrence] = useState(initialTodo?.recurrence || 'none');
  const [showCalendar, setShowCalendar] = useState(false);
  const [showRecurrence, setShowRecurrence] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Month state for visual calendar
  const [calendarMonth, setCalendarMonth] = useState(() => {
    if (initialTodo?.dueDate && /^\d{4}-\d{2}-\d{2}$/.test(initialTodo.dueDate)) {
      const d = new Date(`${initialTodo.dueDate}T12:00:00`);
      if (!isNaN(d.getTime())) {
        return new Date(d.getFullYear(), d.getMonth(), 1);
      }
    }
    const t = startOfToday();
    return new Date(t.getFullYear(), t.getMonth(), 1);
  });

  const isEdit = Boolean(initialTodo);
  const primaryColor = theme.colors.primary ?? '#7C3AED';
  const textColor = theme.colors.text ?? '#111';
  const textLight = theme.colors.textLight ?? '#999';
  const textSecondary = theme.colors.textSecondary ?? '#666';
  const borderColor = theme.colors.border ?? '#E5E7EB';

  const hasActiveDate = Boolean(dueDate && dueDate !== 'No date');

  // Merge default categories + custom categories + current category
  const allCategories = useMemo(() => {
    const list = [...DEFAULT_CATEGORIES];
    const existingKeys = new Set(list.map(c => c.key));

    (customCategories || []).forEach(c => {
      const key = typeof c === 'string' ? c : c.key || c.name;
      if (key && !existingKeys.has(key)) {
        list.push({key, icon: typeof c === 'object' && c.icon ? c.icon : '🏷️'});
        existingKeys.add(key);
      }
    });

    if (category && !existingKeys.has(category)) {
      list.push({key: category, icon: '🏷️'});
    }

    return list;
  }, [customCategories, category]);

  useEffect(() => {
    setTodoTitle(initialTodo?.title || '');
    setDescription(initialTodo?.description || '');
    setCategory(initialTodo?.category || 'Personal');
    setPriority(initialTodo?.priority || 'medium');
    setDueDate(initialTodo?.dueDate || 'No date');
    setReminder(Boolean(initialTodo?.reminder));
    setRecurrence(initialTodo?.recurrence || 'none');
  }, [initialTodo]);

  const notifyChange = () => {
    if (typeof onChange === 'function') onChange();
  };

  function changeMonth(delta) {
    setCalendarMonth(prev => {
      return new Date(prev.getFullYear(), prev.getMonth() + delta, 1);
    });
  }

  function pickDate(date) {
    try {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    } catch (_) {}
    if (!date) {
      setDueDate('No date');
    } else {
      setDueDate(dateKey(date));
    }
    notifyChange();
  }

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
        recurrence,
      });
    } catch {
      setError('Unable to save todo. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  /* ------------------------------ RENDER CALENDAR ------------------------------ */
  function renderCalendar() {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [
      ...Array(firstWeekday).fill(null),
      ...Array.from({length: daysInMonth}, (_, i) => i + 1),
    ];
    while (cells.length % 7 !== 0) cells.push(null);

    return (
      <View style={styles.calendar}>
        {/* Month Navigation */}
        <View style={styles.calendarHeader}>
          <Pressable
            style={styles.monthArrow}
            onPress={() => changeMonth(-1)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Previous month">
            <ChevronLeft size={18} color={theme.colors.text} strokeWidth={2.4} />
          </Pressable>

          <Text style={styles.monthTitle}>
            {MONTHS[month]} {year}
          </Text>

          <Pressable
            style={styles.monthArrow}
            onPress={() => changeMonth(1)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Next month">
            <ChevronRight size={18} color={theme.colors.text} strokeWidth={2.4} />
          </Pressable>
        </View>

        {/* Weekday Row */}
        <View style={styles.calendarGrid}>
          {WEEKDAYS.map((d, i) => (
            <View key={`wd-${i}`} style={styles.calendarCell}>
              <Text style={styles.weekdayText}>{d}</Text>
            </View>
          ))}

          {/* Days Grid */}
          {cells.map((day, index) => {
            if (day === null) {
              return <View key={`e-${index}`} style={styles.calendarCell} />;
            }

            const current = new Date(year, month, day);
            const curKey = dateKey(current);
            const selected = dueDate === curKey;
            const isToday = curKey === dateKey(today);

            return (
              <Pressable
                key={`${year}-${month}-${day}`}
                style={styles.calendarCell}
                onPress={() => pickDate(current)}>
                <View
                  style={[
                    styles.dayCircle,
                    selected && {
                      backgroundColor: primaryColor,
                      borderColor: primaryColor,
                    },
                    isToday &&
                      !selected && {
                        borderColor: primaryColor,
                      },
                  ]}>
                  <Text
                    style={[
                      styles.dayText,
                      isToday && {color: primaryColor, fontWeight: '800'},
                      selected && styles.selectedDayText,
                    ]}>
                    {day}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Quick Date Presets Row */}
        <View style={styles.quickCalendarRow}>
          <Pressable
            onPress={() => pickDate(null)}
            style={[
              styles.quickCalendarChip,
              (!dueDate || dueDate === 'No date') && {
                backgroundColor: primaryColor + '18',
                borderColor: primaryColor,
              },
            ]}>
            <Text
              style={[
                styles.quickCalendarChipText,
                {
                  color:
                    !dueDate || dueDate === 'No date'
                      ? primaryColor
                      : textSecondary,
                },
              ]}>
              No Date
            </Text>
          </Pressable>

          <Pressable
            onPress={() => pickDate(today)}
            style={[
              styles.quickCalendarChip,
              dueDate === dateKey(today) && {
                backgroundColor: primaryColor + '18',
                borderColor: primaryColor,
              },
            ]}>
            <Text
              style={[
                styles.quickCalendarChipText,
                {
                  color:
                    dueDate === dateKey(today)
                      ? primaryColor
                      : textSecondary,
                },
              ]}>
              Today
            </Text>
          </Pressable>

          <Pressable
            onPress={() => pickDate(getTomorrow())}
            style={[
              styles.quickCalendarChip,
              dueDate === dateKey(getTomorrow()) && {
                backgroundColor: primaryColor + '18',
                borderColor: primaryColor,
              },
            ]}>
            <Text
              style={[
                styles.quickCalendarChipText,
                {
                  color:
                    dueDate === dateKey(getTomorrow())
                      ? primaryColor
                      : textSecondary,
                },
              ]}>
              Tomorrow
            </Text>
          </Pressable>

          <Pressable
            onPress={() => pickDate(getNextWeek())}
            style={[
              styles.quickCalendarChip,
              dueDate === dateKey(getNextWeek()) && {
                backgroundColor: primaryColor + '18',
                borderColor: primaryColor,
              },
            ]}>
            <Text
              style={[
                styles.quickCalendarChipText,
                {
                  color:
                    dueDate === dateKey(getNextWeek())
                      ? primaryColor
                      : textSecondary,
                },
              ]}>
              Next Week
            </Text>
          </Pressable>

          <Pressable
            onPress={() => pickDate(getWeekend())}
            style={[
              styles.quickCalendarChip,
              dueDate === dateKey(getWeekend()) && {
                backgroundColor: primaryColor + '18',
                borderColor: primaryColor,
              },
            ]}>
            <Text
              style={[
                styles.quickCalendarChipText,
                {
                  color:
                    dueDate === dateKey(getWeekend())
                      ? primaryColor
                      : textSecondary,
                },
              ]}>
              Weekend
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={onCancel}
            style={styles.backBtn}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back">
            <ChevronLeft size={20} color={textColor} strokeWidth={2.4} />
          </Pressable>
          <View style={styles.headerTextWrap}>
            <Text style={styles.headerTitle}>{title}</Text>
            <Text style={styles.headerSub}>{subtitle}</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}>
          {error ? (
            <View style={styles.errorBox}>
              <AlertCircle size={15} color="#EF4444" strokeWidth={2.4} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Title */}
          <View style={styles.field}>
            <View style={styles.fieldHeader}>
              <Type size={12} color={textSecondary} strokeWidth={2.4} />
              <Text style={styles.label}>TITLE</Text>
            </View>
            <TextInput
              style={styles.input}
              value={todoTitle}
              onChangeText={t => {
                setTodoTitle(t);
                if (error) setError('');
                notifyChange();
              }}
              placeholder="What needs to be done?"
              placeholderTextColor={textLight}
              maxLength={100}
              returnKeyType="done"
            />
          </View>

          {/* Description */}
          <View style={styles.field}>
            <View style={styles.fieldHeader}>
              <AlignLeft size={12} color={textSecondary} strokeWidth={2.4} />
              <Text style={styles.label}>
                DESCRIPTION{' '}
                <Text style={styles.labelOptional}>(optional)</Text>
              </Text>
            </View>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={t => {
                setDescription(t);
                notifyChange();
              }}
              placeholder="Add optional notes or subtasks..."
              placeholderTextColor={textLight}
              multiline
              maxLength={500}
            />
          </View>

          {/* Priority - Professional Segmented Control */}
          <View style={styles.field}>
            <View style={styles.fieldHeader}>
              <Flag size={12} color={textSecondary} strokeWidth={2.4} />
              <Text style={styles.label}>PRIORITY</Text>
            </View>
            <View style={styles.segment}>
              {PRIORITIES.map(item => {
                const selected = priority === item.key;
                return (
                  <Pressable
                    key={item.key}
                    style={[
                      styles.segmentItem,
                      selected && {backgroundColor: item.color},
                    ]}
                    onPress={() => {
                      setPriority(item.key);
                      notifyChange();
                    }}>
                    <View
                      style={[
                        styles.priorityDot,
                        {
                          backgroundColor: selected ? '#FFFFFF' : item.color,
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.segmentText,
                        selected && styles.segmentTextSelected,
                      ]}>
                      {item.label}
                    </Text>
                    {selected && (
                      <Check
                        size={12}
                        color="#FFFFFF"
                        strokeWidth={3}
                        style={{marginLeft: 2}}
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Category - Modern Horizontal Chips */}
          <View style={styles.field}>
            <View style={styles.fieldHeader}>
              <Tag size={12} color={textSecondary} strokeWidth={2.4} />
              <Text style={styles.label}>CATEGORY</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScroll}>
              {allCategories.map(item => {
                const selected = category === item.key;
                return (
                  <Pressable
                    key={item.key}
                    style={[
                      styles.categoryChip,
                      selected && {
                        backgroundColor: primaryColor,
                        borderColor: primaryColor,
                      },
                    ]}
                    onPress={() => {
                      setCategory(item.key);
                      notifyChange();
                    }}>
                    <Text style={styles.categoryIcon}>{item.icon || '🏷️'}</Text>
                    <Text
                      style={[
                        styles.categoryText,
                        selected && styles.categoryTextSelected,
                      ]}>
                      {item.key}
                    </Text>
                    {selected && (
                      <Check
                        size={12}
                        color="#FFFFFF"
                        strokeWidth={3}
                        style={{marginLeft: 2}}
                      />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Due Date with Full Interactive Visual Calendar */}
          <View style={styles.field}>
            <View style={styles.fieldHeader}>
              <Calendar size={12} color={textSecondary} strokeWidth={2.4} />
              <Text style={styles.label}>DUE DATE</Text>
            </View>

            {/* Date Selector Row */}
            <Pressable
              style={[
                styles.dateRow,
                hasActiveDate && {borderColor: primaryColor + '65'},
              ]}
              onPress={() => {
                try {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                } catch (_) {}
                setShowCalendar(c => !c);
                setShowRecurrence(false);
              }}>
              <View style={styles.dateLeft}>
                <View
                  style={[
                    styles.dateIconWrap,
                    {
                      backgroundColor: hasActiveDate
                        ? primaryColor + '18'
                        : theme.colors.surface,
                    },
                  ]}>
                  <Calendar
                    size={16}
                    color={hasActiveDate ? primaryColor : textSecondary}
                    strokeWidth={2.4}
                  />
                </View>
                <View style={{flex: 1}}>
                  <Text style={styles.dateSubLabel}>
                    Selected Date
                  </Text>
                  <Text
                    style={[
                      styles.dateValueText,
                      !hasActiveDate && {color: textLight},
                    ]}
                    numberOfLines={1}>
                    {formatDueDateDisplay(dueDate)}
                  </Text>
                </View>
              </View>

              <View style={styles.dateRight}>
                {hasActiveDate && (
                  <Pressable
                    onPress={() => pickDate(null)}
                    hitSlop={10}
                    style={styles.clearIconBtn}
                    accessibilityRole="button"
                    accessibilityLabel="Clear date">
                    <X size={14} color={textSecondary} strokeWidth={2.6} />
                  </Pressable>
                )}
                <ChevronRight
                  size={18}
                  color={textSecondary}
                  strokeWidth={2.4}
                  style={{
                    transform: [{rotate: showCalendar ? '90deg' : '0deg'}],
                  }}
                />
              </View>
            </Pressable>

            {/* Interactive Visual Calendar Grid */}
            {showCalendar && renderCalendar()}
          </View>

          {/* Repeat */}
          <View style={styles.field}>
            <View style={styles.fieldHeader}>
              <RefreshCw size={12} color={textSecondary} strokeWidth={2.4} />
              <Text style={styles.label}>REPEAT</Text>
            </View>
            <Pressable
              style={styles.select}
              onPress={() => {
                setShowRecurrence(c => !c);
                setShowCalendar(false);
              }}>
              <View style={styles.selectLeft}>
                <View style={[styles.selectIconWrap, {backgroundColor: '#10B98115'}]}>
                  <RefreshCw size={15} color="#10B981" strokeWidth={2.4} />
                </View>
                <Text style={styles.selectText}>
                  {getRecurrenceLabel(recurrence)}
                </Text>
              </View>
              {showRecurrence ? (
                <ChevronUp size={16} color={textSecondary} strokeWidth={2.4} />
              ) : (
                <ChevronDown size={16} color={textSecondary} strokeWidth={2.4} />
              )}
            </Pressable>

            {showRecurrence && (
              <View style={styles.dropdown}>
                {RECURRENCE_OPTIONS.map(item => {
                  const selected = item.key === recurrence;
                  return (
                    <Pressable
                      key={item.key}
                      style={[
                        styles.dropdownItem,
                        selected && styles.selectedDropdownItem,
                      ]}
                      onPress={() => {
                        setRecurrence(item.key);
                        setShowRecurrence(false);
                        notifyChange();
                      }}>
                      <Text
                        style={[
                          styles.dropdownText,
                          selected && {color: primaryColor, fontWeight: '800'},
                        ]}>
                        {item.label}
                      </Text>
                      {selected && (
                        <Check size={15} color={primaryColor} strokeWidth={3} />
                      )}
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>

          {/* Reminder Toggle */}
          <View style={styles.reminderCard}>
            <View style={styles.reminderLeft}>
              <View
                style={[
                  styles.reminderIconWrap,
                  {
                    backgroundColor: reminder
                      ? primaryColor + '18'
                      : theme.colors.background,
                  },
                ]}>
                <Bell
                  size={16}
                  color={reminder ? primaryColor : textSecondary}
                  strokeWidth={2.4}
                />
              </View>
              <View style={styles.flex}>
                <Text style={styles.reminderTitle}>
                  Reminder Notification
                </Text>
                <Text style={styles.reminderDesc}>
                  Notify me when this task is due
                </Text>
              </View>
            </View>
            <Switch
              value={reminder}
              onValueChange={v => {
                setReminder(v);
                notifyChange();
              }}
              trackColor={{false: borderColor, true: primaryColor}}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Professional Action Buttons: Side-by-Side */}
          <View style={styles.actionRow}>
            <Pressable
              onPress={onCancel}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
              style={({pressed}) => [
                styles.cancelBtn,
                {opacity: pressed ? 0.75 : 1},
              ]}>
              <X size={15} color={textSecondary} strokeWidth={2.4} />
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>

            <Pressable
              onPress={handleSubmit}
              disabled={loading || !todoTitle.trim()}
              accessibilityRole="button"
              accessibilityLabel={isEdit ? 'Save changes' : 'Add task'}
              style={({pressed}) => [
                styles.saveBtn,
                {
                  backgroundColor: todoTitle.trim()
                    ? primaryColor
                    : theme.dark
                    ? '#222634'
                    : '#E2E8F0',
                  shadowColor: primaryColor,
                  shadowOpacity: todoTitle.trim() ? 0.25 : 0,
                  elevation: todoTitle.trim() ? 3 : 0,
                  opacity: loading
                    ? 0.75
                    : !todoTitle.trim()
                    ? 0.6
                    : pressed
                    ? 0.9
                    : 1,
                },
              ]}>
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Check
                  size={16}
                  color={todoTitle.trim() ? '#FFFFFF' : textLight}
                  strokeWidth={2.8}
                />
              )}
              <Text
                style={[
                  styles.saveBtnText,
                  {color: todoTitle.trim() ? '#FFFFFF' : textLight},
                ]}>
                {loading
                  ? 'Saving...'
                  : isEdit
                  ? 'Save Changes'
                  : 'Add Task'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ------------------------------- STYLES ------------------------------- */

function createStyles(theme) {
  return StyleSheet.create({
    flex: {flex: 1},
    safe: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    backBtn: {
      width: 36,
      height: 36,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    headerTextWrap: {
      flex: 1,
    },
    headerTitle: {
      fontSize: 17,
      fontWeight: '800',
      color: theme.colors.text,
      letterSpacing: -0.3,
    },
    headerSub: {
      fontSize: 11.5,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    scroll: {
      padding: 16,
      paddingBottom: 40,
    },
    errorBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: '#FEE2E2',
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 12,
      marginBottom: 14,
    },
    errorText: {
      color: '#B91C1C',
      fontSize: 12.5,
      fontWeight: '600',
      flex: 1,
    },
    field: {
      marginBottom: 16,
    },
    fieldHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 8,
    },
    label: {
      fontSize: 11,
      fontWeight: '800',
      color: theme.colors.textSecondary,
      letterSpacing: 0.8,
    },
    labelOptional: {
      fontSize: 10.5,
      fontWeight: '500',
      color: theme.colors.textLight,
      letterSpacing: 0.2,
    },
    input: {
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 11,
      fontSize: 14.5,
      color: theme.colors.text,
      backgroundColor: theme.colors.surface,
      fontWeight: '600',
    },
    textArea: {
      minHeight: 80,
      textAlignVertical: 'top',
      paddingTop: 11,
    },

    /* Priority Segmented */
    segment: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderRadius: 14,
      padding: 4,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      gap: 6,
    },
    segmentItem: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 10,
      borderRadius: 10,
    },
    segmentText: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.textSecondary,
    },
    segmentTextSelected: {
      color: '#FFFFFF',
      fontWeight: '800',
    },
    priorityDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
    },

    /* Category Chips */
    categoryScroll: {
      gap: 8,
      paddingVertical: 2,
    },
    categoryChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    categoryIcon: {
      fontSize: 13,
    },
    categoryText: {
      fontSize: 12.5,
      fontWeight: '700',
      color: theme.colors.text,
    },
    categoryTextSelected: {
      color: '#FFFFFF',
      fontWeight: '800',
    },

    /* Date row */
    dateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 12,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    dateLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: 12,
    },
    dateIconWrap: {
      width: 36,
      height: 36,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dateSubLabel: {
      fontSize: 10.5,
      fontWeight: '800',
      color: theme.colors.textSecondary,
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      marginBottom: 2,
    },
    dateValueText: {
      fontSize: 14.5,
      fontWeight: '700',
      color: theme.colors.text,
    },
    dateRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    clearIconBtn: {
      width: 26,
      height: 26,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background,
    },

    /* Visual Calendar Grid */
    calendar: {
      marginTop: 10,
      padding: 12,
      borderRadius: 14,
      backgroundColor: theme.colors.surface,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
    },
    calendarHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    monthArrow: {
      width: 32,
      height: 32,
      borderRadius: 9,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background,
    },
    monthTitle: {
      fontSize: 14.5,
      fontWeight: '800',
      color: theme.colors.text,
    },
    calendarGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    calendarCell: {
      width: `${100 / 7}%`,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    weekdayText: {
      fontSize: 11,
      fontWeight: '800',
      color: theme.colors.textLight,
    },
    dayCircle: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: 'transparent',
    },
    dayText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.text,
    },
    selectedDayText: {
      color: '#FFFFFF',
      fontWeight: '800',
    },

    /* Quick calendar presets chips */
    quickCalendarRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginTop: 10,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    quickCalendarChip: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 9,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    },
    quickCalendarChipText: {
      fontSize: 11.5,
      fontWeight: '700',
    },

    /* Repeat Select Dropdown Trigger */
    select: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: theme.colors.surface,
    },
    selectLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      flex: 1,
    },
    selectIconWrap: {
      width: 28,
      height: 28,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    selectText: {
      fontSize: 13.5,
      fontWeight: '700',
      color: theme.colors.text,
    },
    dropdown: {
      marginTop: 6,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 14,
      backgroundColor: theme.colors.surface,
      overflow: 'hidden',
    },
    dropdownItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 14,
      paddingVertical: 11,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    selectedDropdownItem: {
      backgroundColor: theme.colors.primarySoft,
    },
    dropdownText: {
      fontSize: 13,
      color: theme.colors.text,
      fontWeight: '600',
    },

    /* Reminder */
    reminderCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 12,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      marginBottom: 20,
    },
    reminderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      flex: 1,
      marginRight: 10,
    },
    reminderIconWrap: {
      width: 34,
      height: 34,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    reminderTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.text,
    },
    reminderDesc: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      marginTop: 1,
    },

    /* Actions Side-by-Side */
    actionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginTop: 4,
    },
    cancelBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      height: 48,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    cancelBtnText: {
      fontSize: 13.5,
      fontWeight: '700',
      color: theme.colors.textSecondary,
      letterSpacing: 0.1,
    },
    saveBtn: {
      flex: 1.35,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      height: 48,
      borderRadius: 14,
      shadowOffset: {width: 0, height: 4},
      shadowRadius: 8,
    },
    saveBtnText: {
      fontSize: 14,
      fontWeight: '800',
      letterSpacing: 0.2,
    },
  });
}

export default TodoForm;
