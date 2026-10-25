/**
 * RESPONSIBILITY: Profile summary card rendered at the top of Settings.
 * FLOW: Displays user name, role/tagline, avatar, and navigates to UserProfileScreen.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { User, ChevronRight, ShieldCheck } from 'lucide-react-native';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';
import { getMinTouchTarget } from '../../../../../core/theme/getMinTouchTarget';
import { triggerLightImpact } from '../../../../../core/interaction/haptics';
import { displayValue } from '../../../../../core/utils/displayValue';

interface UserSettingsProfileCardProps {
  name: string;
  email: string;
  onPress: () => void;
}

export function UserSettingsProfileCard({
  name,
  email,
  onPress,
}: UserSettingsProfileCardProps) {
  const tokens = useThemeTokens();
  const minTarget = getMinTouchTarget();

  const handlePress = () => {
    triggerLightImpact();
    onPress();
  };

  const styles = StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: tokens.color.card,
      borderRadius: tokens.radius.lg,
      borderWidth: 1,
      borderColor: tokens.color.border,
      padding: tokens.space[4],
      marginBottom: tokens.space[4],
      minHeight: minTarget,
    },
    avatar: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: tokens.color.primarySubtle,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: tokens.color.primary,
      marginRight: tokens.space[3],
    },
    info: {
      flex: 1,
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: tokens.space[1],
    },
    name: {
      ...tokens.typography.headingSm,
      color: tokens.color.foreground,
    },
    email: {
      ...tokens.typography.bodySm,
      color: tokens.color.muted,
      marginTop: 2,
    },
  });

  return (
    <Pressable
      style={styles.card}
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={name ? `Profile settings for ${name}` : 'Profile settings'}
    >
      <View style={styles.avatar}>
        <User size={24} color={tokens.color.primary} />
      </View>
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{displayValue(name)}</Text>
          <ShieldCheck size={16} color={tokens.color.primary} />
        </View>
        <Text style={styles.email} numberOfLines={1}>{displayValue(email)}</Text>
      </View>
      <ChevronRight size={20} color={tokens.color.muted} />
    </Pressable>
  );
}
