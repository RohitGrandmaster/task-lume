import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  View,
} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import DrawerNavigator from './DrawerNavigator';
import OnboardingScreen from '../screens/OnboardingScreen';
import {getItem, setItem} from '../storage/storage';
import APP_CONFIG from '../constants/appConfig';

const ONBOARDING_KEY = '@todomaster/onboarding_completed';
const NOTES_STORAGE_KEY = '@todomaster/notes';

function RootNavigator() {
  const [startup, setStartup] = useState('loading');

  useEffect(() => {
    let active = true;

    async function initialize() {
      try {
        const [completed, savedTodos, savedProfile, savedNotes] = await Promise.all([
          getItem(ONBOARDING_KEY, false),
          getItem(APP_CONFIG.STORAGE_KEYS.TODOS, null),
          getItem(APP_CONFIG.STORAGE_KEYS.AUTH_USER, null),
          getItem(NOTES_STORAGE_KEY, null),
        ]);

        const hasExistingData =
          (Array.isArray(savedTodos) && savedTodos.length > 0) ||
          Boolean(savedProfile && (savedProfile.name || savedProfile.email || savedProfile.mobile)) ||
          (Array.isArray(savedNotes) && savedNotes.length > 0);

        // Don't interrupt an existing user on upgrade just to show onboarding.
        if (!completed && hasExistingData) {
          await setItem(ONBOARDING_KEY, true);
        }

        if (active) setStartup(completed || hasExistingData ? 'app' : 'onboarding');
      } catch (error) {
        console.warn('[RootNavigator] startup setup failed:', error);
        if (active) setStartup('app');
      }
    }

    initialize();
    return () => {
      active = false;
    };
  }, []);

  async function finishOnboarding() {
    await setItem(ONBOARDING_KEY, true);
    setStartup('app');
  }

  return (
    <NavigationContainer>
      {startup === 'loading' ? (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <ActivityIndicator size="large" />
        </View>
      ) : startup === 'onboarding' ? (
        <OnboardingScreen onFinish={finishOnboarding} />
      ) : (
        <DrawerNavigator />
      )}
    </NavigationContainer>
  );
}

export default RootNavigator;
