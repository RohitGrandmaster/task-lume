import {LocalizedText, LocalizedTextInput} from '../../i18n/LocalizedText';
import React, {useState} from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Pressable,
  Alert
} from 'react-native';
import {Download, X} from 'lucide-react-native';
import useTheme from '../../hooks/useTheme';

export default function BackupImportModal({visible, onClose, onImport}) {
  const {theme} = useTheme();
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState('');

  function handleRestore() {
    setError('');
    if (!jsonText.trim()) {
      setError('Please paste your backup JSON code');
      return;
    }

    let tasksList;
    try {
      const parsed = JSON.parse(jsonText.trim());
      tasksList = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed?.tasks)
        ? parsed.tasks
        : null;
    } catch (_) {
      setError('Invalid JSON format. Please paste valid backup data.');
      return;
    }

    if (!tasksList || tasksList.length > 10000) {
      setError('Backup must contain a tasks array with no more than 10,000 items.');
      return;
    }

    const validRecords = tasksList.every(item =>
      item &&
      typeof item === 'object' &&
      !Array.isArray(item) &&
      (item.title === undefined || typeof item.title === 'string') &&
      (item.description === undefined || typeof item.description === 'string') &&
      (item.id === undefined || typeof item.id === 'string' || typeof item.id === 'number') &&
      (item.dueDate === undefined || typeof item.dueDate === 'string' || typeof item.dueDate === 'number') &&
      (item.completed === undefined || typeof item.completed === 'boolean') &&
      (item.category === undefined || typeof item.category === 'string') &&
      (item.priority === undefined || ['low', 'medium', 'high'].includes(item.priority))
    );
    if (!validRecords) {
      setError('Backup contains invalid task data. Your current tasks have not been changed.');
      return;
    }

    Alert.alert(
      'Replace current tasks?',
      'Restoring this backup replaces the tasks currently stored on this device. Export a backup first if you need to keep them.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Replace & Restore',
          style: 'destructive',
          onPress: () => {
            try {
              const result = onImport?.(tasksList);
              if (result === false) {
                setError('The backup could not be restored. Your current tasks were kept.');
                return;
              }
              setJsonText('');
              setError('');
              onClose();
              Alert.alert(
                'Restore Complete',
                'Successfully restored ' + tasksList.length + ' tasks!',
              );
            } catch (error) {
              setError(error?.message || 'The backup could not be restored. Your current tasks were kept.');
            }
          },
        },
      ],
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}>
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Download size={20} color={theme.colors.primary} strokeWidth={2.4} />
            </View>
            <View style={{flex: 1}}>
              <LocalizedText style={[styles.title, {color: theme.colors.text}]}>
                Restore Backup
              </LocalizedText>
              <LocalizedText style={[styles.subtitle, {color: theme.colors.textSecondary}]}>
                Paste your exported backup JSON below
              </LocalizedText>
            </View>
            <Pressable onPress={onClose} hitSlop={8} style={styles.closeBtn}>
              <X size={18} color={theme.colors.text} strokeWidth={2.2} />
            </Pressable>
          </View>

          <LocalizedTextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.background,
                borderColor: error ? '#EF4444' : theme.colors.border,
                color: theme.colors.text,
              },
            ]}
            placeholder='Paste {"tasks": [...]} data here'
            placeholderTextColor={theme.colors.textLight}
            value={jsonText}
            onChangeText={t => {
              setJsonText(t);
              setError('');
            }}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />

          {error ? <LocalizedText style={styles.errorText}>{error}</LocalizedText> : null}

          <View style={styles.actions}>
            <Pressable
              onPress={onClose}
              style={[
                styles.cancelBtn,
                {backgroundColor: theme.colors.background, borderColor: theme.colors.border},
              ]}>
              <LocalizedText style={[styles.btnText, {color: theme.colors.textSecondary}]}>
                Cancel
              </LocalizedText>
            </Pressable>

            <Pressable
              onPress={handleRestore}
              style={[styles.restoreBtn, {backgroundColor: theme.colors.primary}]}>
              <LocalizedText style={[styles.btnText, {color: '#FFFFFF'}]}>
                Restore Data
              </LocalizedText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  sheet: {
    width: '100%',
    maxWidth: 520,
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  input: {
    height: 140,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    fontSize: 13,
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  restoreBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnText: {
    fontSize: 13.5,
    fontWeight: '700',
  },
});
