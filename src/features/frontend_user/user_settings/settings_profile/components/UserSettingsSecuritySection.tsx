/**
 * RESPONSIBILITY: Security and Hardware Biometrics lock section for User Settings.
 * FLOW: Toggles device authentication lock backed by react-native-keychain hardware enclave.
 */

import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { Shield, Fingerprint } from 'lucide-react-native';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';
import { triggerMediumImpact } from '../../../../../core/interaction/haptics';

interface UserSettingsSecuritySectionProps {
  isLockEnabled: boolean;
  onToggleLock: () => void;
}

export function UserSettingsSecuritySection({
  isLockEnabled,
  onToggleLock,
}: UserSettingsSecuritySectionProps) {
  const tokens = useThemeTokens();

  const handleToggle = () => {
    triggerMediumImpact();
    onToggleLock();
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
    },
    leftContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: tokens.space[3],
      flex: 1,
      paddingRight: tokens.space[2],
    },
    label: {
      ...tokens.typography.body,
      color: tokens.color.foreground,
      fontWeight: '600',
    },
    sublabel: {
      ...tokens.typography.bodySm,
      color: tokens.color.muted,
      marginTop: 2,
    },
  });

  return (
    <View style={styles.section}>
      <View style={styles.row}>
        <View style={styles.leftContent}>
          <Fingerprint size={22} color={tokens.color.primary} />
          <View>
            <Text style={styles.label}>App Biometric Lock</Text>
            <Text style={styles.sublabel}>Require Face ID / Fingerprint / Device PIN</Text>
          </View>
        </View>
        <Switch
          value={isLockEnabled}
          onValueChange={handleToggle}
          trackColor={{ false: tokens.color.border, true: tokens.color.primary }}
          thumbColor={tokens.color.foreground}
          accessibilityLabel="Toggle biometric app lock"
        />
      </View>
    </View>
  );
}
