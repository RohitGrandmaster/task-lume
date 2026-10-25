/**
 * RESPONSIBILITY: Canonical navigation interceptor guarding against accidental loss of unsaved form data.
 * FLOW: Listens to React Navigation beforeRemove event and requires user confirmation when isDirty is true.
 */

import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';

export function useUnsavedChangesGuard(isDirty: boolean, message: string = 'You have unsaved changes. Discard them?') {
  const navigation = useNavigation<any>();

  useEffect(() => {
    if (!isDirty || !navigation?.addListener) return;

    const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
      e.preventDefault();

      Alert.alert(
        'Discard Changes?',
        message,
        [
          { text: 'Keep Editing', style: 'cancel', onPress: () => {} },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.dispatch(e.data.action),
          },
        ]
      );
    });

    return unsubscribe;
  }, [navigation, isDirty, message]);
}

export default useUnsavedChangesGuard;
