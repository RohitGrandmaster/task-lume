/**
 * RESPONSIBILITY: Canonical confirmation hook for high-stakes/destructive user actions (Rule 31).
 * FLOW: Manages confirmation modal state and resolves action callback upon explicit confirmation.
 */

import { useState, useCallback } from 'react';
import { triggerLightImpact } from '../interaction/haptics';

export interface ConfirmOptions {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
}

export function useConfirm() {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({
    title: 'Confirm Action',
    description: 'Are you sure you want to proceed?',
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    isDestructive: false,
  });
  const [resolver, setResolver] = useState<{ resolve: (value: boolean) => void } | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    triggerLightImpact();
    setOptions({
      confirmLabel: 'Confirm',
      cancelLabel: 'Cancel',
      isDestructive: false,
      ...opts,
    });
    setIsOpen(true);

    return new Promise<boolean>((resolve) => {
      setResolver({ resolve });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setIsOpen(false);
    if (resolver) {
      resolver.resolve(true);
      setResolver(null);
    }
  }, [resolver]);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
    if (resolver) {
      resolver.resolve(false);
      setResolver(null);
    }
  }, [resolver]);

  return {
    isOpen,
    options,
    confirm,
    handleConfirm,
    handleCancel,
  };
}

export default useConfirm;
