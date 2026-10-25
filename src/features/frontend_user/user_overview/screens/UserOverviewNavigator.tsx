/**
 * RESPONSIBILITY: Pure Navigation Stack Shell for the User Overview domain (≤80 lines).
 * FLOW: Mounts route screens for overview dashboard analytics; zero business logic.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { USER_OVERVIEW_ROUTES } from '../overview_dashboard/config/user_overview.url_config';
import { UserOverviewScreen } from '../overview_dashboard/screens/UserOverviewScreen';

const Stack = createNativeStackNavigator();

export function UserOverviewNavigator() {
  return (
    <Stack.Navigator
      initialRouteName={USER_OVERVIEW_ROUTES.DASHBOARD}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name={USER_OVERVIEW_ROUTES.DASHBOARD} component={UserOverviewScreen} />
    </Stack.Navigator>
  );
}
