import React, {useEffect} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
} from 'react-native';
import {Fingerprint, ShieldCheck} from 'lucide-react-native';
import {useAppLock} from '../../context/AppLockContext';
import useTheme from '../../hooks/useTheme';

export default function LockScreen() {
  const {isLocked, authenticateWithDevice} = useAppLock();
  const {theme} = useTheme();

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

  return (
    <View
      style={[
        styles.container,
        {backgroundColor: theme.colors.background},
      ]}>
      {/* Center lock graphics */}
      <View style={styles.centerCard}>
        <View
          style={[
            styles.glowOuter,
            {
              backgroundColor: theme.colors.primary + '12',
              borderColor: theme.colors.primary + '30',
            },
          ]}>
          <Image
            source={require('../../assets/images/tasklume_icon.png')}
            style={{
              width: 74,
              height: 74,
              borderRadius: 22,
            }}
            resizeMode="cover"
          />
        </View>

        <Text style={[styles.title, {color: theme.colors.text}]}>
          Tasklume Locked
        </Text>
        <Text style={[styles.subtitle, {color: theme.colors.textSecondary}]}>
          Protected by your phone's screen lock & biometrics
        </Text>

        {/* Action Button */}
        <Pressable
          onPress={authenticateWithDevice}
          accessibilityRole="button"
          accessibilityLabel="Unlock with device lock"
          style={({pressed}) => [
            styles.unlockBtn,
            {backgroundColor: theme.colors.primary},
            pressed && {opacity: 0.85, transform: [{scale: 0.98}]},
          ]}>
          <Fingerprint size={22} color="#FFFFFF" strokeWidth={2.4} />
          <Text style={styles.unlockBtnText}>
            Tap to Unlock
          </Text>
        </Pressable>

        <View style={styles.deviceInfoRow}>
          <ShieldCheck size={14} color="#10B981" strokeWidth={2.4} />
          <Text style={[styles.deviceInfoText, {color: theme.colors.textLight}]}>
            Uses your phone's native Fingerprint / Face / Pattern / PIN
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999999,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  centerCard: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 380,
  },
  glowOuter: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 4},
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.4,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13.5,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
    lineHeight: 19,
  },
  unlockBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#F97316',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    marginBottom: 20,
  },
  unlockBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  deviceInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
  },
  deviceInfoText: {
    fontSize: 11.5,
    fontWeight: '600',
    textAlign: 'center',
  },
});
