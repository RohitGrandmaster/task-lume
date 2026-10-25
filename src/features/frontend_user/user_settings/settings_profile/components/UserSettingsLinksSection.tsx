/**
 * RESPONSIBILITY: Navigational links section in Settings for Support, FAQ, More Apps, and About.
 * FLOW: Dispatches route changes to specialized settings sub-views.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { HelpCircle, MessageSquare, AppWindow, User, Shield, FileText, ChevronRight } from 'lucide-react-native';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';
import { getMinTouchTarget } from '../../../../../core/theme/getMinTouchTarget';
import { triggerLightImpact } from '../../../../../core/interaction/haptics';
import { showToast } from '../../../../../core/toast/showToast';

interface UserSettingsLinksSectionProps {
  onOpenFaq: () => void;
  onOpenFeedback: () => void;
  onOpenMoreApps: () => void;
  onOpenAbout: () => void;
}

export function UserSettingsLinksSection({
  onOpenFaq,
  onOpenFeedback,
  onOpenMoreApps,
  onOpenAbout,
}: UserSettingsLinksSectionProps) {
  const tokens = useThemeTokens();
  const minTarget = getMinTouchTarget();

  const handleNav = (action: () => void) => {
    triggerLightImpact();
    action();
  };

  const handleLegal = (title: string) => {
    triggerLightImpact();
    showToast(`${title} details available in developer documentation.`, 'info');
  };

  const styles = StyleSheet.create({
    section: {
      backgroundColor: tokens.color.card,
      borderRadius: tokens.radius.lg,
      borderWidth: 1,
      borderColor: tokens.color.border,
      marginBottom: tokens.space[4],
      overflow: 'hidden',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: tokens.space[4],
      minHeight: minTarget,
      borderBottomWidth: 1,
      borderBottomColor: tokens.color.border,
    },
    lastRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: tokens.space[4],
      minHeight: minTarget,
    },
    leftContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: tokens.space[3],
    },
    label: {
      ...tokens.typography.body,
      color: tokens.color.foreground,
      fontWeight: '500',
    },
  });

  return (
    <View style={styles.section}>
      <Pressable
        style={styles.row}
        onPress={() => handleNav(onOpenFaq)}
        accessibilityRole="button"
        accessibilityLabel="Frequently Asked Questions"
      >
        <View style={styles.leftContent}>
          <HelpCircle size={18} color={tokens.color.primary} />
          <Text style={styles.label}>FAQ & Help Guide</Text>
        </View>
        <ChevronRight size={18} color={tokens.color.muted} />
      </Pressable>

      <Pressable
        style={styles.row}
        onPress={() => handleNav(onOpenFeedback)}
        accessibilityRole="button"
        accessibilityLabel="Send Feedback"
      >
        <View style={styles.leftContent}>
          <MessageSquare size={18} color={tokens.color.primary} />
          <Text style={styles.label}>Send Feedback & Suggestions</Text>
        </View>
        <ChevronRight size={18} color={tokens.color.muted} />
      </Pressable>

      <Pressable
        style={styles.row}
        onPress={() => handleNav(onOpenMoreApps)}
        accessibilityRole="button"
        accessibilityLabel="More Apps by Developer"
      >
        <View style={styles.leftContent}>
          <AppWindow size={18} color={tokens.color.primary} />
          <Text style={styles.label}>More Apps by Developer</Text>
        </View>
        <ChevronRight size={18} color={tokens.color.muted} />
      </Pressable>

      <Pressable
        style={styles.row}
        onPress={() => handleNav(onOpenAbout)}
        accessibilityRole="button"
        accessibilityLabel="About Developer Rohit Kumar"
      >
        <View style={styles.leftContent}>
          <User size={18} color={tokens.color.primary} />
          <Text style={styles.label}>About Developer (Rohit Kumar)</Text>
        </View>
        <ChevronRight size={18} color={tokens.color.muted} />
      </Pressable>

      <Pressable
        style={styles.row}
        onPress={() => handleLegal('Privacy Policy')}
        accessibilityRole="button"
        accessibilityLabel="Privacy Policy"
      >
        <View style={styles.leftContent}>
          <Shield size={18} color={tokens.color.primary} />
          <Text style={styles.label}>Privacy Policy</Text>
        </View>
        <ChevronRight size={18} color={tokens.color.muted} />
      </Pressable>

      <Pressable
        style={styles.lastRow}
        onPress={() => handleLegal('Terms of Service')}
        accessibilityRole="button"
        accessibilityLabel="Terms of Service"
      >
        <View style={styles.leftContent}>
          <FileText size={18} color={tokens.color.primary} />
          <Text style={styles.label}>Terms of Service</Text>
        </View>
        <ChevronRight size={18} color={tokens.color.muted} />
      </Pressable>
    </View>
  );
}

