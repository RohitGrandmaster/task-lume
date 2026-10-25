/**
 * RESPONSIBILITY: Validates pasted TaskLume JSON backups and requests safe restoration.
 * FLOW: Settings data section opens the sheet → user pastes JSON → local shape validation → import callback.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';

interface UserSettingsRestoreSheetProps {
  visible: boolean;
  isRestoring?: boolean;
  onClose: () => void;
  onRestore: (records: unknown[]) => boolean | void | Promise<boolean | void>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function UserSettingsRestoreSheet({
  visible,
  isRestoring = false,
  onClose,
  onRestore,
}: UserSettingsRestoreSheetProps) {
  const tokens = useThemeTokens();
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheetModal>(null);
  const [rawJson, setRawJson] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const busy = isRestoring || isSubmitting;
  const snapPoints = useMemo(() => ['85%'], []);

  useEffect(() => {
    if (visible) sheetRef.current?.present();
    else sheetRef.current?.dismiss();
  }, [visible]);

  const close = useCallback(() => {
    if (busy) return;
    setError('');
    onClose();
    sheetRef.current?.dismiss();
  }, [busy, onClose]);

  const restore = useCallback(async () => {
    if (busy) return;
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawJson);
    } catch {
      setError('The pasted content is not valid JSON.');
      return;
    }

    const records = Array.isArray(parsed)
      ? parsed
      : isRecord(parsed) && Array.isArray(parsed.tasks)
        ? parsed.tasks
        : null;

    if (!records || records.some((item) => !isRecord(item) || typeof item.title !== 'string')) {
      setError('The backup must contain a task array, and every task must have a text title.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      const result = await onRestore(records);
      if (result === false) {
        setError('The backup could not be restored. Your current tasks were kept.');
        return;
      }
      setRawJson('');
      onClose();
      sheetRef.current?.dismiss();
    } catch {
      setError('The backup could not be restored. Your current tasks were kept.');
    } finally {
      setIsSubmitting(false);
    }
  }, [busy, onClose, onRestore, rawJson]);

  const styles = StyleSheet.create({
    content: {
      flex: 1,
      paddingHorizontal: tokens.space[4],
      paddingTop: tokens.space[3],
      paddingBottom: Math.max(insets.bottom, tokens.space[4]),
      gap: tokens.space[3],
      backgroundColor: tokens.color.card,
    },
    title: { ...tokens.typography.headingSm, color: tokens.color.foreground },
    description: { ...tokens.typography.bodySm, color: tokens.color.muted },
    input: {
      minHeight: 180,
      borderRadius: tokens.radius.md,
      borderWidth: 1,
      borderColor: error ? tokens.color.destructive : tokens.color.border,
      color: tokens.color.foreground,
      backgroundColor: tokens.color.cardElevated,
      padding: tokens.space[3],
      ...tokens.typography.bodySm,
      textAlignVertical: 'top',
    },
    error: { ...tokens.typography.caption, color: tokens.color.statusDangerText },
    buttonRow: { flexDirection: 'row', gap: tokens.space[3], marginTop: tokens.space[2] },
    button: {
      flex: 1,
      minWidth: tokens.layout.buttonMinWidth,
      minHeight: Math.max(tokens.layout.minTouchTargetIos, tokens.layout.minTouchTargetAndroid),
      borderRadius: tokens.radius.md,
      paddingHorizontal: tokens.space[3],
      borderWidth: 1,
      borderColor: tokens.color.border,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: tokens.space[2],
    },
    cancelText: { ...tokens.typography.body, color: tokens.color.foreground, fontWeight: '600' },
    restoreButton: {
      backgroundColor: tokens.color.primary,
      borderColor: tokens.color.primary,
      opacity: busy ? tokens.opacity.loading : 1,
    },
    restoreText: { ...tokens.typography.body, color: tokens.color.onPrimary, fontWeight: '700' },
  });

  return (
    <BottomSheetModal
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      keyboardBehavior="interactive"
      android_keyboardInputMode="adjustResize"
      enablePanDownToClose={!busy}
      backdropComponent={(props) => (
        <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior={busy ? 'none' : 'close'} />
      )}
      backgroundStyle={{ backgroundColor: tokens.color.card }}
      handleIndicatorStyle={{ backgroundColor: tokens.color.border }}
      onDismiss={close}
    >
      <BottomSheetView style={styles.content} accessibilityViewIsModal>
        <Text style={styles.title} accessibilityRole="header">Restore tasks from JSON</Text>
        <Text style={styles.description}>Paste a TaskLume backup containing a task array or a JSON object with a tasks array. The current task list will be replaced after validation.</Text>
        <BottomSheetScrollView keyboardShouldPersistTaps="handled">
          <BottomSheetTextInput
            style={styles.input}
            value={rawJson}
            onChangeText={(value) => { setRawJson(value); setError(''); }}
            placeholder='Paste backup JSON here…'
            placeholderTextColor={tokens.color.muted}
            multiline
            editable={!busy}
            accessibilityLabel="Task backup JSON"
            testID="settings-restore-json-input"
          />
        </BottomSheetScrollView>
        {error ? <Text style={styles.error} accessibilityLiveRegion="assertive">{error}</Text> : null}
        <View style={styles.buttonRow}>
          <Pressable style={styles.button} onPress={close} disabled={busy} accessibilityRole="button" accessibilityLabel="Cancel restore" testID="settings-restore-cancel">
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
          <Pressable style={[styles.button, styles.restoreButton]} onPress={restore} disabled={busy || rawJson.trim().length === 0} accessibilityRole="button" accessibilityLabel="Validate and restore tasks" accessibilityState={{ disabled: busy || rawJson.trim().length === 0, busy }} testID="settings-restore-submit">
            {busy ? <ActivityIndicator size={tokens.icon.sm} color={tokens.color.onPrimary} /> : null}
            <Text style={styles.restoreText}>{busy ? 'Restoring…' : 'Restore Tasks'}</Text>
          </Pressable>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
