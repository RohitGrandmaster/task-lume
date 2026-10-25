/**
 * RESPONSIBILITY: Pure Navigation Stack Shell for the User Calendar domain (≤80 lines).
 * FLOW: Mounts route screens for calendar agenda; zero business logic.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { USER_CALENDAR_ROUTES } from '../calendar_agenda/config/user_calendar.url_config';
import { UserCalendarScreen } from '../calendar_agenda/screens/UserCalendarScreen';

const Stack = createNativeStackNavigator();

export function UserCalendarNavigator() {
  return (
    <Stack.Navigator
      initialRouteName={USER_CALENDAR_ROUTES.AGENDA}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name={USER_CALENDAR_ROUTES.AGENDA} component={UserCalendarScreen} />
    </Stack.Navigator>
  );
}
