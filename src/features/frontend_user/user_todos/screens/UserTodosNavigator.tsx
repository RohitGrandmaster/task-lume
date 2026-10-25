/**
 * RESPONSIBILITY: Pure Navigation Stack Shell for the User Todos domain.
 * FLOW: Mounts route screens for todos management under canonical URL configs; zero business logic.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { USER_TODOS_ROUTES, type UserTodosStackParamList } from '../todos_management/config/user_todos.url_config';
import { UserTodosHomeScreen } from '../todos_management/screens/UserTodosHomeScreen';
import { UserTodosAddScreen } from '../todos_management/screens/UserTodosAddScreen';
import { UserTodosEditScreen } from '../todos_management/screens/UserTodosEditScreen';
import { UserTodosDetailScreen } from '../todos_management/screens/UserTodosDetailScreen';
import { UserTodosTrashScreen } from '../todos_management/screens/UserTodosTrashScreen';
import { UserTodosFavoritesScreen } from '../todos_management/screens/UserTodosFavoritesScreen';
import { UserTodosCategoriesScreen } from '../todos_management/screens/UserTodosCategoriesScreen';

const Stack = createNativeStackNavigator<UserTodosStackParamList>();

export function UserTodosNavigator() {
  return (
    <Stack.Navigator
      initialRouteName={USER_TODOS_ROUTES.HOME}
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name={USER_TODOS_ROUTES.HOME} component={UserTodosHomeScreen} />
      <Stack.Screen name={USER_TODOS_ROUTES.ADD} component={UserTodosAddScreen} />
      <Stack.Screen name={USER_TODOS_ROUTES.EDIT} component={UserTodosEditScreen} />
      <Stack.Screen name={USER_TODOS_ROUTES.DETAIL} component={UserTodosDetailScreen} />
      <Stack.Screen name={USER_TODOS_ROUTES.TRASH} component={UserTodosTrashScreen} />
      <Stack.Screen name={USER_TODOS_ROUTES.FAVORITES} component={UserTodosFavoritesScreen} />
      <Stack.Screen name={USER_TODOS_ROUTES.CATEGORIES} component={UserTodosCategoriesScreen} />
    </Stack.Navigator>
  );
}
