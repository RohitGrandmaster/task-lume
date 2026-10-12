import {
  View,
  Text,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {useState} from 'react';

import AppLogo from '../../components/common/AppLogo';
import AppButton from '../../components/common/AppButton';
import AppInput from '../../components/common/AppInput';

import useAuth from '../../hooks/useAuth';
import useTheme from '../../hooks/useTheme';

import {
  validateForgotPassword,
} from '../../utils/validation';

function ForgotPasswordScreen({
  navigation,
}) {
  const {theme} = useTheme();
  const {
    resetPassword,
  } = useAuth();

  const styles = createStyles(theme);

  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    setError('');
    setMessage('');

    const validationError = validateForgotPassword(identifier);

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    const result = await resetPassword(identifier.trim());

    setLoading(false);

    if (!result.success) {
      setError(result.message);
      return;
    }

    setMessage(result.message);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <View style={styles.container}>
            <Pressable
              style={styles.backButton}
              onPress={() => navigation.goBack()}>
              <Text style={styles.backText}>‹</Text>
            </Pressable>

            <AppLogo size="small" />

            <View style={styles.heading}>
              <Text style={styles.title}>Forgot password?</Text>
              <Text style={styles.subtitle}>
                Enter your registered mobile number or email to reset your password.
              </Text>
            </View>

            <AppInput
              label="Mobile Number or Email"
              placeholder="Enter registered mobile or email"
              value={identifier}
              onChangeText={text => {
                setIdentifier(text);
                if (error) setError('');
              }}
              keyboardType="default"
              error={error}
            />

            {message ? (
              <Text style={styles.success}>{message}</Text>
            ) : null}

            <AppButton
              title="Reset Password"
              onPress={handleReset}
              loading={loading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },

    keyboard: {
      flex: 1,
    },

    scrollContent: {
      flexGrow: 1,
    },

    container: {
      flex: 1,
      padding: theme.spacing.xxl,
      paddingVertical: theme.spacing.xl,
    },

    backButton: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },

    backText: {
      fontSize: 38,
      color: theme.colors.text,
    },

    heading: {
      marginTop: 48,
      marginBottom: theme.spacing.xxl,
    },

    title: {
      fontSize: 30,
      fontWeight: '800',
      color: theme.colors.text,
    },

    subtitle: {
      marginTop: theme.spacing.sm,
      fontSize: theme.typography.body,
      lineHeight: 23,
      color: theme.colors.textSecondary,
    },

    success: {
      marginBottom: theme.spacing.lg,
      fontSize: theme.typography.bodySmall,
      lineHeight: 20,
      color: theme.colors.success,
    },
  });
}

export default ForgotPasswordScreen;