import React, {useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {DrawerActions} from '@react-navigation/native';
import {
  Menu,
  User as UserIcon,
  Mail,
  Lock,
  Save,
  LogOut,
  CheckCircle2,
  Layers,
  CheckCheck,
  Star,
  Camera,
  X,
  Shield,
  Info,
  Sparkles,
} from 'lucide-react-native';

import useAuth from '../../hooks/useAuth';
import useTodos from '../../hooks/useTodos';
import useTheme from '../../hooks/useTheme';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental &&
  !global._Bridgeless &&
  !global.RN$Bridgeless
) {
  try {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  } catch (e) {}
}

/* --------------------------- SCREEN --------------------------- */

function ProfileScreen({navigation}) {
  const {theme} = useTheme();
  const insets = useSafeAreaInsets();
  const {user, updateProfile, logout} = useAuth();
  const {tasks} = useTodos();

  const styles = useMemo(
    () => createStyles(theme, insets),
    [theme, insets],
  );

  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const initialName = (user?.name || '').trim();
  const hasChanges = name.trim() !== initialName;
  const isNameValid = name.trim().length >= 2;

  /* --------------------------- NAVIGATION --------------------------- */
  function openDrawer() {
    navigation.dispatch(DrawerActions.openDrawer());
  }

  /* --------------------------- STATS --------------------------- */
  const stats = useMemo(() => {
    const list = (tasks || []).filter(t => t && !t.deleted);
    const total = list.length;
    const completed = list.filter(t => t.completed).length;
    const active = total - completed;
    const favorites = list.filter(t => t.favorite).length;
    return {total, completed, active, favorites};
  }, [tasks]);

  /* --------------------------- AVATAR INITIAL --------------------------- */
  const avatarInitial = useMemo(() => {
    const n = (user?.name || '').trim();
    if (n) return n.charAt(0).toUpperCase();
    return 'U';
  }, [user?.name]);

  /* --------------------------- MEMBER SINCE --------------------------- */
  const memberSince = useMemo(() => {
    const ts = user?.createdAt;
    if (!ts) return null;
    const d = new Date(ts);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString(undefined, {
      month: 'short',
      year: 'numeric',
    });
  }, [user?.createdAt]);

  /* --------------------------- SAVE --------------------------- */
  async function handleSave() {
    setError('');

    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }
    if (!hasChanges) {
      setError('No changes to save');
      return;
    }
    if (loading) return;

    setLoading(true);
    try {
      if (typeof updateProfile === 'function') {
        await updateProfile(name.trim());
      }
      setLoading(false);
      Alert.alert('Success', 'Profile updated successfully.', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    } catch (e) {
      setLoading(false);
      setError('Could not update profile. Please try again.');
    }
  }

  /* --------------------------- CANCEL --------------------------- */
  function handleCancel() {
    if (hasChanges) {
      Alert.alert(
        'Discard changes?',
        'Your unsaved changes will be lost.',
        [
          {text: 'Keep editing', style: 'cancel'},
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
              setName(user?.name || '');
              setError('');
            },
          },
        ],
      );
    } else {
      navigation.goBack();
    }
  }

  /* --------------------------- LOGOUT --------------------------- */
  function handleLogout() {
    Alert.alert(
      'Logout?',
      'You will be signed out of your account.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            if (typeof logout === 'function') {
              await logout();
            }
          },
        },
      ],
    );
  }

  /* --------------------------- RENDER --------------------------- */
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={styles.scrollContent}>
          {/* ============ HEADER ============ */}
          <View style={styles.header}>
            <Pressable
              onPress={openDrawer}
              style={styles.menuBtn}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Open menu">
              <Menu
                size={18}
                color={theme.colors.text}
                strokeWidth={2.6}
              />
            </Pressable>

            <View style={styles.headerContent}>
              <Text style={styles.title}>Profile</Text>
              <Text style={styles.subtitle}>
                Manage your account details
              </Text>
            </View>
          </View>

          {/* ============ HERO CARD ============ */}
          <View
            style={[
              styles.heroCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}>
            {/* Avatar */}
            <View style={styles.avatarWrap}>
              <View
                style={[
                  styles.avatar,
                  {backgroundColor: theme.colors.primary},
                ]}>
                <Text style={styles.avatarText}>{avatarInitial}</Text>
              </View>
              <View
                style={[
                  styles.avatarBadge,
                  {
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.border,
                  },
                ]}>
                <Camera
                  size={12}
                  color={theme.colors.textSecondary}
                  strokeWidth={2.6}
                />
              </View>
            </View>

            <Text
              style={[styles.heroName, {color: theme.colors.text}]}
              numberOfLines={1}>
              {user?.name || 'Guest'}
            </Text>

            {!!user?.email && (
              <Text
                style={[
                  styles.heroEmail,
                  {color: theme.colors.textSecondary},
                ]}
                numberOfLines={1}>
                {user.email}
              </Text>
            )}

            {memberSince && (
              <View
                style={[
                  styles.heroPill,
                  {
                    backgroundColor: theme.colors.primary + '14',
                    borderColor: theme.colors.primary + '30',
                  },
                ]}>
                <Sparkles
                  size={10}
                  color={theme.colors.primary}
                  strokeWidth={2.8}
                />
                <Text
                  style={[
                    styles.heroPillText,
                    {color: theme.colors.primary},
                  ]}>
                  Member since {memberSince}
                </Text>
              </View>
            )}
          </View>

          {/* ============ STATS ROW ============ */}
          <View style={styles.statsRow}>
            <View
              style={[
                styles.statMini,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}>
              <View
                style={[
                  styles.statIconWrap,
                  {backgroundColor: '#6366F1' + '18'},
                ]}>
                <Layers size={13} color="#6366F1" strokeWidth={2.6} />
              </View>
              <Text
                style={[styles.statValue, {color: theme.colors.text}]}>
                {stats.total}
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  {color: theme.colors.textSecondary},
                ]}
                numberOfLines={1}>
                Total
              </Text>
            </View>

            <View
              style={[
                styles.statMini,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}>
              <View
                style={[
                  styles.statIconWrap,
                  {backgroundColor: '#10B981' + '18'},
                ]}>
                <CheckCheck size={13} color="#10B981" strokeWidth={2.6} />
              </View>
              <Text
                style={[styles.statValue, {color: theme.colors.text}]}>
                {stats.completed}
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  {color: theme.colors.textSecondary},
                ]}
                numberOfLines={1}>
                Done
              </Text>
            </View>

            <View
              style={[
                styles.statMini,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}>
              <View
                style={[
                  styles.statIconWrap,
                  {backgroundColor: '#F59E0B' + '18'},
                ]}>
                <Star
                  size={13}
                  color="#F59E0B"
                  strokeWidth={2.6}
                  fill="#F59E0B"
                />
              </View>
              <Text
                style={[styles.statValue, {color: theme.colors.text}]}>
                {stats.favorites}
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  {color: theme.colors.textSecondary},
                ]}
                numberOfLines={1}>
                Favorites
              </Text>
            </View>
          </View>

          {/* ============ EDIT FORM ============ */}
          <View
            style={[
              styles.formCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}>
            <Text
              style={[
                styles.sectionLabel,
                {color: theme.colors.textLight},
              ]}>
              ACCOUNT DETAILS
            </Text>

            {/* Name */}
            <View style={styles.field}>
              <View style={styles.fieldLabelRow}>
                <UserIcon
                  size={11}
                  color={theme.colors.textSecondary}
                  strokeWidth={2.6}
                />
                <Text
                  style={[
                    styles.fieldLabel,
                    {color: theme.colors.textSecondary},
                  ]}>
                  NAME
                </Text>
              </View>
              <View
                style={[
                  styles.inputWrap,
                  {
                    backgroundColor: theme.colors.background,
                    borderColor: error
                      ? theme.colors.danger
                      : theme.colors.border,
                  },
                ]}>
                <TextInput
                  style={[
                    styles.input,
                    {color: theme.colors.text},
                  ]}
                  value={name}
                  onChangeText={t => {
                    setName(t);
                    if (error) setError('');
                  }}
                  placeholder="Your name"
                  placeholderTextColor={theme.colors.textLight}
                  autoCapitalize="words"
                  maxLength={50}
                  returnKeyType="done"
                />
                {name.trim().length >= 2 && (
                  <CheckCircle2
                    size={16}
                    color={theme.colors.success || '#10B981'}
                    strokeWidth={2.6}
                  />
                )}
              </View>
              {!!error && (
                <View style={styles.errorRow}>
                  <Info
                    size={11}
                    color={theme.colors.danger}
                    strokeWidth={2.6}
                  />
                  <Text
                    style={[
                      styles.errorText,
                      {color: theme.colors.danger},
                    ]}>
                    {error}
                  </Text>
                </View>
              )}
            </View>

            {/* Email */}
            <View style={styles.field}>
              <View style={styles.fieldLabelRow}>
                <Mail
                  size={11}
                  color={theme.colors.textSecondary}
                  strokeWidth={2.6}
                />
                <Text
                  style={[
                    styles.fieldLabel,
                    {color: theme.colors.textSecondary},
                  ]}>
                  EMAIL
                </Text>
              </View>
              <View
                style={[
                  styles.inputWrap,
                  styles.inputWrapDisabled,
                  {
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.border,
                  },
                ]}>
                <TextInput
                  style={[
                    styles.input,
                    {color: theme.colors.textSecondary},
                  ]}
                  value={user?.email || ''}
                  editable={false}
                  placeholder="No email"
                  placeholderTextColor={theme.colors.textLight}
                />
                <Lock
                  size={14}
                  color={theme.colors.textLight}
                  strokeWidth={2.4}
                />
              </View>
              <Text
                style={[
                  styles.fieldHelper,
                  {color: theme.colors.textLight},
                ]}>
                Email cannot be changed
              </Text>
            </View>
          </View>

          {/* ============ ACTION BUTTONS ============ */}
          <View style={styles.actions}>
            <Pressable
              onPress={handleSave}
              disabled={loading || !isNameValid || !hasChanges}
              accessibilityRole="button"
              accessibilityLabel="Save profile"
              style={({pressed}) => [
                styles.primaryBtn,
                {
                  backgroundColor: theme.colors.primary,
                  shadowColor: theme.colors.primary,
                  opacity:
                    loading || !isNameValid || !hasChanges
                      ? 0.5
                      : pressed
                      ? 0.9
                      : 1,
                },
              ]}>
              <Save size={15} color="#FFFFFF" strokeWidth={2.6} />
              <Text style={styles.primaryBtnText}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Text>
            </Pressable>

            <Pressable
              onPress={handleCancel}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
              style={({pressed}) => [
                styles.secondaryBtn,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}>
              <X
                size={14}
                color={theme.colors.text}
                strokeWidth={2.6}
              />
              <Text
                style={[
                  styles.secondaryBtnText,
                  {color: theme.colors.text},
                ]}>
                {hasChanges ? 'Discard' : 'Close'}
              </Text>
            </Pressable>
          </View>

          {/* ============ ACCOUNT ============ */}
          <Text
            style={[
              styles.sectionLabel,
              {
                color: theme.colors.textLight,
                marginTop: 22,
                marginBottom: 10,
                marginLeft: 4,
              },
            ]}>
            ACCOUNT
          </Text>

          <Pressable
            onPress={handleLogout}
            accessibilityRole="button"
            accessibilityLabel="Logout"
            style={({pressed}) => [
              styles.logoutBtn,
              {
                backgroundColor: theme.colors.danger + '10',
                borderColor: theme.colors.danger + '35',
                opacity: pressed ? 0.85 : 1,
              },
            ]}>
            <View
              style={[
                styles.logoutIcon,
                {backgroundColor: theme.colors.danger + '20'},
              ]}>
              <LogOut
                size={15}
                color={theme.colors.danger}
                strokeWidth={2.6}
              />
            </View>
            <View style={{flex: 1, minWidth: 0}}>
              <Text
                style={[
                  styles.logoutTitle,
                  {color: theme.colors.danger},
                ]}>
                Logout
              </Text>
              <Text
                style={[
                  styles.logoutSub,
                  {color: theme.colors.textSecondary},
                ]}
                numberOfLines={1}>
                Sign out of your account
              </Text>
            </View>
          </Pressable>

          {/* ============ ABOUT / FOOTER ============ */}
          <View
            style={[
              styles.aboutCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}>
            <View
              style={[
                styles.aboutIcon,
                {backgroundColor: theme.colors.primary + '14'},
              ]}>
              <Shield
                size={14}
                color={theme.colors.primary}
                strokeWidth={2.6}
              />
            </View>
            <View style={{flex: 1, minWidth: 0}}>
              <Text
                style={[
                  styles.aboutTitle,
                  {color: theme.colors.text},
                ]}>
                TodoMaster
              </Text>
              <Text
                style={[
                  styles.aboutSub,
                  {color: theme.colors.textSecondary},
                ]}
                numberOfLines={1}>
                Your data is stored locally and securely
              </Text>
            </View>
            <Text
              style={[
                styles.versionText,
                {color: theme.colors.textLight},
              ]}>
              v1.0.0
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* --------------------------- STYLES --------------------------- */

function createStyles(theme, insets) {
  return StyleSheet.create({
    flex: {
      flex: 1,
    },
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: Math.max(insets.bottom, 12) + 40,
    },

    /* Header */
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 18,
    },
    menuBtn: {
      width: 42,
      height: 42,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    headerContent: {
      flex: 1,
      minWidth: 0,
    },
    title: {
      fontSize: 24,
      fontWeight: '900',
      color: theme.colors.text,
      letterSpacing: -0.6,
    },
    subtitle: {
      marginTop: 2,
      fontSize: 12,
      fontWeight: '500',
      color: theme.colors.textSecondary,
      letterSpacing: 0.1,
    },

    /* Hero */
    heroCard: {
      alignItems: 'center',
      padding: 20,
      borderRadius: 22,
      borderWidth: 1,
      marginBottom: 14,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.05,
      shadowRadius: 12,
      elevation: 2,
    },
    avatarWrap: {
      marginBottom: 14,
    },
    avatar: {
      width: 88,
      height: 88,
      borderRadius: 44,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 8},
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 6,
    },
    avatarText: {
      fontSize: 34,
      fontWeight: '900',
      color: '#FFFFFF',
      letterSpacing: -1,
      includeFontPadding: false,
    },
    avatarBadge: {
      position: 'absolute',
      right: -2,
      bottom: -2,
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
    },
    heroName: {
      fontSize: 20,
      fontWeight: '900',
      letterSpacing: -0.5,
      textAlign: 'center',
    },
    heroEmail: {
      marginTop: 4,
      fontSize: 13,
      fontWeight: '500',
      letterSpacing: 0.1,
      textAlign: 'center',
    },
    heroPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 99,
      borderWidth: 1,
      marginTop: 12,
    },
    heroPillText: {
      fontSize: 10.5,
      fontWeight: '800',
      letterSpacing: 0.3,
    },

    /* Stats */
    statsRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 14,
    },
    statMini: {
      flex: 1,
      minWidth: 0,
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 8,
      borderRadius: 15,
      borderWidth: 1,
    },
    statIconWrap: {
      width: 28,
      height: 28,
      borderRadius: 9,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 6,
    },
    statValue: {
      fontSize: 18,
      fontWeight: '900',
      letterSpacing: -0.5,
      lineHeight: 20,
    },
    statLabel: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 0.3,
      marginTop: 2,
      textTransform: 'uppercase',
    },

    /* Form */
    formCard: {
      padding: 16,
      borderRadius: 20,
      borderWidth: 1,
      marginBottom: 16,
    },
    sectionLabel: {
      fontSize: 10.5,
      fontWeight: '900',
      letterSpacing: 1.4,
      marginBottom: 14,
    },
    field: {
      marginBottom: 14,
    },
    fieldLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      marginBottom: 6,
    },
    fieldLabel: {
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 1,
    },
    inputWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 13,
      paddingVertical: 11,
      borderRadius: 14,
      borderWidth: 1.5,
    },
    inputWrapDisabled: {
      opacity: 0.85,
    },
    input: {
      flex: 1,
      fontSize: 15,
      fontWeight: '600',
      padding: 0,
      letterSpacing: -0.1,
    },
    fieldHelper: {
      marginTop: 5,
      fontSize: 10.5,
      fontWeight: '600',
      letterSpacing: 0.2,
    },
    errorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      marginTop: 6,
    },
    errorText: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.1,
    },

    /* Actions */
    actions: {
      gap: 10,
    },
    primaryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 15,
      borderRadius: 15,
      shadowOffset: {width: 0, height: 6},
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 5,
    },
    primaryBtnText: {
      color: '#FFFFFF',
      fontSize: 14.5,
      fontWeight: '900',
      letterSpacing: 0.2,
    },
    secondaryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      paddingVertical: 13,
      borderRadius: 15,
      borderWidth: 1.5,
    },
    secondaryBtnText: {
      fontSize: 13.5,
      fontWeight: '800',
      letterSpacing: 0.2,
    },

    /* Logout */
    logoutBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderRadius: 15,
      borderWidth: 1,
      marginBottom: 22,
    },
    logoutIcon: {
      width: 36,
      height: 36,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    logoutTitle: {
      fontSize: 14,
      fontWeight: '900',
      letterSpacing: -0.2,
    },
    logoutSub: {
      fontSize: 11,
      fontWeight: '600',
      marginTop: 2,
      letterSpacing: 0.1,
    },

    /* About */
    aboutCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderRadius: 15,
      borderWidth: 1,
    },
    aboutIcon: {
      width: 34,
      height: 34,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    aboutTitle: {
      fontSize: 13.5,
      fontWeight: '800',
      letterSpacing: -0.1,
    },
    aboutSub: {
      fontSize: 11,
      fontWeight: '600',
      marginTop: 2,
      letterSpacing: 0.1,
    },
    versionText: {
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 0.3,
    },
  });
}

export default ProfileScreen;