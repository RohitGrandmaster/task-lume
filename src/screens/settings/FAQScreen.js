import React, {useMemo, useState} from 'react';
import {
  TextInput,
  Text,
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {
  ArrowLeft,
  Search,
  X,
  HelpCircle,
  MessageCircle,
  ChevronDown,
  Lightbulb,
  Layers,
  CheckSquare,
  Sparkles,
  Bug,
  Inbox,
  ThumbsUp,
  Mail,
  Send,
} from 'lucide-react-native';

import {useTheme} from '../../hooks/useTheme';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/* --------------------------- DATA --------------------------- */

const FAQS = [
  {
    id: '1',
    category: 'tasks',
    question: 'How do I create a new task?',
    answer:
      'Open the Task screen and tap the + button. Enter your task details such as title, description, category, priority and due date, then save it.',
  },
  {
    id: '2',
    category: 'tasks',
    question: 'Can I edit an existing task?',
    answer:
      'Yes. Open a task from your task list and choose the Edit option. Update the information you need and save your changes.',
  },
  {
    id: '3',
    category: 'tasks',
    question: 'How do I mark a task as completed?',
    answer:
      'Tap the checkbox on an active task. The task will be marked as completed and will move into your completed tasks.',
  },
  {
    id: '4',
    category: 'features',
    question: 'Can I save tasks as favorites?',
    answer:
      'Yes. Important tasks can be marked as favorites and will appear in the Favorites section for quick access.',
  },
  {
    id: '5',
    category: 'tasks',
    question: 'What happens when I delete a task?',
    answer:
      'Deleted tasks are moved to the Trash section. From there they can later be restored or permanently deleted.',
  },
  {
    id: '6',
    category: 'general',
    question: 'Does Tasklume support dark mode?',
    answer:
      'Yes. You can switch between light and dark mode from the Drawer menu. Your selected theme is saved on the device.',
  },
  {
    id: '7',
    category: 'general',
    question: 'Are my tasks saved after I close the app?',
    answer:
      'Tasks are stored locally on your device so your data can remain available when you reopen the app.',
  },
  {
    id: '8',
    category: 'features',
    question: 'Does the Pomodoro timer work in the background?',
    answer:
      'The current version focuses on the in-app timer experience. Background notifications and advanced timer behavior can be added later.',
  },
  {
    id: '9',
    category: 'features',
    question: 'Can I use different task categories?',
    answer:
      'Yes. Tasks can be organized into categories such as Personal, Work, Learning, Shopping, Health and Project.',
  },
  {
    id: '10',
    category: 'general',
    question: 'Will Tasklume support cloud sync?',
    answer:
      'The current version uses local storage. Cloud sync and account-based backup can be connected in a future update.',
  },
];

const CATEGORIES = [
  {key: 'all', label: 'All', Icon: Layers, color: '#6366F1'},
  {key: 'tasks', label: 'Tasks', Icon: CheckSquare, color: '#3B82F6'},
  {key: 'features', label: 'Features', Icon: Sparkles, color: '#8B5CF6'},
  {key: 'general', label: 'General', Icon: Lightbulb, color: '#F59E0B'},
];

/* --------------------------- SCREEN --------------------------- */

function FAQScreen() {
  const {theme} = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const styles = useMemo(
    () => createStyles(theme, insets),
    [theme, insets],
  );

  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [category, setCategory] = useState('all');
  const [openId, setOpenId] = useState(null);
  const [helpfulIds, setHelpfulIds] = useState(new Set());

  /* --------------------------- FILTER --------------------------- */
  const filteredFaqs = useMemo(() => {
    let list = FAQS;

    if (category !== 'all') {
      list = list.filter(f => f.category === category);
    }

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        f =>
          f.question.toLowerCase().includes(q) ||
          f.answer.toLowerCase().includes(q),
      );
    }

    return list;
  }, [category, search]);

  /* --------------------------- HANDLERS --------------------------- */
  function handleBack() {
    navigation.goBack();
  }

  function toggleFAQ(id) {
    LayoutAnimation.configureNext(
      LayoutAnimation.Presets.easeInEaseOut,
    );
    setOpenId(cur => (cur === id ? null : id));
  }

  function toggleHelpful(id) {
    LayoutAnimation.configureNext(
      LayoutAnimation.Presets.easeInEaseOut,
    );
    setHelpfulIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function clearSearch() {
    setSearch('');
  }

  function toggleSearch() {
    LayoutAnimation.configureNext(
      LayoutAnimation.Presets.easeInEaseOut,
    );
    setSearchOpen(v => !v);
    if (searchOpen) setSearch('');
  }

  function goToFeedback() {
    navigation.navigate('Feedback');
  }

  /* --------------------------- RENDER --------------------------- */
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={styles.scrollContent}>
          {/* HEADER */}
          <View style={styles.header}>
            <Pressable
              onPress={handleBack}
              style={styles.backBtn}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Go back">
              <ArrowLeft
                size={18}
                color={theme.colors.text}
                strokeWidth={2.6}
              />
            </Pressable>

            <View style={styles.headerContent}>
              <Text style={styles.title}>FAQ</Text>
              <Text style={styles.subtitle}>
                Find answers to common questions
              </Text>
            </View>

            <Pressable
              onPress={toggleSearch}
              style={styles.headerIconBtn}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel="Toggle search">
              <Search
                size={16}
                color={theme.colors.text}
                strokeWidth={2.6}
              />
            </Pressable>
          </View>

          {/* SEARCH */}
          {searchOpen && (
            <View
              style={[
                styles.searchBar,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}>
              <Search
                size={15}
                color={theme.colors.textSecondary}
                strokeWidth={2.4}
              />
              <TextInput
                style={[
                  styles.searchInput,
                  {color: theme.colors.text},
                ]}
                placeholder="Search FAQs..."
                placeholderTextColor={theme.colors.textLight}
                value={search}
                onChangeText={setSearch}
                autoFocus
                returnKeyType="search"
              />
              {search.length > 0 && (
                <Pressable onPress={clearSearch} hitSlop={8}>
                  <X
                    size={14}
                    color={theme.colors.textSecondary}
                    strokeWidth={2.6}
                  />
                </Pressable>
              )}
            </View>
          )}

          {/* HELP CARD (tappable) */}
          <Pressable
            onPress={goToFeedback}
            accessibilityRole="button"
            accessibilityLabel="Open feedback"
            style={({pressed}) => [
              styles.helpCard,
              {
                backgroundColor: theme.colors.primary + '10',
                borderColor: theme.colors.primary + '25',
                opacity: pressed ? 0.9 : 1,
              },
            ]}>
            <View
              style={[
                styles.helpIconWrap,
                {backgroundColor: theme.colors.primary + '18'},
              ]}>
              <MessageCircle
                size={20}
                color={theme.colors.primary}
                strokeWidth={2.6}
              />
            </View>

            <View style={styles.helpContent}>
              <Text
                style={[styles.helpTitle, {color: theme.colors.text}]}>
                Can't find your answer?
              </Text>
              <Text
                style={[
                  styles.helpText,
                  {color: theme.colors.textSecondary},
                ]}>
                Tap to send us feedback
              </Text>
            </View>

            <View
              style={[
                styles.helpArrow,
                {backgroundColor: theme.colors.primary + '14'},
              ]}>
              <Send
                size={13}
                color={theme.colors.primary}
                strokeWidth={2.8}
              />
            </View>
          </Pressable>

          {/* CATEGORY CHIPS */}
          <View style={styles.categoryRow}>
            {CATEGORIES.map(cat => {
              const CatIcon = cat.Icon;
              const selected = category === cat.key;
              return (
                <Pressable
                  key={cat.key}
                  onPress={() => {
                    LayoutAnimation.configureNext(
                      LayoutAnimation.Presets.easeInEaseOut,
                    );
                    setCategory(cat.key);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={`Filter ${cat.label}`}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: selected
                        ? cat.color + '18'
                        : theme.colors.surface,
                      borderColor: selected
                        ? cat.color
                        : theme.colors.border,
                    },
                  ]}>
                  <CatIcon
                    size={12}
                    color={
                      selected ? cat.color : theme.colors.textSecondary
                    }
                    strokeWidth={2.6}
                  />
                  <Text
                    style={[
                      styles.categoryText,
                      {
                        color: selected
                          ? cat.color
                          : theme.colors.textSecondary,
                      },
                    ]}>
                    {cat.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* SECTION TITLE with count */}
          <View style={styles.sectionRow}>
            <Text
              style={[styles.sectionTitle, {color: theme.colors.text}]}>
              Frequently Asked
            </Text>
            <View
              style={[
                styles.sectionCount,
                {backgroundColor: theme.colors.primary + '14'},
              ]}>
              <Text
                style={[
                  styles.sectionCountText,
                  {color: theme.colors.primary},
                ]}>
                {filteredFaqs.length}
              </Text>
            </View>
          </View>

          {/* FAQ LIST */}
          {filteredFaqs.length === 0 ? (
            <View
              style={[
                styles.emptyCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}>
              <View
                style={[
                  styles.emptyIconWrap,
                  {backgroundColor: theme.colors.background},
                ]}>
                <Inbox
                  size={28}
                  color={theme.colors.textLight}
                  strokeWidth={1.8}
                />
              </View>
              <Text
                style={[styles.emptyTitle, {color: theme.colors.text}]}>
                {search.trim()
                  ? 'No matching FAQs'
                  : 'No FAQs in this category'}
              </Text>
              <Text
                style={[
                  styles.emptyDesc,
                  {color: theme.colors.textSecondary},
                ]}>
                {search.trim()
                  ? 'Try a different keyword or category.'
                  : 'Try another category to find your answer.'}
              </Text>
            </View>
          ) : (
            filteredFaqs.map((item, index) => {
              const isOpen = openId === item.id;
              const isHelpful = helpfulIds.has(item.id);

              return (
                <View
                  key={item.id}
                  style={[
                    styles.faqCard,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: isOpen
                        ? theme.colors.primary + '55'
                        : theme.colors.border,
                    },
                  ]}>
                  <Pressable
                    onPress={() => toggleFAQ(item.id)}
                    accessibilityRole="button"
                    accessibilityLabel={item.question}
                    style={styles.questionBtn}>
                    <View
                      style={[
                        styles.questionNumber,
                        {
                          backgroundColor: isOpen
                            ? theme.colors.primary + '18'
                            : theme.colors.background,
                        },
                      ]}>
                      <Text
                        style={[
                          styles.questionNumberText,
                          {
                            color: isOpen
                              ? theme.colors.primary
                              : theme.colors.textSecondary,
                          },
                        ]}>
                        {String(index + 1).padStart(2, '0')}
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.question,
                        {color: theme.colors.text},
                      ]}>
                      {item.question}
                    </Text>

                    <View
                      style={[
                        styles.expandBtn,
                        {
                          backgroundColor: isOpen
                            ? theme.colors.primary + '14'
                            : theme.colors.background,
                        },
                      ]}>
                      <ChevronDown
                        size={15}
                        color={
                          isOpen
                            ? theme.colors.primary
                            : theme.colors.textSecondary
                        }
                        strokeWidth={2.8}
                        style={{
                          transform: [
                            {rotate: isOpen ? '180deg' : '0deg'},
                          ],
                        }}
                      />
                    </View>
                  </Pressable>

                  {isOpen && (
                    <View
                      style={[
                        styles.answerWrap,
                        {borderTopColor: theme.colors.border},
                      ]}>
                      <Text
                        style={[
                          styles.answer,
                          {color: theme.colors.textSecondary},
                        ]}>
                        {item.answer}
                      </Text>

                      {/* Helpful feedback */}
                      <View
                        style={[
                          styles.helpfulRow,
                          {
                            backgroundColor: theme.colors.background,
                            borderColor: theme.colors.border,
                          },
                        ]}>
                        <Text
                          style={[
                            styles.helpfulLabel,
                            {color: theme.colors.textSecondary},
                          ]}>
                          {isHelpful
                            ? 'Thanks for your feedback!'
                            : 'Was this helpful?'}
                        </Text>
                        <Pressable
                          onPress={() => toggleHelpful(item.id)}
                          hitSlop={6}
                          accessibilityRole="button"
                          accessibilityLabel={
                            isHelpful
                              ? 'Mark as not helpful'
                              : 'Mark as helpful'
                          }
                          style={[
                            styles.helpfulBtn,
                            {
                              backgroundColor: isHelpful
                                ? theme.colors.success + '20'
                                : theme.colors.surface,
                              borderColor: isHelpful
                                ? theme.colors.success
                                : theme.colors.border,
                            },
                          ]}>
                          <ThumbsUp
                            size={11}
                            color={
                              isHelpful
                                ? theme.colors.success
                                : theme.colors.textSecondary
                            }
                            strokeWidth={2.8}
                            fill={isHelpful ? theme.colors.success : 'transparent'}
                          />
                          <Text
                            style={[
                              styles.helpfulBtnText,
                              {
                                color: isHelpful
                                  ? theme.colors.success
                                  : theme.colors.textSecondary,
                              },
                            ]}>
                            {isHelpful ? 'Thanks' : 'Helpful'}
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  )}
                </View>
              );
            })
          )}

          {/* BOTTOM CTA */}
          <Pressable
            onPress={goToFeedback}
            accessibilityRole="button"
            accessibilityLabel="Send feedback"
            style={({pressed}) => [
              styles.bottomCta,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                opacity: pressed ? 0.9 : 1,
              },
            ]}>
            <View
              style={[
                styles.bottomCtaIcon,
                {backgroundColor: theme.colors.primary + '18'},
              ]}>
              <Mail
                size={16}
                color={theme.colors.primary}
                strokeWidth={2.6}
              />
            </View>
            <View style={{flex: 1, minWidth: 0}}>
              <Text
                style={[
                  styles.bottomCtaTitle,
                  {color: theme.colors.text},
                ]}>
                Still need help?
              </Text>
              <Text
                style={[
                  styles.bottomCtaDesc,
                  {color: theme.colors.textSecondary},
                ]}
                numberOfLines={1}>
                Send us your question directly
              </Text>
            </View>
            <Send
              size={15}
              color={theme.colors.primary}
              strokeWidth={2.6}
            />
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* --------------------------- STYLES --------------------------- */

function createStyles(theme, insets) {
  return StyleSheet.create({
    flex: {flex: 1},
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: Math.max(insets.bottom, 12) + 30,
    },

    /* Header */
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 16,
    },
    backBtn: {
      width: 42,
      height: 42,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    headerContent: {
      flex: 1,
      minWidth: 0,
    },
    title: {
      fontSize: 24,
      fontWeight: '900',
      color: theme.colors.text,
      letterSpacing: -0.6,
    },
    subtitle: {
      marginTop: 2,
      fontSize: 12,
      fontWeight: '500',
      color: theme.colors.textSecondary,
      letterSpacing: 0.1,
    },
    headerIconBtn: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },

    /* Search */
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 14,
      borderWidth: 1,
      marginBottom: 12,
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
      fontWeight: '600',
      padding: 0,
      letterSpacing: -0.1,
    },

    /* Help card */
    helpCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 14,
      paddingHorizontal: 14,
      borderRadius: 18,
      borderWidth: 1,
      marginBottom: 14,
    },
    helpIconWrap: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    helpContent: {
      flex: 1,
      minWidth: 0,
    },
    helpTitle: {
      fontSize: 14,
      fontWeight: '900',
      letterSpacing: -0.2,
    },
    helpText: {
      fontSize: 11.5,
      fontWeight: '600',
      marginTop: 2,
      letterSpacing: 0.1,
    },
    helpArrow: {
      width: 30,
      height: 30,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },

    /* Category */
    categoryRow: {
      flexDirection: 'row',
      gap: 6,
      marginBottom: 18,
    },
    categoryChip: {
      flex: 1,
      minWidth: 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      paddingVertical: 9,
      paddingHorizontal: 6,
      borderRadius: 12,
      borderWidth: 1.5,
    },
    categoryText: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.1,
    },

    /* Section title */
    sectionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 17,
      fontWeight: '900',
      letterSpacing: -0.3,
    },
    sectionCount: {
      minWidth: 24,
      height: 22,
      paddingHorizontal: 7,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sectionCountText: {
      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 0.2,
    },

    /* FAQ card */
    faqCard: {
      borderWidth: 1.5,
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 10,
    },
    questionBtn: {
      minHeight: 62,
      paddingHorizontal: 12,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    questionNumber: {
      width: 32,
      height: 32,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    questionNumberText: {
      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 0.2,
    },
    question: {
      flex: 1,
      fontSize: 13.5,
      fontWeight: '800',
      lineHeight: 19,
      letterSpacing: -0.1,
    },
    expandBtn: {
      width: 30,
      height: 30,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },

    /* Answer */
    answerWrap: {
      borderTopWidth: 1,
      paddingHorizontal: 14,
      paddingTop: 12,
      paddingBottom: 12,
    },
    answer: {
      fontSize: 13,
      lineHeight: 20,
      fontWeight: '500',
      letterSpacing: 0.1,
    },

    /* Helpful */
    helpfulRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      marginTop: 14,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 12,
      borderWidth: 1,
    },
    helpfulLabel: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.2,
      flex: 1,
    },
    helpfulBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 9,
      borderWidth: 1.5,
    },
    helpfulBtnText: {
      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 0.2,
    },

    /* Empty */
    emptyCard: {
      alignItems: 'center',
      padding: 30,
      borderRadius: 18,
      borderWidth: 1,
      marginBottom: 12,
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
      fontWeight: '900',
      letterSpacing: -0.3,
      marginBottom: 4,
      textAlign: 'center',
    },
    emptyDesc: {
      fontSize: 12.5,
      fontWeight: '500',
      textAlign: 'center',
      lineHeight: 18,
      maxWidth: 260,
    },

    /* Bottom CTA */
    bottomCta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 14,
      paddingHorizontal: 12,
      borderRadius: 16,
      borderWidth: 1,
      marginTop: 14,
    },
    bottomCtaIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    bottomCtaTitle: {
      fontSize: 13.5,
      fontWeight: '900',
      letterSpacing: -0.2,
    },
    bottomCtaDesc: {
      fontSize: 11,
      fontWeight: '600',
      marginTop: 2,
      letterSpacing: 0.1,
    },
  });
}

export default FAQScreen;