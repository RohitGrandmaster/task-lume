import {LocalizedText} from '../../i18n/LocalizedText';
import React, {useMemo, useState, useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Switch,
  ScrollView,
  Alert,
  LayoutAnimation,
  UIManager,
  Platform,
  Modal,
  Share,
  Image
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {DrawerActions} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
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
  Code,
  X,
  Palette,
  Check,
} from 'lucide-react-native';

import useTheme from '../../hooks/useTheme';
import useAuth from '../../hooks/useAuth';
import useTodos from '../../hooks/useTodos';
import {useAppLock} from '../../context/AppLockContext';
import {useSettings} from '../../context/SettingsContext';
import {useTranslation} from '../../i18n/translations';
import {getItem, setItem} from '../../storage/storage';

/* ------------------------------------------------------------------ */
/*  AboutMe — Developer / Profile card                                */
/* ------------------------------------------------------------------ */
import AboutMe from './AboutMe';
import LegalModal from '../../components/common/LegalModal';
import BackupImportModal from '../../components/common/BackupImportModal';

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

function SettingsScreen({navigation}) {
  const {theme, toggleTheme, accentColor, setAccentColor, palettes = []} =
    useTheme();
  const {user} = useAuth();
  const {tasks, clearTodos, importTodos} = useTodos();
  const {isLockEnabled, enableDeviceLock, disableDeviceLock} = useAppLock();
  const insets = useSafeAreaInsets();
  const styles = useMemo(
    () => createStyles(theme, insets),
    [theme, insets],
  );
  const {
    notificationsEnabled,
    remindersEnabled,
    use24Hour,
    weekStartsMonday,
    hapticsEnabled,
    language,
    snoozeDuration,
    swipeActionsEnabled,
    updateSetting,
  } = useSettings();
  const {t} = useTranslation();

  const setNotificationsEnabled = val =>
    updateSetting('notificationsEnabled', val);
  const setRemindersEnabled = val => updateSetting('remindersEnabled', val);
  const setUse24Hour = val => updateSetting('use24Hour', val);
  const setWeekStartsMonday = val => updateSetting('weekStartsMonday', val);
  const setHapticsEnabled = val => updateSetting('hapticsEnabled', val);
  const setSwipeActionsEnabled = val =>
    updateSetting('swipeActionsEnabled', val);
  const setSnoozeDuration = val => updateSetting('snoozeDuration', val);
  const setLanguage = fn => {
    const next = typeof fn === 'function' ? fn(language) : fn;
    updateSetting('language', next);
  };

  const [aboutDeveloperVisible, setAboutDeveloperVisible] = useState(false);
  const [legalModalVisible, setLegalModalVisible] = useState(false);
  const [legalTab, setLegalTab] = useState('privacy');
  const [importModalVisible, setImportModalVisible] = useState(false);

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

async function handleAppLockToggle(value) {
  try {
    if (value) {
      const success = await enableDeviceLock();

      if (success) {
        Toast.show({
          type: 'success',
          text1: 'App Lock Enabled',
          text2: 'Your Tasklume app is now protected by your device lock.',
          position: 'bottom',
          visibilityTime: 2500,
        });
      }
    } else {
      const disabled = await disableDeviceLock();

      if (disabled) {
        Toast.show({
          type: 'info',
          text1: 'App Lock Disabled',
          text2: 'Your app is no longer protected by the device lock.',
          position: 'bottom',
          visibilityTime: 2500,
        });
      }
    }
  } catch (error) {
    Alert.alert(
      'Device Lock Error',
      error?.message ||
        'Please set up a PIN, pattern, or fingerprint in your phone settings.',
    );
  }
}

  async function handleExport() {
    try {
      const backupData = JSON.stringify(
        {
          appName: 'Tasklume',
          version: '1.0',
          exportedAt: new Date().toISOString(),
          totalTasks: tasks?.length || 0,
          tasks: tasks || [],
        },
        null,
        2,
      );

      await Share.share({
        message: backupData,
        title: 'Tasklume_Backup.json',
      });
    } catch (e) {
      console.warn('Export cancelled or failed', e);
    }
  }

  function handleImport() {
    setImportModalVisible(true);
  }

  function handleReset() {
    Alert.alert(
      'Reset all tasks?',
      'All your tasks, reminders, and data will be permanently cleared. This cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: () => {
            if (typeof clearTodos === 'function') {
              clearTodos();
            }
            Alert.alert('Reset Complete', 'All task data has been cleared.');
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
            <LocalizedText style={styles.title}>Settings</LocalizedText>
            <LocalizedText style={styles.subtitle}>
              Customize how Tasklume works
            </LocalizedText>
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
                {backgroundColor: '#070A38', overflow: 'hidden'},
              ]}>
              <Image
                source={require('../../assets/images/tasklume_icon.png')}
                style={{width: '100%', height: '100%'}}
                resizeMode="cover"
              />
            </View>

            <View style={{flex: 1, minWidth: 0}}>
              <LocalizedText
                style={[styles.userName, {color: theme.colors.text}]}
                numberOfLines={1}>
                {user?.name || 'Guest'}
              </LocalizedText>
              <LocalizedText
                style={[
                  styles.userEmail,
                  {color: theme.colors.textSecondary},
                ]}
                numberOfLines={1}>
                {user?.mobile
                  ? user?.email
                    ? `+91 ${user.mobile} • ${user.email}`
                    : `+91 ${user.mobile}`
                  : user?.email || 'Tap to edit profile'}
              </LocalizedText>
            </View>

            <ChevronRight
              size={18}
              color={theme.colors.textLight}
              strokeWidth={2.4}
            />
          </Pressable>
        )}

        {/* ============ APPEARANCE ============ */}
        <LocalizedText style={styles.sectionLabel}>
          {t('appearance', 'APPEARANCE')}
        </LocalizedText>

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
                <LocalizedText
                  style={[styles.rowTitle, {color: theme.colors.text}]}>
                  {isDark
                    ? t('darkMode', 'Dark Mode')
                    : t('lightMode', 'Light Mode')}
                </LocalizedText>
                <LocalizedText
                  style={[
                    styles.rowSub,
                    {color: theme.colors.textSecondary},
                  ]}>
                  {t('switchAppearance', 'Switch app appearance')}
                </LocalizedText>
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

          {/* ============ THEME ACCENT COLOR PICKER ============ */}
          <View
            style={[
              styles.row,
              styles.rowBorderTop,
              {
                borderTopColor: theme.colors.border,
                flexDirection: 'column',
                alignItems: 'stretch',
                paddingVertical: 14,
                gap: 12,
              },
            ]}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
                <View
                  style={[
                    styles.rowIconWrap,
                    {backgroundColor: theme.colors.primary + '18'},
                  ]}>
                  <Palette
                    size={16}
                    color={theme.colors.primary}
                    strokeWidth={2.6}
                  />
                </View>
                <View>
                  <LocalizedText
                    style={[styles.rowTitle, {color: theme.colors.text}]}>
                    {t('themeColor', 'Theme Color')}
                  </LocalizedText>
                  <LocalizedText
                    style={[
                      styles.rowSub,
                      {color: theme.colors.textSecondary},
                    ]}>
                    {t('themeColorSubtitle', 'Pick your favorite accent color')}
                  </LocalizedText>
                </View>
              </View>

              <View
                style={[
                  styles.pill,
                  {backgroundColor: theme.colors.primary + '18'},
                ]}>
                <LocalizedText
                  style={[
                    styles.pillText,
                    {
                      color: theme.colors.primary,
                      textTransform: 'capitalize',
                      fontWeight: '700',
                    },
                  ]}>
                  {palettes.find(p => p.id === accentColor)?.name || 'Indigo'}
                </LocalizedText>
              </View>
            </View>

            {/* Horizontal Palette Swatches */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{gap: 10, paddingVertical: 4}}>
              {palettes.map(p => {
                const isSelected = accentColor === p.id;
                const dotColor = isDark ? p.dark : p.light;
                return (
                  <Pressable
                    key={p.id}
                    onPress={() => {
                      LayoutAnimation.configureNext(
                        LayoutAnimation.Presets.easeInEaseOut,
                      );
                      setAccentColor(p.id);
                    }}
                    style={({pressed}) => [
                      {
                        width: 38,
                        height: 38,
                        borderRadius: 19,
                        backgroundColor: dotColor,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: isSelected ? 3 : 1,
                        borderColor: isSelected
                          ? isDark
                            ? '#FFFFFF'
                            : '#0F172A'
                          : theme.colors.border,
                        transform: [
                          {scale: pressed ? 0.9 : isSelected ? 1.08 : 1},
                        ],
                      },
                    ]}
                    accessibilityLabel={p.name}>
                    {isSelected && (
                      <Check
                        size={16}
                        color={isDark ? '#000000' : '#FFFFFF'}
                        strokeWidth={3}
                      />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
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
                <LocalizedText
                  style={[styles.rowTitle, {color: theme.colors.text}]}>
                  {t('language', 'Language')}
                </LocalizedText>
                <LocalizedText
                  style={[
                    styles.rowSub,
                    {color: theme.colors.textSecondary},
                  ]}>
                  {language === 'en' ? 'English (default)' : 'हिन्दी'}
                </LocalizedText>
              </View>
            </View>
            <Pressable onPress={toggleLanguage} hitSlop={8}>
              <View
                style={[
                  styles.pill,
                  {backgroundColor: theme.colors.primary + '18'},
                ]}>
                <LocalizedText
                  style={[
                    styles.pillText,
                    {color: theme.colors.primary},
                  ]}>
                  {language === 'en' ? 'EN' : 'HI'}
                </LocalizedText>
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
                <LocalizedText
                  style={[styles.rowTitle, {color: theme.colors.text}]}>
                  24-Hour Time
                </LocalizedText>
                <LocalizedText
                  style={[
                    styles.rowSub,
                    {color: theme.colors.textSecondary},
                  ]}>
                  {use24Hour ? 'Example: 14:30' : 'Example: 2:30 PM'}
                </LocalizedText>
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
                <LocalizedText
                  style={[styles.rowTitle, {color: theme.colors.text}]}>
                  Week starts Monday
                </LocalizedText>
                <LocalizedText
                  style={[
                    styles.rowSub,
                    {color: theme.colors.textSecondary},
                  ]}>
                  {weekStartsMonday
                    ? 'Monday → Sunday'
                    : 'Sunday → Saturday'}
                </LocalizedText>
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
        <LocalizedText style={styles.sectionLabel}>NOTIFICATIONS</LocalizedText>

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
                <LocalizedText
                  style={[styles.rowTitle, {color: theme.colors.text}]}>
                  Push notifications
                </LocalizedText>
                <LocalizedText
                  style={[
                    styles.rowSub,
                    {color: theme.colors.textSecondary},
                  ]}>
                  Get alerts for important tasks
                </LocalizedText>
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
                <LocalizedText
                  style={[styles.rowTitle, {color: theme.colors.text}]}>
                  Task reminders
                </LocalizedText>
                <LocalizedText
                  style={[
                    styles.rowSub,
                    {color: theme.colors.textSecondary},
                  ]}>
                  Notify before due date
                </LocalizedText>
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
                <LocalizedText
                  style={[styles.rowTitle, {color: theme.colors.text}]}>
                  Snooze duration
                </LocalizedText>
                <LocalizedText
                  style={[
                    styles.rowSub,
                    {color: theme.colors.textSecondary},
                  ]}>
                  Tap to cycle through options
                </LocalizedText>
              </View>
            </View>
            <Pressable onPress={cycleSnooze} hitSlop={8}>
              <View
                style={[
                  styles.pill,
                  {backgroundColor: theme.colors.primary + '18'},
                ]}>
                <LocalizedText
                  style={[
                    styles.pillText,
                    {color: theme.colors.primary},
                  ]}>
                  {snoozeDuration}min
                </LocalizedText>
              </View>
            </Pressable>
          </View>
        </View>

        {/* ============ SECURITY & GESTURES ============ */}
        <LocalizedText style={styles.sectionLabel}>SECURITY & GESTURES</LocalizedText>

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
                <LocalizedText
                  style={[styles.rowTitle, {color: theme.colors.text}]}>
                  App Lock
                </LocalizedText>
                <LocalizedText
                  style={[
                    styles.rowSub,
                    {color: theme.colors.textSecondary},
                  ]}>
                  Use phone's fingerprint or screen lock
                </LocalizedText>
              </View>
            </View>
            <Switch
              value={isLockEnabled}
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
                <LocalizedText
                  style={[styles.rowTitle, {color: theme.colors.text}]}>
                  Haptic Feedback
                </LocalizedText>
                <LocalizedText
                  style={[
                    styles.rowSub,
                    {color: theme.colors.textSecondary},
                  ]}>
                  Vibrate on taps and actions
                </LocalizedText>
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
                <LocalizedText
                  style={[styles.rowTitle, {color: theme.colors.text}]}>
                  Swipe Actions
                </LocalizedText>
                <LocalizedText
                  style={[
                    styles.rowSub,
                    {color: theme.colors.textSecondary},
                  ]}>
                  Swipe tasks for quick actions
                </LocalizedText>
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
        <LocalizedText style={styles.sectionLabel}>DATA</LocalizedText>

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
                <LocalizedText
                  style={[styles.rowTitle, {color: theme.colors.text}]}>
                  Backup Data
                </LocalizedText>
                <LocalizedText
                  style={[
                    styles.rowSub,
                    {color: theme.colors.textSecondary},
                  ]}>
                  Export tasks as a file
                </LocalizedText>
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
                <LocalizedText
                  style={[styles.rowTitle, {color: theme.colors.text}]}>
                  Restore Data
                </LocalizedText>
                <LocalizedText
                  style={[
                    styles.rowSub,
                    {color: theme.colors.textSecondary},
                  ]}>
                  Import from a backup
                </LocalizedText>
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
                <LocalizedText
                  style={[styles.rowTitle, {color: '#EF4444'}]}>
                  Reset app data
                </LocalizedText>
                <LocalizedText
                  style={[
                    styles.rowSub,
                    {color: theme.colors.textSecondary},
                  ]}>
                  Delete everything permanently
                </LocalizedText>
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
        <LocalizedText style={styles.sectionLabel}>SUPPORT</LocalizedText>

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
                <LocalizedText
                  style={[styles.rowTitle, {color: theme.colors.text}]}>
                  FAQ
                </LocalizedText>
                <LocalizedText
                  style={[
                    styles.rowSub,
                    {color: theme.colors.textSecondary},
                  ]}>
                  Frequently asked questions
                </LocalizedText>
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
                <LocalizedText
                  style={[styles.rowTitle, {color: theme.colors.text}]}>
                  Send feedback
                </LocalizedText>
                <LocalizedText
                  style={[
                    styles.rowSub,
                    {color: theme.colors.textSecondary},
                  ]}>
                  Help us improve
                </LocalizedText>
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
                <LocalizedText
                  style={[styles.rowTitle, {color: theme.colors.text}]}>
                  More apps
                </LocalizedText>
                <LocalizedText
                  style={[
                    styles.rowSub,
                    {color: theme.colors.textSecondary},
                  ]}>
                  Explore our other apps
                </LocalizedText>
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
        <LocalizedText style={styles.sectionLabel}>ABOUT</LocalizedText>

        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}>
          <Pressable
            onPress={() => setAboutDeveloperVisible(true)}
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
                <Code size={15} color="#6366F1" strokeWidth={2.6} />
              </View>
              <View style={{flex: 1, minWidth: 0}}>
                <LocalizedText
                  style={[styles.rowTitle, {color: theme.colors.text}]}>
                  About Developer
                </LocalizedText>
                <LocalizedText
                  style={[
                    styles.rowSub,
                    {color: theme.colors.textSecondary},
                  ]}>
                  Meet the developer · Rohit Kumar
                </LocalizedText>
              </View>
            </View>
            <ChevronRight
              size={16}
              color={theme.colors.textLight}
              strokeWidth={2.4}
            />
          </Pressable>
          <Pressable
            onPress={() => {
              setLegalTab('privacy');
              setLegalModalVisible(true);
            }}
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
                <LocalizedText
                  style={[styles.rowTitle, {color: theme.colors.text}]}>
                  Privacy policy
                </LocalizedText>
                <LocalizedText
                  style={[
                    styles.rowSub,
                    {color: theme.colors.textSecondary},
                  ]}>
                  How we handle your data
                </LocalizedText>
              </View>
            </View>
            <ChevronRight
              size={16}
              color={theme.colors.textLight}
              strokeWidth={2.4}
            />
          </Pressable>

          <Pressable
            onPress={() => {
              setLegalTab('terms');
              setLegalModalVisible(true);
            }}
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
                <LocalizedText
                  style={[styles.rowTitle, {color: theme.colors.text}]}>
                  Terms of service
                </LocalizedText>
                <LocalizedText
                  style={[
                    styles.rowSub,
                    {color: theme.colors.textSecondary},
                  ]}>
                  Terms and conditions
                </LocalizedText>
              </View>
            </View>
            <ChevronRight
              size={16}
              color={theme.colors.textLight}
              strokeWidth={2.4}
            />
          </Pressable>
        </View>


        {/* ============ VERSION ============ */}
        <View style={styles.versionWrap}>
          <View style={styles.versionRow}>
            <Sparkles
              size={11}
              color={theme.colors.textLight}
              strokeWidth={2.6}
            />
            <LocalizedText
              style={[
                styles.versionText,
                {color: theme.colors.textLight},
              ]}>
              Tasklume · v1.0.0
            </LocalizedText>
          </View>
          <LocalizedText
            style={[
              styles.versionSub,
              {color: theme.colors.textLight},
            ]}>
            Plan Smart. Focus Better.
          </LocalizedText>
        </View>
      </ScrollView>

      {/* ============ ABOUT DEVELOPER MODAL ============ */}
      <Modal
        visible={aboutDeveloperVisible}
        animationType="slide"
        transparent={true}
        statusBarTranslucent
        onRequestClose={() => setAboutDeveloperVisible(false)}>
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setAboutDeveloperVisible(false)}
          />
          <View
            style={[
              styles.modalSheet,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}>
            <View style={styles.modalHandleWrap}>
              <View
                style={[
                  styles.modalHandle,
                  {backgroundColor: theme.colors.border},
                ]}
              />
            </View>

            <View style={styles.modalHeader}>
              <View style={{flex: 1}}>
                <LocalizedText
                  style={[
                    styles.modalTitle,
                    {color: theme.colors.text},
                  ]}>
                  About Developer
                </LocalizedText>
                <LocalizedText
                  style={[
                    styles.modalSub,
                    {color: theme.colors.textSecondary},
                  ]}>
                  Developer Details & Contact
                </LocalizedText>
              </View>
              <Pressable
                onPress={() => setAboutDeveloperVisible(false)}
                hitSlop={8}
                style={[
                  styles.modalCloseBtn,
                  {backgroundColor: theme.colors.background},
                ]}>
                <X size={16} color={theme.colors.text} strokeWidth={2.4} />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}>
              <AboutMe style={{marginHorizontal: 0, marginVertical: 6}} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ============ LEGAL MODAL (PRIVACY & TERMS) ============ */}
      <LegalModal
        visible={legalModalVisible}
        initialTab={legalTab}
        onClose={() => setLegalModalVisible(false)}
      />

      {/* ============ BACKUP RESTORE MODAL ============ */}
      <BackupImportModal
        visible={importModalVisible}
        onClose={() => setImportModalVisible(false)}
        onImport={importTodos}
      />

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

    /* Modal / BottomSheet styles */
    modalOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0, 0, 0, 0.55)',
    },
    modalBackdrop: {
      ...StyleSheet.absoluteFillObject,
    },
    modalSheet: {
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      borderTopWidth: 1,
      borderLeftWidth: 1,
      borderRightWidth: 1,
      maxHeight: '88%',
      paddingBottom: Math.max(insets.bottom, 16) + 6,
    },
    modalHandleWrap: {
      alignItems: 'center',
      paddingVertical: 10,
    },
    modalHandle: {
      width: 42,
      height: 4,
      borderRadius: 2,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingBottom: 10,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '800',
      letterSpacing: -0.3,
    },
    modalSub: {
      fontSize: 12,
      fontWeight: '500',
      marginTop: 2,
    },
    modalCloseBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalScrollContent: {
      paddingHorizontal: 16,
      paddingBottom: 20,
    },
  });
}

export default SettingsScreen;