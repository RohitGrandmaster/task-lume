/**
 * RESPONSIBILITY: Opens the canonical confirmation sheet and resolves only after confirm/cancel.
 * FLOW: Feature action → confirm(options, action) → ConfirmBottomSheet → boolean result.
 */

import React, { useCallback, useRef, useState } from 'react';
import { ConfirmBottomSheet } from '../ui/ConfirmBottomSheet';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  destructive?: boolean;
  errorMessage?: string;
}

/**
 * Requests explicit user confirmation before running a potentially destructive action.
 *
 * @param options - Localized title, consequence description, and button labels.
 * @param action - Mutation executed only after confirmation; may return a promise.
 * @returns A promise resolving true only after the action succeeds; false on cancel.
 */
export function useConfirm() {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const actionRef = useRef<(() => void | Promise<void>) | null>(null);
  const resolveRef = useRef<((confirmed: boolean) => void) | null>(null);

  const complete = useCallback((confirmed: boolean) => {
    const resolve = resolveRef.current;
    resolveRef.current = null;
    actionRef.current = null;
    setOptions(null);
    resolve?.(confirmed);
  }, []);

  const confirm = useCallback((nextOptions: ConfirmOptions, action: () => void | Promise<void>) => {
    return new Promise<boolean>((resolve) => {
      resolveRef.current?.(false);
      actionRef.current = action;
      resolveRef.current = resolve;
      setOptions(nextOptions);
    });
  }, []);

  const runConfirmedAction = useCallback(async () => {
    await actionRef.current?.();
  }, []);

  const confirmDialog = (
    <ConfirmBottomSheet
      visible={options !== null}
      title={options?.title ?? ''}
      message={options?.message ?? ''}
      confirmLabel={options?.confirmLabel ?? 'Confirm'}
      cancelLabel={options?.cancelLabel ?? 'Cancel'}
      destructive={options?.destructive ?? true}
      errorMessage={options?.errorMessage}
      onConfirm={runConfirmedAction}
      onConfirmed={() => complete(true)}
      onCancel={() => complete(false)}
    />
  );

  return { confirm, confirmDialog };
}
