import React, {useEffect, useRef, useState} from 'react';
import {
  TextInput,
  Text,
  View,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Alert,
  Animated,
  LayoutAnimation,
  UIManager,
  PermissionsAndroid,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Voice from '@react-native-voice/voice';
import {
  Mic,
  Square,
  ArrowLeft,
  Calendar as CalendarIcon,
  Bell,
  Palette,
  Tag,
  Flag,
  Sparkles,
  Languages,
  ChevronLeft,
  ChevronRight,
  Check,
  Play,
  Type,
  X,
} from 'lucide-react-native';

import useTheme from '../../hooks/useTheme';
import {useTodoContext} from '../../context/TodoContext';

// LayoutAnimation experimental is handled automatically in React Native New Architecture

/* ------------------------------- CONSTANTS ------------------------------- */

const PRIORITIES = [
  {key: 'low', label: 'Low', color: '#10B981'},
  {key: 'medium', label: 'Medium', color: '#F59E0B'},
  {key: 'high', label: 'High', color: '#EF4444'},
];

const CATEGORIES = [
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

const COLORS = [
  '#6366F1',
  '#EC4899',
  '#14B8A6',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#10B981',
  '#3B82F6',
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

/* -------------------------------- HELPERS -------------------------------- */

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

/* ------------------------------- COMPONENT ------------------------------- */

function AddTodoScreen({navigation}) {
  const {addTodo, customCategories = []} = useTodoContext();
  const {theme} = useTheme();
  const styles = createStyles(theme);

  const today = startOfToday();

  /* ------------------------------- STATE ------------------------------- */
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Personal');
  const categoryOptions = [
    ...CATEGORIES,
    ...customCategories
      .filter(name => !CATEGORIES.some(item => item.key.toLocaleLowerCase() === String(name).toLocaleLowerCase()))
      .map(key => ({key, icon: '🏷️'})),
  ];
  const [priority, setPriority] = useState('medium');
  const [color, setColor] = useState(COLORS[0]);
  const [dueDate, setDueDate] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [showCalendar, setShowCalendar] = useState(false);
  const [reminder, setReminder] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Voice
  const voiceTargetRef = useRef(null);
  const [voiceTarget, setVoiceTarget] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceLanguage, setVoiceLanguage] = useState('en-IN');
  const [translating, setTranslating] = useState(false);

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const errorAnim = useRef(new Animated.Value(0)).current;
  const titleInputRef = useRef(null);

  /* ------------------------------ VOICE FX ----------------------------- */
  useEffect(() => {
    Voice.onSpeechStart = () => {
      setIsListening(true);
    };

    Voice.onSpeechRecognized = () => {};

    Voice.onSpeechEnd = () => {
      setIsListening(false);
    };

    Voice.onSpeechResults = event => {
      const spokenText = event.value?.[0];
      if (!spokenText) return;

      const target = voiceTargetRef.current;
      if (target === 'title') {
        setTitle(prev => (prev ? `${prev} ${spokenText}` : spokenText));
      } else if (target === 'description') {
        setDescription(prev =>
          prev ? `${prev} ${spokenText}` : spokenText,
        );
      }
      setIsListening(false);
    };

    Voice.onSpeechPartialResults = event => {
      const partial = event.value?.[0];
      if (!partial) return;
    };

    Voice.onSpeechError = event => {
      setIsListening(false);
      const code = event?.error?.code || event?.error?.message;
      // Benign non-critical codes (7 = NO_MATCH, 6 = TIMEOUT)
      if (code !== '7' && code !== 7 && code !== '6' && code !== 6) {
        console.log('Voice speech error:', event?.error);
      }
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners).catch(() => {});
    };
  }, []);

  /* --------------------------- PULSE ANIMATION ------------------------- */
  useEffect(() => {
    if (isListening) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.5,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      );
      loop.start();
      return () => loop.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isListening, pulseAnim]);

  /* --------------------------- ERROR ANIMATION ------------------------- */
  useEffect(() => {
    Animated.timing(errorAnim, {
      toValue: error ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [error, errorAnim]);

  /* ------------------------------- ACTIONS ----------------------------- */
  async function requestAudioPermission() {
    if (Platform.OS !== 'android') return true;
    try {
      const alreadyGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      );
      if (alreadyGranted) {
        return true;
      }
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Microphone Permission',
          message:
            'Tasklume needs access to your microphone for voice typing.',
          buttonPositive: 'OK',
          buttonNegative: 'Cancel',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Audio permission error:', err);
      return false;
    }
  }

  async function startVoiceInput(target) {
    try {
      const granted = await requestAudioPermission();
      if (!granted) {
        Alert.alert(
          'Microphone Permission Required',
          'Please allow microphone permission in settings to speak your task.',
        );
        return;
      }

      try {
        await Voice.stop();
      } catch (_) {}

      voiceTargetRef.current = target;
      setVoiceTarget(target);
      setIsListening(true);
      await Voice.start(voiceLanguage);
    } catch (e) {
      setIsListening(false);
      console.log('Voice start error:', e);
      Alert.alert(
        'Voice Input',
        'Could not start speech recognition. Please ensure Google Speech Services are active on your device.',
      );
    }
  }

  async function stopVoiceInput() {
    try {
      await Voice.stop();
    } catch (_) {}
    setIsListening(false);
  }

  function toggleVoice(target) {
    const active = isListening && voiceTarget === target;
    if (active || isListening) {
      stopVoiceInput();
    } else {
      startVoiceInput(target);
    }
  }

  async function translateSingleText(text, targetLang) {
    if (!text || !text.trim()) return '';
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text.trim())}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data && Array.isArray(data[0])) {
      return data[0]
        .map(item => item[0])
        .filter(Boolean)
        .join('');
    }
    return text;
  }

  function handleTranslate() {
    Alert.alert(
      'Translate task text?',
      'The title and description you selected will be sent to Google Translate to provide a translation. Do not continue with sensitive information unless you accept this.',
      [
        {text: 'Cancel', style: 'cancel'},
        {text: 'Continue', onPress: () => performTranslate()},
      ],
    );
  }

  async function performTranslate() {
    const hasTitle = Boolean(title && title.trim());
    const hasDesc = Boolean(description && description.trim());

    if (!hasTitle && !hasDesc) {
      Alert.alert('Empty Text', 'Please enter or speak some text first to translate.');
      return;
    }

    setTranslating(true);
    try {
      // Auto-detect target: if language is Hindi (hi-IN) translate to English ('en'), else to Hindi ('hi')
      const targetLang = voiceLanguage === 'hi-IN' ? 'en' : 'hi';

      const [translatedTitle, translatedDesc] = await Promise.all([
        hasTitle ? translateSingleText(title, targetLang) : Promise.resolve(null),
        hasDesc ? translateSingleText(description, targetLang) : Promise.resolve(null),
      ]);

      if (translatedTitle !== null && translatedTitle) {
        setTitle(translatedTitle);
      }
      if (translatedDesc !== null && translatedDesc) {
        setDescription(translatedDesc);
      }
    } catch (e) {
      console.log('Translate error:', e);
      Alert.alert(
        'Translation Error',
        'Unable to translate at the moment. Please check your internet connection.',
      );
    } finally {
      setTranslating(false);
    }
  }


  function changeMonth(amount) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCalendarMonth(
      prev => new Date(prev.getFullYear(), prev.getMonth() + amount, 1),
    );
  }

  function toggleCalendar() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowCalendar(v => !v);
  }

  function pickDate(date) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setDueDate(dateKey(date));
    setShowCalendar(false);
  }

  /* ------------------------------ CALENDAR ----------------------------- */
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
        {/* Month nav */}
        <View style={styles.calendarHeader}>
          <Pressable
            style={styles.monthArrow}
            onPress={() => changeMonth(-1)}
            hitSlop={8}>
            <ChevronLeft size={20} color={theme.colors.text} strokeWidth={2.4} />
          </Pressable>

          <Text style={styles.monthTitle}>
            {MONTHS[month]} {year}
          </Text>

          <Pressable
            style={styles.monthArrow}
            onPress={() => changeMonth(1)}
            hitSlop={8}>
            <ChevronRight size={20} color={theme.colors.text} strokeWidth={2.4} />
          </Pressable>
        </View>

        {/* Weekday row */}
        <View style={styles.calendarGrid}>
          {WEEKDAYS.map((d, i) => (
            <View key={`wd-${i}`} style={styles.calendarCell}>
              <Text style={styles.weekdayText}>{d}</Text>
            </View>
          ))}

          {cells.map((day, index) => {
            if (day === null) {
              return <View key={`e-${index}`} style={styles.calendarCell} />;
            }

            const current = new Date(year, month, day);
            const selected = dueDate === dateKey(current);
            const isToday = dateKey(current) === dateKey(today);

            return (
              <Pressable
                key={`${year}-${month}-${day}`}
                style={styles.calendarCell}
                onPress={() => pickDate(current)}>
                <View
                  style={[
                    styles.dayCircle,
                    selected && {
                      backgroundColor: theme.colors.primary,
                      borderColor: theme.colors.primary,
                    },
                    isToday &&
                      !selected && {
                        borderColor: theme.colors.primary,
                      },
                  ]}>
                  <Text
                    style={[
                      styles.dayText,
                      isToday && {color: theme.colors.primary, fontWeight: '800'},
                      selected && styles.selectedDayText,
                    ]}>
                    {day}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Quick chips */}
        <View style={styles.quickRow}>
          <QuickChip
            label="Today"
            onPress={() => pickDate(today)}
            styles={styles}
            theme={theme}
          />
          <QuickChip
            label="Tomorrow"
            onPress={() => pickDate(getTomorrow())}
            styles={styles}
            theme={theme}
          />
          <QuickChip
            label="Next Week"
            onPress={() => pickDate(getNextWeek())}
            styles={styles}
            theme={theme}
          />
          <QuickChip
            label="Weekend"
            onPress={() => pickDate(getWeekend())}
            styles={styles}
            theme={theme}
          />
        </View>
      </View>
    );
  }

  /* ------------------------------ MIC BUTTON --------------------------- */
  function renderMicButton(target, size = 44) {
    const active = isListening && voiceTarget === target;

    return (
      <View
        style={{
          width: size,
          height: size,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {active && (
          <Animated.View
            style={[
              styles.micPulse,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                transform: [{scale: pulseAnim}],
                opacity: pulseAnim.interpolate({
                  inputRange: [1, 1.5],
                  outputRange: [0.55, 0],
                }),
              },
            ]}
          />
        )}
        <Pressable
          onPress={() => toggleVoice(target)}
          hitSlop={8}
          style={[
            styles.micButton,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
            active && styles.micButtonActive,
          ]}
          accessibilityRole="button"
          accessibilityLabel={
            active ? 'Stop voice input' : `Start voice input for ${target}`
          }
          accessibilityState={{selected: active}}>
          {active ? (
            <Square size={16} color="#FFFFFF" fill="#FFFFFF" strokeWidth={2} />
          ) : (
            <Mic size={20} color="#FFFFFF" strokeWidth={2.4} />
          )}
        </Pressable>
      </View>
    );
  }

  /* ------------------------------ SAVE --------------------------------- */
  function handleSave(startImmediately = false) {
    setError('');

    const cleanTitle = title.trim();
    const cleanDescription = description.trim();

    if (!cleanTitle) {
      setError('Please enter a todo title.');
      return;
    }
    if (cleanTitle.length < 2) {
      setError('Todo title must be at least 2 characters.');
      return;
    }
    if (loading) return;

    setLoading(true);
    const now = new Date();

    const newTodo = {
      title: cleanTitle,
      description: cleanDescription,
      category,
      priority,
      color,
      dueDate,
      reminder,
      createdAt: now.toISOString(),
      startedAt: startImmediately ? now.toISOString() : null,
      status: startImmediately ? 'in-progress' : 'pending',
    };

    try {
      addTodo(newTodo);
      setLoading(false);
      navigation.goBack();
    } catch (e) {
      setLoading(false);
      setError('Could not save todo. Please try again.');
    }
  }

  /* ------------------------------ RENDER ------------------------------- */
  const titleActive = isListening && voiceTarget === 'title';
  const descActive = isListening && voiceTarget === 'description';
  const anyListening = isListening;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* HEADER */}
          <View style={styles.header}>
            <Pressable
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              hitSlop={12}>
              <ArrowLeft size={20} color={theme.colors.text} strokeWidth={2.4} />
            </Pressable>

            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>New Task</Text>
              <Text style={styles.headerSubtitle}>
                Plan it. Focus on it. Get it done.
              </Text>
            </View>
          </View>

          {/* ============ SECTION: TASK ============ */}
          <SectionCard
            icon={<Type size={14} color="#FFFFFF" strokeWidth={2.6} />}
            accent={theme.colors.primary}
            title="Task"
            styles={styles}
            theme={theme}>
            {/* Title */}
            <View style={styles.inputWrap}>
              <TextInput
                ref={titleInputRef}
                style={[styles.titleInput, titleActive && styles.inputListening]}
                placeholder="What needs to be done?"
                placeholderTextColor={theme.colors.textLight}
                value={title}
                onChangeText={setTitle}
                maxLength={100}
                returnKeyType="next"
              />
            </View>

            {/* Description */}
            <View
              style={[
                styles.inputWrap,
                styles.textAreaWrap,
                descActive && styles.inputListening,
              ]}>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Add details or speak your notes..."
                placeholderTextColor={theme.colors.textLight}
                value={description}
                onChangeText={setDescription}
                multiline
                textAlignVertical="top"
                maxLength={500}
              />
            </View>

            {/* Language + Translate bar */}
            <View style={styles.voiceBar}>
              <View style={styles.langGroup}>
                <Languages
                  size={14}
                  color={theme.colors.textSecondary}
                  strokeWidth={2.4}
                />
                {['en-IN', 'hi-IN'].map(lang => {
                  const selected = voiceLanguage === lang;
                  return (
                    <Pressable
                      key={lang}
                      style={[
                        styles.langChip,
                        selected && styles.langChipActive,
                      ]}
                      onPress={() => setVoiceLanguage(lang)}>
                      <Text
                        style={[
                          styles.langChipText,
                          selected && styles.langChipTextActive,
                        ]}>
                        {lang === 'en-IN' ? 'EN' : 'HI'}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.voiceBarRight}>
                <Pressable
                  style={[styles.translateBtn, translating && {opacity: 0.6}]}
                  disabled={translating}
                  onPress={handleTranslate}>
                  <Sparkles
                    size={13}
                    color={theme.colors.primary}
                    strokeWidth={2.4}
                  />
                  <Text style={styles.translateBtnText}>
                    {translating ? 'Translating...' : 'Translate'}
                  </Text>
                </Pressable>
              </View>
            </View>

            {anyListening && (
              <View style={styles.listeningStrip}>
                <View style={styles.listeningDot} />
                <Text style={styles.listeningText}>
                  Listening… speak clearly
                </Text>
              </View>
            )}
          </SectionCard>

          {/* ============ SECTION: ORGANIZATION ============ */}
          <SectionCard
            icon={<Tag size={14} color="#FFFFFF" strokeWidth={2.6} />}
            accent="#8B5CF6"
            title="Organization"
            styles={styles}
            theme={theme}>
            {/* Priority segmented */}
            <Text style={styles.miniLabel}>
              <Flag
                size={11}
                color={theme.colors.textSecondary}
                strokeWidth={2.6}
              />
              {'  '}Priority
            </Text>
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
                    onPress={() => setPriority(item.key)}>
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
                  </Pressable>
                );
              })}
            </View>

            {/* Category chips */}
            <Text style={[styles.miniLabel, {marginTop: 16}]}>
              <Tag
                size={11}
                color={theme.colors.textSecondary}
                strokeWidth={2.6}
              />
              {'  '}Category
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScroll}>
              {categoryOptions.map(item => {
                const selected = category === item.key;
                return (
                  <Pressable
                    key={item.key}
                    style={[
                      styles.categoryChip,
                      selected && {
                        backgroundColor: theme.colors.primary,
                        borderColor: theme.colors.primary,
                      },
                    ]}
                    onPress={() => setCategory(item.key)}>
                    <Text style={styles.categoryIcon}>{item.icon}</Text>
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

            {/* Color */}
            <Text style={[styles.miniLabel, {marginTop: 16}]}>
              <Palette
                size={11}
                color={theme.colors.textSecondary}
                strokeWidth={2.6}
              />
              {'  '}Color Tag
            </Text>
            <View style={styles.colorRow}>
              {COLORS.map(c => {
                const selected = color === c;
                return (
                  <Pressable
                    key={c}
                    style={[
                      styles.colorOuter,
                      selected && {borderColor: c},
                    ]}
                    onPress={() => setColor(c)}>
                    <View
                      style={[styles.colorInner, {backgroundColor: c}]}>
                      {selected && (
                        <Check size={14} color="#FFFFFF" strokeWidth={3.2} />
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </SectionCard>

          {/* ============ SECTION: SCHEDULE ============ */}
          <SectionCard
            icon={<CalendarIcon size={14} color="#FFFFFF" strokeWidth={2.6} />}
            accent="#14B8A6"
            title="Schedule"
            styles={styles}
            theme={theme}>
            {/* Due date */}
            <Pressable
              style={[
                styles.dateRow,
                dueDate && {borderColor: theme.colors.primary + '55'},
              ]}
              onPress={toggleCalendar}>
              <View style={styles.dateLeft}>
                <View
                  style={[
                    styles.dateIconWrap,
                    {
                      backgroundColor: dueDate
                        ? theme.colors.primary + '18'
                        : theme.colors.background,
                    },
                  ]}>
                  <CalendarIcon
                    size={16}
                    color={
                      dueDate
                        ? theme.colors.primary
                        : theme.colors.textSecondary
                    }
                    strokeWidth={2.4}
                  />
                </View>
                <View style={{flex: 1}}>
                  <Text style={styles.dateLabel}>Due date</Text>
                  <Text
                    style={[
                      styles.dateValue,
                      !dueDate && {color: theme.colors.textLight},
                    ]}
                    numberOfLines={1}>
                    {dueDate
                      ? formatDate(new Date(`${dueDate}T12:00:00`))
                      : 'No date selected'}
                  </Text>
                </View>
              </View>

              <View style={styles.dateRight}>
                {dueDate && (
                  <Pressable
                    onPress={() => setDueDate(null)}
                    hitSlop={10}
                    style={styles.clearIconBtn}>
                    <X
                      size={14}
                      color={theme.colors.textSecondary}
                      strokeWidth={2.6}
                    />
                  </Pressable>
                )}
                <ChevronRight
                  size={18}
                  color={theme.colors.textSecondary}
                  strokeWidth={2.4}
                  style={{
                    transform: [{rotate: showCalendar ? '90deg' : '0deg'}],
                  }}
                />
              </View>
            </Pressable>

            {showCalendar && renderCalendar()}

            {/* Reminder — simple toggle, no time */}
            <View style={styles.reminderCard}>
              <View style={styles.reminderLeft}>
                <View
                  style={[
                    styles.dateIconWrap,
                    {
                      backgroundColor: reminder
                        ? theme.colors.primary + '18'
                        : theme.colors.background,
                    },
                  ]}>
                  <Bell
                    size={16}
                    color={
                      reminder
                        ? theme.colors.primary
                        : theme.colors.textSecondary
                    }
                    strokeWidth={2.4}
                  />
                </View>
                <View style={{flex: 1}}>
                  <Text style={styles.reminderTitle}>Reminder</Text>
                  <Text style={styles.reminderDesc} numberOfLines={1}>
                    Get notified about this task
                  </Text>
                </View>
              </View>

              <Switch
                value={reminder}
                onValueChange={val => {
                  LayoutAnimation.configureNext(
                    LayoutAnimation.Presets.easeInEaseOut,
                  );
                  setReminder(val);
                }}
                trackColor={{
                  false: theme.colors.border,
                  true: theme.colors.primary,
                }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={theme.colors.border}
              />
            </View>
          </SectionCard>

          {/* ERROR */}
          {error ? (
            <Animated.View
              style={[
                styles.errorBox,
                {
                  opacity: errorAnim,
                  transform: [
                    {
                      translateY: errorAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-6, 0],
                      }),
                    },
                  ],
                },
              ]}>
              <Text style={styles.errorText}>{error}</Text>
            </Animated.View>
          ) : null}

          {/* ACTIONS */}
          <View style={styles.actions}>
            <Pressable
              style={[
                styles.primaryBtn,
                {backgroundColor: theme.colors.primary},
                loading && {opacity: 0.6},
              ]}
              onPress={() => handleSave(false)}
              disabled={loading}>
              <Check size={18} color="#FFFFFF" strokeWidth={2.8} />
              <Text style={styles.primaryBtnText}>Save Task</Text>
            </Pressable>

            <Pressable
              style={[
                styles.secondaryBtn,
                {
                  borderColor: theme.colors.primary,
                  backgroundColor: theme.colors.primary + '10',
                },
                loading && {opacity: 0.6},
              ]}
              onPress={() => handleSave(true)}
              disabled={loading}>
              <Play
                size={16}
                color={theme.colors.primary}
                strokeWidth={2.6}
                fill={theme.colors.primary}
              />
              <Text
                style={[
                  styles.secondaryBtnText,
                  {color: theme.colors.primary},
                ]}>
                Save & Start
              </Text>
            </Pressable>

            <Pressable
              style={styles.cancelBtn}
              onPress={() => navigation.goBack()}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* --------------------------- SUB-COMPONENTS ---------------------------- */

function SectionCard({icon, accent, title, children, styles, theme}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.cardIconWrap, {backgroundColor: accent}]}>
          {icon}
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <View style={styles.cardBody}>{children}</View>
    </View>
  );
}

function QuickChip({label, onPress, styles, theme}) {
  return (
    <Pressable
      style={[
        styles.quickChip,
        {
          backgroundColor: theme.colors.background,
          borderColor: theme.colors.border,
        },
      ]}
      onPress={onPress}>
      <Text style={[styles.quickChipText, {color: theme.colors.text}]}>
        {label}
      </Text>
    </Pressable>
  );
}

/* ------------------------------- STYLES -------------------------------- */

function createStyles(theme) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    keyboard: {flex: 1},
    scrollContent: {
      paddingBottom: 40,
    },

    /* Header */
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 20,
    },
    backButton: {
      width: 42,
      height: 42,
      borderRadius: 14,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
    },
    headerTextContainer: {flex: 1},
    headerTitle: {
      fontSize: 24,
      fontWeight: '800',
      color: theme.colors.text,
      letterSpacing: -0.6,
    },
    headerSubtitle: {
      marginTop: 2,
      fontSize: 13,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },

    /* Card */
    card: {
      marginHorizontal: 16,
      marginBottom: 14,
      backgroundColor: theme.colors.surface,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.05,
      shadowRadius: 12,
      elevation: 2,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 14,
    },
    cardIconWrap: {
      width: 26,
      height: 26,
      borderRadius: 9,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },
    cardTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: theme.colors.text,
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    cardBody: {},

    /* Inputs */
    inputWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      borderRadius: 16,
      paddingLeft: 14,
      paddingRight: 14,
      minHeight: 54,
      marginBottom: 12,
    },
    textAreaWrap: {
      alignItems: 'flex-start',
      minHeight: 130,
      paddingTop: 4,
      paddingBottom: 8,
      paddingRight: 14,
    },
    inputListening: {
      borderColor: theme.colors.primary,
      shadowColor: theme.colors.primary,
      shadowOpacity: 0.15,
      shadowRadius: 8,
      shadowOffset: {width: 0, height: 0},
      elevation: 3,
    },
    titleInput: {
      flex: 1,
      paddingVertical: 14,
      fontSize: 17,
      fontWeight: '600',
      color: theme.colors.text,
    },
    input: {
      flex: 1,
      paddingVertical: 14,
      fontSize: 15,
      fontWeight: '500',
      color: theme.colors.text,
    },
    textArea: {
      minHeight: 108,
      textAlignVertical: 'top',
      paddingTop: 12,
      paddingLeft: 0,
    },
    micSlot: {
      marginLeft: 6,
      alignItems: 'center',
      justifyContent: 'center',
    },
    micSlotTop: {
      marginTop: 6,
      alignItems: 'center',
      justifyContent: 'center',
    },

    /* Mic button */
    micButton: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
      shadowColor: theme.colors.primary,
      shadowOffset: {width: 0, height: 3},
      shadowOpacity: 0.35,
      shadowRadius: 6,
      elevation: 4,
      zIndex: 2,
    },
    micButtonActive: {
      backgroundColor: '#DC2626',
      shadowColor: '#DC2626',
    },
    micPulse: {
      position: 'absolute',
      backgroundColor: '#DC2626',
    },

    /* Voice bar */
    voiceBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 4,
    },
    langGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    langChip: {
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 12,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginLeft: 6,
    },
    langChipActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    langChipText: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.5,
      color: theme.colors.textSecondary,
    },
    langChipTextActive: {color: '#FFFFFF'},
    voiceBarRight: {},
    translateBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      backgroundColor: theme.colors.primary + '14',
      borderWidth: 1,
      borderColor: theme.colors.primary + '40',
    },
    translateBtnText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.primary,
    },

    /* Listening strip */
    listeningStrip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 12,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      backgroundColor: theme.colors.primary + '12',
    },
    listeningDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#DC2626',
    },
    listeningText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.primary,
    },

    /* Mini labels inside cards */
    miniLabel: {
      fontSize: 11,
      fontWeight: '800',
      color: theme.colors.textSecondary,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      marginBottom: 10,
    },

    /* Priority segmented */
    segment: {
      flexDirection: 'row',
      backgroundColor: theme.colors.background,
      borderRadius: 14,
      padding: 4,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    segmentItem: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      borderRadius: 11,
      gap: 6,
    },
    priorityDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    segmentText: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.textSecondary,
    },
    segmentTextSelected: {color: '#FFFFFF'},

    /* Category */
    categoryScroll: {
      gap: 8,
      paddingRight: 8,
    },
    categoryChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    categoryIcon: {fontSize: 14},
    categoryText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.textSecondary,
    },
    categoryTextSelected: {
      color: '#FFFFFF',
      fontWeight: '700',
    },

    /* Colors */
    colorRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    colorOuter: {
      width: 44,
      height: 44,
      borderRadius: 14,
      borderWidth: 2,
      borderColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
    },
    colorInner: {
      width: 34,
      height: 34,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
    },

    /* Date row */
    dateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 12,
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
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
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dateLabel: {
      fontSize: 11,
      fontWeight: '800',
      color: theme.colors.textSecondary,
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      marginBottom: 2,
    },
    dateValue: {
      fontSize: 15,
      fontWeight: '600',
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
      borderRadius: 9,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
    },

    /* Reminder */
    reminderCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 12,
      marginTop: 12,
      borderRadius: 16,
      backgroundColor: theme.colors.background,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
    },
    reminderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: 12,
      marginRight: 8,
    },
    reminderTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.text,
    },
    reminderDesc: {
      marginTop: 2,
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },

    /* Calendar */
    calendar: {
      marginTop: 12,
      padding: 12,
      borderRadius: 16,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    calendarHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    monthArrow: {
      width: 34,
      height: 34,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
    },
    monthTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: theme.colors.text,
    },
    calendarGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    calendarCell: {
      width: `${100 / 7}%`,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    weekdayText: {
      fontSize: 11,
      fontWeight: '800',
      color: theme.colors.textLight,
    },
    dayCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
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
    quickRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 12,
    },
    quickChip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      borderWidth: 1,
    },
    quickChipText: {
      fontSize: 12,
      fontWeight: '700',
    },

    /* Error */
    errorBox: {
      marginHorizontal: 16,
      marginBottom: 12,
      padding: 14,
      borderRadius: 14,
      backgroundColor: '#FEE2E2',
      borderWidth: 1,
      borderColor: '#FCA5A5',
    },
    errorText: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.danger,
    },

    /* Actions */
    actions: {
      paddingHorizontal: 16,
      marginTop: 6,
      gap: 10,
    },
    primaryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 16,
      borderRadius: 16,
      shadowColor: theme.colors.primary,
      shadowOffset: {width: 0, height: 6},
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    },
    primaryBtnText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '800',
      letterSpacing: 0.2,
    },
    secondaryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 14,
      borderRadius: 16,
      borderWidth: 1.5,
    },
    secondaryBtnText: {
      fontSize: 15,
      fontWeight: '800',
    },
    cancelBtn: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
    },
    cancelText: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.textSecondary,
    },
  });
}

export default AddTodoScreen;