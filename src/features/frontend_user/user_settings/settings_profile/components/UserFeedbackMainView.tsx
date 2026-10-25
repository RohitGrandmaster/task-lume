/**
 * RESPONSIBILITY: User Feedback submission view (≤200 lines).
 * FLOW: Renders category chips, star/reaction rating, comments input, and submit action.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable } from 'react-native';
import { Bug, Lightbulb, Heart, MessageCircle, Star, Send } from 'lucide-react-native';
import { useThemeTokens } from '../../../../core/theme/useThemeTokens';
import { getMinTouchTarget } from '../../../../core/theme/getMinTouchTarget';
import { triggerSuccessNotification, triggerLightImpact } from '../../../../core/interaction/haptics';

interface UserFeedbackMainViewProps {
  onSubmit: (feedback: { category: string; rating: number; message: string }) => void;
}

const CATEGORIES = [
  { key: 'bug', label: 'Bug', Icon: Bug },
  { key: 'feature', label: 'Feature', Icon: Lightbulb },
  { key: 'praise', label: 'Praise', Icon: Heart },
  { key: 'other', label: 'General', Icon: MessageCircle },
];

export function UserFeedbackMainView({ onSubmit }: UserFeedbackMainViewProps) {
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
    sectionTitle: {
      ...tokens.typography.body,
      color: tokens.color.foreground,
      fontWeight: '600',
      marginBottom: tokens.space[3],
    },
    categoriesRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: tokens.space[2],
    },
    categoryChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: tokens.space[2],
      paddingHorizontal: tokens.space[3],
      height: 40,
      borderRadius: tokens.radius.md,
      borderWidth: 1,
      borderColor: tokens.color.border,
      backgroundColor: tokens.color.card,
    },
    categoryChipActive: {
      borderColor: tokens.color.primary,
      backgroundColor: tokens.color.primarySubtle,
    },
    categoryText: {
      ...tokens.typography.bodySm,
      color: tokens.color.foreground,
    },
    categoryTextActive: {
      color: tokens.color.primaryText,
      fontWeight: '600',
    },
    starsRow: {
      flexDirection: 'row',
      gap: tokens.space[3],
      alignItems: 'center',
    },
    starButton: {
      padding: tokens.space[2],
    },
    input: {
      height: 120,
      borderWidth: 1,
      borderColor: tokens.color.border,
      borderRadius: tokens.radius.md,
      padding: tokens.space[3],
      color: tokens.color.foreground,
      textAlignVertical: 'top',
      ...tokens.typography.body,
      marginBottom: tokens.space[4],
    },
    submitButton: {
      height: minTarget,
      backgroundColor: tokens.color.primary,
      borderRadius: tokens.radius.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: tokens.space[2],
    },
    submitButtonText: {
      ...tokens.typography.labelUppercase,
      color: tokens.color.onPrimary,
      fontWeight: '700',
    },
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.title}>Send Feedback</Text>
        <Text style={styles.subtitle}>Help make TaskLume even better</Text>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Category</Text>
        <View style={styles.categoriesRow}>
          {CATEGORIES.map(({ key, label, Icon }) => {
            const isActive = selectedCategory === key;
            return (
              <Pressable
                key={key}
                style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                onPress={() => {
                  triggerLightImpact();
                  setSelectedCategory(key);
                }}
                accessibilityRole="button"
                accessibilityLabel={`Select category ${label}`}
              >
                <Icon size={16} color={isActive ? tokens.color.primary : tokens.color.muted} />
                <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
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
