import React from 'react';
import {View, Text, Modal, Pressable} from 'react-native';
import {AlarmClock, X, ChevronRight, Trash2} from 'lucide-react-native';

export default function ReminderSnoozeModal({
  visible,
  onClose,
  snoozeTask,
  snoozeOptions = [],
  onApplySnooze,
  onDelete,
  theme,
  styles,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <Pressable style={styles.snoozeOverlay} onPress={onClose}>
        <Pressable
          style={[
            styles.snoozeCard,
            {backgroundColor: theme.colors.background},
          ]}
          onPress={() => {}}>
          <View style={styles.snoozeHeader}>
            <View
              style={[
                styles.snoozeHeaderIcon,
                {backgroundColor: theme.colors.primary + '18'},
              ]}>
              <AlarmClock
                size={18}
                color={theme.colors.primary}
                strokeWidth={2.6}
              />
            </View>
            <View style={styles.snoozeHeaderText}>
              <Text
                style={[styles.snoozeTitle, {color: theme.colors.text}]}
                numberOfLines={1}>
                Snooze reminder
              </Text>
              <Text
                style={[
                  styles.snoozeSubtitle,
                  {color: theme.colors.textSecondary},
                ]}
                numberOfLines={1}>
                {snoozeTask?.title || ''}
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              hitSlop={10}
              style={[
                styles.snoozeClose,
                {backgroundColor: theme.colors.surface},
              ]}>
              <X size={16} color={theme.colors.text} strokeWidth={2.6} />
            </Pressable>
          </View>

          <View style={styles.snoozeOptions}>
            {snoozeOptions.map(option => {
              const Icon = option.Icon;
              return (
                <Pressable
                  key={option.key}
                  onPress={() => onApplySnooze(option)}
                  style={[
                    styles.snoozeOption,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                    },
                  ]}>
                  <View
                    style={[
                      styles.snoozeOptionIcon,
                      {backgroundColor: theme.colors.primary + '14'},
                    ]}>
                    <Icon
                      size={15}
                      color={theme.colors.primary}
                      strokeWidth={2.6}
                    />
                  </View>
                  <Text
                    style={[
                      styles.snoozeOptionText,
                      {color: theme.colors.text},
                    ]}
                    numberOfLines={1}>
                    {option.label}
                  </Text>
                  <ChevronRight
                    size={16}
                    color={theme.colors.textLight}
                    strokeWidth={2.4}
                  />
                </Pressable>
              );
            })}
          </View>

          <Pressable
            onPress={() => {
              if (snoozeTask && typeof onDelete === 'function') {
                onDelete(snoozeTask);
              }
              onClose();
            }}
            style={[styles.snoozeDelete, {backgroundColor: '#EF444418'}]}>
            <Trash2 size={15} color="#EF4444" strokeWidth={2.6} />
            <Text style={styles.snoozeDeleteText}>Delete reminder</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
