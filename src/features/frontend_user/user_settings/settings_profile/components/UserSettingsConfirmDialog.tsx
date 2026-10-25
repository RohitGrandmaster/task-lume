/**
 * RESPONSIBILITY: Accessible confirmation dialog for destructive Settings data operations.
 * FLOW: Settings data action → dialog → explicit cancel/confirm; never mutates data itself.
 */
import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';
import { useTranslation } from '../../../../../core/i18n/useTranslation';
import { getMinTouchTarget } from '../../../../../core/theme/getMinTouchTarget';

export interface UserSettingsConfirmDialogProps {
  visible: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * Requires an explicit user decision for destructive settings actions.
 * @param props - Dialog text, visibility and decision callbacks.
 * @returns A modal with accessible controls and deterministic test IDs.
 * @sideEffects Follows and cleans up the OS reduced-motion preference listener.
 */
export function UserSettingsConfirmDialog({ visible, title, description, confirmLabel, onCancel, onConfirm }: UserSettingsConfirmDialogProps) {
  const tokens = useThemeTokens();
  const { t } = useTranslation();
  const minTarget = getMinTouchTarget();
  const [reduceMotion, setReduceMotion] = useState(false);
  const confirmHandledRef = useRef(false);

  useEffect(() => {
    if (!visible) confirmHandledRef.current = false;
  }, [visible]);

  const handleConfirm = () => {
    if (confirmHandledRef.current) return;
    confirmHandledRef.current = true;
    onConfirm();
  };

  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => { if (active) setReduceMotion(enabled); }).catch(() => undefined);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    // Preference changes update animation; this subscription is removed on unmount.
    return () => { active = false; subscription.remove(); };
  }, []);

  const styles = StyleSheet.create({
    backdrop: { flex: 1, justifyContent: 'center', padding: tokens.space[4], backgroundColor: tokens.color.overlayBackdrop },
    surface: { width: '100%', backgroundColor: tokens.color.card, borderRadius: tokens.radius.xl, borderWidth: 1, borderColor: tokens.color.border, padding: tokens.space[5] },
    title: { ...tokens.typography.headingSm, color: tokens.color.foreground, marginBottom: tokens.space[2] },
    description: { ...tokens.typography.bodySm, color: tokens.color.muted, marginBottom: tokens.space[5] },
    actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: tokens.space[2], flexWrap: 'wrap' },
    button: { minHeight: minTarget, minWidth: tokens.layout.buttonMinWidth, justifyContent: 'center', alignItems: 'center', paddingHorizontal: tokens.space[3], borderRadius: tokens.radius.md, borderWidth: 1, borderColor: tokens.color.border },
    cancelText: { ...tokens.typography.body, color: tokens.color.foreground, fontWeight: '600' },
    confirmButton: { backgroundColor: tokens.color.destructive, borderColor: tokens.color.destructive },
    confirmText: { ...tokens.typography.body, color: tokens.color.onDestructive, fontWeight: '700' },
  });

  return (
    <Modal visible={visible} transparent animationType={reduceMotion ? 'none' : 'fade'} onRequestClose={onCancel} statusBarTranslucent>
      <SafeAreaView style={styles.backdrop}>
        <View style={styles.surface} accessible accessibilityViewIsModal accessibilityLabel={title} testID="user_settings-confirm-dialog">
          <Text accessibilityRole="header" style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
          <View style={styles.actions}>
            <Pressable style={styles.button} onPress={onCancel} accessibilityRole="button" accessibilityLabel={t('user_settings_profile.CANCEL_ACTION')} testID="user_settings-confirm-cancel">
              <Text style={styles.cancelText}>{t('user_settings_profile.CANCEL')}</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.confirmButton]} onPress={handleConfirm} accessibilityRole="button" accessibilityLabel={confirmLabel} testID="user_settings-confirm-submit">
              <Text style={styles.confirmText}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
