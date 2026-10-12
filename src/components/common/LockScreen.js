import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Vibration,
} from 'react-native';
import {Lock, Delete, ShieldAlert} from 'lucide-react-native';
import {useAppLock} from '../../context/AppLockContext';
import useTheme from '../../hooks/useTheme';

const NUMBERS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

export default function LockScreen() {
  const {isLocked, unlockWithPin} = useAppLock();
  const {theme} = useTheme();
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Clear PIN whenever locked changes
  useEffect(() => {
    setPin('');
    setErrorMsg('');
  }, [isLocked]);

  if (!isLocked) return null;

  function triggerShake() {
    try {
      Vibration.vibrate(100);
    } catch (e) {}

    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 12,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -12,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 8,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -8,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }

  function handlePress(key) {
    if (!key) return;

    if (key === 'del') {
      setPin(prev => prev.slice(0, -1));
      setErrorMsg('');
      return;
    }

    if (pin.length >= 4) return;

    const newPin = pin + key;
    setPin(newPin);
    setErrorMsg('');

    if (newPin.length === 4) {
      setTimeout(() => {
        const success = unlockWithPin(newPin);
        if (!success) {
          setErrorMsg('Incorrect PIN. Try again.');
          triggerShake();
          setPin('');
        }
      }, 100);
    }
  }

  return (
    <View
      style={[
        styles.container,
        {backgroundColor: theme.colors.background},
      ]}>
      {/* Decorative top icon */}
      <View style={styles.topSection}>
        <View
          style={[
            styles.iconWrapper,
            {
              backgroundColor: theme.colors.primary + '18',
              borderColor: theme.colors.primary + '35',
            },
          ]}>
          <Lock size={32} color={theme.colors.primary} strokeWidth={2.4} />
        </View>

        <Text style={[styles.title, {color: theme.colors.text}]}>
          TodoMaster
        </Text>
        <Text style={[styles.subtitle, {color: theme.colors.textSecondary}]}>
          Enter your 4-digit PIN to unlock
        </Text>

        {/* 4 Dots indicator */}
        <Animated.View
          style={[
            styles.dotsRow,
            {transform: [{translateX: shakeAnim}]},
          ]}>
          {[0, 1, 2, 3].map(index => {
            const isFilled = pin.length > index;
            return (
              <View
                key={index}
                style={[
                  styles.dot,
                  {
                    borderColor: errorMsg
                      ? '#EF4444'
                      : theme.colors.primary,
                    backgroundColor: isFilled
                      ? errorMsg
                        ? '#EF4444'
                        : theme.colors.primary
                      : 'transparent',
                  },
                ]}
              />
            );
          })}
        </Animated.View>

        {/* Error message */}
        {errorMsg ? (
          <View style={styles.errorRow}>
            <ShieldAlert size={14} color="#EF4444" strokeWidth={2.4} />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : (
          <View style={{height: 22}} />
        )}
      </View>

      {/* Numeric Keypad */}
      <View style={styles.keypad}>
        {NUMBERS.map((key, i) => {
          if (!key) {
            return <View key={i} style={styles.keyEmpty} />;
          }

          if (key === 'del') {
            return (
              <Pressable
                key={i}
                onPress={() => handlePress('del')}
                hitSlop={10}
                style={({pressed}) => [
                  styles.keyBtn,
                  styles.keyDel,
                  pressed && {opacity: 0.6},
                ]}>
                <Delete size={22} color={theme.colors.text} strokeWidth={2.2} />
              </Pressable>
            );
          }

          return (
            <Pressable
              key={i}
              onPress={() => handlePress(key)}
              hitSlop={8}
              style={({pressed}) => [
                styles.keyBtn,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
                pressed && [
                  styles.keyPressed,
                  {backgroundColor: theme.colors.primary + '20'},
                ],
              ]}>
              <Text style={[styles.keyText, {color: theme.colors.text}]}>
                {key}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999999,
    justifyContent: 'space-between',
    paddingVertical: 50,
    paddingHorizontal: 24,
  },
  topSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  iconWrapper: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 26,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 12,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 22,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12.5,
    fontWeight: '700',
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: 320,
    alignSelf: 'center',
    gap: 16,
    marginBottom: 20,
  },
  keyBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: {width: 0, height: 2},
  },
  keyPressed: {
    transform: [{scale: 0.94}],
  },
  keyEmpty: {
    width: 76,
    height: 76,
  },
  keyDel: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
  },
  keyText: {
    fontSize: 26,
    fontWeight: '700',
  },
});
