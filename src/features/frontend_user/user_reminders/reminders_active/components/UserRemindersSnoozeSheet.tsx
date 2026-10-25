/**
 * RESPONSIBILITY: Presents fixed reminder snooze choices in an accessible modal sheet.
 * FLOW: UserRemindersMainView opens the sheet → user chooses a delay → minutes return to the owning hook.
 */
import React, { useEffect, useState } from 'react';
import { AccessibilityInfo, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';
import { useTranslation } from '../../../../../core/i18n/useTranslation';
import { getMinTouchTarget } from '../../../../../core/theme/getMinTouchTarget';

export interface UserRemindersSnoozeSheetProps {
  visible: boolean;
  onCancel: () => void;
  onSelectMinutes: (minutes: number) => void;
}

/**
 * Lets a user select a concrete delay without silently changing a reminder.
 * @param props - Visibility and select/cancel handlers.
 * @returns An accessible modal sheet with fixed snooze intervals.
 * @sideEffects Follows the system reduced-motion preference while mounted.
 */
export function UserRemindersSnoozeSheet({ visible, onCancel, onSelectMinutes }: UserRemindersSnoozeSheetProps) {
  const tokens = useThemeTokens();
  const { t } = useTranslation();
  const minTarget = getMinTouchTarget();
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => { if (active) setReduceMotion(enabled); }).catch(() => undefined);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    // Follow OS accessibility changes and clean up the listener when the sheet unmounts.
    return () => { active = false; subscription.remove(); };
  }, []);

  const styles = StyleSheet.create({
    backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: tokens.color.overlayBackdrop },
    sheet: { backgroundColor: tokens.color.card, borderTopLeftRadius: tokens.radius.xl, borderTopRightRadius: tokens.radius.xl, borderWidth: 1, borderColor: tokens.color.border, padding: tokens.space[4], paddingBottom: tokens.space[5] },
    title: { ...tokens.typography.headingSm, color: tokens.color.foreground, marginBottom: tokens.space[2] },
    description: { ...tokens.typography.bodySm, color: tokens.color.muted, marginBottom: tokens.space[3] },
    option: { minHeight: minTarget, borderWidth: 1, borderColor: tokens.color.border, borderRadius: tokens.radius.md, paddingHorizontal: tokens.space[4], marginTop: tokens.space[2], justifyContent: 'center' },
    optionText: { ...tokens.typography.body, color: tokens.color.foreground },
    cancel: { borderColor: tokens.color.primary, backgroundColor: tokens.color.primarySubtle },
    cancelText: { ...tokens.typography.body, color: tokens.color.primaryText, fontWeight: '700' },
  });

  const tomorrowMinutes = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    return Math.max(1, Math.ceil((tomorrow.getTime() - Date.now()) / 60000));
  };

  return (
    <Modal visible={visible} transparent animationType={reduceMotion ? 'none' : 'slide'} onRequestClose={onCancel} statusBarTranslucent>
      <SafeAreaView style={styles.backdrop}>
        <View style={styles.sheet} accessible accessibilityViewIsModal accessibilityLabel={t('user_reminders_active.SNOOZE_TITLE')} testID="user_reminders-snooze-sheet">
          <Text accessibilityRole="header" style={styles.title}>{t('user_reminders_active.SNOOZE_TITLE')}</Text>
          <Text style={styles.description}>{t('user_reminders_active.SNOOZE_DESCRIPTION')}</Text>
          <Pressable style={styles.option} onPress={() => onSelectMinutes(10)} accessibilityRole="button" accessibilityLabel={t('user_reminders_active.SNOOZE_TEN_MINUTES')} testID="user_reminders-snooze-10m">
            <Text style={styles.optionText}>{t('user_reminders_active.SNOOZE_TEN_MINUTES')}</Text>
          </Pressable>
          <Pressable style={styles.option} onPress={() => onSelectMinutes(60)} accessibilityRole="button" accessibilityLabel={t('user_reminders_active.SNOOZE_ONE_HOUR')} testID="user_reminders-snooze-1h">
            <Text style={styles.optionText}>{t('user_reminders_active.SNOOZE_ONE_HOUR')}</Text>
          </Pressable>
          <Pressable style={styles.option} onPress={() => onSelectMinutes(tomorrowMinutes())} accessibilityRole="button" accessibilityLabel={t('user_reminders_active.SNOOZE_TOMORROW')} testID="user_reminders-snooze-tomorrow">
            <Text style={styles.optionText}>{t('user_reminders_active.SNOOZE_TOMORROW')}</Text>
          </Pressable>
          <Pressable style={[styles.option, styles.cancel]} onPress={onCancel} accessibilityRole="button" accessibilityLabel={t('user_reminders_active.CANCEL')} testID="user_reminders-snooze-cancel">
            <Text style={styles.cancelText}>{t('user_reminders_active.CANCEL')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}
