/**
 * RESPONSIBILITY: Shows an accessible, token-based confirmation dialog for irreversible Todo actions.
 * FLOW: Todo detail/trash action → dialog → cancel or explicit confirm callback; no deletion logic lives here.
 */
import React, { useEffect, useState } from 'react';
import { AccessibilityInfo, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';
import { useTranslation } from '../../../../../core/i18n/useTranslation';
import { getMinTouchTarget } from '../../../../../core/theme/getMinTouchTarget';

export interface UserTodosConfirmDialogProps {
  visible: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

/**
 * Provides a native modal dialog with explicit cancel/confirm actions.
 * @param props - Visibility, explanatory copy, action labels, callbacks, and pending state.
 * @returns A modal dialog with screen-reader semantics and stable test IDs.
 * @sideEffects Reads and listens for the OS reduced-motion preference while mounted.
 */
export function UserTodosConfirmDialog({
  visible,
  title,
  description,
  confirmLabel,
  onCancel,
  onConfirm,
  isSubmitting = false,
}: UserTodosConfirmDialogProps) {
  const tokens = useThemeTokens();
  const { t } = useTranslation();
  const minTarget = getMinTouchTarget();
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (active) setReduceMotion(enabled);
      })
      .catch(() => undefined);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    // Keep the OS preference current while mounted and remove both listeners on unmount.
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  const styles = StyleSheet.create({
    backdrop: {
      flex: 1,
      justifyContent: 'center',
      padding: tokens.space[4],
      backgroundColor: tokens.color.overlayBackdrop,
    },
    surface: {
      width: '100%',
      backgroundColor: tokens.color.card,
      borderRadius: tokens.radius.xl,
      borderWidth: 1,
      borderColor: tokens.color.border,
      padding: tokens.space[5],
    },
    title: {
      ...tokens.typography.headingSm,
      color: tokens.color.foreground,
      marginBottom: tokens.space[2],
    },
    description: {
      ...tokens.typography.bodySm,
      color: tokens.color.muted,
      marginBottom: tokens.space[5],
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: tokens.space[2],
      flexWrap: 'wrap',
    },
    button: {
      minHeight: minTarget,
      minWidth: tokens.layout.buttonMinWidth,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: tokens.space[3],
      borderRadius: tokens.radius.md,
      borderWidth: 1,
      borderColor: tokens.color.border,
    },
    cancelText: {
      ...tokens.typography.body,
      color: tokens.color.foreground,
      fontWeight: '600',
    },
    confirmButton: {
      backgroundColor: tokens.color.destructive,
      borderColor: tokens.color.destructive,
      opacity: isSubmitting ? tokens.opacity.loading : 1,
    },
    confirmText: {
      ...tokens.typography.body,
      color: tokens.color.onDestructive,
      fontWeight: '700',
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType={reduceMotion ? 'none' : 'fade'}
      onRequestClose={isSubmitting ? () => undefined : onCancel}
      statusBarTranslucent
    >
      <SafeAreaView style={styles.backdrop}>
        <View
          style={styles.surface}
          accessible
          accessibilityViewIsModal
          accessibilityLabel={title}
          testID="user_todos-confirm-dialog"
        >
          <Text accessibilityRole="header" style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
          <View style={styles.actions}>
            <Pressable
              style={styles.button}
              onPress={onCancel}
              disabled={isSubmitting}
              accessibilityRole="button"
              accessibilityLabel={t('user_todos_management.CANCEL_ACTION')}
              accessibilityState={{ disabled: isSubmitting }}
              testID="user_todos-confirm-cancel"
            >
              <Text style={styles.cancelText}>{t('user_todos_management.CANCEL')}</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.confirmButton]}
              onPress={onConfirm}
              disabled={isSubmitting}
              accessibilityRole="button"
              accessibilityLabel={confirmLabel}
              accessibilityState={{ disabled: isSubmitting, busy: isSubmitting }}
              testID="user_todos-confirm-submit"
            >
              <Text style={styles.confirmText}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
