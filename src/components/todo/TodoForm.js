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

import {SafeAreaView} from 'react-native-safe-area-context';
import {useEffect, useState} from 'react';

import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
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
  RefreshCw,
} from 'lucide-react-native';

import AppButton from '../common/AppButton';
import useTheme from '../../hooks/useTheme';
import {getDueDateOptions} from '../../utils/dateUtils';
import {RECURRENCE_OPTIONS, getRecurrenceLabel} from '../../utils/recurrence';

const PRIORITIES = [
  {key: 'low', label: 'Low', Icon: ArrowDown, color: '#10B981'},
  {key: 'medium', label: 'Medium', Icon: Minus, color: '#F59E0B'},
  {key: 'high', label: 'High', Icon: ArrowUp, color: '#EF4444'},
];

const CATEGORIES = [
  {key: 'Personal', Icon: User},
  {key: 'Work', Icon: Briefcase},
  {key: 'Learning', Icon: GraduationCap},
  {key: 'Shopping', Icon: ShoppingCart},
  {key: 'Health', Icon: Dumbbell},
  {key: 'Project', Icon: Rocket},
];

function TodoForm({
  title = 'New Todo',
  subtitle = 'Add something you want to get done.',
  initialTodo = null,
  onSubmit,
  onCancel,
  onChange,
}) {
  const {theme} = useTheme();
  const styles = createStyles(theme);

  const [todoTitle, setTodoTitle] = useState(initialTodo?.title || '');
  const [description, setDescription] = useState(initialTodo?.description || '');
  const [category, setCategory] = useState(initialTodo?.category || 'Personal');
  const [priority, setPriority] = useState(initialTodo?.priority || 'medium');
  const [dueDate, setDueDate] = useState(initialTodo?.dueDate || 'No date');
  const [reminder, setReminder] = useState(Boolean(initialTodo?.reminder));
  const [recurrence, setRecurrence] = useState(initialTodo?.recurrence || 'none');
  const [showCategory, setShowCategory] = useState(false);
  const [showDueDate, setShowDueDate] = useState(false);
  const [showRecurrence, setShowRecurrence] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isEdit = Boolean(initialTodo);
  const primaryColor = theme.colors.primary ?? '#7C3AED';
  const textColor = theme.colors.text ?? '#111';
  const textLight = theme.colors.textLight ?? '#999';
  const textSecondary = theme.colors.textSecondary ?? '#666';
  const borderColor = theme.colors.border ?? '#E5E7EB';

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

  const SelectedCategoryIcon =
    CATEGORIES.find(c => c.key === category)?.Icon || Folder;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Pressable onPress={onCancel} style={styles.backBtn} hitSlop={8}>
            <ChevronLeft size={22} color={textColor} strokeWidth={2.4} />
          </Pressable>
          <View style={{flex: 1}}>
            <Text style={styles.headerTitle}>{title}</Text>
            <Text style={styles.headerSub}>{subtitle}</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {error ? (
            <View style={styles.errorBox}>
              <AlertCircle size={16} color="#EF4444" strokeWidth={2.4} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.field}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={todoTitle}
              onChangeText={t => {
                setTodoTitle(t);
                notifyChange();
              }}
              placeholder="What needs to be done?"
              placeholderTextColor={textLight}
              maxLength={100}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={t => {
                setDescription(t);
                notifyChange();
              }}
              placeholder="Optional details..."
              placeholderTextColor={textLight}
              multiline
              maxLength={500}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Priority</Text>
            <View style={styles.priorityRow}>
              {PRIORITIES.map(item => {
                const selected = priority === item.key;
                const Icon = item.Icon;
                return (
                  <Pressable
                    key={item.key}
                    style={[
                      styles.priorityChip,
                      selected && {
                        backgroundColor: item.color + '18',
                        borderColor: item.color,
                      },
                    ]}
                    onPress={() => {
                      setPriority(item.key);
                      notifyChange();
                    }}>
                    <Icon
                      size={14}
                      color={selected ? item.color : textSecondary}
                      strokeWidth={2.4}
                    />
                    <Text
                      style={[
                        styles.priorityText,
                        {color: selected ? item.color : textSecondary},
                      ]}>
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Category</Text>
            <Pressable
              style={styles.select}
              onPress={() => {
                setShowCategory(c => !c);
                setShowDueDate(false);
                setShowRecurrence(false);
              }}>
              <View style={styles.selectLeft}>
                <SelectedCategoryIcon size={18} color={primaryColor} strokeWidth={2} />
                <Text style={styles.selectText}>{category}</Text>
              </View>
              {showCategory ? (
                <ChevronUp size={18} color={textSecondary} />
              ) : (
                <ChevronDown size={18} color={textSecondary} />
              )}
            </Pressable>
            {showCategory && (
              <View style={styles.dropdown}>
                {CATEGORIES.map(item => {
                  const selected = item.key === category;
                  const Icon = item.Icon;
                  return (
                    <Pressable
                      key={item.key}
                      style={[
                        styles.dropdownItem,
                        selected && styles.selectedDropdownItem,
                      ]}
                      onPress={() => {
                        setCategory(item.key);
                        setShowCategory(false);
                        notifyChange();
                      }}>
                      <Icon size={16} color={selected ? primaryColor : textSecondary} />
                      <Text
                        style={[
                          styles.dropdownText,
                          selected && {color: primaryColor, fontWeight: '700'},
                        ]}>
                        {item.key}
                      </Text>
                      {selected && <Check size={16} color={primaryColor} strokeWidth={3} />}
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Due Date</Text>
            <Pressable
              style={styles.select}
              onPress={() => {
                setShowDueDate(c => !c);
                setShowCategory(false);
                setShowRecurrence(false);
              }}>
              <View style={styles.selectLeft}>
                <Calendar size={18} color={primaryColor} strokeWidth={2} />
                <Text style={styles.selectText}>{dueDate}</Text>
              </View>
              {showDueDate ? (
                <ChevronUp size={18} color={textSecondary} />
              ) : (
                <ChevronDown size={18} color={textSecondary} />
              )}
            </Pressable>
            {showDueDate && (
              <View style={styles.dropdown}>
                {getDueDateOptions().map(item => {
                  const selected = item === dueDate;
                  return (
                    <Pressable
                      key={item}
                      style={[
                        styles.dropdownItem,
                        selected && styles.selectedDropdownItem,
                      ]}
                      onPress={() => {
                        setDueDate(item);
                        setShowDueDate(false);
                        notifyChange();
                      }}>
                      <Text
                        style={[
                          styles.dropdownText,
                          selected && {color: primaryColor, fontWeight: '700'},
                        ]}>
                        {item}
                      </Text>
                      {selected && <Check size={16} color={primaryColor} strokeWidth={3} />}
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Repeat</Text>
            <Pressable
              style={styles.select}
              onPress={() => {
                setShowRecurrence(c => !c);
                setShowDueDate(false);
                setShowCategory(false);
              }}>
              <View style={styles.selectLeft}>
                <RefreshCw size={18} color={primaryColor} strokeWidth={2} />
                <Text style={styles.selectText}>
                  {getRecurrenceLabel(recurrence)}
                </Text>
              </View>
              {showRecurrence ? (
                <ChevronUp size={18} color={textSecondary} />
              ) : (
                <ChevronDown size={18} color={textSecondary} />
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
                          selected && {color: primaryColor, fontWeight: '700'},
                        ]}>
                        {item.label}
                      </Text>
                      {selected && <Check size={16} color={primaryColor} strokeWidth={3} />}
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>

          <View style={styles.reminderRow}>
            <View style={styles.reminderLeft}>
              <View style={[styles.reminderIconWrap, {backgroundColor: primaryColor + '18'}]}>
                <Bell size={18} color={primaryColor} strokeWidth={2} />
              </View>
              <View>
                <Text style={styles.label}>Reminder</Text>
                <Text style={styles.reminderDesc}>Notify on due date</Text>
              </View>
            </View>
            <Switch
              value={reminder}
              onValueChange={v => {
                setReminder(v);
                notifyChange();
              }}
              trackColor={{false: borderColor, true: primaryColor}}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.actions}>
            <AppButton
              title={isEdit ? 'Save changes' : 'Add task'}
              onPress={handleSubmit}
              loading={loading}
            />
            <AppButton title="Cancel" variant="secondary" onPress={onCancel} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    safe: {flex: 1, backgroundColor: theme.colors.background},
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    backBtn: {
      width: 36,
      height: 36,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.colors.text,
      letterSpacing: -0.3,
    },
    headerSub: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    scroll: {padding: 16, paddingBottom: 40},
    errorBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: '#FEE2E2',
      padding: 12,
      borderRadius: 12,
      marginBottom: 12,
    },
    errorText: {color: '#B91C1C', fontSize: 13, fontWeight: '600', flex: 1},
    field: {marginBottom: 16},
    label: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.textSecondary,
      marginBottom: 8,
      letterSpacing: 0.3,
    },
    input: {
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      color: theme.colors.text,
      backgroundColor: theme.colors.surface,
      fontWeight: '500',
    },
    textArea: {minHeight: 88, textAlignVertical: 'top'},
    priorityRow: {flexDirection: 'row', gap: 8},
    priorityChip: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    priorityText: {fontSize: 13, fontWeight: '700'},
    select: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 12,
      backgroundColor: theme.colors.surface,
    },
    selectLeft: {flexDirection: 'row', alignItems: 'center', gap: 10},
    selectText: {fontSize: 15, fontWeight: '600', color: theme.colors.text},
    dropdown: {
      marginTop: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 14,
      backgroundColor: theme.colors.surface,
      overflow: 'hidden',
    },
    dropdownItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    selectedDropdownItem: {backgroundColor: theme.colors.primarySoft},
    dropdownText: {flex: 1, fontSize: 14, color: theme.colors.text},
    reminderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 20,
      paddingVertical: 4,
    },
    reminderLeft: {flexDirection: 'row', alignItems: 'center', gap: 12},
    reminderIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    reminderDesc: {fontSize: 12, color: theme.colors.textSecondary, marginTop: 2},
    actions: {gap: 10, marginTop: 8},
  });
}

export default TodoForm;
