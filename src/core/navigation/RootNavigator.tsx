/**
 * RESPONSIBILITY: Canonical Root Navigation Orchestrator for TaskLume (Rule 5).
 * FLOW: Renders NavigationContainer wrapping DrawerNavigator; zero business logic.
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { DrawerNavigator } from './DrawerNavigator';

export function RootNavigator() {
  return (
    <NavigationContainer>
      <DrawerNavigator />
    </NavigationContainer>
  );
}

export default RootNavigator;
