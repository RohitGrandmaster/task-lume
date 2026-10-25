/**
 * RESPONSIBILITY: Pure Navigation Stack Shell for the User Voice domain (≤80 lines).
 * FLOW: Mounts route screens for voice recording and memos; zero business logic.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { USER_VOICE_ROUTES } from '../voice_memos/config/user_voice.url_config';
import { UserVoiceScreen } from '../voice_memos/screens/UserVoiceScreen';

const Stack = createNativeStackNavigator();

export function UserVoiceNavigator() {
  return (
    <Stack.Navigator
      initialRouteName={USER_VOICE_ROUTES.MEMOS}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name={USER_VOICE_ROUTES.MEMOS} component={UserVoiceScreen} />
    </Stack.Navigator>
  );
}
