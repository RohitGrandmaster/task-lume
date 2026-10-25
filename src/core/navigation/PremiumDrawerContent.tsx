/**
 * RESPONSIBILITY: Canonical Drawer Content component rendered in DrawerNavigator (Section 5C.4).
 * FLOW: Styled with Luxury Premium Gold tokens; orchestrates navigation across workspaces and settings.
 */

import React, { useState } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  Palette,
  Check,
  ChevronDown,
} from 'lucide-react-native';

import { useThemeTokens } from '../theme/useThemeTokens';
import { useThemeContext } from '../theme/ThemeProvider';
import useAuth from '../../hooks/useAuth';
import useTheme from '../../hooks/useTheme';
import { CORE_ROUTES } from './routes';

function IconBox({
  icon: Icon,
  active = false,
  tokens,
  size = 36,
}: {
  icon: any;
  active?: boolean;
  tokens: any;
  size?: number;
}) {
  const iconColor = active ? tokens.color.primary : tokens.color.muted;
  return (
    <View
      style={[
        styles.iconBox,
        {
          width: size,
          height: size,
          borderRadius: size * 0.3,
          backgroundColor: active
            ? tokens.color.primarySubtle
            : tokens.isDark
            ? 'rgba(255,255,255,0.04)'
            : 'rgba(0,0,0,0.03)',
          borderColor: active ? tokens.color.primary : tokens.color.border,
        },
      ]}>
      <Icon size={18} color={iconColor} strokeWidth={2.2} />
    </View>
  );
}

