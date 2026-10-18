import React, {useState, useMemo} from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import {
  Download,
  X,
  CheckCircle2,
  AlertCircle,
  Layers,
  RefreshCw,
} from 'lucide-react-native';
import useTheme from '../../hooks/useTheme';

/**
 * Normalize dueDate labels to ISO YYYY-MM-DD where possible.
 */
function normalizeImportedDueDate(dueDate) {
  if (!dueDate || dueDate === 'No date' || dueDate === 'no date') {
    return 'No date';
  }
  const dd = String(dueDate).trim();
  const lower = dd.toLowerCase();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (lower === 'today') return today.toISOString().slice(0, 10);
  if (lower === 'tomorrow') {
    const t = new Date(today);
    t.setDate(t.getDate() + 1);
    return t.toISOString().slice(0, 10);
  }
  if (lower === 'next week' || lower === 'nextweek') {
    const t = new Date(today);
    t.setDate(t.getDate() + 7);
    return t.toISOString().slice(0, 10);
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(dd)) return dd;
  const parsed = new Date(dd);
  if (!isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return dd;
}

/**
 * Validates and sanitizes imported task array against expected schema
 */
export function validateAndSanitizeTasks(rawList) {
  if (!Array.isArray(rawList)) return null;

  const valid = [];
  for (const item of rawList) {
    if (!item || typeof item !== 'object') continue;
    const title = typeof item.title === 'string' ? item.title.trim() : '';
    if (!title) continue;

    const id =
      item.id != null && String(item.id).trim()
        ? String(item.id)
        : `imp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

    valid.push({
      id,
      title,
      description: typeof item.description === 'string' ? item.description : '',
      completed: Boolean(item.completed),
      category:
        typeof item.category === 'string' && item.category.trim()
          ? item.category.trim()
          : 'Personal',
      priority: ['low', 'medium', 'high'].includes(item.priority)
        ? item.priority
        : 'medium',
      dueDate: normalizeImportedDueDate(
        typeof item.dueDate === 'string' ? item.dueDate : 'No date',
      ),
      reminder: Boolean(item.reminder),
      favorite: Boolean(item.favorite),
      deleted: Boolean(item.deleted),
      pinned: Boolean(item.pinned),
      createdAt: typeof item.createdAt === 'number' ? item.createdAt : Date.now(),
      completedAt: typeof item.completedAt === 'number' ? item.completedAt : null,
      deletedAt: typeof item.deletedAt === 'number' ? item.deletedAt : null,
      timerEndAt: null,
      timerNotificationId: null,
    });
  }

  return valid.length > 0 ? valid : null;
}

export default function BackupImportModal({visible, onClose, onImport}) {
  const {theme} = useTheme();
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState('');
  const [restoreMode, setRestoreMode] = useState('merge');

  const parsedPreview = useMemo(() => {
    const trimmed = jsonText.trim();
    if (!trimmed) return null;

    try {
      const parsed = JSON.parse(trimmed);
      const rawList = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed?.tasks)
        ? parsed.tasks
        : null;

      if (!rawList) {
        return {error: 'No tasks array found in JSON'};
      }

      const validated = validateAndSanitizeTasks(rawList);
      if (!validated) {
        return {
          error:
            'No valid tasks could be extracted (each task must have a title)',
        };
      }

      const completedCount = validated.filter(t => t.completed).length;
      const pendingCount = validated.length - completedCount;
      const exportedAt = parsed?.exportedAt
        ? new Date(parsed.exportedAt).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })
        : null;

      return {
        tasks: validated,
        total: validated.length,
        completed: completedCount,
        pending: pendingCount,
        exportedAt,
        appName: parsed?.appName || 'Tasklume',
      };
    } catch (e) {
      return {
        error: 'Invalid JSON syntax. Please check for missing brackets or quotes.',
      };
    }
  }, [jsonText]);

  function handleRestore() {
    if (!jsonText.trim()) {
      setError('Please paste your backup JSON code');
      return;
    }

    if (!parsedPreview || parsedPreview.error || !parsedPreview.tasks) {
      setError(parsedPreview?.error || 'Invalid backup data format');
      return;
    }

    const {tasks} = parsedPreview;

    Alert.alert(
      restoreMode === 'merge' ? 'Merge Backup?' : 'Replace All Tasks?',
      restoreMode === 'merge'
        ? `This will add ${tasks.length} tasks to your existing list, keeping non-duplicate items.`
        : `This will replace all your current tasks with the ${tasks.length} tasks from this backup.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: restoreMode === 'merge' ? 'Merge Tasks' : 'Replace All',
          style: restoreMode === 'replace' ? 'destructive' : 'default',
          onPress: () => {
            onImport?.(tasks, restoreMode);
            setJsonText('');
            setError('');
            onClose();
            Alert.alert(
              'Restore Complete',
              `Successfully restored ${tasks.length} tasks!`,
            );
          },
        },
      ],
    );
  }

  function handlePasteSample() {
    const sample = {
      appName: 'Tasklume',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      tasks: [
        {
          title: 'Welcome to Tasklume',
          description: 'Explore smart tasks, pomodoro, and private notes.',
          completed: false,
          category: 'Personal',
          priority: 'high',
        },
        {
          title: 'Review weekly goals',
          description: 'Check off pending items in Overview tab.',
          completed: true,
          category: 'Work',
          priority: 'medium',
        },
      ],
    };
    setJsonText(JSON.stringify(sample, null, 2));
    setError('');
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
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
              <View style={styles.iconCircle}>
                <Download size={20} color={theme.colors.primary} strokeWidth={2.4} />
              </View>
              <View style={{flex: 1}}>
                <Text style={[styles.title, {color: theme.colors.text}]}>
                  Restore Backup
                </Text>
                <Text
                  style={[styles.subtitle, {color: theme.colors.textSecondary}]}>
                  Import tasks safely with preview & validation
                </Text>
              </View>
              <Pressable onPress={onClose} hitSlop={8} style={styles.closeBtn}>
                <X size={18} color={theme.colors.text} strokeWidth={2.2} />
              </Pressable>
            </View>

            <Text style={[styles.sectionLabel, {color: theme.colors.textSecondary}]}>
              RESTORE METHOD
            </Text>
            <View
              style={[
                styles.modeToggleWrap,
                {
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                },
              ]}>
              <Pressable
                onPress={() => setRestoreMode('merge')}
                style={[
                  styles.modeTab,
                  restoreMode === 'merge' && [
                    styles.modeTabActive,
                    {backgroundColor: theme.colors.primary},
                  ],
                ]}>
                <Layers
                  size={14}
                  color={
                    restoreMode === 'merge'
                      ? '#FFFFFF'
                      : theme.colors.textSecondary
                  }
                  strokeWidth={2.4}
                />
                <Text
                  style={[
                    styles.modeTabText,
                    {
                      color:
                        restoreMode === 'merge'
                          ? '#FFFFFF'
                          : theme.colors.textSecondary,
                    },
                  ]}>
                  Merge (Safe)
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setRestoreMode('replace')}
                style={[
                  styles.modeTab,
                  restoreMode === 'replace' && [
                    styles.modeTabActive,
                    {backgroundColor: '#EF4444'},
                  ],
                ]}>
                <RefreshCw
                  size={14}
                  color={
                    restoreMode === 'replace'
                      ? '#FFFFFF'
                      : theme.colors.textSecondary
                  }
                  strokeWidth={2.4}
                />
                <Text
                  style={[
                    styles.modeTabText,
                    {
                      color:
                        restoreMode === 'replace'
                          ? '#FFFFFF'
                          : theme.colors.textSecondary,
                    },
                  ]}>
                  Replace All
                </Text>
              </Pressable>
            </View>

            <View style={styles.inputHeader}>
              <Text style={[styles.sectionLabel, {color: theme.colors.textSecondary}]}>
                BACKUP JSON CONTENT
              </Text>
              <Pressable onPress={handlePasteSample} hitSlop={6}>
                <Text style={[styles.sampleLink, {color: theme.colors.primary}]}>
                  Paste Sample
                </Text>
              </Pressable>
            </View>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.background,
                  borderColor: error ? '#EF4444' : theme.colors.border,
                  color: theme.colors.text,
                },
              ]}
              placeholder='Paste {"tasks": [...]} data here...'
              placeholderTextColor={theme.colors.textLight}
              value={jsonText}
              onChangeText={txt => {
                setJsonText(txt);
                setError('');
              }}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />

            {parsedPreview && !parsedPreview.error && (
              <View
                style={[
                  styles.previewCard,
                  {
                    backgroundColor: theme.colors.primary + '10',
                    borderColor: theme.colors.primary + '30',
                  },
                ]}>
                <View style={styles.previewHeader}>
                  <CheckCircle2
                    size={16}
                    color={theme.colors.primary}
                    strokeWidth={2.6}
                  />
                  <Text style={[styles.previewTitle, {color: theme.colors.text}]}>
                    Valid Backup Detected
                  </Text>
                </View>
                <View style={styles.previewStatsRow}>
                  <Text style={[styles.previewStat, {color: theme.colors.textSecondary}]}>
                    Total:{' '}
                    <Text style={{fontWeight: '700', color: theme.colors.text}}>
                      {parsedPreview.total}
                    </Text>
                  </Text>
                  <Text style={[styles.previewStat, {color: theme.colors.textSecondary}]}>
                    Pending:{' '}
                    <Text style={{fontWeight: '700', color: '#F59E0B'}}>
                      {parsedPreview.pending}
                    </Text>
                  </Text>
                  <Text style={[styles.previewStat, {color: theme.colors.textSecondary}]}>
                    Done:{' '}
                    <Text style={{fontWeight: '700', color: '#10B981'}}>
                      {parsedPreview.completed}
                    </Text>
                  </Text>
                </View>
                {parsedPreview.exportedAt ? (
                  <Text style={[styles.previewDate, {color: theme.colors.textLight}]}>
                    Exported on: {parsedPreview.exportedAt}
                  </Text>
                ) : null}
              </View>
            )}

            {(error ||
              (parsedPreview && parsedPreview.error && jsonText.trim())) && (
              <View style={styles.errorBanner}>
                <AlertCircle size={14} color="#EF4444" strokeWidth={2.4} />
                <Text style={styles.errorText}>
                  {error || parsedPreview.error}
                </Text>
              </View>
            )}

            <View style={styles.actions}>
              <Pressable
                onPress={onClose}
                style={[
                  styles.cancelBtn,
                  {
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.border,
                  },
                ]}>
                <Text style={[styles.btnText, {color: theme.colors.textSecondary}]}>
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                onPress={handleRestore}
                disabled={Boolean(!parsedPreview || parsedPreview.error)}
                style={[
                  styles.restoreBtn,
                  {
                    backgroundColor:
                      !parsedPreview || parsedPreview.error
                        ? theme.colors.border
                        : theme.colors.primary,
                  },
                ]}>
                <Text
                  style={[
                    styles.btnText,
                    {
                      color:
                        !parsedPreview || parsedPreview.error
                          ? theme.colors.textLight
                          : '#FFFFFF',
                    },
                  ]}>
                  {restoreMode === 'merge' ? 'Merge Tasks' : 'Replace All'}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
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
    padding: 16,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
  },
  sheet: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '90%',
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
  title: {fontSize: 16, fontWeight: '800'},
  subtitle: {fontSize: 12, fontWeight: '500', marginTop: 2},
  closeBtn: {padding: 4},
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  modeToggleWrap: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 4,
    gap: 6,
    marginBottom: 14,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
  },
  modeTabActive: {
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  modeTabText: {fontSize: 12.5, fontWeight: '700'},
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sampleLink: {fontSize: 12, fontWeight: '700'},
  input: {
    height: 120,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    fontSize: 12.5,
    fontFamily: 'monospace',
    marginBottom: 10,
  },
  previewCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
    gap: 6,
  },
  previewHeader: {flexDirection: 'row', alignItems: 'center', gap: 6},
  previewTitle: {fontSize: 13, fontWeight: '700'},
  previewStatsRow: {flexDirection: 'row', gap: 12, marginTop: 2},
  previewStat: {fontSize: 12},
  previewDate: {fontSize: 11},
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EF444415',
    borderWidth: 1,
    borderColor: '#EF444430',
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
  },
  errorText: {color: '#EF4444', fontSize: 12, fontWeight: '600', flex: 1},
  actions: {flexDirection: 'row', gap: 12, marginTop: 8},
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  restoreBtn: {
    flex: 1.2,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnText: {fontSize: 13.5, fontWeight: '700'},
});
