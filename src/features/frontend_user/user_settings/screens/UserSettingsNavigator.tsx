/**
 * RESPONSIBILITY: Pure Navigation Stack Shell for the User Settings domain (≤80 lines).
 * FLOW: Mounts route screens for profile, security, data, FAQ, and developer about; zero business logic.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { USER_SETTINGS_ROUTES } from '../settings_profile/config/user_settings.url_config';
import { UserSettingsScreen } from '../settings_profile/screens/UserSettingsScreen';
import { UserProfileScreen } from '../settings_profile/screens/UserProfileScreen';
import { UserFeedbackScreen } from '../settings_profile/screens/UserFeedbackScreen';
import { UserFaqScreen } from '../settings_profile/screens/UserFaqScreen';
import { UserMoreAppsScreen } from '../settings_profile/screens/UserMoreAppsScreen';
import { UserAboutScreen } from '../settings_profile/screens/UserAboutScreen';

const Stack = createNativeStackNavigator();

export function UserSettingsNavigator() {
  return (
    <Stack.Navigator
      initialRouteName={USER_SETTINGS_ROUTES.MAIN}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name={USER_SETTINGS_ROUTES.MAIN} component={UserSettingsScreen} />
      <Stack.Screen name={USER_SETTINGS_ROUTES.PROFILE} component={UserProfileScreen} />
      <Stack.Screen name={USER_SETTINGS_ROUTES.FEEDBACK} component={UserFeedbackScreen} />
      <Stack.Screen name={USER_SETTINGS_ROUTES.FAQ} component={UserFaqScreen} />
      <Stack.Screen name={USER_SETTINGS_ROUTES.APPS} component={UserMoreAppsScreen} />
      <Stack.Screen name={USER_SETTINGS_ROUTES.ABOUT} component={UserAboutScreen} />
    </Stack.Navigator>
  );
}
