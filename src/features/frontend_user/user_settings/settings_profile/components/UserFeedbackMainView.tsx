/**
 * RESPONSIBILITY: User Feedback submission view (≤200 lines).
 * FLOW: Composes UserFeedbackCategorySelector, star rating, feedback message, and submit button.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable } from 'react-native';
import { Star, Send, ArrowLeft } from 'lucide-react-native';
import { UserFeedbackCategorySelector } from './UserFeedbackCategorySelector';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';
import { getMinTouchTarget } from '../../../../../core/theme/getMinTouchTarget';
import { triggerSuccessNotification, triggerLightImpact } from '../../../../../core/interaction/haptics';

interface UserFeedbackMainViewProps {
  onSubmit: (feedback: { category: string; rating: number; message: string }) => void;
  onBack?: () => void;
}

export function UserFeedbackMainView({ onSubmit, onBack }: UserFeedbackMainViewProps) {
  const tokens = useThemeTokens();
  const minTarget = getMinTouchTarget();
  const [selectedCategory, setSelectedCategory] = useState('feature');
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    triggerSuccessNotification();
    onSubmit({ category: selectedCategory, rating, message });
    setMessage('');
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: tokens.color.background,
    },
    scrollContent: {
      padding: tokens.space[4],
      paddingBottom: tokens.space[9],
    },
    header: {
      marginBottom: tokens.space[4],
    },
    headerTop: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: tokens.space[2],
      gap: tokens.space[2],
    },
    backButton: {
      width: minTarget,
      height: minTarget,
      borderRadius: tokens.radius.md,
      backgroundColor: tokens.color.card,
      borderWidth: 1,
      borderColor: tokens.color.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      ...tokens.typography.headingLg,
      color: tokens.color.foreground,
    },
    subtitle: {
      ...tokens.typography.bodySm,
      color: tokens.color.muted,
      marginTop: 2,
    },
    sectionCard: {
      backgroundColor: tokens.color.card,
      borderRadius: tokens.radius.lg,
      borderWidth: 1,
      borderColor: tokens.color.border,
      padding: tokens.space[4],
      marginBottom: tokens.space[4],
    },
    sectionTitle: { ...tokens.typography.body, color: tokens.color.foreground, fontWeight: '600', marginBottom: tokens.space[3] },
    starsRow: { flexDirection: 'row', gap: tokens.space[3], alignItems: 'center' },
    starButton: { padding: tokens.space[2] },
    input: { height: 120, borderWidth: 1, borderColor: tokens.color.border, borderRadius: tokens.radius.md, padding: tokens.space[3], color: tokens.color.foreground, textAlignVertical: 'top', ...tokens.typography.body, marginBottom: tokens.space[4] },
    submitButton: { height: minTarget, backgroundColor: tokens.color.primary, borderRadius: tokens.radius.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: tokens.space[2] },
    submitButtonText: { ...tokens.typography.labelUppercase, color: tokens.color.onPrimary, fontWeight: '700' },
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          {onBack ? (
            <Pressable
              style={styles.backButton}
              onPress={() => {
                triggerLightImpact();
                onBack();
              }}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={8}
            >
              <ArrowLeft size={20} color={tokens.color.foreground} strokeWidth={2.2} />
            </Pressable>
          ) : null}
          <Text style={styles.title}>Send Feedback</Text>
        </View>
        <Text style={styles.subtitle}>Help make TaskLume even better</Text>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Category</Text>
        <UserFeedbackCategorySelector
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Experience Rating</Text>
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Pressable
              key={star}
              style={styles.starButton}
              onPress={() => {
                triggerLightImpact();
                setRating(star);
              }}
              accessibilityRole="button"
              accessibilityLabel={`Rate ${star} stars`}
            >
              <Star
                size={28}
                color={star <= rating ? tokens.color.primary : tokens.color.border}
                fill={star <= rating ? tokens.color.primary : 'transparent'}
              />
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Your Thoughts</Text>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          multiline={true}
          placeholder="Tell us what you love or what we should improve..."
          placeholderTextColor={tokens.color.muted}
        />
        <Pressable
          style={styles.submitButton}
          onPress={handleSubmit}
          accessibilityRole="button"
          accessibilityLabel="Submit feedback"
        >
          <Send size={18} color={tokens.color.onPrimary} />
          <Text style={styles.submitButtonText}>Submit Feedback</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
