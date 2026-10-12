import React, {useEffect, useRef} from 'react';
import {StyleSheet, View, Animated} from 'react-native';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {
  CheckSquare2,
  CalendarDays,
  BarChart3,
  Timer,
} from 'lucide-react-native';

import {useSafeAreaInsets} from 'react-native-safe-area-context';
import useTheme from '../hooks/useTheme';

import HomeScreen from '../screens/todo/HomeScreen';
import AddTodoScreen from '../screens/todo/AddTodoScreen';
import EditTodoScreen from '../screens/todo/EditTodoScreen';
import TodoDetailScreen from '../screens/todo/TodoDetailScreen';

import CalendarScreen from '../screens/calendar/CalendarScreen';
import OverviewScreen from '../screens/overview/OverviewScreen';
import PomodoroScreen from '../screens/pomodoro/PomodoroScreen';
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

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_COLORS = {
  tasks: '#3B82F6',
  calendar: '#F59E0B',
  overview: '#8B5CF6',
  focus: '#EC4899',
};

/* --------------------------- TAB ICON --------------------------- */

function TabIcon({Icon, color, focused}) {
  const iconColor = color || '#3B82F6';
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
      {/* Active top indicator bar */}
      <Animated.View
        style={[
          styles.topIndicator,
          {
            backgroundColor: iconColor,
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

      {/* Icon container with active background */}
      <View
        style={[
          styles.iconContainer,
          focused && {
            backgroundColor: `${iconColor}26`,
            borderWidth: 1,
            borderColor: `${iconColor}42`,
          },
        ]}>
        <Icon
          size={focused ? 23 : 21}
          strokeWidth={focused ? 2.6 : 2.1}
          color={iconColor}
        />
      </View>
    </View>
  );
}

/* --------------------------- MAIN TABS --------------------------- */

function MainTabs() {
  const {theme} = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarInactiveTintColor: theme.colors.textLight,
        tabBarHideOnKeyboard: true,

        tabBarStyle: {
          position: 'absolute',
          left: 20,
          right: 20,
          bottom: Math.max(insets.bottom, 12) + 2,

          height: 66,

          paddingTop: 8,
          paddingBottom: 6,
          paddingHorizontal: 6,

          borderTopWidth: 0,
          borderRadius: 33,

          backgroundColor: theme.colors.surface,

          shadowColor: theme.mode === 'dark' ? '#000000' : theme.colors.primary,
          shadowOffset: {width: 0, height: 10},
          shadowOpacity: theme.mode === 'dark' ? 0.4 : 0.16,
          shadowRadius: 22,
          elevation: 14,

          borderWidth: theme.mode === 'dark' ? 1 : 0,
          borderColor:
            theme.mode === 'dark'
              ? 'rgba(255,255,255,0.07)'
              : 'transparent',
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

      {/* ============ TASKS ============ */}
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          title: 'Tasks',
          tabBarLabel: 'Tasks',
          tabBarActiveTintColor: TAB_COLORS.tasks,
          tabBarIcon: ({focused}) => (
            <TabIcon
              Icon={CheckSquare2}
              color={TAB_COLORS.tasks}
              focused={focused}
            />
          ),
        }}
      />

      {/* ============ CALENDAR ============ */}
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          title: 'Calendar',
          tabBarLabel: 'Calendar',
          tabBarActiveTintColor: TAB_COLORS.calendar,
          tabBarIcon: ({focused}) => (
            <TabIcon
              Icon={CalendarDays}
              color={TAB_COLORS.calendar}
              focused={focused}
            />
          ),
        }}
      />

      {/* ============ OVERVIEW ============ */}
      <Tab.Screen
        name="Overview"
        component={OverviewScreen}
        options={{
          title: 'Overview',
          tabBarLabel: 'Overview',
          tabBarActiveTintColor: TAB_COLORS.overview,
          tabBarIcon: ({focused}) => (
            <TabIcon
              Icon={BarChart3}
              color={TAB_COLORS.overview}
              focused={focused}
            />
          ),
        }}
      />

      {/* ============ FOCUS ============ */}
      <Tab.Screen
        name="Pomodoro"
        component={PomodoroScreen}
        options={{
          title: 'Focus',
          tabBarLabel: 'Focus',
          tabBarActiveTintColor: TAB_COLORS.focus,
          tabBarIcon: ({focused}) => (
            <TabIcon
              Icon={Timer}
              color={TAB_COLORS.focus}
              focused={focused}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

/* --------------------------- STACK NAVIGATOR --------------------------- */

function MainNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: {
          backgroundColor: 'transparent',
        },
      }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="AddTodo" component={AddTodoScreen} />
      <Stack.Screen name="EditTodo" component={EditTodoScreen} />
      <Stack.Screen name="TodoDetail" component={TodoDetailScreen} />
      <Stack.Screen name="Reminders" component={RemindersScreen} />
      <Stack.Screen name="Favorites" component={FavoritesScreen} />
      <Stack.Screen name="Categories" component={CategoriesScreen} />
      <Stack.Screen name="Trash" component={TrashScreen} />
      <Stack.Screen name="VoiceMemos" component={VoiceMemosScreen} />
      <Stack.Screen name="Stats" component={OverviewScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="MoreApps" component={MoreAppsScreen} />
      <Stack.Screen name="Feedback" component={FeedbackScreen} />
      <Stack.Screen name="FAQ" component={FAQScreen} />
    </Stack.Navigator>
  );
}

/* --------------------------- STYLES --------------------------- */

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

export default MainNavigator;