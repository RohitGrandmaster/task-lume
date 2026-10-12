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
  validateSignup,
} from '../../utils/validation';

function SignupScreen({navigation}) {
  const {theme} = useTheme();
  const {signup} = useAuth();

  const styles = createStyles(theme);

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    setError('');

    const validationError = validateSignup(
      name,
      mobile,
      password,
      confirmPassword,
    );

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    const result = await signup(
      name.trim(),
      mobile.trim(),
      password,
    );

    setLoading(false);

    if (!result.success) {
      setError(result.message);
    }
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
            <Pressable
              style={styles.backButton}
              onPress={() => navigation.goBack()}>
              <Text style={styles.backText}>‹</Text>
            </Pressable>

            <AppLogo size="small" />

            <View style={styles.heading}>
              <Text style={styles.title}>Create your account</Text>
              <Text style={styles.subtitle}>
                Sign up with your mobile number. You can add your email anytime in your profile.
              </Text>
            </View>

            <AppInput
              label="Full Name"
              placeholder="Enter your name"
              value={name}
              onChangeText={text => {
                setName(text);
                if (error) setError('');
              }}
              autoCapitalize="words"
            />

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
              placeholder="Create a password (min 6 characters)"
              value={password}
              onChangeText={text => {
                setPassword(text);
                if (error) setError('');
              }}
              secureTextEntry={!showPassword}
              rightLabel={showPassword ? 'Hide' : 'Show'}
              onRightPress={() => setShowPassword(current => !current)}
            />

            <AppInput
              label="Confirm Password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChangeText={text => {
                setConfirmPassword(text);
                if (error) setError('');
              }}
              secureTextEntry={!showConfirmPassword}
              rightLabel={showConfirmPassword ? 'Hide' : 'Show'}
              onRightPress={() =>
                setShowConfirmPassword(current => !current)
              }
              error={error}
            />

            <AppButton
              title="Create Account"
              onPress={handleSignup}
              loading={loading}
            />

            <View style={styles.loginRow}>
              <Text style={styles.bottomText}>
                Already have an account?
              </Text>

              <Pressable onPress={() => navigation.goBack()}>
                <Text style={styles.loginLink}>Login</Text>
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
      padding: theme.spacing.xxl,
      paddingVertical: theme.spacing.lg,
    },

    backButton: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.lg,
    },

    backText: {
      fontSize: 38,
      color: theme.colors.text,
    },

    heading: {
      marginTop: theme.spacing.xxl,
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

    loginRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: theme.spacing.xxxl,
    },

    bottomText: {
      fontSize: theme.typography.bodySmall,
      color: theme.colors.textSecondary,
    },

    loginLink: {
      marginLeft: theme.spacing.xs,
      fontSize: theme.typography.bodySmall,
      fontWeight: '800',
      color: theme.colors.primary,
    },
  });
}

export default SignupScreen;