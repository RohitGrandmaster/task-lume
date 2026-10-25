/**
 * RESPONSIBILITY: About Developer view for Rohit Kumar (≤200 lines).
 * FLOW: Displays developer credentials, avatar, tagline, and direct WhatsApp/Instagram contact buttons.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Linking, Alert } from 'react-native';
import { User, MessageCircle, Instagram, Globe, Heart, Code2 } from 'lucide-react-native';
import { useThemeTokens } from '../../../../core/theme/useThemeTokens';
import { getMinTouchTarget } from '../../../../core/theme/getMinTouchTarget';
import { triggerLightImpact } from '../../../../core/interaction/haptics';

const DEVELOPER = {
  name: 'Rohit Kumar',
  role: 'Software Engineer & Grandmaster',
  tagline: 'Develop & Design with Precision',
  whatsapp: '918084350824',
  instagram: 'hacking_grand_master',
  portfolio: 'https://github.com/RohitGrandmaster',
};

export function UserAboutMainView() {
  const tokens = useThemeTokens();
  const minTarget = getMinTouchTarget();

  const handleOpenWhatsApp = async () => {
    triggerLightImpact();
    const url = `https://wa.me/${DEVELOPER.whatsapp}`;
    try {
      await Linking.openURL(url);
    } catch (_) {
      Alert.alert('Notice', 'Unable to open WhatsApp.');
    }
  };

  const handleOpenInstagram = async () => {
    triggerLightImpact();
    const url = `https://www.instagram.com/${DEVELOPER.instagram}/`;
    try {
      await Linking.openURL(url);
    } catch (_) {
      Alert.alert('Notice', 'Unable to open Instagram.');
    }
  };

  const handleOpenPortfolio = async () => {
    triggerLightImpact();
    try {
      await Linking.openURL(DEVELOPER.portfolio);
    } catch (_) {
      Alert.alert('Notice', 'Unable to open Portfolio.');
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: tokens.color.background,
    },
    scrollContent: {
      padding: tokens.space[4],
      paddingBottom: tokens.space[9],
      alignItems: 'center',
    },
    avatarWrapper: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: tokens.color.card,
      borderWidth: 2,
      borderColor: tokens.color.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: tokens.space[4],
      marginBottom: tokens.space[3],
    },
    name: {
      ...tokens.typography.headingLg,
      color: tokens.color.foreground,
      textAlign: 'center',
    },
    role: {
      ...tokens.typography.body,
      color: tokens.color.primaryText,
      fontWeight: '600',
      marginTop: 2,
    },
    tagline: {
      ...tokens.typography.bodySm,
      color: tokens.color.muted,
      marginTop: 4,
      marginBottom: tokens.space[6],
      textAlign: 'center',
    },
    card: {
      width: '100%',
      backgroundColor: tokens.color.card,
      borderRadius: tokens.radius.lg,
      borderWidth: 1,
      borderColor: tokens.color.border,
      padding: tokens.space[4],
      marginBottom: tokens.space[4],
    },
    button: {
      width: '100%',
      height: minTarget,
      backgroundColor: tokens.color.card,
      borderRadius: tokens.radius.md,
      borderWidth: 1,
      borderColor: tokens.color.border,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: tokens.space[4],
      marginBottom: tokens.space[3],
      gap: tokens.space[3],
    },
    buttonHighlight: {
      borderColor: tokens.color.primary,
      backgroundColor: tokens.color.primarySubtle,
    },
    buttonText: {
      ...tokens.typography.body,
      color: tokens.color.foreground,
      fontWeight: '600',
      flex: 1,
    },
    version: {
      ...tokens.typography.caption,
      color: tokens.color.muted,
      marginTop: tokens.space[4],
      textAlign: 'center',
    },
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.avatarWrapper}>
        <User size={48} color={tokens.color.primary} />
      </View>
      <Text style={styles.name}>{DEVELOPER.name}</Text>
      <Text style={styles.role}>{DEVELOPER.role}</Text>
      <Text style={styles.tagline}>{DEVELOPER.tagline}</Text>

      <View style={styles.card}>
        <Pressable
          style={[styles.button, styles.buttonHighlight]}
          onPress={handleOpenWhatsApp}
          accessibilityRole="button"
          accessibilityLabel="Connect on WhatsApp"
        >
          <MessageCircle size={20} color={tokens.color.primary} />
          <Text style={styles.buttonText}>Connect on WhatsApp</Text>
        </Pressable>

        <Pressable
          style={styles.button}
          onPress={handleOpenInstagram}
          accessibilityRole="button"
          accessibilityLabel="Follow on Instagram"
        >
          <Instagram size={20} color={tokens.color.primary} />
          <Text style={styles.buttonText}>Follow on Instagram</Text>
        </Pressable>

        <Pressable
          style={styles.button}
          onPress={handleOpenPortfolio}
          accessibilityRole="button"
          accessibilityLabel="GitHub Portfolio"
        >
          <Code2 size={20} color={tokens.color.primary} />
          <Text style={styles.buttonText}>GitHub Developer Profile</Text>
        </Pressable>
      </View>

      <Text style={styles.version}>TaskLume · Built with Luxury Gold React Native Architecture</Text>
    </ScrollView>
  );
}
