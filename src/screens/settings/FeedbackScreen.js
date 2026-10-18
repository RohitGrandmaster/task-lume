import {LocalizedText, LocalizedTextInput} from '../../i18n/LocalizedText';
import React, {useMemo, useState} from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  LayoutAnimation,
  UIManager,
  Animated
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {
  ArrowLeft,
  Star,
  Bug,
  Lightbulb,
  Heart,
  MessageCircle,
  Mail,
  Send,
  CheckCircle2,
  Info,
  Smile,
  Frown,
  Meh,
  Laugh,
  ThumbsUp,
} from 'lucide-react-native';

import {useTheme} from '../../hooks/useTheme';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/* --------------------------- CONSTANTS --------------------------- */

const CATEGORIES = [
  {
    key: 'bug',
    label: 'Bug',
    Icon: Bug,
    color: '#EF4444',
  },
  {
    key: 'feature',
    label: 'Feature',
    Icon: Lightbulb,
    color: '#F59E0B',
  },
  {
    key: 'praise',
    label: 'Praise',
    Icon: Heart,
    color: '#EC4899',
  },
  {
    key: 'other',
    label: 'Other',
    Icon: MessageCircle,
    color: '#6366F1',
  },
];

const RATING_OPTIONS = [
  {value: 1, label: 'Poor', Icon: Frown, color: '#EF4444'},
  {value: 2, label: 'Okay', Icon: Meh, color: '#F59E0B'},
  {value: 3, label: 'Good', Icon: Smile, color: '#EAB308'},
  {value: 4, label: 'Great', Icon: ThumbsUp, color: '#84CC16'},
  {value: 5, label: 'Love it', Icon: Laugh, color: '#10B981'},
];

const MAX_FEEDBACK = 500;

/* --------------------------- SCREEN --------------------------- */

