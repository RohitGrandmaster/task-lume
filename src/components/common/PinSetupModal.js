import React, {useState, useEffect} from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import {Lock, KeyRound, X, Delete, Check} from 'lucide-react-native';
import useTheme from '../../hooks/useTheme';

const NUMBERS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

export default function PinSetupModal({
  visible,
  mode = 'setup', // 'setup' | 'disable' | 'change'
  onClose,
  onSuccess,
  storedPin,
}) {
  const {theme} = useTheme();
  const [step, setStep] = useState(1); // 1: enter, 2: confirm
  const [pin1, setPin1] = useState('');
  const [pin2, setPin2] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setStep(1);
      setPin1('');
      setPin2('');
      setError('');
    }
  }, [visible, mode]);

  const activePin = step === 1 ? pin1 : pin2;

  function handlePress(key) {
    if (!key) return;

    if (key === 'del') {
      if (step === 1) {
        setPin1(prev => prev.slice(0, -1));
      } else {
        setPin2(prev => prev.slice(0, -1));
      }
      setError('');
      return;
    }

    if (activePin.length >= 4) return;

    const nextPin = activePin + key;

    if (step === 1) {
      setPin1(nextPin);
      setError('');
      if (nextPin.length === 4) {
        if (mode === 'disable') {
          // Check current pin
          if (String(nextPin) === String(storedPin)) {
            onSuccess?.(nextPin);
          } else {
            setError('Incorrect current PIN');
            setPin1('');
          }
        } else {
          // Move to confirm step
          setTimeout(() => {
            setStep(2);
          }, 150);
        }
      }
    } else {
      setPin2(nextPin);
      setError('');
      if (nextPin.length === 4) {
        if (nextPin === pin1) {
          onSuccess?.(nextPin);
        } else {
          setError('PINs do not match. Try again.');
          setPin2('');
        }
      }
    }
  }

  const title =
    mode === 'disable'
      ? 'Enter Current PIN'
      : step === 1
      ? mode === 'change'
        ? 'Enter New PIN'
        : 'Set 4-Digit PIN'
      : 'Confirm Your PIN';

  const subtitle =
    mode === 'disable'
      ? 'Enter your PIN to disable App Lock'
      : step === 1
      ? 'Choose a 4-digit code to protect TodoMaster'
      : 'Re-enter the same 4-digit PIN';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}>
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <KeyRound size={22} color={theme.colors.primary} strokeWidth={2.4} />
            </View>

            <Text style={[styles.title, {color: theme.colors.text}]}>
              {title}
            </Text>
            <Text style={[styles.subtitle, {color: theme.colors.textSecondary}]}>
              {subtitle}
            </Text>

            {/* Dots */}
            <View style={styles.dotsRow}>
              {[0, 1, 2, 3].map(i => {
                const isFilled = activePin.length > i;
                return (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      {
                        borderColor: error
                          ? '#EF4444'
                          : theme.colors.primary,
                        backgroundColor: isFilled
                          ? error
                            ? '#EF4444'
                            : theme.colors.primary
                          : 'transparent',
                      },
                    ]}
                  />
                );
              })}
            </View>

            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : (
              <View style={{height: 18}} />
            )}
          </View>

          {/* Keypad */}
          <View style={styles.keypad}>
            {NUMBERS.map((key, i) => {
              if (!key) return <View key={i} style={styles.keyEmpty} />;
              if (key === 'del') {
                return (
                  <Pressable
                    key={i}
                    onPress={() => handlePress('del')}
                    style={({pressed}) => [
                      styles.keyBtn,
                      styles.keyDel,
                      pressed && {opacity: 0.6},
                    ]}>
                    <Delete size={20} color={theme.colors.text} strokeWidth={2.2} />
                  </Pressable>
                );
              }
              return (
                <Pressable
                  key={i}
                  onPress={() => handlePress(key)}
                  style={({pressed}) => [
                    styles.keyBtn,
                    {
                      backgroundColor: theme.colors.background,
                      borderColor: theme.colors.border,
                    },
                    pressed && {backgroundColor: theme.colors.primary + '20'},
                  ]}>
                  <Text style={[styles.keyText, {color: theme.colors.text}]}>
                    {key}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            onPress={onClose}
            style={[
              styles.cancelBtn,
              {backgroundColor: theme.colors.background, borderColor: theme.colors.border},
            ]}>
            <Text style={[styles.cancelText, {color: theme.colors.textSecondary}]}>
              Cancel
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  sheet: {
    width: '100%',
    maxWidth: 500,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    paddingTop: 20,
    paddingBottom: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    width: '100%',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12.5,
    fontWeight: '500',
    marginBottom: 16,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 8,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
    height: 18,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    maxWidth: 280,
    marginVertical: 10,
  },
  keyBtn: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyEmpty: {
    width: 66,
    height: 66,
  },
  keyDel: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  keyText: {
    fontSize: 22,
    fontWeight: '700',
  },
  cancelBtn: {
    marginTop: 12,
    width: '100%',
    maxWidth: 280,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 13.5,
    fontWeight: '700',
  },
});
