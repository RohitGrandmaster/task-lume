import React, {useState} from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
  Image,
  LayoutAnimation,
} from 'react-native';

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
  Crown,
  StickyNote,
  Palette,
  Check,
  ChevronDown,
} from 'lucide-react-native';

import useTheme from '../hooks/useTheme';
import useAuth from '../hooks/useAuth';
import {useTranslation} from '../i18n/translations';

const ICON_COLORS = {
  tasks: '#3B82F6',
  overview: '#8B5CF6',
  calendar: '#F59E0B',
  focus: '#EC4899',
  notes: '#10B981',
  reminders: '#F97316',
  favorites: '#EAB308',
  voice: '#14B8A6',
  categories: '#06B6D4',
  trash: '#EF4444',
  profile: '#6366F1',
  settings: '#64748B',
  theme: '#F59E0B',
};

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
      hitSlop={4}
      style={({pressed}) => [
        styles.menuItem,
        {
          backgroundColor: active
            ? theme.mode === 'dark'
              ? `${color}1F`
              : `${color}0F`
            : pressed
            ? theme.mode === 'dark'
              ? 'rgba(255,255,255,0.04)'
              : 'rgba(0,0,0,0.03)'
            : 'transparent',
          opacity: pressed ? 0.85 : 1,
        },
      ]}>
      {active ? (
        <View style={[styles.activeBar, {backgroundColor: color}]} />
      ) : null}
      <IconBox icon={Icon} color={color} active={active} theme={theme} />
      <View style={styles.menuTextContainer}>
        <Text
          style={[styles.menuTitle, {color: active ? color : theme.colors.text}]}
          numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={[styles.menuSubtitle, {color: theme.colors.textLight}]}
            numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

function SectionTitle({title, theme}) {
  return (
    <View style={styles.sectionTitleWrap}>
      <Text style={[styles.sectionTitle, {color: theme.colors.textLight}]}>
        {title}
      </Text>
      <View
        style={[styles.sectionDivider, {backgroundColor: theme.colors.border}]}
      />
    </View>
  );
}

function getActiveRouteName(state) {
  if (!state) return null;
  const route = state.routes[state.index];
  if (route?.state) return getActiveRouteName(route.state);
  return route?.name ?? null;
}

