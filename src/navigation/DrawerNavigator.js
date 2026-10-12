import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import {createDrawerNavigator} from '@react-navigation/drawer';
import {
  useNavigation,
  useNavigationState,
  DrawerActions,
} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {
  CheckSquare,
  ChartNoAxesColumnIncreasing,
  CalendarDays,
  Timer,
  Bell,
  Star,
  Mic,
  Tags,
  Trash2,
  UserRound,
  Settings,
  Sun,
  Moon,
  AppWindow,
  MessageSquare,
  CircleHelp,
  Crown,
  LogOut,
} from 'lucide-react-native';

import useTheme from '../hooks/useTheme';
import useAuth from '../hooks/useAuth';

import MainNavigator from './MainNavigator';
import RemindersScreen from '../screens/reminders/RemindersScreen';
import FavoritesScreen from '../screens/todo/FavoritesScreen';
import CategoriesScreen from '../screens/todo/CategoriesScreen';
import TrashScreen from '../screens/todo/TrashScreen';
import VoiceMemosScreen from '../screens/voice/VoiceMemosScreen';
import ProfileScreen from '../screens/settings/ProfileScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import MoreAppsScreen from '../screens/settings/MoreAppsScreen';
import FeedbackScreen from '../screens/settings/FeedbackScreen';
import FAQScreen from '../screens/settings/FAQScreen';

const Drawer = createDrawerNavigator();

const ICON_COLORS = {
  tasks: '#3B82F6',
  overview: '#8B5CF6',
  calendar: '#F59E0B',
  focus: '#EC4899',
  reminders: '#F97316',
  favorites: '#EAB308',
  voice: '#14B8A6',
  categories: '#06B6D4',
  trash: '#EF4444',
  profile: '#6366F1',
  settings: '#64748B',
  theme: '#F59E0B',
  apps: '#A855F7',
  feedback: '#10B981',
  faq: '#0EA5E9',
};

/* --------------------------- ICON BOX --------------------------- */

function IconBox({icon: Icon, color, active = false, theme, size = 36}) {
  const iconColor = color || theme.colors.primary;

  return (
    <View
      style={[
        styles.iconBox,
        {
          width: size,
          height: size,
          borderRadius: size * 0.3,
          backgroundColor: active
            ? `${iconColor}22`
            : theme.mode === 'dark'
            ? `${iconColor}18`
            : `${iconColor}10`,
          borderColor: active ? `${iconColor}55` : `${iconColor}28`,
        },
      ]}>
      <Icon size={18} color={iconColor} strokeWidth={2.2} />
    </View>
  );
}

/* --------------------------- MENU ITEM --------------------------- */

