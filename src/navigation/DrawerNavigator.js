import React from 'react';
import {useWindowDimensions} from 'react-native';
import {createDrawerNavigator} from '@react-navigation/drawer';

import MainNavigator from './MainNavigator';
import { UserRemindersScreen } from '../features/frontend_user/user_reminders/reminders_active/screens/UserRemindersScreen';
import { UserTodosFavoritesScreen } from '../features/frontend_user/user_todos/todos_management/screens/UserTodosFavoritesScreen';
import { UserTodosCategoriesScreen } from '../features/frontend_user/user_todos/todos_management/screens/UserTodosCategoriesScreen';
import { UserTodosTrashScreen } from '../features/frontend_user/user_todos/todos_management/screens/UserTodosTrashScreen';
import { UserVoiceScreen } from '../features/frontend_user/user_voice/voice_memos/screens/UserVoiceScreen';
import ProfileScreen from '../screens/settings/ProfileScreen';
import { UserSettingsScreen } from '../features/frontend_user/user_settings/settings_profile/screens/UserSettingsScreen';
import MoreAppsScreen from '../screens/settings/MoreAppsScreen';
import FeedbackScreen from '../screens/settings/FeedbackScreen';
import FAQScreen from '../screens/settings/FAQScreen';
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
      <Drawer.Screen name="Reminders" component={UserRemindersScreen} />
      <Drawer.Screen name="Favorites" component={UserTodosFavoritesScreen} />
      <Drawer.Screen name="VoiceMemos" component={UserVoiceScreen} />
      <Drawer.Screen name="Categories" component={UserTodosCategoriesScreen} />
      <Drawer.Screen name="Trash" component={UserTodosTrashScreen} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
      <Drawer.Screen name="Settings" component={UserSettingsScreen} />
      <Drawer.Screen name="MoreApps" component={MoreAppsScreen} />
      <Drawer.Screen name="Feedback" component={FeedbackScreen} />
      <Drawer.Screen name="FAQ" component={FAQScreen} />
    </Drawer.Navigator>
  );
}

export default DrawerNavigator;
