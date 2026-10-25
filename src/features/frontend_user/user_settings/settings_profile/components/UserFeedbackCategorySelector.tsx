/**
 * RESPONSIBILITY: Category selector chips for User Feedback view (≤200 lines).
 * FLOW: Renders selectable category chips with icons and handles selection state.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Bug, Lightbulb, Heart, MessageCircle } from 'lucide-react-native';
import { useThemeTokens } from '../../../../core/theme/useThemeTokens';
import { triggerLightImpact } from '../../../../core/interaction/haptics';

interface UserFeedbackCategorySelectorProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const CATEGORIES = [
  { key: 'bug', label: 'Bug', Icon: Bug },
  { key: 'feature', label: 'Feature', Icon: Lightbulb },
  { key: 'praise', label: 'Praise', Icon: Heart },
  { key: 'other', label: 'General', Icon: MessageCircle },
];

export function UserFeedbackCategorySelector({
  selectedCategory,
  onSelectCategory,
}: UserFeedbackCategorySelectorProps) {
  const tokens = useThemeTokens();

  const styles = StyleSheet.create({
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
  });

  return (
    <View style={styles.categoriesRow}>
      {CATEGORIES.map(({ key, label, Icon }) => {
        const isActive = selectedCategory === key;
        return (
          <Pressable
            key={key}
            style={[styles.categoryChip, isActive && styles.categoryChipActive]}
            onPress={() => {
              triggerLightImpact();
              onSelectCategory(key);
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
  );
}
