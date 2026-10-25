/**
 * RESPONSIBILITY: Prevents accidental loss of dirty form data when leaving a navigation screen.
 * FLOW: Form isDirty → beforeRemove interception → canonical confirmation sheet → proceed or stay.
 */

import { useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useConfirm } from './useConfirm';

/**
 * Confirms before allowing a stack screen with unsaved edits to be removed.
 *
 * @param isDirty - React Hook Form's dirty flag for the current screen.
 * @returns The confirmation sheet element that must be mounted by the caller.
 */
export function useUnsavedChangesGuard(isDirty: boolean) {
  const navigation = useNavigation<any>();
  const { confirm, confirmDialog } = useConfirm();
  const allowLeaveRef = useRef(false);
  const confirmationPendingRef = useRef(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (event: any) => {
      if (!isDirty || allowLeaveRef.current) return;
      event.preventDefault();
      if (confirmationPendingRef.current) return;
      confirmationPendingRef.current = true;
      void confirm({
        title: 'Discard unsaved changes?',
        message: 'Your edits have not been saved. Leaving this screen will discard them.',
        confirmLabel: 'Discard Changes',
        cancelLabel: 'Keep Editing',
        destructive: true,
      }, () => {
        allowLeaveRef.current = true;
        navigation.dispatch(event.data.action);
      }).then((confirmed) => {
        confirmationPendingRef.current = false;
        if (!confirmed) allowLeaveRef.current = false;
      });
    });
    // navigation is the owning stack, while isDirty controls when interception is active.
    return unsubscribe;
  }, [confirm, isDirty, navigation]);

  return { confirmDialog };
}