function PremiumDrawerContent() {
  const navigation = useNavigation();
  const {theme, toggleTheme, accentColor, setAccentColor, palettes = []} =
    useTheme();
  const {user} = useAuth();
  const {t} = useTranslation();
  const insets = useSafeAreaInsets();
  const navState = useNavigationState(state => state);
  const activeRoute = getActiveRouteName(navState);
  const [paletteExpanded, setPaletteExpanded] = useState(false);

  function closeDrawer() {
    navigation.dispatch(DrawerActions.closeDrawer());
  }

  function closeAndGo(name, params) {
    closeDrawer();
    navigation.navigate(name, params);
  }

  function goToTask() {
    closeAndGo('Task', {screen: 'MainTabs', params: {screen: 'HomeTab'}});
  }

  function goToOverview() {
    closeAndGo('Task', {screen: 'MainTabs', params: {screen: 'Overview'}});
  }

  function goToCalendar() {
    closeAndGo('Task', {screen: 'MainTabs', params: {screen: 'Calendar'}});
  }

  function goToPomodoro() {
    closeAndGo('Task', {screen: 'MainTabs', params: {screen: 'Pomodoro'}});
  }

  const isTasksActive =
    activeRoute === 'HomeTab' ||
    activeRoute === 'MainTabs' ||
    activeRoute === 'Task' ||
    activeRoute === 'AddTodo' ||
    activeRoute === 'EditTodo' ||
    activeRoute === 'TodoDetail';

  return (
    <View
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: insets.bottom + 20},
        ]}>
        <View
          style={[
            styles.profileHeader,
            {
              backgroundColor: theme.colors.primary,
              paddingTop: insets.top + 12,
            },
          ]}>
          <View style={styles.headerDecorCircle} />
          <View style={styles.headerTopRow}>
            <View
              style={[
                styles.avatarWrap,
                {overflow: 'hidden', backgroundColor: '#070A38'},
              ]}>
              <Image
                source={require('../assets/images/tasklume_icon.png')}
                style={{width: '100%', height: '100%'}}
                resizeMode="cover"
              />
            </View>
            <View style={styles.proBadge}>
              <Crown size={11} color="#FFFFFF" strokeWidth={2.6} />
              <Text style={styles.proBadgeText}>
                {t('proFree', 'PRO FREE')}
              </Text>
            </View>
          </View>
          <Text style={styles.brandName}>Tasklume</Text>
          <Text style={styles.brandSubtitle} numberOfLines={1}>
            {user?.name?.trim()
              ? `Hi, ${user.name.trim()}`
              : t('planSmart', 'Plan Smart. Focus Better.')}
          </Text>
        </View>

        <SectionTitle title="WORKSPACE" theme={theme} />
        <DrawerMenuItem
          icon={CheckSquare}
          iconColor={ICON_COLORS.tasks}
          title={t('tasks', 'Tasks')}
          subtitle="Your daily tasks"
          active={isTasksActive}
          onPress={goToTask}
          theme={theme}
        />
        <DrawerMenuItem
          icon={ChartNoAxesColumnIncreasing}
          iconColor={ICON_COLORS.overview}
          title={t('overview', 'Overview')}
          subtitle="Progress & statistics"
          active={activeRoute === 'Overview'}
          onPress={goToOverview}
          theme={theme}
        />
        <DrawerMenuItem
          icon={CalendarDays}
          iconColor={ICON_COLORS.calendar}
          title={t('calendar', 'Calendar')}
          subtitle="Plan your schedule"
          active={activeRoute === 'Calendar'}
          onPress={goToCalendar}
          theme={theme}
        />
        <DrawerMenuItem
          icon={Timer}
          iconColor={ICON_COLORS.focus}
          title={t('focus', 'Focus')}
          subtitle="Pomodoro timer"
          active={activeRoute === 'Pomodoro'}
          onPress={goToPomodoro}
          theme={theme}
        />
        <DrawerMenuItem
          icon={Bell}
          iconColor={ICON_COLORS.reminders}
          title={t('reminders', 'Reminders')}
          subtitle="Never miss a task"
          active={activeRoute === 'Reminders'}
          onPress={() => closeAndGo('Reminders')}
          theme={theme}
        />
        <DrawerMenuItem
          icon={Star}
          iconColor={ICON_COLORS.favorites}
          title={t('favorites', 'Favorites')}
          subtitle="Important tasks"
          active={activeRoute === 'Favorites'}
          onPress={() => closeAndGo('Favorites')}
          theme={theme}
        />
        <DrawerMenuItem
          icon={Mic}
          iconColor={ICON_COLORS.voice}
          title={t('voiceMemos', 'Voice Memos')}
          subtitle="Record voice notes"
          active={activeRoute === 'VoiceMemos'}
          onPress={() => closeAndGo('VoiceMemos')}
          theme={theme}
        />
        <DrawerMenuItem
          icon={StickyNote}
          iconColor={ICON_COLORS.notes}
          title={t('notes', 'Notes')}
          subtitle="Auto-saved quick notes"
          active={activeRoute === 'Notes' || activeRoute === 'NoteEditor'}
          onPress={() => closeAndGo('Notes')}
          theme={theme}
        />

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
              {theme.mode === 'dark'
                ? t('darkMode', 'Dark Mode')
                : t('lightMode', 'Light Mode')}
            </Text>
            <Text
              style={[styles.menuSubtitle, {color: theme.colors.textLight}]}
              numberOfLines={1}>
              {t('switchAppearance', 'Switch app appearance')}
            </Text>
          </View>
          <Switch
            value={theme.mode === 'dark'}
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
            styles.themeColorCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              paddingVertical: paletteExpanded ? 10 : 8,
            },
          ]}>
          <Pressable
            onPress={() => {
              LayoutAnimation.configureNext(
                LayoutAnimation.Presets.easeInEaseOut,
              );
              setPaletteExpanded(prev => !prev);
            }}
            accessibilityRole="button"
            accessibilityLabel={t('themeColor', 'Theme Color')}
            style={({pressed}) => [
              styles.themeColorHeader,
              {
                marginBottom: paletteExpanded ? 10 : 0,
                opacity: pressed ? 0.75 : 1,
              },
            ]}>
            <IconBox
              icon={Palette}
              color={theme.colors.primary}
              active
              theme={theme}
            />
            <View style={styles.menuTextContainer}>
              <Text
                style={[styles.menuTitle, {color: theme.colors.text}]}
                numberOfLines={1}>
                {t('themeColor', 'Theme Color')}
              </Text>
              <Text
                style={[styles.menuSubtitle, {color: theme.colors.textLight}]}
                numberOfLines={1}>
                {palettes.find(p => p.id === accentColor)?.name || 'Indigo'}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                marginRight: 4,
              }}>
              <View
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  backgroundColor: theme.colors.primary,
                  borderWidth: 1.5,
                  borderColor: theme.mode === 'dark' ? '#FFFFFF' : '#0F172A',
                }}
              />
              <ChevronDown
                size={16}
                color={theme.colors.textLight}
                strokeWidth={2.4}
                style={{
                  transform: [
                    {rotate: paletteExpanded ? '180deg' : '0deg'},
                  ],
                }}
              />
            </View>
          </Pressable>

          {paletteExpanded && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              nestedScrollEnabled
              contentContainerStyle={styles.paletteRow}>
              {palettes.map(p => {
                const isSelected = accentColor === p.id;
                const dotColor = theme.mode === 'dark' ? p.dark : p.light;
                return (
                  <Pressable
                    key={p.id}
                    onPress={() => setAccentColor(p.id)}
                    accessibilityRole="button"
                    accessibilityLabel={p.name}
                    hitSlop={6}
                    style={({pressed}) => [
                      styles.paletteDot,
                      {
                        backgroundColor: dotColor,
                        borderWidth: isSelected ? 3 : 1,
                        borderColor: isSelected
                          ? theme.mode === 'dark'
                            ? '#FFFFFF'
                            : '#0F172A'
                          : theme.colors.border,
                        transform: [
                          {scale: pressed ? 0.9 : isSelected ? 1.08 : 1},
                        ],
                      },
                    ]}>
                    {isSelected ? (
                      <Check
                        size={14}
                        color={theme.mode === 'dark' ? '#000000' : '#FFFFFF'}
                        strokeWidth={3}
                      />
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        </View>

        <SectionTitle title="ORGANIZE" theme={theme} />
        <DrawerMenuItem
          icon={Tags}
          iconColor={ICON_COLORS.categories}
          title={t('categories', 'Categories')}
          subtitle="Manage categories"
          active={activeRoute === 'Categories'}
          onPress={() => closeAndGo('Categories')}
          theme={theme}
        />
        <DrawerMenuItem
          icon={Trash2}
          iconColor={ICON_COLORS.trash}
          title={t('trash', 'Trash')}
          subtitle="Deleted tasks"
          active={activeRoute === 'Trash'}
          onPress={() => closeAndGo('Trash')}
          theme={theme}
        />

        <SectionTitle title="ACCOUNT" theme={theme} />
        <DrawerMenuItem
          icon={UserRound}
          iconColor={ICON_COLORS.profile}
          title={t('profile', 'Profile')}
          subtitle="Your account"
          active={activeRoute === 'Profile'}
          onPress={() => closeAndGo('Profile')}
          theme={theme}
        />
        <DrawerMenuItem
          icon={Settings}
          iconColor={ICON_COLORS.settings}
          title={t('settings', 'Settings')}
          subtitle="App preferences"
          active={activeRoute === 'Settings'}
          onPress={() => closeAndGo('Settings')}
          theme={theme}
        />

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
            <Text style={[styles.footerTitle, {color: theme.colors.text}]}>
              Tasklume
            </Text>
            <Text style={[styles.version, {color: theme.colors.textLight}]}>
              • v1.0.0
            </Text>
          </View>
          <Text style={[styles.footerText, {color: theme.colors.textLight}]}>
            {t('planSmart', 'Plan Smart. Focus Better.')}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  scrollContent: {paddingBottom: 20},
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
  sectionTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    marginBottom: 8,
    marginHorizontal: 18,
  },
  sectionTitle: {fontSize: 10, fontWeight: '800', letterSpacing: 1.4},
  sectionDivider: {flex: 1, height: 1, opacity: 0.6},
  menuItem: {
    minHeight: 52,
    marginHorizontal: 10,
    marginVertical: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
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
  menuTextContainer: {flex: 1, marginLeft: 12},
  menuTitle: {fontSize: 13.5, fontWeight: '700', letterSpacing: -0.1},
  menuSubtitle: {fontSize: 10.5, marginTop: 1.5},
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    marginVertical: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  themeColorCard: {
    marginHorizontal: 10,
    marginVertical: 4,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  themeColorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  paletteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 2,
    paddingRight: 8,
  },
  paletteDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerCard: {
    marginHorizontal: 16,
    marginTop: 20,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  footerRow: {flexDirection: 'row', alignItems: 'center', gap: 6},
  footerDot: {width: 7, height: 7, borderRadius: 4},
  footerTitle: {fontSize: 13, fontWeight: '800'},
  version: {fontSize: 11},
  footerText: {marginTop: 4, fontSize: 11},
});

export default PremiumDrawerContent;
