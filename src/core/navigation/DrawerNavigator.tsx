/**
 * RESPONSIBILITY: Canonical Drawer Navigator orchestrating all high-level domains (Rule 0A.3, Rule 5).
 * FLOW: Mounts Tier 3 Domain Navigators and renders PremiumDrawerContent shell.
 */

import React from 'react';
import { useWindowDimensions } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';

import { BottomTabNavigator } from './BottomTabNavigator';
import { PremiumDrawerContent } from './PremiumDrawerContent';
import { CORE_ROUTES } from './routes';

import { UserRemindersNavigator } from '../../features/frontend_user/user_reminders/screens/UserRemindersNavigator';
import { UserVoiceNavigator } from '../../features/frontend_user/user_voice/screens/UserVoiceNavigator';
import { UserSettingsNavigator } from '../../features/frontend_user/user_settings/screens/UserSettingsNavigator';
import { UserTodosNavigator } from '../../features/frontend_user/user_todos/screens/UserTodosNavigator';
import { UserCalendarNavigator } from '../../features/frontend_user/user_calendar/screens/UserCalendarNavigator';
import { UserOverviewNavigator } from '../../features/frontend_user/user_overview/screens/UserOverviewNavigator';
import { UserPomodoroNavigator } from '../../features/frontend_user/user_pomodoro/screens/UserPomodoroNavigator';

import { UserTodosFavoritesScreen } from '../../features/frontend_user/user_todos/todos_management/screens/UserTodosFavoritesScreen';
import { UserTodosCategoriesScreen } from '../../features/frontend_user/user_todos/todos_management/screens/UserTodosCategoriesScreen';
import { UserTodosTrashScreen } from '../../features/frontend_user/user_todos/todos_management/screens/UserTodosTrashScreen';
import { UserProfileScreen } from '../../features/frontend_user/user_settings/settings_profile/screens/UserProfileScreen';
import { UserMoreAppsScreen } from '../../features/frontend_user/user_settings/settings_profile/screens/UserMoreAppsScreen';
import { UserFeedbackScreen } from '../../features/frontend_user/user_settings/settings_profile/screens/UserFeedbackScreen';
import { UserFaqScreen } from '../../features/frontend_user/user_settings/settings_profile/screens/UserFaqScreen';
import { UserAboutScreen } from '../../features/frontend_user/user_settings/settings_profile/screens/UserAboutScreen';

const Drawer = createDrawerNavigator();

function renderDrawerContent(props: any) {
  return <PremiumDrawerContent {...props} />;
}

export function DrawerNavigator() {
  const { width } = useWindowDimensions();
  const drawerWidth = Math.min(width * 0.78, 320);

  return (
    <Drawer.Navigator
      drawerContent={renderDrawerContent}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        drawerStyle: { width: drawerWidth },
        overlayColor: 'rgba(0,0,0,0.45)',
        swipeEnabled: true,
      }}>
      <Drawer.Screen name={CORE_ROUTES.TASK} component={BottomTabNavigator} />
      <Drawer.Screen name={CORE_ROUTES.REMINDERS} component={UserRemindersNavigator} />
      <Drawer.Screen name={CORE_ROUTES.VOICE_MEMOS} component={UserVoiceNavigator} />
      <Drawer.Screen name={CORE_ROUTES.SETTINGS} component={UserSettingsNavigator} />
      <Drawer.Screen name={CORE_ROUTES.TODOS} component={UserTodosNavigator} />
      <Drawer.Screen name={CORE_ROUTES.CALENDAR} component={UserCalendarNavigator} />
      <Drawer.Screen name={CORE_ROUTES.OVERVIEW} component={UserOverviewNavigator} />
      <Drawer.Screen name={CORE_ROUTES.POMODORO} component={UserPomodoroNavigator} />

      {/* Backward-compatible alias routes */}
      <Drawer.Screen name={CORE_ROUTES.FAVORITES} component={UserTodosFavoritesScreen} />
      <Drawer.Screen name={CORE_ROUTES.CATEGORIES} component={UserTodosCategoriesScreen} />
      <Drawer.Screen name={CORE_ROUTES.TRASH} component={UserTodosTrashScreen} />
      <Drawer.Screen name={CORE_ROUTES.PROFILE} component={UserProfileScreen} />
      <Drawer.Screen name={CORE_ROUTES.MORE_APPS} component={UserMoreAppsScreen} />
      <Drawer.Screen name={CORE_ROUTES.FEEDBACK} component={UserFeedbackScreen} />
      <Drawer.Screen name={CORE_ROUTES.FAQ} component={UserFaqScreen} />
      <Drawer.Screen name={CORE_ROUTES.ABOUT} component={UserAboutScreen} />
    </Drawer.Navigator>
  );
}

export default DrawerNavigator;
