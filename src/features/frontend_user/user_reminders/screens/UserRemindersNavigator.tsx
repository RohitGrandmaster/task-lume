/**
 * RESPONSIBILITY: Pure Navigation Stack Shell for the User Reminders domain (≤80 lines).
 * FLOW: Mounts route screens for active reminders and task alarms; zero business logic.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { USER_REMINDERS_ROUTES } from '../reminders_active/config/user_reminders.url_config';
import { UserRemindersScreen } from '../reminders_active/screens/UserRemindersScreen';

const Stack = createNativeStackNavigator();

export function UserRemindersNavigator() {
  return (
    <Stack.Navigator
      initialRouteName={USER_REMINDERS_ROUTES.ACTIVE}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name={USER_REMINDERS_ROUTES.ACTIVE} component={UserRemindersScreen} />
    </Stack.Navigator>
  );
}
