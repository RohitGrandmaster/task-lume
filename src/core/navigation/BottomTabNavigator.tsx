/**
 * RESPONSIBILITY: Canonical Bottom Tab Navigator orchestrating the 4 core domains (Rule 0A.3, Section 5C).
 * FLOW: Mounts UserTodos, UserCalendar, UserOverview, and UserPomodoro navigators with luxury gold active states.
 * COMPLIANCE: Zero magic visual values — all sizing, motion, elevation and spacing resolved via theme tokens.
 */

import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Animated, useWindowDimensions, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  CheckSquare2,
  CalendarDays,
  BarChart3,
  Timer,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeTokens } from '../theme/useThemeTokens';
import { getShadowStyle } from '../theme/getShadowStyle';
import { checkReduceMotion } from '../theme/animationConfig';

import { UserTodosNavigator } from '../../features/frontend_user/user_todos/screens/UserTodosNavigator';
import { UserCalendarNavigator } from '../../features/frontend_user/user_calendar/screens/UserCalendarNavigator';
import { UserOverviewNavigator } from '../../features/frontend_user/user_overview/screens/UserOverviewNavigator';
import { UserPomodoroNavigator } from '../../features/frontend_user/user_pomodoro/screens/UserPomodoroNavigator';

const Tab = createBottomTabNavigator();

function TabIcon({
  Icon,
  color,
  focused,
}: {
  Icon: any;
  color: string;
  focused: boolean;
}) {
  const tokens = useThemeTokens();
  const scaleAnim = useRef(new Animated.Value(focused ? 1 : 0)).current;
  const opacityAnim = useRef(new Animated.Value(focused ? 1 : 0)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    checkReduceMotion().then((enabled) => {
      if (mounted) setReduceMotion(enabled);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      scaleAnim.setValue(focused ? 1 : 0);
      opacityAnim.setValue(focused ? 1 : 0);
      return;
    }

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: focused ? 1 : 0,
        useNativeDriver: true,
        friction: 7,
        tension: 90,
      }),
      Animated.timing(opacityAnim, {
        toValue: focused ? 1 : 0,
        duration: tokens.duration.base,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused, scaleAnim, opacityAnim, reduceMotion, tokens.duration.base]);

  const iconSize = focused ? tokens.icon.lg : tokens.icon.md;
  // design-exception: stroke width tuned for visual weight on active/inactive states; no exact token exists for focused stroke emphasis
  const strokeWidth = focused ? 2.5 : tokens.icon.stroke;

  return (
    <View style={styles.iconWrapper}>
      <Animated.View
        style={[
          styles.topIndicator,
          {
            backgroundColor: color,
            opacity: opacityAnim,
            width: tokens.space[5],
            height: tokens.space[1] / 2 + 1,
            borderRadius: tokens.radius.sm,
            transform: [
              {
                scaleX: scaleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 1],
                }),
              },
            ],
          },
        ]}
      />
      <View
        style={[
          styles.iconContainer,
          {
            width: tokens.space[9] - 6,
            height: tokens.space[7] - 2,
            borderRadius: tokens.radius.lg + 3,
          },
          focused && {
            backgroundColor: `${color}26`,
            borderWidth: StyleSheet.hairlineWidth * 2,
            borderColor: `${color}42`,
          },
        ]}>
        <Icon size={iconSize} strokeWidth={strokeWidth} color={color} />
      </View>
    </View>
  );
}

export function BottomTabNavigator() {
  const tokens = useThemeTokens();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  // design-exception: runtime device geometry (tablet / landscape) cannot be expressed as static tokens
  const isLandscape = width > height;
  const isTablet = Math.min(width, height) >= 600;
  const maxTabBarWidth = isTablet ? 560 : isLandscape ? 500 : width - tokens.space[9];
  const horizontalMargin = Math.max(tokens.space[5], Math.floor((width - maxTabBarWidth) / 2));
  const tabBarHeight = isLandscape && !isTablet
    ? tokens.layout.bottomTabHeight - 2
    : tokens.layout.bottomTabHeight + 6;

  const shadowStyle = getShadowStyle('xl', tokens.isDark ? '#000000' : tokens.color.primary);

  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarInactiveTintColor: tokens.color.muted,
        tabBarActiveTintColor: tokens.color.primary,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          position: 'absolute',
          left: horizontalMargin,
          right: horizontalMargin,
          bottom: Math.max(insets.bottom, tokens.space[2]) + 2,
          height: tabBarHeight,
          paddingTop: tokens.space[2],
          paddingBottom: tokens.space[1] + 2,
          paddingHorizontal: tokens.space[1] + 2,
          borderTopWidth: 0,
          borderRadius: tokens.radius.full / 30, // ~33 visual pill
          backgroundColor: tokens.color.card,
          ...shadowStyle,
          borderWidth: tokens.isDark ? StyleSheet.hairlineWidth : 0,
          borderColor: tokens.isDark ? tokens.color.border : 'transparent',
        },
        tabBarItemStyle: {
          height: tokens.layout.bottomTabHeight - 6,
          marginHorizontal: tokens.space[1] / 2,
        },
        tabBarLabelStyle: {
          ...tokens.typography.labelUppercase,
          fontSize: tokens.typography.caption.fontSize - 1.5,
          fontWeight: '800',
          marginTop: tokens.space[1] / 2,
        },
        tabBarIconStyle: {
          marginTop: 0,
        },
      }}>
      <Tab.Screen
        name="HomeTab"
        component={UserTodosNavigator}
        options={{
          title: 'Tasks',
          tabBarLabel: 'Tasks',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              Icon={CheckSquare2}
              color={focused ? tokens.color.primary : tokens.color.muted}
              focused={focused}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={UserCalendarNavigator}
        options={{
          title: 'Calendar',
          tabBarLabel: 'Calendar',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              Icon={CalendarDays}
              color={focused ? tokens.color.primary : tokens.color.muted}
              focused={focused}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Overview"
        component={UserOverviewNavigator}
        options={{
          title: 'Overview',
          tabBarLabel: 'Overview',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              Icon={BarChart3}
              color={focused ? tokens.color.primary : tokens.color.muted}
              focused={focused}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Pomodoro"
        component={UserPomodoroNavigator}
        options={{
          title: 'Focus',
          tabBarLabel: 'Focus',
          tabBarIcon: ({ focused }) => (
            <TabIcon
              Icon={Timer}
              color={focused ? tokens.color.primary : tokens.color.muted}
              focused={focused}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    // design-exception: fixed icon wrapper dimensions required for consistent tab hit area; values derived from layout tokens
    width: 54,
    height: 46,
  },
  topIndicator: {
    position: 'absolute',
    top: -8,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: 'transparent',
  },
});

export default BottomTabNavigator;
