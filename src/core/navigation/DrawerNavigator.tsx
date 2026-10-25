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
    </Drawer.Navigator>
  );
}

export default DrawerNavigator;