function DrawerMenuItem({
  icon: Icon,
  title,
  subtitle,
  active = false,
  onPress,
  tokens,
}: {
  icon: any;
  title: string;
  subtitle?: string;
  active?: boolean;
  onPress: () => void;
  tokens: any;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      hitSlop={4}
      style={({ pressed }) => [
        styles.menuItem,
        {
          backgroundColor: active
            ? tokens.color.primarySubtle
            : pressed
            ? tokens.isDark
              ? 'rgba(255,255,255,0.04)'
              : 'rgba(0,0,0,0.03)'
            : 'transparent',
          opacity: pressed ? 0.85 : 1,
        },
      ]}>
      {active ? (
        <View style={[styles.activeBar, { backgroundColor: tokens.color.primary }]} />
      ) : null}
      <IconBox icon={Icon} active={active} tokens={tokens} />
      <View style={styles.menuTextContainer}>
        <Text
          style={[
            styles.menuTitle,
            {
              color: active ? tokens.color.foreground : tokens.color.muted,
              fontWeight: active ? '700' : '500',
            },
          ]}
          numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={[styles.menuSubtitle, { color: tokens.color.muted }]}
            numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

function SectionTitle({ title, tokens }: { title: string; tokens: any }) {
  return (
    <View style={styles.sectionTitleWrap}>
      <Text style={[styles.sectionTitle, { color: tokens.color.muted }]}>
        {title}
      </Text>
      <View
        style={[styles.sectionDivider, { backgroundColor: tokens.color.border }]}
      />
    </View>
  );
}

function getActiveRouteName(state: any): string | null {
  if (!state) return null;
  const route = state.routes[state.index];
  if (route?.state) return getActiveRouteName(route.state);
  return route?.name ?? null;
}

export function PremiumDrawerContent() {
  const navigation = useNavigation<any>();
  const tokens = useThemeTokens();
  const { toggleTheme, isDarkMode } = useThemeContext();
  const { accentColor, setAccentColor, palettes = [] } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const navState = useNavigationState(state => state);
  const activeRoute = getActiveRouteName(navState);
  const [paletteExpanded, setPaletteExpanded] = useState(false);

  function closeDrawer() {
    navigation.dispatch(DrawerActions.closeDrawer());
  }

  function closeAndGo(name: string, params?: any) {
    closeDrawer();
    navigation.navigate(name, params);
  }

  function goToTask() {
    closeAndGo(CORE_ROUTES.TASK, { screen: 'MainTabs', params: { screen: 'HomeTab' } });
  }

  function goToOverview() {
    closeAndGo(CORE_ROUTES.TASK, { screen: 'MainTabs', params: { screen: 'Overview' } });
  }

  function goToCalendar() {
    closeAndGo(CORE_ROUTES.TASK, { screen: 'MainTabs', params: { screen: 'Calendar' } });
  }

  function goToPomodoro() {
    closeAndGo(CORE_ROUTES.TASK, { screen: 'MainTabs', params: { screen: 'Pomodoro' } });
  }

  const isTasksActive =
    activeRoute === 'HomeTab' ||
    activeRoute === 'MainTabs' ||
    activeRoute === CORE_ROUTES.TASK ||
    activeRoute === 'AddTodo' ||
    activeRoute === 'EditTodo' ||
    activeRoute === 'TodoDetail';

  return (
    <View
      style={[styles.container, { backgroundColor: tokens.color.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}>
        <View
          style={[
            styles.profileHeader,
            {
              backgroundColor: tokens.color.card,
              borderBottomColor: tokens.color.border,
              borderBottomWidth: 1,
              paddingTop: insets.top + 12,
            },
          ]}>
          <View style={styles.headerDecorCircle} />
          <View style={styles.headerTopRow}>
            <View
              style={[
                styles.avatarWrap,
                { overflow: 'hidden', borderColor: tokens.color.border },
              ]}>
              <Image
                source={require('../../assets/images/tasklume_icon.png')}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            </View>
            <View
              style={[
                styles.proBadge,
                {
                  backgroundColor: tokens.color.primarySubtle,
                  borderColor: tokens.color.primary,
                },
              ]}>
              <Crown size={11} color={tokens.color.primary} strokeWidth={2.6} />
              <Text
                style={[
                  styles.proBadgeText,
                  { color: tokens.color.primary },
                ]}>
                {'PRO FREE'}
              </Text>
            </View>
          </View>
          <Text style={[styles.brandName, { color: tokens.color.foreground }]}>
            Tasklume
          </Text>
          <Text
            style={[styles.brandSubtitle, { color: tokens.color.muted }]}
            numberOfLines={1}>
            {user?.name?.trim()
              ? `Hi, ${user.name.trim()}`
              : 'Plan Smart. Focus Better.'}
          </Text>
        </View>

        <SectionTitle title="WORKSPACE" tokens={tokens} />
        <DrawerMenuItem
          icon={CheckSquare}
          title={'Tasks'}
          subtitle="Your daily tasks"
          active={isTasksActive}
          onPress={goToTask}
          tokens={tokens}
        />
        <DrawerMenuItem
          icon={ChartNoAxesColumnIncreasing}
          title={'Overview'}
          subtitle="Progress & statistics"
          active={activeRoute === 'Overview'}
          onPress={goToOverview}
          tokens={tokens}
        />
        <DrawerMenuItem
          icon={CalendarDays}
          title={'Calendar'}
          subtitle="Plan your schedule"
          active={activeRoute === 'Calendar'}
          onPress={goToCalendar}
          tokens={tokens}
        />
        <DrawerMenuItem
          icon={Timer}
          title={'Focus'}
          subtitle="Pomodoro timer"
          active={activeRoute === 'Pomodoro'}
          onPress={goToPomodoro}
          tokens={tokens}
        />
        <DrawerMenuItem
          icon={Bell}
          title={'Reminders'}
          subtitle="Never miss a task"
          active={activeRoute === CORE_ROUTES.REMINDERS}
          onPress={() => closeAndGo(CORE_ROUTES.REMINDERS)}
          tokens={tokens}
        />
        <DrawerMenuItem
          icon={Star}
          title={'Favorites'}
          subtitle="Important tasks"
          active={activeRoute === CORE_ROUTES.FAVORITES}
          onPress={() => closeAndGo(CORE_ROUTES.FAVORITES)}
          tokens={tokens}
        />
        <DrawerMenuItem
          icon={Mic}
          title={'Voice Memos'}
          subtitle="Record voice notes"
          active={activeRoute === CORE_ROUTES.VOICE_MEMOS}
          onPress={() => closeAndGo(CORE_ROUTES.VOICE_MEMOS)}
          tokens={tokens}
        />

        <SectionTitle title="APPEARANCE" tokens={tokens} />
        <View
          style={[
            styles.themeRow,
            {
              backgroundColor: tokens.color.card,
              borderColor: tokens.color.border,
            },
          ]}>
          <IconBox
            icon={isDarkMode ? Moon : Sun}
            active
            tokens={tokens}
          />
          <View style={styles.menuTextContainer}>
            <Text
              style={[styles.menuTitle, { color: tokens.color.foreground }]}
              numberOfLines={1}>
              {isDarkMode ? 'Dark Mode' : 'Light Mode'}
            </Text>
            <Text
              style={[styles.menuSubtitle, { color: tokens.color.muted }]}
              numberOfLines={1}>
              {'Switch app appearance'}
            </Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{
              false: tokens.color.border,
              true: tokens.color.primary,
            }}
            thumbColor={tokens.color.foreground}
            ios_backgroundColor={tokens.color.border}
          />
        </View>

        <View
          style={[
            styles.themeColorCard,
            {
              backgroundColor: tokens.color.card,
              borderColor: tokens.color.border,
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
            accessibilityLabel={'Theme Color'}
            style={({ pressed }) => [
              styles.themeColorHeader,
              {
                marginBottom: paletteExpanded ? 10 : 0,
                opacity: pressed ? 0.75 : 1,
              },
            ]}>
            <IconBox
              icon={Palette}
              active
              tokens={tokens}
            />
            <View style={styles.menuTextContainer}>
              <Text
                style={[styles.menuTitle, { color: tokens.color.foreground }]}
                numberOfLines={1}>
                {'Theme Color'}
              </Text>
              <Text
                style={[styles.menuSubtitle, { color: tokens.color.muted }]}
                numberOfLines={1}>
                {palettes.find(p => p.id === accentColor)?.name || 'Ocean Blue'}
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
                  backgroundColor: tokens.color.primary,
                  borderWidth: 1.5,
                  borderColor: tokens.color.foreground,
                }}
              />
              <ChevronDown
                size={16}
                color={tokens.color.muted}
                strokeWidth={2.4}
                style={{
                  transform: [
                    { rotate: paletteExpanded ? '180deg' : '0deg' },
                  ],
                }}
              />
            </View>
          </Pressable>

          {paletteExpanded && (
            <View style={styles.paletteRow}>
              {palettes.map(p => {
                const isSelected = accentColor === p.id;
                const dotColor = isDarkMode ? p.dark : p.light;
                return (
                  <Pressable
                    key={p.id}
                    onPress={() => setAccentColor(p.id)}
                    accessibilityRole="button"
                    accessibilityLabel={p.name}
                    hitSlop={6}
                    style={({ pressed }) => [
                      styles.paletteDot,
                      {
                        backgroundColor: dotColor,
                        borderWidth: isSelected ? 3 : 1,
                        borderColor: isSelected
                          ? tokens.color.foreground
                          : tokens.color.border,
                        transform: [
                          { scale: pressed ? 0.9 : isSelected ? 1.08 : 1 },
                        ],
                      },
                    ]}>
                    {isSelected ? (
                      <Check
                        size={14}
                        color={tokens.isDark ? '#000000' : '#FFFFFF'}
                        strokeWidth={3}
                      />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        <SectionTitle title="ORGANIZE" tokens={tokens} />
        <DrawerMenuItem
          icon={Tags}
          title={'Categories'}
          subtitle="Manage categories"
          active={activeRoute === CORE_ROUTES.CATEGORIES}
          onPress={() => closeAndGo(CORE_ROUTES.CATEGORIES)}
          tokens={tokens}
        />
        <DrawerMenuItem
          icon={Trash2}
          title={'Trash'}
          subtitle="Deleted tasks"
          active={activeRoute === CORE_ROUTES.TRASH}
          onPress={() => closeAndGo(CORE_ROUTES.TRASH)}
          tokens={tokens}
        />

        <SectionTitle title="ACCOUNT" tokens={tokens} />
        <DrawerMenuItem
          icon={UserRound}
          title={'Profile'}
          subtitle="Your account"
          active={activeRoute === CORE_ROUTES.PROFILE}
          onPress={() => closeAndGo(CORE_ROUTES.PROFILE)}
          tokens={tokens}
        />
        <DrawerMenuItem
          icon={Settings}
          title={'Settings'}
          subtitle="App preferences"
          active={activeRoute === CORE_ROUTES.SETTINGS}
          onPress={() => closeAndGo(CORE_ROUTES.SETTINGS)}
          tokens={tokens}
        />
        <DrawerMenuItem
          icon={Crown}
          title={'About Developer'}
          subtitle="Rohit Kumar"
          active={activeRoute === CORE_ROUTES.ABOUT}
          onPress={() => closeAndGo(CORE_ROUTES.ABOUT)}
          tokens={tokens}
        />

        <View
          style={[
            styles.footerCard,
            {
              backgroundColor: tokens.color.card,
              borderColor: tokens.color.border,
            },
          ]}>
          <View style={styles.footerRow}>
            <View
              style={[
                styles.footerDot,
                { backgroundColor: tokens.color.primary },
              ]}
            />
            <Text style={[styles.footerTitle, { color: tokens.color.foreground }]}>
              Tasklume
            </Text>
            <Text style={[styles.version, { color: tokens.color.muted }]}>
              • v1.0.0
            </Text>
          </View>
          <Text style={[styles.footerText, { color: tokens.color.muted }]}>
            {'Plan Smart. Focus Better.'}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
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
    backgroundColor: 'rgba(255,255,255,0.03)',
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
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
    borderWidth: 1,
  },
  proBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  brandName: {
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  brandSubtitle: {
    marginTop: 3,
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
  sectionTitle: { fontSize: 10, fontWeight: '800', letterSpacing: 1.4 },
  sectionDivider: { flex: 1, height: 1, opacity: 0.6 },
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
  menuTextContainer: { flex: 1, marginLeft: 12 },
  menuTitle: { fontSize: 13.5, letterSpacing: -0.1 },
  menuSubtitle: { fontSize: 10.5, marginTop: 1.5 },
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
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 10,
    paddingTop: 4,
    paddingBottom: 2,
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
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerDot: { width: 7, height: 7, borderRadius: 4 },
  footerTitle: { fontSize: 13, fontWeight: '800' },
  version: { fontSize: 11 },
  footerText: { marginTop: 4, fontSize: 11 },
});

export default PremiumDrawerContent;