function FeedbackScreen() {
  const {theme} = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const styles = useMemo(
    () => createStyles(theme, insets),
    [theme, insets],
  );

  const [category, setCategory] = useState('feature');
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [feedback, setFeedback] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isFormValid =
    rating > 0 && feedback.trim().length >= 10 && title.trim().length >= 3;

  const feedbackLen = feedback.length;
  const counterColor =
    feedbackLen >= MAX_FEEDBACK
      ? theme.colors.danger
      : feedbackLen >= MAX_FEEDBACK * 0.8
      ? '#F59E0B'
      : theme.colors.textLight;

  const selectedRating = RATING_OPTIONS.find(r => r.value === rating);

  /* --------------------------- HANDLERS --------------------------- */
  function handleBack() {
    navigation.goBack();
  }

  function handleSubmit() {
    setError('');

    if (!rating) {
      setError('Please select a rating');
      return;
    }
    if (title.trim().length < 3) {
      setError('Title must be at least 3 characters');
      return;
    }
    if (feedback.trim().length < 10) {
      setError('Feedback must be at least 10 characters');
      return;
    }
    if (email && !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }
    if (submitting) return;

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 700);
  }

  function handleReset() {
    setCategory('feature');
    setRating(0);
    setTitle('');
    setFeedback('');
    setEmail('');
    setError('');
    setSubmitted(false);
  }

  /* --------------------------- SUCCESS SCREEN --------------------------- */
  if (submitted) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.successContainer}>
          <View
            style={[
              styles.successIconOuter,
              {backgroundColor: '#10B981' + '14'},
            ]}>
            <View
              style={[
                styles.successIconInner,
                {backgroundColor: '#10B981'},
              ]}>
              <CheckCircle2
                size={38}
                color="#FFFFFF"
                strokeWidth={2.6}
              />
            </View>
          </View>

          <LocalizedText style={styles.successTitle}>Thank you!</LocalizedText>
          <LocalizedText style={styles.successText}>
            Your feedback helps us make Tasklume better. We read every
            single message.
          </LocalizedText>

          <View style={styles.successStatsRow}>
            <View
              style={[
                styles.successStatMini,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}>
              {selectedRating && (
                <selectedRating.Icon
                  size={16}
                  color={selectedRating.color}
                  strokeWidth={2.6}
                />
              )}
              <LocalizedText
                style={[
                  styles.successStatValue,
                  {color: theme.colors.text},
                ]}>
                {rating}/5
              </LocalizedText>
              <LocalizedText
                style={[
                  styles.successStatLabel,
                  {color: theme.colors.textSecondary},
                ]}>
                Rating
              </LocalizedText>
            </View>

            <View
              style={[
                styles.successStatMini,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}>
              <MessageCircle
                size={16}
                color="#6366F1"
                strokeWidth={2.6}
              />
              <LocalizedText
                style={[
                  styles.successStatValue,
                  {color: theme.colors.text},
                ]}>
                {feedback.length}
              </LocalizedText>
              <LocalizedText
                style={[
                  styles.successStatLabel,
                  {color: theme.colors.textSecondary},
                ]}>
                Chars
              </LocalizedText>
            </View>
          </View>

          <Pressable
            onPress={handleReset}
            style={({pressed}) => [
              styles.successPrimaryBtn,
              {
                backgroundColor: theme.colors.primary,
                shadowColor: theme.colors.primary,
                opacity: pressed ? 0.9 : 1,
              },
            ]}>
            <Send size={15} color="#FFFFFF" strokeWidth={2.6} />
            <LocalizedText style={styles.successPrimaryBtnText}>
              Send another
            </LocalizedText>
          </Pressable>

          <Pressable
            onPress={handleBack}
            style={({pressed}) => [
              styles.successSecondaryBtn,
              {
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surface,
                opacity: pressed ? 0.85 : 1,
              },
            ]}>
            <LocalizedText
              style={[
                styles.successSecondaryBtnText,
                {color: theme.colors.text},
              ]}>
              Back to settings
            </LocalizedText>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  /* --------------------------- MAIN FORM --------------------------- */
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
              <LocalizedText style={styles.title}>Feedback</LocalizedText>
              <LocalizedText style={styles.subtitle}>
                We read every message
              </LocalizedText>
            </View>
          </View>

          {/* HERO */}
          <View
            style={[
              styles.heroCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}>
            <View
              style={[
                styles.heroIconWrap,
                {backgroundColor: theme.colors.primary + '18'},
              ]}>
              <MessageCircle
                size={22}
                color={theme.colors.primary}
                strokeWidth={2.6}
              />
            </View>
            <LocalizedText
              style={[styles.heroTitle, {color: theme.colors.text}]}>
              How can we improve?
            </LocalizedText>
            <LocalizedText
              style={[
                styles.heroDesc,
                {color: theme.colors.textSecondary},
              ]}>
              Report a bug, suggest a feature, or just say hi. Your
              thoughts shape Tasklume.
            </LocalizedText>
          </View>

          {/* CATEGORY */}
          <LocalizedText style={styles.sectionLabel}>CATEGORY</LocalizedText>
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
                  accessibilityLabel={`Category ${cat.label}`}
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
                    size={14}
                    color={selected ? cat.color : theme.colors.textSecondary}
                    strokeWidth={2.6}
                  />
                  <LocalizedText
                    style={[
                      styles.categoryText,
                      {
                        color: selected
                          ? cat.color
                          : theme.colors.textSecondary,
                      },
                    ]}>
                    {cat.label}
                  </LocalizedText>
                </Pressable>
              );
            })}
          </View>

          {/* RATING */}
          <LocalizedText style={styles.sectionLabel}>RATING</LocalizedText>
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}>
            <View style={styles.ratingRow}>
              {RATING_OPTIONS.map(opt => {
                const OptIcon = opt.Icon;
                const selected = rating === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => {
                      LayoutAnimation.configureNext(
                        LayoutAnimation.Presets.easeInEaseOut,
                      );
                      setRating(opt.value);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={`Rate ${opt.label}`}
                    style={[
                      styles.ratingItem,
                      {
                        backgroundColor: selected
                          ? opt.color + '15'
                          : theme.colors.background,
                        borderColor: selected
                          ? opt.color
                          : theme.colors.border,
                      },
                    ]}>
                    <OptIcon
                      size={22}
                      color={
                        selected ? opt.color : theme.colors.textLight
                      }
                      strokeWidth={2.4}
                    />
                    <LocalizedText
                      style={[
                        styles.ratingLabel,
                        {
                          color: selected
                            ? opt.color
                            : theme.colors.textSecondary,
                        },
                      ]}
                      numberOfLines={1}>
                      {opt.label}
                    </LocalizedText>
                  </Pressable>
                );
              })}
            </View>

            {rating > 0 && (
              <View
                style={[
                  styles.ratingFeedback,
                  {backgroundColor: selectedRating.color + '12'},
                ]}>
                <Star
                  size={12}
                  color={selectedRating.color}
                  strokeWidth={2.6}
                  fill={selectedRating.color}
                />
                <LocalizedText
                  style={[
                    styles.ratingFeedbackText,
                    {color: selectedRating.color},
                  ]}>
                  You rated us {rating} out of 5 · {selectedRating.label}
                </LocalizedText>
              </View>
            )}
          </View>

          {/* TITLE */}
          <LocalizedText style={styles.sectionLabel}>TITLE</LocalizedText>
          <View
            style={[
              styles.inputWrap,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}>
            <LocalizedTextInput
              style={[styles.input, {color: theme.colors.text}]}
              placeholder="Brief summary of your feedback"
              placeholderTextColor={theme.colors.textLight}
              value={title}
              onChangeText={setTitle}
              maxLength={80}
              returnKeyType="next"
            />
          </View>

          {/* DETAILS */}
          <LocalizedText style={styles.sectionLabel}>DETAILS</LocalizedText>
          <View
            style={[
              styles.textAreaWrap,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}>
            <LocalizedTextInput
              style={[styles.textArea, {color: theme.colors.text}]}
              placeholder="Describe your feedback in detail..."
              placeholderTextColor={theme.colors.textLight}
              value={feedback}
              onChangeText={setFeedback}
              multiline
              maxLength={MAX_FEEDBACK}
              textAlignVertical="top"
            />
            <LocalizedText
              style={[
                styles.counterText,
                {color: counterColor},
              ]}>
              {feedbackLen}/{MAX_FEEDBACK}
            </LocalizedText>
          </View>

          {/* EMAIL (OPTIONAL) */}
          <LocalizedText style={styles.sectionLabel}>
            EMAIL <LocalizedText style={styles.sectionLabelOptional}>(optional)</LocalizedText>
          </LocalizedText>
          <View
            style={[
              styles.inputWrap,
              styles.inputWrapWithIcon,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}>
            <Mail
              size={15}
              color={theme.colors.textLight}
              strokeWidth={2.4}
            />
            <LocalizedTextInput
              style={[styles.input, {color: theme.colors.text}]}
              placeholder="you@example.com"
              placeholderTextColor={theme.colors.textLight}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={80}
            />
          </View>
          <LocalizedText
            style={[
              styles.helperText,
              {color: theme.colors.textLight},
            ]}>
            We'll only use this to reply to your feedback
          </LocalizedText>

          {/* ERROR */}
          {!!error && (
            <View
              style={[
                styles.errorBox,
                {
                  backgroundColor: theme.colors.danger + '12',
                  borderColor: theme.colors.danger + '40',
                },
              ]}>
              <Info
                size={13}
                color={theme.colors.danger}
                strokeWidth={2.6}
              />
              <LocalizedText
                style={[
                  styles.errorText,
                  {color: theme.colors.danger},
                ]}>
                {error}
              </LocalizedText>
            </View>
          )}

          {/* SUBMIT */}
          <Pressable
            onPress={handleSubmit}
            disabled={!isFormValid || submitting}
            accessibilityRole="button"
            accessibilityLabel="Submit feedback"
            style={({pressed}) => [
              styles.submitBtn,
              {
                backgroundColor: isFormValid
                  ? theme.colors.primary
                  : theme.colors.border,
                shadowColor: isFormValid
                  ? theme.colors.primary
                  : 'transparent',
                opacity: pressed ? 0.9 : 1,
              },
            ]}>
            <Send
              size={16}
              color={isFormValid ? '#FFFFFF' : theme.colors.textLight}
              strokeWidth={2.6}
            />
            <LocalizedText
              style={[
                styles.submitBtnText,
                {
                  color: isFormValid
                    ? '#FFFFFF'
                    : theme.colors.textLight,
                },
              ]}>
              {submitting ? 'Sending...' : 'Submit Feedback'}
            </LocalizedText>
          </Pressable>

          {/* TIP */}
          <View
            style={[
              styles.tipCard,
              {
                backgroundColor: theme.colors.primary + '0D',
                borderColor: theme.colors.primary + '25',
              },
            ]}>
            <View
              style={[
                styles.tipIconWrap,
                {backgroundColor: theme.colors.primary + '18'},
              ]}>
              <Lightbulb
                size={14}
                color={theme.colors.primary}
                strokeWidth={2.6}
              />
            </View>
            <View style={{flex: 1, minWidth: 0}}>
              <LocalizedText
                style={[
                  styles.tipTitle,
                  {color: theme.colors.primary},
                ]}>
                What makes feedback great?
              </LocalizedText>
              <LocalizedText
                style={[
                  styles.tipText,
                  {color: theme.colors.text},
                ]}>
                Mention what you were doing, what you expected, and what
                happened instead. Screenshots help too!
              </LocalizedText>
            </View>
          </View>

          <View style={{height: 20}} />
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
      gap: 12,
      marginBottom: 18,
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

    /* Hero */
    heroCard: {
      alignItems: 'center',
      padding: 20,
      borderRadius: 20,
      borderWidth: 1,
      marginBottom: 18,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.05,
      shadowRadius: 12,
      elevation: 2,
    },
    heroIconWrap: {
      width: 54,
      height: 54,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    heroTitle: {
      fontSize: 17,
      fontWeight: '900',
      letterSpacing: -0.3,
      marginBottom: 6,
      textAlign: 'center',
    },
    heroDesc: {
      fontSize: 13,
      fontWeight: '500',
      textAlign: 'center',
      lineHeight: 19,
      maxWidth: 280,
      letterSpacing: 0.1,
    },

    /* Section label */
    sectionLabel: {
      fontSize: 10.5,
      fontWeight: '900',
      letterSpacing: 1.4,
      color: theme.colors.textLight,
      marginTop: 6,
      marginBottom: 8,
      marginLeft: 4,
    },
    sectionLabelOptional: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 0.5,
      color: theme.colors.textLight,
      textTransform: 'none',
    },

    /* Category */
    categoryRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 16,
    },
    categoryChip: {
      flex: 1,
      minWidth: 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
      paddingVertical: 10,
      paddingHorizontal: 6,
      borderRadius: 12,
      borderWidth: 1.5,
    },
    categoryText: {
      fontSize: 11.5,
      fontWeight: '800',
      letterSpacing: 0.2,
    },

    /* Card */
    card: {
      padding: 14,
      borderRadius: 18,
      borderWidth: 1,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 3},
      shadowOpacity: 0.04,
      shadowRadius: 10,
      elevation: 2,
    },

    /* Rating */
    ratingRow: {
      flexDirection: 'row',
      gap: 6,
    },
    ratingItem: {
      flex: 1,
      minWidth: 0,
      minHeight: 70,
      borderWidth: 1.5,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      paddingHorizontal: 4,
    },
    ratingLabel: {
      fontSize: 9,
      fontWeight: '800',
      marginTop: 5,
      letterSpacing: 0.1,
    },
    ratingFeedback: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 12,
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: 10,
    },
    ratingFeedbackText: {
      flex: 1,
      fontSize: 11.5,
      fontWeight: '800',
      letterSpacing: 0.1,
    },

    /* Input */
    inputWrap: {
      paddingHorizontal: 14,
      paddingVertical: 4,
      borderRadius: 14,
      borderWidth: 1.5,
      marginBottom: 14,
    },
    inputWrapWithIcon: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 2,
    },
    input: {
      flex: 1,
      fontSize: 14,
      fontWeight: '600',
      paddingVertical: 11,
      padding: 0,
      letterSpacing: -0.1,
    },
    textAreaWrap: {
      paddingHorizontal: 14,
      paddingTop: 12,
      paddingBottom: 8,
      borderRadius: 14,
      borderWidth: 1.5,
      marginBottom: 14,
    },
    textArea: {
      minHeight: 120,
      fontSize: 14,
      fontWeight: '500',
      padding: 0,
      lineHeight: 20,
      letterSpacing: -0.1,
    },
    counterText: {
      alignSelf: 'flex-end',
      marginTop: 6,
      fontSize: 10.5,
      fontWeight: '800',
      letterSpacing: 0.2,
    },
    helperText: {
      fontSize: 10.5,
      fontWeight: '600',
      letterSpacing: 0.1,
      marginTop: -8,
      marginBottom: 14,
      marginLeft: 4,
    },

    /* Error */
    errorBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1,
      marginBottom: 14,
    },
    errorText: {
      flex: 1,
      fontSize: 12,
      fontWeight: '700',
      letterSpacing: 0.1,
    },

    /* Submit */
    submitBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      height: 54,
      borderRadius: 16,
      marginTop: 6,
      shadowOffset: {width: 0, height: 6},
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 5,
    },
    submitBtnText: {
      fontSize: 14.5,
      fontWeight: '900',
      letterSpacing: 0.2,
    },

    /* Tip */
    tipCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
      padding: 14,
      borderRadius: 16,
      borderWidth: 1,
      marginTop: 14,
    },
    tipIconWrap: {
      width: 32,
      height: 32,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    tipTitle: {
      fontSize: 12,
      fontWeight: '900',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      marginBottom: 3,
    },
    tipText: {
      fontSize: 12.5,
      fontWeight: '600',
      lineHeight: 18,
      letterSpacing: 0.1,
    },

    /* Success */
    successContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 28,
    },
    successIconOuter: {
      width: 110,
      height: 110,
      borderRadius: 36,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 22,
    },
    successIconInner: {
      width: 78,
      height: 78,
      borderRadius: 26,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#10B981',
      shadowOffset: {width: 0, height: 8},
      shadowOpacity: 0.35,
      shadowRadius: 16,
      elevation: 8,
    },
    successTitle: {
      fontSize: 26,
      fontWeight: '900',
      color: theme.colors.text,
      letterSpacing: -0.6,
      textAlign: 'center',
      marginBottom: 8,
    },
    successText: {
      fontSize: 14,
      lineHeight: 21,
      textAlign: 'center',
      color: theme.colors.textSecondary,
      maxWidth: 300,
      fontWeight: '500',
      marginBottom: 22,
    },
    successStatsRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 24,
    },
    successStatMini: {
      minWidth: 110,
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 15,
      borderWidth: 1,
    },
    successStatValue: {
      fontSize: 17,
      fontWeight: '900',
      letterSpacing: -0.4,
      marginTop: 6,
      lineHeight: 19,
    },
    successStatLabel: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 0.4,
      marginTop: 2,
      textTransform: 'uppercase',
    },
    successPrimaryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      minWidth: 200,
      paddingVertical: 14,
      borderRadius: 14,
      shadowOffset: {width: 0, height: 6},
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 5,
    },
    successPrimaryBtnText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '900',
      letterSpacing: 0.2,
    },
    successSecondaryBtn: {
      marginTop: 12,
      minWidth: 200,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderWidth: 1.5,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    successSecondaryBtnText: {
      fontSize: 13,
      fontWeight: '800',
      letterSpacing: 0.2,
    },
  });
}

export default FeedbackScreen;