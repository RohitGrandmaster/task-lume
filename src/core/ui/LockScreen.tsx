/**
 * RESPONSIBILITY: Canonical Lock Screen overlay preventing unauthorized app access (Rule 6, Rule 56).
 * FLOW: Listens to AppLockContext; presents biometric / PIN authentication prompt styled with Luxury Gold design tokens.
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Fingerprint, ShieldCheck } from 'lucide-react-native';
import { useAppLock } from '../../context/AppLockContext';
import { useThemeTokens } from '../theme/useThemeTokens';
import { triggerLightImpact } from '../interaction/haptics';

export function LockScreen() {
  const { isLocked, authenticateWithDevice } = useAppLock();
  const tokens = useThemeTokens();

  // Prompt device authentication automatically when locked
  useEffect(() => {
    if (isLocked) {
      const timer = setTimeout(() => {
        authenticateWithDevice();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isLocked, authenticateWithDevice]);

  if (!isLocked) return null;

  const handleUnlockPress = () => {
    triggerLightImpact();
    authenticateWithDevice();
  };

  const styles = StyleSheet.create({
    container: {
      ...StyleSheet.absoluteFill,
      zIndex: 999999,
      backgroundColor: tokens.color.background,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
    },
    centerCard: {
      alignItems: 'center',
      width: '100%',
      maxWidth: 380,
      backgroundColor: tokens.color.card,
      borderRadius: tokens.radius.xl,
      borderWidth: 1,
      borderColor: tokens.color.border,
      padding: tokens.space[6],
    },
    glowOuter: {
      width: 96,
      height: 96,
      borderRadius: 48,
      borderWidth: 2,
      borderColor: tokens.color.primary,
      backgroundColor: tokens.color.primarySubtle,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: tokens.space[4],
    },
    avatar: {
      width: 70,
      height: 70,
      borderRadius: 22,
    },
    title: {
      ...tokens.typography.headingLg,
      color: tokens.color.foreground,
      marginBottom: tokens.space[2],
      textAlign: 'center',
    },
    subtitle: {
      ...tokens.typography.bodySm,
      color: tokens.color.muted,
      textAlign: 'center',
      marginBottom: tokens.space[6],
      lineHeight: 18,
    },
    unlockBtn: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: tokens.space[2],
      paddingVertical: tokens.space[4],
      borderRadius: tokens.radius.lg,
      backgroundColor: tokens.color.primary,
      marginBottom: tokens.space[4],
    },
    unlockBtnPressed: {
      backgroundColor: tokens.color.primaryPressed,
      opacity: 0.9,
    },
    unlockBtnText: {
      ...tokens.typography.body,
      color: tokens.color.onPrimary,
      fontWeight: '800',
    },
    deviceInfoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: tokens.space[2],
    },
    deviceInfoText: {
      ...tokens.typography.caption,
      color: tokens.color.muted,
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.centerCard}>
        <View style={styles.glowOuter}>
          <Image
            source={require('../../assets/images/tasklume_icon.png')}
            style={styles.avatar}
            resizeMode="cover"
          />
        </View>

        <Text style={styles.title}>Tasklume Locked</Text>
        <Text style={styles.subtitle}>
          Protected by your phone's screen lock & biometrics
        </Text>

        <Pressable
          onPress={handleUnlockPress}
          accessibilityRole="button"
          accessibilityLabel="Unlock with device lock"
          style={({ pressed }) => [
            styles.unlockBtn,
            pressed && styles.unlockBtnPressed,
          ]}
        >
          <Fingerprint size={22} color={tokens.color.onPrimary} strokeWidth={2.4} />
          <Text style={styles.unlockBtnText}>Tap to Unlock</Text>
        </Pressable>

        <View style={styles.deviceInfoRow}>
          <ShieldCheck size={14} color={tokens.color.primary} strokeWidth={2.4} />
          <Text style={styles.deviceInfoText}>
            Uses phone's native Fingerprint / Face / PIN
          </Text>
        </View>
      </View>
    </View>
  );
}

export default LockScreen;
