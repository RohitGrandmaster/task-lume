/**
 * RESPONSIBILITY: Canonical Bottom Tab Navigator orchestrating the 4 core domains (Rule 0A.3, Section 5C).
 * FLOW: Mounts UserTodos, UserCalendar, UserOverview, and UserPomodoro navigators with luxury gold active states.
 */

import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, useWindowDimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  CheckSquare2,
  CalendarDays,
  BarChart3,
  Timer,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeTokens } from '../theme/useThemeTokens';

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
  const scaleAnim = useRef(new Animated.Value(focused ? 1 : 0)).current;
  const opacityAnim = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: focused ? 1 : 0,
        useNativeDriver: true,
        friction: 7,
        tension: 90,
      }),
      Animated.timing(opacityAnim, {
        toValue: focused ? 1 : 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused, scaleAnim, opacityAnim]);

  return (
    <View style={styles.iconWrapper}>
      <Animated.View
        style={[
          styles.topIndicator,
          {
            backgroundColor: color,
            opacity: opacityAnim,
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
          focused && {
            backgroundColor: `${color}26`,
            borderWidth: 1,
            borderColor: `${color}42`,
          },
        ]}>
        <Icon
          size={focused ? 23 : 21}
          strokeWidth={focused ? 2.6 : 2.1}
          color={color}
        />
      </View>
    </View>
  );
}

export function BottomTabNavigator() {
  const tokens = useThemeTokens();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const isLandscape = width > height;
  const isTablet = Math.min(width, height) >= 600;
  const maxTabBarWidth = isTablet ? 560 : isLandscape ? 500 : width - 40;
  const horizontalMargin = Math.max(20, Math.floor((width - maxTabBarWidth) / 2));
  const tabBarHeight = isLandscape && !isTablet ? 58 : 66;

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
          bottom: Math.max(insets.bottom, 10) + 2,
          height: tabBarHeight,
          paddingTop: 8,
          paddingBottom: 6,
          paddingHorizontal: 6,
          borderTopWidth: 0,
          borderRadius: 33,
          backgroundColor: tokens.color.card,
          shadowColor: tokens.isDark ? '#000000' : tokens.color.primary,
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: tokens.isDark ? 0.4 : 0.16,
          shadowRadius: 22,
          elevation: 14,
          borderWidth: tokens.isDark ? 1 : 0,
          borderColor: tokens.isDark ? tokens.color.border : 'transparent',
        },
        tabBarItemStyle: {
          height: 54,
          marginHorizontal: 2,
        },
        tabBarLabelStyle: {
          fontSize: 10.5,
          fontWeight: '800',
          letterSpacing: 0.3,
          marginTop: 2,
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
    width: 54,
    height: 46,
  },
  topIndicator: {
    position: 'absolute',
    top: -8,
    width: 22,
    height: 3,
    borderRadius: 2,
  },
  iconContainer: {
    width: 42,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: 'transparent',
  },
});

export default BottomTabNavigator;
