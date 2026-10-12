import React, {useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Switch,
  ScrollView,
  Alert,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {DrawerActions} from '@react-navigation/native';
import {
  Menu,
  Moon,
  Sun,
  Bell,
  AlarmClock,
  Calendar,
  Clock,
  Shield,
  FileText,
  HelpCircle,
  MessageSquare,
  AppWindow,
  LogOut,
  ChevronRight,
  Download,
  Upload,
  Trash2,
  Sparkles,
  Fingerprint,
  Vibrate,
  Languages,
  Timer,
  ArrowLeftRight,
} from 'lucide-react-native';

import useTheme from '../../hooks/useTheme';
import useAuth from '../../hooks/useAuth';
import useTodos from '../../hooks/useTodos';

/* ------------------------------------------------------------------ */
/*  AboutMe — Developer / Profile card                                */
/* ------------------------------------------------------------------ */
import AboutMe from './AboutMe';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/* --------------------------- SCREEN --------------------------- */

function SettingsScreen({navigation}) {
  const {theme, toggleTheme} = useTheme();
  const {user, logout} = useAuth();
  const {tasks} = useTodos();
  const insets = useSafeAreaInsets();
  const styles = useMemo(
    () => createStyles(theme, insets),
    [theme, insets],
  );

  /* --------------------------- STATE --------------------------- */
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [use24Hour, setUse24Hour] = useState(false);
  const [weekStartsMonday, setWeekStartsMonday] = useState(false);
  const [appLockEnabled, setAppLockEnabled] = useState(false);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [language, setLanguage] = useState('en');
  const [snoozeDuration, setSnoozeDuration] = useState(10);
  const [swipeActionsEnabled, setSwipeActionsEnabled] = useState(true);

  const isDark = theme.mode === 'dark';

  /* --------------------------- NAVIGATION --------------------------- */
  function openDrawer() {
    navigation.dispatch(DrawerActions.openDrawer());
  }

  function goTo(routeName) {
    navigation.navigate(routeName);
  }

  /* --------------------------- HANDLERS --------------------------- */
  function toggleWithAnimation(setter) {
    return value => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setter(value);
    };
  }

  function cycleSnooze() {
    const options = [5, 10, 15, 30, 60];
    const idx = options.indexOf(snoozeDuration);
    const next = options[(idx + 1) % options.length];
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSnoozeDuration(next);
  }

  function toggleLanguage() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setLanguage(l => (l === 'en' ? 'hi' : 'en'));
  }

  function handleAppLockToggle(value) {
    if (value) {
      Alert.alert(
        'Enable App Lock',
        'You will need to use your fingerprint or face to unlock the app.',
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Enable',
            onPress: () => {
              LayoutAnimation.configureNext(
                LayoutAnimation.Presets.easeInEaseOut,
              );
              setAppLockEnabled(true);
            },
          },
        ],
      );
    } else {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setAppLockEnabled(false);
    }
  }

  function handleExport() {
    Alert.alert(
      'Backup Data',
      `Export ${tasks?.length || 0} task${
        (tasks?.length || 0) !== 1 ? 's' : ''
      } as a backup file.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Export',
          onPress: () =>
            Alert.alert(
              'Coming soon',
              'Backup export will be available in the next update.',
            ),
        },
      ],
    );
  }

  function handleImport() {
    Alert.alert(
      'Restore Data',
      'Select a backup file to restore. This will overwrite your current data.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Select File',
          onPress: () =>
            Alert.alert(
              'Coming soon',
              'Backup restore will be available in the next update.',
            ),
        },
      ],
    );
  }

  function handleReset() {
    Alert.alert(
      'Reset app data?',
      'All your tasks, memos, and settings will be permanently deleted. This cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Are you sure?',
              'This is your last chance. Data cannot be recovered.',
              [
                {text: 'Cancel', style: 'cancel'},
                {
                  text: 'Yes, Reset',
                  style: 'destructive',
                  onPress: () =>
                    Alert.alert(
                      'Coming soon',
                      'Reset will be available in the next update.',
                    ),
                },
              ],
            );
          },
        },
      ],
    );
  }

  function handleLogout() {
    Alert.alert(
      'Logout?',
      'You will be signed out of your account. Your tasks will remain saved.',
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* ============ HEADER ============ */}
        <View style={styles.header}>
          <Pressable
            onPress={openDrawer}
            style={styles.menuBtn}
            hitSlop={8}>
            <Menu size={18} color={theme.colors.text} strokeWidth={2.6} />
          </Pressable>

          <View style={styles.headerContent}>
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>
              Customize how TodoMaster works
            </Text>
          </View>
        </View>

        {/* ============ USER CARD ============ */}
        {user && (
          <Pressable
            onPress={() => goTo('Profile')}
            style={({pressed}) => [
              styles.userCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                opacity: pressed ? 0.9 : 1,
              },
            ]}>
            <View
              style={[
                styles.userAvatar,
                {backgroundColor: theme.colors.primary},
              ]}>
              <Text style={styles.userAvatarText}>
                {(user?.name || user?.email || 'U')
                  .charAt(0)
                  .toUpperCase()}
              </Text>
            </View>

            <View style={{flex: 1, minWidth: 0}}>
              <Text
                style={[styles.userName, {color: theme.colors.text}]}
                numberOfLines={1}>
                {user?.name || 'Guest'}
              </Text>
              <Text
                style={[
                  styles.userEmail,
                  {color: theme.colors.textSecondary},
                ]}
                numberOfLines={1}>
                {user?.email || 'Tap to edit profile'}
              </Text>
            </View>

            <ChevronRight
              size={18}
              color={theme.colors.textLight}
              strokeWidth={2.4}
            />
          </Pressable>
        )}

        {/* ============ APPEARANCE ============ */}
        <Text style={styles.sectionLabel}>APPEARANCE</Text>

        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View
                style={[
                  styles.rowIconWrap,
                  {
                    backgroundColor: isDark
                      ? '#8B5CF6' + '18'
                      : '#F59E0B' + '18',
                  },
                ]}>
                {isDark ? (
                  <Moon size={15} color="#8B5CF6" strokeWidth={2.6} />
                ) : (
                  <Sun size={15} color="#F59E0B" strokeWidth={2.6} />
                )}
              </View>
              <View style={{flex: 1, minWidth: 0}}>
                <Text
                  style={[styles.rowTitle, {color: theme.colors.text}]}>
                  {isDark ? 'Dark Mode' : 'Light Mode'}
                </Text>
                <Text
                  style={[
                    styles.rowSub,
                    {color: theme.colors.textSecondary},
                  ]}>
                  Switch app appearance
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              thumbColor="#FFFFFF"
              ios_backgroundColor={theme.colors.border}
            />
          </View>

          <View
            style={[
              styles.row,
              styles.rowBorderTop,
              {borderTopColor: theme.colors.border},
            ]}>
            <View style={styles.rowLeft}>
              <View
                style={[
                  styles.rowIconWrap,
                  {backgroundColor: '#F59E0B' + '18'},
                ]}>
                <Languages size={15} color="#F59E0B" strokeWidth={2.6} />
              </View>
              <View style={{flex: 1, minWidth: 0}}>
                <Text
                  style={[styles.rowTitle, {color: theme.colors.text}]}>
                  Language
                </Text>
                <Text
                  style={[
                    styles.rowSub,
                    {color: theme.colors.textSecondary},
                  ]}>
                  {language === 'en' ? 'English (default)' : 'हिन्दी'}
                </Text>
              </View>
            </View>
            <Pressable onPress={toggleLanguage} hitSlop={8}>
              <View
                style={[
                  styles.pill,
                  {backgroundColor: theme.colors.primary + '18'},
                ]}>
                <Text
                  style={[
                    styles.pillText,
                    {color: theme.colors.primary},
                  ]}>
                  {language === 'en' ? 'EN' : 'HI'}
                </Text>
              </View>
            </Pressable>
          </View>

          <View
            style={[
              styles.row,
              styles.rowBorderTop,
              {borderTopColor: theme.colors.border},
            ]}>
            <View style={styles.rowLeft}>
              <View
                style={[
                  styles.rowIconWrap,
                  {backgroundColor: '#0EA5E9' + '18'},
                ]}>
                <Clock size={15} color="#0EA5E9" strokeWidth={2.6} />
              </View>
              <View style={{flex: 1, minWidth: 0}}>
                <Text
                  style={[styles.rowTitle, {color: theme.colors.text}]}>
                  24-Hour Time
                </Text>
                <Text
                  style={[
                    styles.rowSub,
                    {color: theme.colors.textSecondary},
                  ]}>
                  {use24Hour ? 'Example: 14:30' : 'Example: 2:30 PM'}
                </Text>
              </View>
            </View>
            <Switch
              value={use24Hour}
              onValueChange={toggleWithAnimation(setUse24Hour)}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              thumbColor="#FFFFFF"
              ios_backgroundColor={theme.colors.border}
            />
          </View>

          <View
            style={[
              styles.row,
              styles.rowBorderTop,
              {borderTopColor: theme.colors.border},
            ]}>
            <View style={styles.rowLeft}>
              <View
                style={[
                  styles.rowIconWrap,
                  {backgroundColor: '#14B8A6' + '18'},
                ]}>
                <Calendar size={15} color="#14B8A6" strokeWidth={2.6} />
              </View>
              <View style={{flex: 1, minWidth: 0}}>
                <Text
                  style={[styles.rowTitle, {color: theme.colors.text}]}>
                  Week starts Monday
                </Text>
                <Text
                  style={[
                    styles.rowSub,
                    {color: theme.colors.textSecondary},
                  ]}>
                  {weekStartsMonday
                    ? 'Monday → Sunday'
                    : 'Sunday → Saturday'}
                </Text>
              </View>
            </View>
            <Switch
              value={weekStartsMonday}
              onValueChange={toggleWithAnimation(setWeekStartsMonday)}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              thumbColor="#FFFFFF"
              ios_backgroundColor={theme.colors.border}
            />
          </View>
        </View>

        {/* ============ NOTIFICATIONS ============ */}
        <Text style={styles.sectionLabel}>NOTIFICATIONS</Text>

        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View
                style={[
                  styles.rowIconWrap,
                  {backgroundColor: '#EC4899' + '18'},
                ]}>
                <Bell size={15} color="#EC4899" strokeWidth={2.6} />
              </View>
              <View style={{flex: 1, minWidth: 0}}>
                <Text
                  style={[styles.rowTitle, {color: theme.colors.text}]}>
                  Push notifications
                </Text>
                <Text
                  style={[
                    styles.rowSub,
                    {color: theme.colors.textSecondary},
                  ]}>
                  Get alerts for important tasks
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleWithAnimation(setNotificationsEnabled)}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              thumbColor="#FFFFFF"
              ios_backgroundColor={theme.colors.border}
            />
          </View>

          <View
            style={[
              styles.row,
              styles.rowBorderTop,
              {borderTopColor: theme.colors.border},
            ]}>
            <View style={styles.rowLeft}>
              <View
                style={[
                  styles.rowIconWrap,
                  {backgroundColor: '#F97316' + '18'},
                ]}>
                <AlarmClock
                  size={15}
                  color="#F97316"
                  strokeWidth={2.6}
                />
              </View>
              <View style={{flex: 1, minWidth: 0}}>
                <Text
                  style={[styles.rowTitle, {color: theme.colors.text}]}>
                  Task reminders
                </Text>
                <Text
                  style={[
                    styles.rowSub,
                    {color: theme.colors.textSecondary},
                  ]}>
                  Notify before due date
                </Text>
              </View>
            </View>
            <Switch
              value={remindersEnabled}
              onValueChange={toggleWithAnimation(setRemindersEnabled)}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              thumbColor="#FFFFFF"
              ios_backgroundColor={theme.colors.border}
            />
          </View>

          <View
            style={[
              styles.row,
              styles.rowBorderTop,
              {borderTopColor: theme.colors.border},
            ]}>
            <View style={styles.rowLeft}>
              <View
                style={[
                  styles.rowIconWrap,
                  {backgroundColor: '#8B5CF6' + '18'},
                ]}>
                <Timer size={15} color="#8B5CF6" strokeWidth={2.6} />
              </View>
              <View style={{flex: 1, minWidth: 0}}>
                <Text
                  style={[styles.rowTitle, {color: theme.colors.text}]}>
                  Snooze duration
                </Text>
                <Text
                  style={[
                    styles.rowSub,
                    {color: theme.colors.textSecondary},
                  ]}>
                  Tap to cycle through options
                </Text>
              </View>
            </View>
            <Pressable onPress={cycleSnooze} hitSlop={8}>
              <View
                style={[
                  styles.pill,
                  {backgroundColor: theme.colors.primary + '18'},
                ]}>
                <Text
                  style={[
                    styles.pillText,
                    {color: theme.colors.primary},
                  ]}>
                  {snoozeDuration}min
                </Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* ============ SECURITY & GESTURES ============ */}
        <Text style={styles.sectionLabel}>SECURITY & GESTURES</Text>

        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View
                style={[
                  styles.rowIconWrap,
                  {backgroundColor: '#EF4444' + '18'},
                ]}>
                <Fingerprint
                  size={15}
                  color="#EF4444"
                  strokeWidth={2.6}
                />
              </View>
              <View style={{flex: 1, minWidth: 0}}>
                <Text
                  style={[styles.rowTitle, {color: theme.colors.text}]}>
                  App Lock
                </Text>
                <Text
                  style={[
                    styles.rowSub,
                    {color: theme.colors.textSecondary},
                  ]}>
                  Require biometric to open
                </Text>
              </View>
            </View>
            <Switch
              value={appLockEnabled}
              onValueChange={handleAppLockToggle}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              thumbColor="#FFFFFF"
              ios_backgroundColor={theme.colors.border}
            />
          </View>

          <View
            style={[
              styles.row,
              styles.rowBorderTop,
              {borderTopColor: theme.colors.border},
            ]}>
            <View style={styles.rowLeft}>
              <View
                style={[
                  styles.rowIconWrap,
                  {backgroundColor: '#10B981' + '18'},
                ]}>
                <Vibrate size={15} color="#10B981" strokeWidth={2.6} />
              </View>
              <View style={{flex: 1, minWidth: 0}}>
                <Text
                  style={[styles.rowTitle, {color: theme.colors.text}]}>
                  Haptic Feedback
                </Text>
                <Text
                  style={[
                    styles.rowSub,
                    {color: theme.colors.textSecondary},
                  ]}>
                  Vibrate on taps and actions
                </Text>
              </View>
            </View>
            <Switch
              value={hapticsEnabled}
              onValueChange={toggleWithAnimation(setHapticsEnabled)}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              thumbColor="#FFFFFF"
              ios_backgroundColor={theme.colors.border}
            />
          </View>

          <View
            style={[
              styles.row,
              styles.rowBorderTop,
              {borderTopColor: theme.colors.border},
            ]}>
            <View style={styles.rowLeft}>
              <View
                style={[
                  styles.rowIconWrap,
                  {backgroundColor: '#0EA5E9' + '18'},
                ]}>
                <ArrowLeftRight
                  size={15}
                  color="#0EA5E9"
                  strokeWidth={2.6}
                />
              </View>
              <View style={{flex: 1, minWidth: 0}}>
                <Text
                  style={[styles.rowTitle, {color: theme.colors.text}]}>
                  Swipe Actions
                </Text>
                <Text
                  style={[
                    styles.rowSub,
                    {color: theme.colors.textSecondary},
                  ]}>
                  Swipe tasks for quick actions
                </Text>
              </View>
            </View>
            <Switch
              value={swipeActionsEnabled}
              onValueChange={toggleWithAnimation(setSwipeActionsEnabled)}
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary,
              }}
              thumbColor="#FFFFFF"
              ios_backgroundColor={theme.colors.border}
            />
          </View>
        </View>

        {/* ============ DATA ============ */}
        <Text style={styles.sectionLabel}>DATA</Text>

        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}>
          <Pressable
            onPress={handleExport}
            style={({pressed}) => [
              styles.row,
              styles.rowBorderBottom,
              {
                borderBottomColor: theme.colors.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}>
            <View style={styles.rowLeft}>
              <View
                style={[
                  styles.rowIconWrap,
                  {backgroundColor: '#06B6D4' + '18'},
                ]}>
                <Download size={15} color="#06B6D4" strokeWidth={2.6} />
              </View>
              <View style={{flex: 1, minWidth: 0}}>
                <Text
                  style={[styles.rowTitle, {color: theme.colors.text}]}>
                  Backup Data
                </Text>
                <Text
                  style={[
                    styles.rowSub,
                    {color: theme.colors.textSecondary},
                  ]}>
                  Export tasks as a file
                </Text>
              </View>
            </View>
            <ChevronRight
              size={16}
              color={theme.colors.textLight}
              strokeWidth={2.4}
            />
          </Pressable>

          <Pressable
            onPress={handleImport}
            style={({pressed}) => [
              styles.row,
              styles.rowBorderBottom,
              {
                borderBottomColor: theme.colors.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}>
            <View style={styles.rowLeft}>
              <View
                style={[
                  styles.rowIconWrap,
                  {backgroundColor: '#8B5CF6' + '18'},
                ]}>
                <Upload size={15} color="#8B5CF6" strokeWidth={2.6} />
              </View>
              <View style={{flex: 1, minWidth: 0}}>
                <Text
                  style={[styles.rowTitle, {color: theme.colors.text}]}>
                  Restore Data
                </Text>
                <Text
                  style={[
                    styles.rowSub,
                    {color: theme.colors.textSecondary},
                  ]}>
                  Import from a backup
                </Text>
              </View>
            </View>
            <ChevronRight
              size={16}
              color={theme.colors.textLight}
              strokeWidth={2.4}
            />
          </Pressable>

          <Pressable
            onPress={handleReset}
            style={({pressed}) => [
              styles.row,
              {opacity: pressed ? 0.7 : 1},
            ]}>
            <View style={styles.rowLeft}>
              <View
                style={[
                  styles.rowIconWrap,
                  {backgroundColor: '#EF4444' + '18'},
                ]}>
                <Trash2 size={15} color="#EF4444" strokeWidth={2.6} />
              </View>
              <View style={{flex: 1, minWidth: 0}}>
                <Text
                  style={[styles.rowTitle, {color: '#EF4444'}]}>
                  Reset app data
                </Text>
                <Text
                  style={[
                    styles.rowSub,
                    {color: theme.colors.textSecondary},
                  ]}>
                  Delete everything permanently
                </Text>
              </View>
            </View>
            <ChevronRight
              size={16}
              color="#EF4444"
              strokeWidth={2.4}
            />
          </Pressable>
        </View>

        {/* ============ SUPPORT ============ */}
        <Text style={styles.sectionLabel}>SUPPORT</Text>

        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}>
          <Pressable
            onPress={() => goTo('FAQ')}
            style={({pressed}) => [
              styles.row,
              styles.rowBorderBottom,
              {
                borderBottomColor: theme.colors.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}>
            <View style={styles.rowLeft}>
              <View
                style={[
                  styles.rowIconWrap,
                  {backgroundColor: '#0EA5E9' + '18'},
                ]}>
                <HelpCircle
                  size={15}
                  color="#0EA5E9"
                  strokeWidth={2.6}
                />
              </View>
              <View style={{flex: 1, minWidth: 0}}>
                <Text
                  style={[styles.rowTitle, {color: theme.colors.text}]}>
                  FAQ
                </Text>
                <Text
                  style={[
                    styles.rowSub,
                    {color: theme.colors.textSecondary},
                  ]}>
                  Frequently asked questions
                </Text>
              </View>
            </View>
            <ChevronRight
              size={16}
              color={theme.colors.textLight}
              strokeWidth={2.4}
            />
          </Pressable>

          <Pressable
            onPress={() => goTo('Feedback')}
            style={({pressed}) => [
              styles.row,
              styles.rowBorderBottom,
              {
                borderBottomColor: theme.colors.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}>
            <View style={styles.rowLeft}>
              <View
                style={[
                  styles.rowIconWrap,
                  {backgroundColor: '#10B981' + '18'},
                ]}>
                <MessageSquare
                  size={15}
                  color="#10B981"
                  strokeWidth={2.6}
                />
              </View>
              <View style={{flex: 1, minWidth: 0}}>
                <Text
                  style={[styles.rowTitle, {color: theme.colors.text}]}>
                  Send feedback
                </Text>
                <Text
                  style={[
                    styles.rowSub,
                    {color: theme.colors.textSecondary},
                  ]}>
                  Help us improve
                </Text>
              </View>
            </View>
            <ChevronRight
              size={16}
              color={theme.colors.textLight}
              strokeWidth={2.4}
            />
          </Pressable>

          <Pressable
            onPress={() => goTo('MoreApps')}
            style={({pressed}) => [
              styles.row,
              {opacity: pressed ? 0.7 : 1},
            ]}>
            <View style={styles.rowLeft}>
              <View
                style={[
                  styles.rowIconWrap,
                  {backgroundColor: '#A855F7' + '18'},
                ]}>
                <AppWindow
                  size={15}
                  color="#A855F7"
                  strokeWidth={2.6}
                />
              </View>
              <View style={{flex: 1, minWidth: 0}}>
                <Text
                  style={[styles.rowTitle, {color: theme.colors.text}]}>
                  More apps
                </Text>
                <Text
                  style={[
                    styles.rowSub,
                    {color: theme.colors.textSecondary},
                  ]}>
                  Explore our other apps
                </Text>
              </View>
            </View>
            <ChevronRight
              size={16}
              color={theme.colors.textLight}
              strokeWidth={2.4}
            />
          </Pressable>
        </View>

        {/* ============ ABOUT ============ */}
        <Text style={styles.sectionLabel}>ABOUT</Text>

        {/* 👇 Developer / Profile card (AboutMe component) */}
        <AboutMe />

        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}>
          <Pressable
            onPress={() =>
              Alert.alert(
                'Privacy Policy',
                'Your data is stored locally on your device. We do not collect or share any personal information.',
              )
            }
            style={({pressed}) => [
              styles.row,
              styles.rowBorderBottom,
              {
                borderBottomColor: theme.colors.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}>
            <View style={styles.rowLeft}>
              <View
                style={[
                  styles.rowIconWrap,
                  {backgroundColor: '#6366F1' + '18'},
                ]}>
                <Shield size={15} color="#6366F1" strokeWidth={2.6} />
              </View>
              <View style={{flex: 1, minWidth: 0}}>
                <Text
                  style={[styles.rowTitle, {color: theme.colors.text}]}>
                  Privacy policy
                </Text>
                <Text
                  style={[
                    styles.rowSub,
                    {color: theme.colors.textSecondary},
                  ]}>
                  How we handle your data
                </Text>
              </View>
            </View>
            <ChevronRight
              size={16}
              color={theme.colors.textLight}
              strokeWidth={2.4}
            />
          </Pressable>

          <Pressable
            onPress={() =>
              Alert.alert(
                'Terms of Service',
                'By using TodoMaster, you agree to use the app responsibly and for lawful purposes only.',
              )
            }
            style={({pressed}) => [
              styles.row,
              {opacity: pressed ? 0.7 : 1},
            ]}>
            <View style={styles.rowLeft}>
              <View
                style={[
                  styles.rowIconWrap,
                  {backgroundColor: '#8B5CF6' + '18'},
                ]}>
                <FileText
                  size={15}
                  color="#8B5CF6"
                  strokeWidth={2.6}
                />
              </View>
              <View style={{flex: 1, minWidth: 0}}>
                <Text
                  style={[styles.rowTitle, {color: theme.colors.text}]}>
                  Terms of service
                </Text>
                <Text
                  style={[
                    styles.rowSub,
                    {color: theme.colors.textSecondary},
                  ]}>
                  Terms and conditions
                </Text>
              </View>
            </View>
            <ChevronRight
              size={16}
              color={theme.colors.textLight}
              strokeWidth={2.4}
            />
          </Pressable>
        </View>

        {/* ============ LOGOUT ============ */}
        <Pressable
          onPress={handleLogout}
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

        {/* ============ VERSION ============ */}
        <View style={styles.versionWrap}>
          <View style={styles.versionRow}>
            <Sparkles
              size={11}
              color={theme.colors.textLight}
              strokeWidth={2.6}
            />
            <Text
              style={[
                styles.versionText,
                {color: theme.colors.textLight},
              ]}>
              TodoMaster · v1.0.0
            </Text>
          </View>
          <Text
            style={[
              styles.versionSub,
              {color: theme.colors.textLight},
            ]}>
            Made with care
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* --------------------------- STYLES --------------------------- */

function createStyles(theme, insets) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: Math.max(insets.bottom, 12) + 30,
    },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 16,
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

    userCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 18,
      borderWidth: 1,
      marginBottom: 18,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 3},
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 2,
    },
    userAvatar: {
      width: 48,
      height: 48,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    userAvatarText: {
      fontSize: 20,
      fontWeight: '900',
      color: '#FFFFFF',
      letterSpacing: -0.5,
    },
    userName: {
      fontSize: 15,
      fontWeight: '800',
      letterSpacing: -0.2,
    },
    userEmail: {
      fontSize: 12,
      fontWeight: '500',
      marginTop: 2,
      letterSpacing: 0.1,
    },

    sectionLabel: {
      fontSize: 10.5,
      fontWeight: '900',
      letterSpacing: 1.4,
      color: theme.colors.textLight,
      marginTop: 6,
      marginBottom: 8,
      marginLeft: 4,
    },

    card: {
      borderRadius: 18,
      borderWidth: 1,
      marginBottom: 16,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 3},
      shadowOpacity: 0.04,
      shadowRadius: 10,
      elevation: 2,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
      paddingVertical: 12,
      gap: 12,
    },
    rowBorderTop: {
      borderTopWidth: 1,
    },
    rowBorderBottom: {
      borderBottomWidth: 1,
    },
    rowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      minWidth: 0,
      gap: 12,
    },
    rowIconWrap: {
      width: 34,
      height: 34,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    rowTitle: {
      fontSize: 14,
      fontWeight: '800',
      letterSpacing: -0.2,
    },
    rowSub: {
      fontSize: 11,
      marginTop: 2,
      fontWeight: '600',
      letterSpacing: 0.1,
    },

    pill: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 10,
      minWidth: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pillText: {
      fontSize: 11.5,
      fontWeight: '900',
      letterSpacing: 0.3,
    },

    logoutBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderRadius: 15,
      borderWidth: 1,
      marginTop: 4,
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

    versionWrap: {
      alignItems: 'center',
      marginTop: 4,
      marginBottom: 20,
    },
    versionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    versionText: {
      fontSize: 11.5,
      fontWeight: '800',
      letterSpacing: 0.3,
    },
    versionSub: {
      marginTop: 3,
      fontSize: 10.5,
      fontWeight: '600',
      letterSpacing: 0.2,
    },
  });
}

export default SettingsScreen;