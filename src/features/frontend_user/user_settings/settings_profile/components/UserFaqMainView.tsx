/**
 * RESPONSIBILITY: Searchable FAQ accordion view for User Settings (≤200 lines).
 * FLOW: Renders searchable categorized FAQ list with collapsible question cards.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable } from 'react-native';
import { Search, ChevronDown, ChevronUp, HelpCircle, ArrowLeft } from 'lucide-react-native';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';
import { getMinTouchTarget } from '../../../../../core/theme/getMinTouchTarget';
import { triggerLightImpact } from '../../../../../core/interaction/haptics';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    id: '1',
    question: 'How do I create a new task?',
    answer: 'Tap the gold + FAB button on the Tasks screen. Fill in title, due date, category, and priority, then save.',
  },
  {
    id: '2',
    question: 'How does Pomodoro focus work?',
    answer: 'Select a 25-minute focus session on the Focus tab, attach a task if desired, and hit Play. You will be notified when time is up.',
  },
  {
    id: '3',
    question: 'How do I enable biometric lock?',
    answer: 'In Settings, toggle "App Biometric Lock". Your device Face ID, fingerprint, or system PIN will be used to secure your tasks.',
  },
  {
    id: '4',
    question: 'How can I backup my data?',
    answer: 'Go to Settings > Backup Tasks (JSON). You can export your data anytime and restore it if you change devices.',
  },
];

interface UserFaqMainViewProps {
  onBack?: () => void;
}

export function UserFaqMainView({ onBack }: UserFaqMainViewProps = {}) {
  const tokens = useThemeTokens();
  const minTarget = getMinTouchTarget();
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>('1');

  const filtered = FAQS.filter(
    (f) =>
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase())
  );

  const toggleExpand = (id: string) => {
    triggerLightImpact();
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: tokens.color.background },
    scrollContent: { padding: tokens.space[4], paddingBottom: tokens.space[9] },
    header: { marginBottom: tokens.space[4] },
    headerTop: { flexDirection: 'row', alignItems: 'center', marginBottom: tokens.space[2], gap: tokens.space[2] },
    backButton: { width: minTarget, height: minTarget, borderRadius: tokens.radius.md, backgroundColor: tokens.color.card, borderWidth: 1, borderColor: tokens.color.border, alignItems: 'center', justifyContent: 'center' },
    title: { ...tokens.typography.headingLg, color: tokens.color.foreground },
    subtitle: { ...tokens.typography.bodySm, color: tokens.color.muted, marginTop: 2 },
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: tokens.color.card, borderWidth: 1, borderColor: tokens.color.border, borderRadius: tokens.radius.md, paddingHorizontal: tokens.space[3], height: minTarget, marginBottom: tokens.space[4] },
    searchInput: { flex: 1, marginLeft: tokens.space[2], color: tokens.color.foreground, ...tokens.typography.body },
    faqCard: { backgroundColor: tokens.color.card, borderRadius: tokens.radius.lg, borderWidth: 1, borderColor: tokens.color.border, marginBottom: tokens.space[3], overflow: 'hidden' },
    faqHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: tokens.space[4], minHeight: minTarget },
    question: { ...tokens.typography.body, color: tokens.color.foreground, fontWeight: '600', flex: 1, paddingRight: tokens.space[2] },
    answerContainer: { padding: tokens.space[4], paddingTop: 0, borderTopWidth: 1, borderTopColor: tokens.color.border },
    answer: { ...tokens.typography.bodySm, color: tokens.color.muted, lineHeight: 20, marginTop: tokens.space[3] },
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
          <Text style={styles.title}>FAQ & Help Guide</Text>
        </View>
        <Text style={styles.subtitle}>Frequently asked questions</Text>
      </View>

      <View style={styles.searchContainer}>
        <Search size={18} color={tokens.color.muted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search questions..."
          placeholderTextColor={tokens.color.muted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {filtered.map((item) => {
        const isExpanded = expandedId === item.id;
        return (
          <View key={item.id} style={styles.faqCard}>
            <Pressable
              style={styles.faqHeader}
              onPress={() => toggleExpand(item.id)}
              accessibilityRole="button"
              accessibilityLabel={`FAQ: ${item.question}`}
            >
              <Text style={styles.question}>{item.question}</Text>
              {isExpanded ? (
                <ChevronUp size={20} color={tokens.color.primary} />
              ) : (
                <ChevronDown size={20} color={tokens.color.muted} />
              )}
            </Pressable>
            {isExpanded && (
              <View style={styles.answerContainer}>
                <Text style={styles.answer}>{item.answer}</Text>
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}
