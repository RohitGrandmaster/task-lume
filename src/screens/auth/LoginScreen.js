import {
  Text,
  View,
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
  validateLogin,
} from '../../utils/validation';

import ROUTES from '../../constants/routes';

function LoginScreen({navigation}) {
  const {theme} = useTheme();
  const {login} = useAuth();

  const styles = createStyles(theme);

  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError('');

    const validationError = validateLogin(mobile, password);

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    const result = await login(mobile.trim(), password);

    setLoading(false);

    if (!result.success) {
      setError(result.message);
    }
  }

  function fillDemoCredentials() {
    setMobile('9876543210');
    setPassword('password123');
    setError('');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
            <AppLogo />

            <View style={styles.heading}>
              <Text style={styles.title}>Welcome back</Text>
              <Text style={styles.subtitle}>
                Sign in with your mobile number to access your tasks.
              </Text>
            </View>

            <AppInput
              label="Mobile Number"
              placeholder="Enter 10-digit mobile number"
              value={mobile}
              onChangeText={text => {
                setMobile(text);
                if (error) setError('');
              }}
              keyboardType="phone-pad"
              maxLength={15}
            />

            <AppInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={text => {
                setPassword(text);
                if (error) setError('');
              }}
              secureTextEntry={!showPassword}
              rightLabel={showPassword ? 'Hide' : 'Show'}
              onRightPress={() => setShowPassword(current => !current)}
              error={error}
            />

            <AppButton
              title="Login"
              onPress={handleLogin}
              loading={loading}
            />

            {/* Demo Quick Fill */}
            <Pressable
              style={[
                styles.demoCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={fillDemoCredentials}>
              <Text style={[styles.demoLabel, {color: theme.colors.primary}]}>
                Demo Account:
              </Text>
              <Text
                style={[
                  styles.demoValue,
                  {color: theme.colors.textSecondary},
                ]}>
                9876543210 • password123 (Tap to autofill)
              </Text>
            </Pressable>

            <Pressable
              style={styles.forgot}
              onPress={() => navigation.navigate(ROUTES.FORGOT_PASSWORD)}>
              <Text style={styles.link}>Forgot password?</Text>
            </Pressable>

            <View style={styles.signupRow}>
              <Text style={styles.bottomText}>
                Don't have an account?
              </Text>
              <Pressable
                onPress={() => navigation.navigate(ROUTES.SIGNUP)}>
                <Text style={styles.signupLink}>Sign up</Text>
              </Pressable>
            </View>
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
      justifyContent: 'center',
      padding: theme.spacing.xxl,
      paddingVertical: theme.spacing.xxxl,
    },

    heading: {
      marginTop: 48,
      marginBottom: theme.spacing.xxl,
    },

    title: {
      fontSize: 32,
      fontWeight: '800',
      color: theme.colors.text,
    },

    subtitle: {
      marginTop: theme.spacing.sm,
      fontSize: theme.typography.body,
      lineHeight: 23,
      color: theme.colors.textSecondary,
    },

    forgot: {
      alignSelf: 'center',
      marginTop: theme.spacing.lg,
    },

    link: {
      fontSize: theme.typography.bodySmall,
      fontWeight: '700',
      color: theme.colors.primary,
    },

    demoCard: {
      marginTop: theme.spacing.lg,
      padding: theme.spacing.md,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      alignItems: 'center',
    },

    demoLabel: {
      fontSize: 12,
      fontWeight: '700',
      marginBottom: 2,
    },

    demoValue: {
      fontSize: 11,
      fontWeight: '500',
    },

    signupRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: theme.spacing.xxxl,
    },

    bottomText: {
      fontSize: theme.typography.bodySmall,
      color: theme.colors.textSecondary,
    },

    signupLink: {
      marginLeft: theme.spacing.xs,
      fontSize: theme.typography.bodySmall,
      fontWeight: '800',
      color: theme.colors.primary,
    },
  });
}

export default LoginScreen;