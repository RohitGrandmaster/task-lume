import React from 'react';
import {useWindowDimensions} from 'react-native';
import {createDrawerNavigator} from '@react-navigation/drawer';

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

export default DrawerNavigator;