function DrawerMenuItem({
  icon: Icon,
  iconColor,
  title,
  subtitle,
  active = false,
  onPress,
  theme,
}) {
  const color = iconColor || theme.colors.primary;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({pressed}) => [
        styles.menuItem,
        {
          backgroundColor: active
            ? theme.mode === 'dark'
              ? `${color}1F`
              : `${color}0F`
            : 'transparent',
          opacity: pressed ? 0.7 : 1,
        },
      ]}>
      {active && (
        <View
          style={[styles.activeBar, {backgroundColor: color}]}
        />
      )}

      <IconBox icon={Icon} color={color} active={active} theme={theme} />

      <View style={styles.menuTextContainer}>
        <Text
          style={[
            styles.menuTitle,
            {color: active ? color : theme.colors.text},
          ]}
          numberOfLines={1}>
          {title}
        </Text>

        {subtitle ? (
          <Text
            style={[
              styles.menuSubtitle,
              {color: theme.colors.textLight},
            ]}
            numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

/* --------------------------- SECTION TITLE --------------------------- */

function SectionTitle({title, theme}) {
  return (
    <View style={styles.sectionTitleWrap}>
      <Text
        style={[styles.sectionTitle, {color: theme.colors.textLight}]}>
        {title}
      </Text>
      <View
        style={[
          styles.sectionDivider,
          {backgroundColor: theme.colors.border},
        ]}
      />
    </View>
  );
}

/* --------------------------- HELPERS --------------------------- */

function getActiveRouteName(state) {
  if (!state) return null;
  const route = state.routes[state.index];
  if (route?.state) return getActiveRouteName(route.state);
  return route?.name ?? null;
}

/* --------------------------- DRAWER CONTENT --------------------------- */

function PremiumDrawerContent() {
  const navigation = useNavigation();
  const {theme, toggleTheme} = useTheme();
  const {user, logout} = useAuth();
  const insets = useSafeAreaInsets();
  const navState = useNavigationState(state => state);
  const activeRoute = getActiveRouteName(navState);

  function closeDrawer() {
    navigation.dispatch(DrawerActions.closeDrawer());
  }

  function closeAndGo(name, params) {
    closeDrawer();
    navigation.navigate(name, params);
  }

  function goToTask() {
    closeAndGo('Task', {
      screen: 'MainTabs',
      params: {screen: 'HomeTab'},
    });
  }

  function goToOverview() {
    closeAndGo('Task', {
      screen: 'MainTabs',
      params: {screen: 'Overview'},
    });
  }

  function goToCalendar() {
    closeAndGo('Task', {
      screen: 'MainTabs',
      params: {screen: 'Calendar'},
    });
  }

  function goToPomodoro() {
    closeAndGo('Task', {
      screen: 'MainTabs',
      params: {screen: 'Pomodoro'},
    });
  }

  async function handleLogout() {
    closeDrawer();
    await logout();
  }

  const isTasksActive =
    activeRoute === 'HomeTab' ||
    activeRoute === 'MainTabs' ||
    activeRoute === 'Task' ||
    activeRoute === 'AddTodo' ||
    activeRoute === 'EditTodo' ||
    activeRoute === 'TodoDetail';

  const userInitial = user?.name
    ? user.name.trim().charAt(0).toUpperCase()
    : null;

  return (
    <View
      style={[
        styles.container,
        {backgroundColor: theme.colors.background},
      ]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: insets.bottom + 20},
        ]}>
        {/* ==================== COMPACT HEADER ==================== */}
        <View
          style={[
            styles.profileHeader,
            {
              backgroundColor: theme.colors.primary,
              paddingTop: insets.top + 12,
            },
          ]}>
          {/* Decorative soft circle */}
          <View style={styles.headerDecorCircle} />

          {/* Top row: avatar + PRO badge */}
          <View style={styles.headerTopRow}>
            <View style={styles.avatarWrap}>
              {userInitial ? (
                <Text style={styles.avatarText}>{userInitial}</Text>
              ) : (
                <CheckSquare
                  size={20}
                  color="#FFFFFF"
                  strokeWidth={2.5}
                />
              )}
            </View>

            <View style={styles.proBadge}>
              <Crown size={11} color="#FFFFFF" strokeWidth={2.6} />
              <Text style={styles.proBadgeText}>PRO</Text>
            </View>
          </View>

          {/* Brand + subtitle */}
          <Text style={styles.brandName}>TodoMaster</Text>
          <Text style={styles.brandSubtitle} numberOfLines={1}>
            {user?.name ? `Hi, ${user.name}` : 'Plan less. Do more.'}
          </Text>
        </View>

        {/* ==================== WORKSPACE ==================== */}
        <SectionTitle title="WORKSPACE" theme={theme} />

        <DrawerMenuItem
          icon={CheckSquare}
          iconColor={ICON_COLORS.tasks}
          title="Tasks"
          subtitle="Your daily tasks"
          active={isTasksActive}
          onPress={goToTask}
          theme={theme}
        />

        <DrawerMenuItem
          icon={ChartNoAxesColumnIncreasing}
          iconColor={ICON_COLORS.overview}
          title="Overview"
          subtitle="Progress & statistics"
          active={activeRoute === 'Overview'}
          onPress={goToOverview}
          theme={theme}
        />

        <DrawerMenuItem
          icon={CalendarDays}
          iconColor={ICON_COLORS.calendar}
          title="Calendar"
          subtitle="Plan your schedule"
          active={activeRoute === 'Calendar'}
          onPress={goToCalendar}
          theme={theme}
        />

        <DrawerMenuItem
          icon={Timer}
          iconColor={ICON_COLORS.focus}
          title="Focus"
          subtitle="Pomodoro timer"
          active={activeRoute === 'Pomodoro'}
          onPress={goToPomodoro}
          theme={theme}
        />

        <DrawerMenuItem
          icon={Bell}
          iconColor={ICON_COLORS.reminders}
          title="Reminders"
          subtitle="Never miss a task"
          active={activeRoute === 'Reminders'}
          onPress={() => closeAndGo('Reminders')}
          theme={theme}
        />

        <DrawerMenuItem
          icon={Star}
          iconColor={ICON_COLORS.favorites}
          title="Favorites"
          subtitle="Important tasks"
          active={activeRoute === 'Favorites'}
          onPress={() => closeAndGo('Favorites')}
          theme={theme}
        />

        <DrawerMenuItem
          icon={Mic}
          iconColor={ICON_COLORS.voice}
          title="Voice Memos"
          subtitle="Record voice notes"
          active={activeRoute === 'VoiceMemos'}
          onPress={() => closeAndGo('VoiceMemos')}
          theme={theme}
        />

        {/* ==================== ORGANIZE ==================== */}
        <SectionTitle title="ORGANIZE" theme={theme} />

        <DrawerMenuItem
          icon={Tags}
          iconColor={ICON_COLORS.categories}
          title="Categories"
          subtitle="Manage categories"
          active={activeRoute === 'Categories'}
          onPress={() => closeAndGo('Categories')}
          theme={theme}
        />

        <DrawerMenuItem
          icon={Trash2}
          iconColor={ICON_COLORS.trash}
          title="Trash"
          subtitle="Deleted tasks"
          active={activeRoute === 'Trash'}
          onPress={() => closeAndGo('Trash')}
          theme={theme}
        />

        {/* ==================== ACCOUNT ==================== */}
        <SectionTitle title="ACCOUNT" theme={theme} />

        <DrawerMenuItem
          icon={UserRound}
          iconColor={ICON_COLORS.profile}
          title="Profile"
          subtitle="Your account"
          active={activeRoute === 'Profile'}
          onPress={() => closeAndGo('Profile')}
          theme={theme}
        />

        <DrawerMenuItem
          icon={Settings}
          iconColor={ICON_COLORS.settings}
          title="Settings"
          subtitle="App preferences"
          active={activeRoute === 'Settings'}
          onPress={() => closeAndGo('Settings')}
          theme={theme}
        />

        {/* ==================== APPEARANCE ==================== */}
        <SectionTitle title="APPEARANCE" theme={theme} />

        <View
          style={[
            styles.themeRow,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}>
          <IconBox
            icon={theme.mode === 'dark' ? Moon : Sun}
            color={ICON_COLORS.theme}
            active
            theme={theme}
          />

          <View style={styles.menuTextContainer}>
            <Text
              style={[styles.menuTitle, {color: theme.colors.text}]}
              numberOfLines={1}>
              {theme.mode === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </Text>
            <Text
              style={[
                styles.menuSubtitle,
                {color: theme.colors.textLight},
              ]}
              numberOfLines={1}>
              Switch app appearance
            </Text>
          </View>

          <Switch
            value={theme.mode === 'dark'}
            onValueChange={toggleTheme}
            trackColor={{
              false: '#D6D8E0',
              true: theme.colors.primary,
            }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* ==================== MORE ==================== */}
        <SectionTitle title="MORE" theme={theme} />

        <DrawerMenuItem
          icon={AppWindow}
          iconColor={ICON_COLORS.apps}
          title="More Apps"
          subtitle="Explore more"
          active={activeRoute === 'MoreApps'}
          onPress={() => closeAndGo('MoreApps')}
          theme={theme}
        />

        <DrawerMenuItem
          icon={MessageSquare}
          iconColor={ICON_COLORS.feedback}
          title="Feedback"
          subtitle="Help us improve"
          active={activeRoute === 'Feedback'}
          onPress={() => closeAndGo('Feedback')}
          theme={theme}
        />

        <DrawerMenuItem
          icon={CircleHelp}
          iconColor={ICON_COLORS.faq}
          title="FAQ"
          subtitle="Common questions"
          active={activeRoute === 'FAQ'}
          onPress={() => closeAndGo('FAQ')}
          theme={theme}
        />

        {/* ==================== LOGOUT ==================== */}
        <Pressable
          onPress={handleLogout}
          accessibilityRole="button"
          accessibilityLabel="Logout"
          style={({pressed}) => [
            styles.logoutBtn,
            {
              backgroundColor:
                theme.colors.dangerSoft || 'rgba(239,68,68,0.10)',
              borderColor: `${theme.colors.danger}35`,
              opacity: pressed ? 0.75 : 1,
            },
          ]}>
          <LogOut
            size={16}
            color={theme.colors.danger}
            strokeWidth={2.6}
          />
          <Text
            style={[styles.logoutText, {color: theme.colors.danger}]}>
            Logout
          </Text>
        </Pressable>

        {/* ==================== FOOTER ==================== */}
        <View
          style={[
            styles.footerCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}>
          <View style={styles.footerRow}>
            <View
              style={[
                styles.footerDot,
                {backgroundColor: theme.colors.primary},
              ]}
            />
            <Text
              style={[styles.footerTitle, {color: theme.colors.text}]}>
              TodoMaster
            </Text>
            <Text
              style={[styles.version, {color: theme.colors.textLight}]}>
              • v1.0.0
            </Text>
          </View>

          <Text
            style={[styles.footerText, {color: theme.colors.textLight}]}>
            Stay focused. Stay productive.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

/* --------------------------- NAVIGATOR --------------------------- */

function DrawerNavigator() {
  const {width} = useWindowDimensions();
  const drawerWidth = Math.min(width * 0.78, 320);

  return (
    <Drawer.Navigator
      drawerContent={() => <PremiumDrawerContent />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        drawerStyle: {width: drawerWidth},
        overlayColor: 'rgba(0,0,0,0.45)',
        swipeEnabled: true,
      }}>
      <Drawer.Screen name="Task" component={MainNavigator} />
      <Drawer.Screen name="Reminders" component={RemindersScreen} />
      <Drawer.Screen name="Favorites" component={FavoritesScreen} />
      <Drawer.Screen name="VoiceMemos" component={VoiceMemosScreen} />
      <Drawer.Screen name="Categories" component={CategoriesScreen} />
      <Drawer.Screen name="Trash" component={TrashScreen} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
      <Drawer.Screen name="MoreApps" component={MoreAppsScreen} />
      <Drawer.Screen name="Feedback" component={FeedbackScreen} />
      <Drawer.Screen name="FAQ" component={FAQScreen} />
    </Drawer.Navigator>
  );
}

/* --------------------------- STYLES --------------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 20,
  },

  /* ==================== HEADER ==================== */
  profileHeader: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    overflow: 'hidden',
  },

  headerDecorCircle: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: -60,
    right: -50,
  },

  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  avatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.30)',
  },

  avatarText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.3,
  },

  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.20)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.30)',
  },

  proBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },

  brandName: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: -0.4,
  },

  brandSubtitle: {
    marginTop: 3,
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.1,
  },

  /* ==================== SECTION TITLE ==================== */
  sectionTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    marginBottom: 8,
    marginHorizontal: 18,
  },

  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
  },

  sectionDivider: {
    flex: 1,
    height: 1,
    opacity: 0.6,
  },

  /* ==================== MENU ITEM ==================== */
  menuItem: {
    minHeight: 52,
    marginHorizontal: 10,
    marginVertical: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },

  activeBar: {
    position: 'absolute',
    left: 0,
    top: 10,
    bottom: 10,
    width: 3,
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
  },

  iconBox: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },

  menuTextContainer: {
    flex: 1,
    marginLeft: 12,
  },

  menuTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    letterSpacing: -0.1,
  },

  menuSubtitle: {
    fontSize: 10.5,
    marginTop: 1.5,
    fontWeight: '500',
    letterSpacing: 0.1,
  },

  /* ==================== THEME ROW ==================== */
  themeRow: {
    minHeight: 52,
    marginHorizontal: 10,
    marginVertical: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  /* ==================== LOGOUT ==================== */
  logoutBtn: {
    marginHorizontal: 14,
    marginTop: 18,
    paddingVertical: 13,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
  },

  logoutText: {
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },

  /* ==================== FOOTER ==================== */
  footerCard: {
    marginTop: 16,
    marginHorizontal: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },

  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  footerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  footerTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    letterSpacing: -0.1,
  },

  version: {
    fontSize: 10.5,
    fontWeight: '600',
  },

  footerText: {
    fontSize: 10.5,
    marginTop: 4,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
});

export default DrawerNavigator;