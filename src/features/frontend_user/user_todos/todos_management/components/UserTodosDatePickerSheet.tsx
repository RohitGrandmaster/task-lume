/**
 * RESPONSIBILITY: Selects a task due date using the native date picker inside the approved bottom-sheet shell.
 * FLOW: Todo form due-date control → this sheet → normalized local YYYY-MM-DD value → React Hook Form.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeTokens } from '../../../../../core/theme/useThemeTokens';

interface UserTodosDatePickerSheetProps {
  visible: boolean;
  value: string;
  onClose: () => void;
  onSelect: (date: string) => void;
}

function parseLocalDate(value: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    const parsed = new Date(year, month - 1, day, 12, 0, 0);
    if (parsed.getFullYear() === year && parsed.getMonth() === month - 1 && parsed.getDate() === day) return parsed;
  }
  return new Date();
}

function formatLocalDate(value: Date): string {
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
}

export function UserTodosDatePickerSheet({ visible, value, onClose, onSelect }: UserTodosDatePickerSheetProps) {
  const tokens = useThemeTokens();
  const insets = useSafeAreaInsets();
  const modalRef = useRef<BottomSheetModal>(null);
  const [selectedDate, setSelectedDate] = useState(() => parseLocalDate(value));
  const snapPoints = useMemo(() => ['50%'], []);

  useEffect(() => {
    if (visible) {
      setSelectedDate(parseLocalDate(value));
      modalRef.current?.present();
    } else {
      modalRef.current?.dismiss();
    }
    // value initializes the picker each time the sheet opens; visible drives presentation.
  }, [value, visible]);

  const close = useCallback(() => {
    onClose();
    modalRef.current?.dismiss();
  }, [onClose]);

  const select = useCallback(() => {
    onSelect(formatLocalDate(selectedDate));
    close();
  }, [close, onSelect, selectedDate]);

  const styles = StyleSheet.create({
    content: {
      paddingHorizontal: tokens.space[4],
      paddingTop: tokens.space[3],
      paddingBottom: Math.max(insets.bottom, tokens.space[4]),
      backgroundColor: tokens.color.card,
      gap: tokens.space[3],
    },
    title: { ...tokens.typography.headingSm, color: tokens.color.foreground },
    picker: { alignSelf: 'center' },
    actions: { flexDirection: 'row', gap: tokens.space[3] },
    button: {
      flex: 1,
      minWidth: tokens.layout.buttonMinWidth,
      minHeight: Math.max(tokens.layout.minTouchTargetIos, tokens.layout.minTouchTargetAndroid),
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: tokens.radius.md,
      borderWidth: 1,
      borderColor: tokens.color.border,
      paddingHorizontal: tokens.space[3],
    },
    primary: { backgroundColor: tokens.color.primary, borderColor: tokens.color.primary },
    label: { ...tokens.typography.body, color: tokens.color.foreground, fontWeight: '600' },
    primaryLabel: { ...tokens.typography.body, color: tokens.color.onPrimary, fontWeight: '700' },
  });

  return (
    <BottomSheetModal
      ref={modalRef}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={(props) => <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />}
      backgroundStyle={{ backgroundColor: tokens.color.card }}
      handleIndicatorStyle={{ backgroundColor: tokens.color.border }}
      onDismiss={onClose}
      accessibilityLabel="Choose task due date"
    >
      <BottomSheetView style={styles.content} accessibilityViewIsModal>
        <Text style={styles.title} accessibilityRole="header">Choose Due Date</Text>
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="spinner"
          onChange={(_event, nextDate) => { if (nextDate) setSelectedDate(nextDate); }}
          accessibilityLabel="Task due date picker"
          testID="user-todos-native-date-picker"
        />
        <View style={styles.actions}>
          <Pressable style={styles.button} onPress={close} accessibilityRole="button" accessibilityLabel="Cancel date selection" testID="user-todos-date-cancel">
            <Text style={styles.label}>Cancel</Text>
          </Pressable>
          <Pressable style={[styles.button, styles.primary]} onPress={select} accessibilityRole="button" accessibilityLabel="Apply due date" testID="user-todos-date-apply">
            <Text style={styles.primaryLabel}>Apply Date</Text>
          </Pressable>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}
