import React from 'react';
import {useWindowDimensions} from 'react-native';
import {createDrawerNavigator} from '@react-navigation/drawer';

import MainNavigator from './MainNavigator';
import { UserRemindersNavigator } from '../features/frontend_user/user_reminders/screens/UserRemindersNavigator';
import { UserVoiceNavigator } from '../features/frontend_user/user_voice/screens/UserVoiceNavigator';
import { UserSettingsNavigator } from '../features/frontend_user/user_settings/screens/UserSettingsNavigator';
import { UserTodosNavigator } from '../features/frontend_user/user_todos/screens/UserTodosNavigator';
import { UserCalendarNavigator } from '../features/frontend_user/user_calendar/screens/UserCalendarNavigator';
import { UserOverviewNavigator } from '../features/frontend_user/user_overview/screens/UserOverviewNavigator';
import { UserPomodoroNavigator } from '../features/frontend_user/user_pomodoro/screens/UserPomodoroNavigator';

import { UserRemindersScreen } from '../features/frontend_user/user_reminders/reminders_active/screens/UserRemindersScreen';
import { UserTodosFavoritesScreen } from '../features/frontend_user/user_todos/todos_management/screens/UserTodosFavoritesScreen';
import { UserTodosCategoriesScreen } from '../features/frontend_user/user_todos/todos_management/screens/UserTodosCategoriesScreen';
import { UserTodosTrashScreen } from '../features/frontend_user/user_todos/todos_management/screens/UserTodosTrashScreen';
import { UserVoiceScreen } from '../features/frontend_user/user_voice/voice_memos/screens/UserVoiceScreen';
import { UserProfileScreen } from '../features/frontend_user/user_settings/settings_profile/screens/UserProfileScreen';
import { UserSettingsScreen } from '../features/frontend_user/user_settings/settings_profile/screens/UserSettingsScreen';
import { UserMoreAppsScreen } from '../features/frontend_user/user_settings/settings_profile/screens/UserMoreAppsScreen';
import { UserFeedbackScreen } from '../features/frontend_user/user_settings/settings_profile/screens/UserFeedbackScreen';
import { UserFaqScreen } from '../features/frontend_user/user_settings/settings_profile/screens/UserFaqScreen';
import { UserAboutScreen } from '../features/frontend_user/user_settings/settings_profile/screens/UserAboutScreen';
import PremiumDrawerContent from './PremiumDrawerContent';

const Drawer = createDrawerNavigator();

function renderDrawerContent(props) {
  return <PremiumDrawerContent {...props} />;
}

function DrawerNavigator() {
  const {width} = useWindowDimensions();
  const drawerWidth = Math.min(width * 0.78, 320);

  return (
    <Drawer.Navigator
      drawerContent={renderDrawerContent}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        drawerStyle: {width: drawerWidth},
        overlayColor: 'rgba(0,0,0,0.45)',
        swipeEnabled: true,
      }}>
      <Drawer.Screen name="Task" component={MainNavigator} />
      <Drawer.Screen name="Reminders" component={UserRemindersNavigator} />
      <Drawer.Screen name="VoiceMemos" component={UserVoiceNavigator} />
      <Drawer.Screen name="Settings" component={UserSettingsNavigator} />
      <Drawer.Screen name="Todos" component={UserTodosNavigator} />
      <Drawer.Screen name="Calendar" component={UserCalendarNavigator} />
      <Drawer.Screen name="Overview" component={UserOverviewNavigator} />
      <Drawer.Screen name="Pomodoro" component={UserPomodoroNavigator} />

      {/* Backward-compatible alias routes */}
      <Drawer.Screen name="Favorites" component={UserTodosFavoritesScreen} />
      <Drawer.Screen name="Categories" component={UserTodosCategoriesScreen} />
      <Drawer.Screen name="Trash" component={UserTodosTrashScreen} />
      <Drawer.Screen name="Profile" component={UserProfileScreen} />
      <Drawer.Screen name="MoreApps" component={UserMoreAppsScreen} />
      <Drawer.Screen name="Feedback" component={UserFeedbackScreen} />
      <Drawer.Screen name="FAQ" component={UserFaqScreen} />
      <Drawer.Screen name="About" component={UserAboutScreen} />
    </Drawer.Navigator>
  );
}

export default DrawerNavigator;
