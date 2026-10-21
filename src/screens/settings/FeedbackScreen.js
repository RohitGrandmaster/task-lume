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
  Linking,
  Share,
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

const CATEGORIES = [
  {key: 'bug', label: 'Bug', Icon: Bug, color: '#EF4444'},
  {key: 'feature', label: 'Feature', Icon: Lightbulb, color: '#F59E0B'},
  {key: 'praise', label: 'Praise', Icon: Heart, color: '#EC4899'},
  {key: 'other', label: 'Other', Icon: MessageCircle, color: '#6366F1'},
];

const RATING_OPTIONS = [
  {value: 1, label: 'Poor', Icon: Frown, color: '#EF4444'},
  {value: 2, label: 'Okay', Icon: Meh, color: '#F59E0B'},
  {value: 3, label: 'Good', Icon: Smile, color: '#EAB308'},
  {value: 4, label: 'Great', Icon: ThumbsUp, color: '#84CC16'},
  {value: 5, label: 'Love it', Icon: Laugh, color: '#10B981'},
];

const MAX_FEEDBACK = 500;
const FEEDBACK_EMAIL = 'tasklume.feedback@gmail.com';

function FeedbackScreen() {
  const {theme} = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme, insets), [theme, insets]);

  const [category, setCategory] = useState('feature');
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [feedback, setFeedback] = useState('');
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

  function handleBack() {
    navigation.goBack();
  }

  async function handleSubmit() {
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
    if (submitting) return;

    setSubmitting(true);

    const catLabel = CATEGORIES.find(c => c.key === category)?.label || category;
    const ratingLabel =
      RATING_OPTIONS.find(r => r.value === rating)?.label || String(rating);

    const subject = `[Tasklume Feedback] ${catLabel}: ${title.trim()}`;
    const bodyLines = [
      `Category: ${catLabel}`,
      `Rating: ${rating}/5 (${ratingLabel})`,
      '',
      title.trim(),
      '',
      feedback.trim(),
      '',
      '---',
      'Sent from Tasklume app',
    ];
    const body = bodyLines.join('\n');

    const mailtoUrl =
      `mailto:${FEEDBACK_EMAIL}` +
      '?subject=' +
      encodeURIComponent(subject) +
      '&body=' +
      encodeURIComponent(body);

    try {
      const canOpen = await Linking.canOpenURL(mailtoUrl);
      if (canOpen) {
        await Linking.openURL(mailtoUrl);
      } else {
        await Share.share({message: `${subject}\n\n${body}`, title: subject});
      }
      setSubmitted(true);
    } catch (e) {
      try {
        await Share.share({message: `${subject}\n\n${body}`, title: subject});
        setSubmitted(true);
      } catch (shareErr) {
        setError('Could not open email or share. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setCategory('feature');
    setRating(0);
    setTitle('');
    setFeedback('');
    setError('');
    setSubmitted(false);
  }

  if (submitted) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.successContainer}>
          <View style={[styles.successIconOuter, {backgroundColor: '#10B981' + '14'}]}>
            <View style={[styles.successIconInner, {backgroundColor: '#10B981'}]}>
              <CheckCircle2 size={38} color="#FFFFFF" strokeWidth={2.6} />
            </View>
          </View>

          <Text style={styles.successTitle}>Thank you!</Text>
          <Text style={styles.successText}>
            Your feedback helps us make Tasklume better. We read every single message.
          </Text>

          <View style={styles.successStatsRow}>
            <View
              style={[
                styles.successStatMini,
                {backgroundColor: theme.colors.surface, borderColor: theme.colors.border},
              ]}>
              {selectedRating && (
                <selectedRating.Icon size={16} color={selectedRating.color} strokeWidth={2.6} />
              )}
              <Text style={[styles.successStatValue, {color: theme.colors.text}]}>
                {rating}/5
              </Text>
              <Text style={[styles.successStatLabel, {color: theme.colors.textSecondary}]}>
                Rating
              </Text>
            </View>

            <View
              style={[
                styles.successStatMini,
                {backgroundColor: theme.colors.surface, borderColor: theme.colors.border},
              ]}>
              <MessageCircle size={16} color="#6366F1" strokeWidth={2.6} />
              <Text style={[styles.successStatValue, {color: theme.colors.text}]}>
                {feedback.length}
              </Text>
              <Text style={[styles.successStatLabel, {color: theme.colors.textSecondary}]}>
                Chars
              </Text>
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
            <Text style={styles.successPrimaryBtnText}>Send another</Text>
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
            <Text style={[styles.successSecondaryBtnText, {color: theme.colors.text}]}>
              Back
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

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
          <View style={styles.header}>
            <Pressable onPress={handleBack} style={styles.backBtn} hitSlop={8}>
              <ArrowLeft size={18} color={theme.colors.text} strokeWidth={2.6} />
            </Pressable>
            <View style={styles.headerContent}>
              <Text style={styles.title}>Feedback</Text>
              <Text style={styles.subtitle}>We read every message</Text>
            </View>
          </View>

          <View
            style={[
              styles.heroCard,
              {backgroundColor: theme.colors.surface, borderColor: theme.colors.border},
            ]}>
            <View style={[styles.heroIconWrap, {backgroundColor: theme.colors.primary + '18'}]}>
              <MessageCircle size={22} color={theme.colors.primary} strokeWidth={2.6} />
            </View>
            <Text style={[styles.heroTitle, {color: theme.colors.text}]}>
              How can we improve?
            </Text>
            <Text style={[styles.heroDesc, {color: theme.colors.textSecondary}]}>
              Report a bug, suggest a feature, or just say hi. Your thoughts shape Tasklume.
            </Text>
          </View>

          <Text style={styles.sectionLabel}>CATEGORY</Text>
          <View style={styles.categoryRow}>
            {CATEGORIES.map(cat => {
              const CatIcon = cat.Icon;
              const selected = category === cat.key;
              return (
                <Pressable
                  key={cat.key}
                  onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setCategory(cat.key);
                  }}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: selected ? cat.color + '18' : theme.colors.surface,
                      borderColor: selected ? cat.color : theme.colors.border,
                    },
                  ]}>
                  <CatIcon
                    size={14}
                    color={selected ? cat.color : theme.colors.textSecondary}
                    strokeWidth={2.6}
                  />
                  <Text
                    style={[
                      styles.categoryText,
                      {color: selected ? cat.color : theme.colors.textSecondary},
                    ]}>
                    {cat.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.sectionLabel}>RATING</Text>
          <View
            style={[
              styles.card,
              {backgroundColor: theme.colors.surface, borderColor: theme.colors.border},
            ]}>
            <View style={styles.ratingRow}>
              {RATING_OPTIONS.map(opt => {
                const OptIcon = opt.Icon;
                const selected = rating === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => {
                      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                      setRating(opt.value);
                    }}
                    style={[
                      styles.ratingItem,
                      {
                        backgroundColor: selected ? opt.color + '15' : theme.colors.background,
                        borderColor: selected ? opt.color : theme.colors.border,
                      },
                    ]}>
                    <OptIcon
                      size={22}
                      color={selected ? opt.color : theme.colors.textLight}
                      strokeWidth={2.4}
                    />
                    <Text
                      style={[
                        styles.ratingLabel,
                        {color: selected ? opt.color : theme.colors.textSecondary},
                      ]}
                      numberOfLines={1}>
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {rating > 0 && selectedRating && (
              <View style={[styles.ratingFeedback, {backgroundColor: selectedRating.color + '12'}]}>
                <Star
                  size={12}
                  color={selectedRating.color}
                  strokeWidth={2.6}
                  fill={selectedRating.color}
                />
                <Text style={[styles.ratingFeedbackText, {color: selectedRating.color}]}>
                  You rated us {rating} out of 5 · {selectedRating.label}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.sectionLabel}>TITLE</Text>
          <View
            style={[
              styles.inputWrap,
              {backgroundColor: theme.colors.surface, borderColor: theme.colors.border},
            ]}>
            <TextInput
              style={[styles.input, {color: theme.colors.text}]}
              placeholder="Brief summary of your feedback"
              placeholderTextColor={theme.colors.textLight}
              value={title}
              onChangeText={setTitle}
              maxLength={80}
              returnKeyType="next"
            />
          </View>

          <Text style={styles.sectionLabel}>DETAILS</Text>
          <View
            style={[
              styles.textAreaWrap,
              {backgroundColor: theme.colors.surface, borderColor: theme.colors.border},
            ]}>
            <TextInput
              style={[styles.textArea, {color: theme.colors.text}]}
              placeholder="Describe your feedback in detail..."
              placeholderTextColor={theme.colors.textLight}
              value={feedback}
              onChangeText={setFeedback}
              multiline
              maxLength={MAX_FEEDBACK}
              textAlignVertical="top"
            />
            <Text style={[styles.counterText, {color: counterColor}]}>
              {feedbackLen}/{MAX_FEEDBACK}
            </Text>
          </View>

          {!!error && (
            <View
              style={[
                styles.errorBox,
                {
                  backgroundColor: theme.colors.danger + '12',
                  borderColor: theme.colors.danger + '40',
                },
              ]}>
              <Info size={13} color={theme.colors.danger} strokeWidth={2.6} />
              <Text style={[styles.errorText, {color: theme.colors.danger}]}>
                {error}
              </Text>
            </View>
          )}

          <Pressable
            onPress={handleSubmit}
            disabled={!isFormValid || submitting}
            style={({pressed}) => [
              styles.submitBtn,
              {
                backgroundColor: isFormValid ? theme.colors.primary : theme.colors.border,
                opacity: !isFormValid || submitting ? 0.6 : pressed ? 0.9 : 1,
              },
            ]}>
            <Send size={16} color="#FFFFFF" strokeWidth={2.6} />
            <Text style={styles.submitBtnText}>
              {submitting ? 'Opening…' : 'Submit Feedback'}
            </Text>
          </Pressable>

          <View style={{height: 28}} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(theme, insets) {
  return StyleSheet.create({
    safeArea: {flex: 1, backgroundColor: theme.colors.background},
    flex: {flex: 1},
    scrollContent: {paddingHorizontal: 16, paddingBottom: insets.bottom + 24},
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingTop: 8,
      paddingBottom: 16,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    headerContent: {flex: 1},
    title: {
      fontSize: 22,
      fontWeight: '900',
      color: theme.colors.text,
      letterSpacing: -0.4,
    },
    subtitle: {
      marginTop: 2,
      fontSize: 12,
      fontWeight: '500',
      color: theme.colors.textSecondary,
    },
    heroCard: {
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      marginBottom: 18,
      alignItems: 'center',
    },
    heroIconWrap: {
      width: 48,
      height: 48,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
    },
    heroTitle: {fontSize: 16, fontWeight: '800', marginBottom: 4},
    heroDesc: {fontSize: 13, lineHeight: 19, textAlign: 'center', fontWeight: '500'},
    sectionLabel: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1.2,
      color: theme.colors.textLight,
      marginBottom: 8,
      marginTop: 4,
    },
    sectionLabelOptional: {fontWeight: '600', letterSpacing: 0.4},
    categoryRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14},
    categoryChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 99,
      borderWidth: 1.5,
    },
    categoryText: {fontSize: 12, fontWeight: '700'},
    card: {borderRadius: 16, borderWidth: 1, padding: 12, marginBottom: 14},
    ratingRow: {flexDirection: 'row', gap: 6},
    ratingItem: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1.5,
      gap: 4,
    },
    ratingLabel: {fontSize: 10, fontWeight: '700'},
    ratingFeedback: {
      marginTop: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 10,
    },
    ratingFeedbackText: {fontSize: 12, fontWeight: '700', flex: 1},
    inputWrap: {
      borderRadius: 14,
      borderWidth: 1,
      paddingHorizontal: 14,
      paddingVertical: 4,
      marginBottom: 12,
      minHeight: 48,
      justifyContent: 'center',
    },
    inputWrapWithIcon: {flexDirection: 'row', alignItems: 'center', gap: 10},
    input: {fontSize: 14, fontWeight: '500', paddingVertical: 10, flex: 1},
    textAreaWrap: {
      borderRadius: 14,
      borderWidth: 1,
      paddingHorizontal: 14,
      paddingTop: 10,
      paddingBottom: 8,
      marginBottom: 12,
      minHeight: 120,
    },
    textArea: {fontSize: 14, fontWeight: '500', minHeight: 90, textAlignVertical: 'top'},
    counterText: {fontSize: 11, fontWeight: '600', textAlign: 'right', marginTop: 4},
    helperText: {fontSize: 11, fontWeight: '500', marginBottom: 12, marginTop: -4},
    errorBox: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      marginBottom: 12,
    },
    errorText: {fontSize: 12, fontWeight: '600', flex: 1},
    submitBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 14,
      borderRadius: 14,
      marginTop: 4,
    },
    submitBtnText: {color: '#FFFFFF', fontSize: 15, fontWeight: '800'},
    successContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
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
    successStatsRow: {flexDirection: 'row', gap: 8, marginBottom: 24},
    successStatMini: {
      minWidth: 110,
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 15,
      borderWidth: 1,
    },
    successStatValue: {fontSize: 17, fontWeight: '900', marginTop: 6},
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
    },
    successPrimaryBtnText: {color: '#FFFFFF', fontSize: 14, fontWeight: '900'},
    successSecondaryBtn: {
      marginTop: 12,
      minWidth: 200,
      paddingVertical: 12,
      borderWidth: 1.5,
      borderRadius: 14,
      alignItems: 'center',
    },
    successSecondaryBtnText: {fontSize: 13, fontWeight: '800'},
  });
}

export default FeedbackScreen;
