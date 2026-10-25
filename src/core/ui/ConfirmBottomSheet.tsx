/**
 * RESPONSIBILITY: Shared confirmation sheet for destructive or irreversible user actions.
 * FLOW: Feature calls useConfirm() → sheet presents → user confirms/cancels → promise resolves.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { triggerErrorHaptic } from '../interaction/haptics';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { AlertTriangle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeTokens } from '../theme/useThemeTokens';
import { showToast } from '../toast/showToast';
export interface ConfirmBottomSheetProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  destructive?: boolean;
  errorMessage?: string;
  onConfirm: () => void | Promise<void>;
  onConfirmed: () => void;
  onCancel: () => void;
}
export function ConfirmBottomSheet({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  destructive = true,
  errorMessage = 'The action could not be completed. Please try again.',
  onConfirm,
  onConfirmed,
  onCancel,
}: ConfirmBottomSheetProps) {
  const tokens = useThemeTokens();
  const insets = useSafeAreaInsets();
  const modalRef = useRef<BottomSheetModal>(null);
  const [isPending, setIsPending] = useState(false);
  const snapPoints = useMemo(() => ['40%'], []);
  useEffect(() => {
    if (visible) {
      modalRef.current?.present();
    } else {
      modalRef.current?.dismiss();
    }
  }, [visible]);
  const handleDismiss = useCallback(() => {
    if (!isPending) onCancel();
  }, [isPending, onCancel]);
  const handleConfirm = useCallback(async () => {
    if (isPending) return;
    setIsPending(true);
    triggerErrorHaptic();
    try {
      await onConfirm();
      onConfirmed();
      modalRef.current?.dismiss();
    } catch {
      showToast(errorMessage, 'error', 'confirm-bottom-sheet-action-failed');
    } finally {
      setIsPending(false);
    }
  }, [errorMessage, isPending, onConfirm, onConfirmed]);
  const styles = StyleSheet.create({
    content: {
      paddingHorizontal: tokens.space[4],
      paddingTop: tokens.space[3],
      paddingBottom: Math.max(insets.bottom, tokens.space[4]),
      backgroundColor: tokens.color.card,
      gap: tokens.space[3],
    },
    headingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: tokens.space[3],
    },
    warningIcon: {
      width: tokens.layout.minTouchTargetIos,
      height: tokens.layout.minTouchTargetIos,
      borderRadius: tokens.radius.full,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: destructive ? tokens.color.statusDangerBg : tokens.color.primarySubtle,
    },
    title: {
      ...tokens.typography.headingSm,
      color: tokens.color.foreground,
      flex: 1,
      flexShrink: 1,
    },
    message: {
      ...tokens.typography.bodySm,
      color: tokens.color.muted,
      flexShrink: 1,
    },
    actions: {
      flexDirection: 'row',
      gap: tokens.space[3],
      marginTop: tokens.space[2],
    },
    button: {
      flex: 1,
      minWidth: tokens.layout.buttonMinWidth,
      minHeight: Math.max(tokens.layout.minTouchTargetIos, tokens.layout.minTouchTargetAndroid),
      borderRadius: tokens.radius.md,
      borderWidth: 1,
      borderColor: tokens.color.border,
      paddingHorizontal: tokens.space[3],
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: tokens.space[2],
    },
    cancelText: {
      ...tokens.typography.body,
      color: tokens.color.foreground,
      fontWeight: '600',
    },
    confirmButton: {
      backgroundColor: destructive ? tokens.color.destructive : tokens.color.primary,
      borderColor: destructive ? tokens.color.destructive : tokens.color.primary,
      opacity: isPending ? tokens.opacity.loading : 1,
    },
    confirmText: {
      ...tokens.typography.body,
      color: destructive ? tokens.color.onDestructive : tokens.color.onPrimary,
      fontWeight: '700',
    },
  });
  return (
    <BottomSheetModal
      ref={modalRef}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose={!isPending}
      backdropComponent={(props) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          pressBehavior={isPending ? 'none' : 'close'}
        />
      )}
      backgroundStyle={{ backgroundColor: tokens.color.card }}
      handleIndicatorStyle={{ backgroundColor: tokens.color.border }}
      onDismiss={handleDismiss}
    >
      <BottomSheetView style={styles.content} accessibilityViewIsModal>
        <View style={styles.headingRow}>
          <View style={styles.warningIcon} accessible={false}>
            <AlertTriangle
              size={tokens.icon.lg}
              color={destructive ? tokens.color.destructive : tokens.color.primary}
            />
          </View>
          <Text style={styles.title} accessibilityRole="header">{title}</Text>
        </View>
        <Text style={styles.message}>{message}</Text>
        <View style={styles.actions}>
          <Pressable
            style={styles.button}
            onPress={() => {
              if (isPending) return;
              onCancel();
              modalRef.current?.dismiss();
            }}
            disabled={isPending}
            accessibilityRole="button"
            accessibilityLabel={cancelLabel}
            accessibilityState={{ disabled: isPending }}
            testID="confirm-bottom-sheet-cancel"
          >
            <Text style={styles.cancelText}>{cancelLabel}</Text>
          </Pressable>
          <Pressable
            style={[styles.button, styles.confirmButton]}
            onPress={handleConfirm}
            disabled={isPending}
            accessibilityRole="button"
            accessibilityLabel={confirmLabel}
            accessibilityState={{ disabled: isPending, busy: isPending }}
            testID="confirm-bottom-sheet-confirm"
          >
            {isPending ? (
              <ActivityIndicator
                size={tokens.icon.sm}
                color={destructive ? tokens.color.onDestructive : tokens.color.onPrimary}
              />
            ) : null}
            <Text style={styles.confirmText}>{confirmLabel}</Text>
          </Pressable>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
