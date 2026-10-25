/**
 * RESPONSIBILITY: More Apps showcase view (≤200 lines).
 * FLOW: Renders cards for developer's suite of apps and handles store/web external navigation.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Linking } from 'react-native';
import { Globe, ExternalLink, Sparkles, Rocket, Shield, Clock, ArrowLeft } from 'lucide-react-native';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';
import { getMinTouchTarget } from '../../../../../core/theme/getMinTouchTarget';
import { triggerLightImpact } from '../../../../../core/interaction/haptics';

interface AppItem {
  id: string;
  title: string;
  description: string;
  url: string;
  tag: string;
}

const APPS: AppItem[] = [
  {
    id: '1',
    title: 'Developer Portfolio',
    description: 'Explore full-stack apps, open source projects, and designs.',
    url: 'https://github.com/RohitGrandmaster',
    tag: 'Web',
  },
  {
    id: '2',
    title: 'Focus Pomodoro Pro',
    description: 'Distraction-free productivity timer with interval tracking.',
    url: 'https://github.com/RohitGrandmaster/task-lume',
    tag: 'Productivity',
  },
  {
    id: '3',
    title: 'Expense & Budget Tracker',
    description: 'Personal finance and expense management made simple.',
    url: 'https://github.com/RohitGrandmaster',
    tag: 'Finance',
  },
];

interface UserMoreAppsMainViewProps {
  onBack?: () => void;
}

export function UserMoreAppsMainView({ onBack }: UserMoreAppsMainViewProps = {}) {
  const tokens = useThemeTokens();
  const minTarget = getMinTouchTarget();

  const handleOpenApp = async (url: string) => {
    triggerLightImpact();
    try {
      await Linking.openURL(url);
    } catch (_) {}
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
    card: {
      backgroundColor: tokens.color.card,
      borderRadius: tokens.radius.lg,
      borderWidth: 1,
      borderColor: tokens.color.border,
      padding: tokens.space[4],
      marginBottom: tokens.space[3],
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: tokens.space[2],
    },
    cardTitle: {
      ...tokens.typography.headingSm,
      color: tokens.color.foreground,
    },
    tag: {
      backgroundColor: tokens.color.primarySubtle,
      paddingHorizontal: tokens.space[2],
      paddingVertical: 2,
      borderRadius: tokens.radius.sm,
      borderWidth: 1,
      borderColor: tokens.color.primary,
    },
    tagText: {
      ...tokens.typography.labelUppercase,
      fontSize: 10,
      color: tokens.color.primaryText,
      fontWeight: '700',
    },
    description: {
      ...tokens.typography.bodySm,
      color: tokens.color.muted,
      marginBottom: tokens.space[4],
    },
    openButton: {
      height: 40,
      backgroundColor: tokens.color.card,
      borderRadius: tokens.radius.md,
      borderWidth: 1,
      borderColor: tokens.color.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: tokens.space[2],
    },
    openButtonText: {
      ...tokens.typography.labelUppercase,
      color: tokens.color.primaryText,
      fontWeight: '600',
    },
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        {onBack ? (
          <View style={styles.headerTop}>
            <Pressable
              style={styles.backButton}
              onPress={() => {
                triggerLightImpact();
                onBack();
              }}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <ArrowLeft size={20} color={tokens.color.foreground} />
            </Pressable>
            <Text style={styles.title}>More Apps</Text>
          </View>
        ) : (
          <Text style={styles.title}>More Apps</Text>
        )}
        <Text style={styles.subtitle}>Discover more tools by Rohit Kumar</Text>
      </View>

      {APPS.map((app) => (
        <View key={app.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{app.title}</Text>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{app.tag}</Text>
            </View>
          </View>
          <Text style={styles.description}>{app.description}</Text>
          <Pressable
            style={styles.openButton}
            onPress={() => handleOpenApp(app.url)}
            accessibilityRole="button"
            accessibilityLabel={`Open ${app.title}`}
          >
            <ExternalLink size={16} color={tokens.color.primary} />
            <Text style={styles.openButtonText}>View App</Text>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}
