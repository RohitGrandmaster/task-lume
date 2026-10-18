import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  FlatList,
  PermissionsAndroid,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
  Modal,
  Animated,
  Share,
  RefreshControl,
  LayoutAnimation,
  UIManager,
  Keyboard,
  Linking,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {DrawerActions, useFocusEffect} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import Sound, {
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
  OutputFormatAndroidType,
  AVEncoderAudioQualityIOSType,
} from 'react-native-nitro-sound';
import {
  Menu,
  Mic,
  Square,
  Play,
  Pause,
  Trash2,
  Share2,
  Edit3,
  Search,
  X,
  Volume2,
  Clock,
  ListMusic,
  ChevronRight,
  MoreVertical,
  Headphones,
} from 'lucide-react-native';

import useTheme from '../../hooks/useTheme';
import {getItem, setItem} from '../../storage/storage';
import APP_CONFIG from '../../constants/appConfig';
import {createId} from '../../utils/helpers';
import ConfirmModal from '../../components/common/ConfirmModal';

// LayoutAnimation experimental is handled automatically in React Native New Architecture

/* --------------------------- CONSTANTS --------------------------- */

const MAX_RECORD_MS = 10 * 60 * 1000; // 10 minutes
const WARN_AT_MS = 9 * 60 * 1000; // warn at 9 minutes

const FILTERS = [
  {key: 'all', label: 'All'},
  {key: 'today', label: 'Today'},
  {key: 'week', label: 'Week'},
];

/* --------------------------- HELPERS --------------------------- */

function formatDuration(ms) {
  const totalSec = Math.floor((ms || 0) / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatDate(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const memoDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = Math.round(
    (today.getTime() - memoDay.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diff === 0)
    return `Today · ${d.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    })}`;
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff} days ago`;
  return d.toLocaleDateString(undefined, {month: 'short', day: 'numeric'});
}

function getFilterBucket(memo) {
  if (!memo?.createdAt) return 'older';
  const d = new Date(memo.createdAt);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const memoDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = Math.round(
    (today.getTime() - memoDay.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diff === 0) return 'today';
  if (diff < 7) return 'week';
  return 'older';
}

/**
 * Safe file cleanup — tries multiple APIs, silently fails if none available.
 * Prevents storage leak without requiring a specific dependency.
 */
async function deleteFileSafe(path) {
  if (!path) return;
  try {
    // Try nitro-sound delete if API exists
    if (typeof Sound.deleteFile === 'function') {
      try {
        await Sound.deleteFile(path);
        return;
      } catch (e) {
        // fall through to RNFS
      }
    }

    // Try RNFS if installed
    try {
      // eslint-disable-next-line global-require
      const RNFS = require('react-native-fs');
      if (RNFS && typeof RNFS.unlink === 'function') {
        const cleanPath = path.startsWith('file://')
          ? path.replace('file://', '')
          : path;
        const exists = await RNFS.exists(cleanPath);
        if (exists) {
          await RNFS.unlink(cleanPath);
        }
        return;
      }
    } catch (_) {
      // RNFS not installed, skip silently
    }
  } catch (e) {
    console.log('File cleanup skipped:', e?.message || e);
  }
}

/* --------------------------- SCREEN --------------------------- */

function VoiceMemosScreen({navigation}) {
  const {theme} = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(
    () => createStyles(theme, insets),
    [theme, insets],
  );

  const [memos, setMemos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSecs, setRecordSecs] = useState(0);
  const [playingId, setPlayingId] = useState(null);
  const [playSecs, setPlaySecs] = useState(0);
  const [titleDraft, setTitleDraft] = useState('');
  const [pendingPath, setPendingPath] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);

  const [renameTarget, setRenameTarget] = useState(null);
  const [renameDraft, setRenameDraft] = useState('');
  const [actionTarget, setActionTarget] = useState(null);

  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const listRef = useRef(null);
  const maxWarnedRef = useRef(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const currentRecordingUriRef = useRef(null);
  const recordStartTimeRef = useRef(0);

  /* --------------------------- LOAD / SAVE --------------------------- */
  useEffect(() => {
    async function load() {
      try {
        const saved = await getItem(
          APP_CONFIG.STORAGE_KEYS.VOICE_MEMOS,
          [],
        );
        setMemos(Array.isArray(saved) ? saved : []);
      } catch (e) {
        console.log('Failed to load voice memos', e);
        setMemos([]);
      } finally {
        setLoading(false);
      }
    }
    load();

    return () => {
      Sound.stopRecorder().catch(() => {});
      Sound.removeRecordBackListener();
      Sound.stopPlayer().catch(() => {});
      Sound.removePlayBackListener();
      Sound.removePlaybackEndListener();
    };
  }, []);

  useEffect(() => {
    if (!loading) {
      setItem(APP_CONFIG.STORAGE_KEYS.VOICE_MEMOS, memos).catch(e =>
        console.log('Failed to save voice memos', e),
      );
    }
  }, [memos, loading]);

  /* --------------------------- PULSE ANIMATION --------------------------- */
  useEffect(() => {
    if (isRecording) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.5,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 900,
            useNativeDriver: true,
          }),
        ]),
      );
      loop.start();
      return () => loop.stop();
    }
    pulseAnim.setValue(1);
  }, [isRecording, pulseAnim]);

  /* --------------------------- AUTO-STOP ON BLUR --------------------------- */
  useFocusEffect(
    useCallback(() => {
      // When screen gains focus
      return () => {
        // When screen loses focus — stop playback
        Sound.stopPlayer().catch(() => {});
        Sound.removePlayBackListener();
        Sound.removePlaybackEndListener();
        setPlayingId(null);
        setPlaySecs(0);
      };
    }, []),
  );

  /* --------------------------- NAVIGATION --------------------------- */
  function openDrawer() {
    navigation.dispatch(DrawerActions.openDrawer());
  }

  /* --------------------------- STOP PLAYBACK --------------------------- */
  const stopPlayback = useCallback(async () => {
    try {
      await Sound.stopPlayer();
      Sound.removePlayBackListener();
      Sound.removePlaybackEndListener();
    } catch (_) {}
    setPlayingId(null);
    setPlaySecs(0);
  }, []);

  /* --------------------------- PERMISSIONS --------------------------- */
  async function requestMicPermission() {
    if (Platform.OS !== 'android') return true;
    try {
      const alreadyGranted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      );
      if (alreadyGranted) {
        return true;
      }

      const permissionsToRequest = [
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ];
      if (Platform.Version <= 28 && PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE) {
        permissionsToRequest.push(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        );
      }

      const results = await PermissionsAndroid.requestMultiple(
        permissionsToRequest,
      );
      return (
        results[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] ===
        PermissionsAndroid.RESULTS.GRANTED
      );
    } catch (err) {
      console.warn('Permission error:', err);
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message:
              'Tasklume needs access to your microphone to record voice memos.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch {
        return false;
      }
    }
  }

  /* --------------------------- RECORDING --------------------------- */
  async function startRecording() {
    try {
      // Keyboard dismiss + close search
      Keyboard.dismiss();
      if (searchOpen) {
        setSearchOpen(false);
        setSearch('');
      }

      const hasPermission = await requestMicPermission();
      if (!hasPermission) {
        Alert.alert(
          'Microphone Permission Required',
          'Tasklume needs access to your microphone to record voice memos. Please grant microphone access in your device settings.',
          [
            {text: 'Cancel', style: 'cancel'},
            {
              text: 'Open Settings',
              onPress: () => Linking.openSettings().catch(() => {}),
            },
          ],
        );
        Toast.show({
          type: 'error',
          text1: 'Microphone Permission Needed',
          text2: 'Tap here or go to device settings to enable microphone.',
          position: 'top',
          visibilityTime: 3500,
          onPress: () => Linking.openSettings().catch(() => {}),
        });
        return;
      }

      // Stop any playback before recording
      await stopPlayback();

      maxWarnedRef.current = false;
      recordStartTimeRef.current = Date.now();
      currentRecordingUriRef.current = null;

      const audioSet = {
        AudioEncoderAndroid: AudioEncoderAndroidType?.AAC ?? 3,
        AudioSourceAndroid: AudioSourceAndroidType?.MIC ?? 1,
        OutputFormatAndroid: OutputFormatAndroidType?.MPEG_4 ?? 2,
        AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType?.high ?? 0x60,
        AVNumberOfChannelsKeyIOS: 2,
        AVFormatIDKeyIOS: 'aac',
      };

      // Calling startRecorder with undefined uri allows nitro-sound to create
      // a valid, sandboxed file path (internal filesDir on Android, documents on iOS)
      const recordedUri = await Sound.startRecorder(undefined, audioSet);
      currentRecordingUriRef.current = recordedUri;

      setIsRecording(true);
      setRecordSecs(0);

      Sound.addRecordBackListener(e => {
        const pos = e.currentPosition ?? e.current_position ?? 0;
        setRecordSecs(pos);

        // Warn at 9 min
        if (!maxWarnedRef.current && pos >= WARN_AT_MS) {
          maxWarnedRef.current = true;
          Alert.alert(
            'Almost at limit',
            'Recording will stop automatically at 10 minutes.',
          );
        }

        // Auto-stop at 10 min
        if (pos >= MAX_RECORD_MS) {
          stopRecording();
        }
      });
    } catch (e) {
      console.log('Record error:', e);
      Alert.alert(
        'Recording Failed',
        e?.message ||
          'Unable to initialize audio recorder. Please check microphone permission and available storage.',
        [
          {text: 'Dismiss', style: 'cancel'},
          {
            text: 'Device Settings',
            onPress: () => Linking.openSettings().catch(() => {}),
          },
        ],
      );
      Toast.show({
        type: 'error',
        text1: 'Recording Initialization Error',
        text2: e?.message || 'Could not start audio recorder.',
        position: 'top',
      });
      setIsRecording(false);
    }
  }

  async function stopRecording() {
    try {
      // Ensure minimum elapsed time to avoid Android MediaRecorder "stop failed" exception
      const elapsed = Date.now() - recordStartTimeRef.current;
      if (elapsed < 800) {
        await new Promise(res => setTimeout(res, 800 - elapsed));
      }

      const result = await Sound.stopRecorder();
      Sound.removeRecordBackListener();
      setIsRecording(false);

      const finalPath =
        typeof result === 'string' &&
        result.length > 0 &&
        result !== 'recorder already stopped'
          ? result
          : currentRecordingUriRef.current;

      if (finalPath) {
        setPendingPath(finalPath);
        setTitleDraft(`Memo ${new Date().toLocaleString()}`);
        setShowSaveModal(true);
      }
    } catch (e) {
      console.log('Stop record error:', e);
      setIsRecording(false);
      Sound.removeRecordBackListener();

      const fallbackPath = currentRecordingUriRef.current;
      if (fallbackPath) {
        setPendingPath(fallbackPath);
        setTitleDraft(`Memo ${new Date().toLocaleString()}`);
        setShowSaveModal(true);
      }
    }
  }

  function saveMemo() {
    if (!pendingPath) {
      setShowSaveModal(false);
      return;
    }

    const title =
      titleDraft.trim() || `Memo ${new Date().toLocaleString()}`;
    const newMemo = {
      id: createId(),
      title,
      path: pendingPath,
      duration: recordSecs,
      createdAt: Date.now(),
    };

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMemos(prev => [newMemo, ...prev]);

    // reset state
    setPendingPath(null);
    setTitleDraft('');
    setRecordSecs(0);
    setShowSaveModal(false);
    setFilter('all');
    setSearch('');

    Toast.show({
      type: 'success',
      text1: 'Voice Memo Saved',
      text2: `"${title}" has been saved.`,
      position: 'top',
      visibilityTime: 2500,
    });

    // scroll to top after render
    setTimeout(() => {
      listRef.current?.scrollToOffset?.({offset: 0, animated: true});
    }, 250);
  }

  async function cancelSave() {
    // Discard: delete temp file + reset
    const tempPath = pendingPath;
    setPendingPath(null);
    setTitleDraft('');
    setRecordSecs(0);
    setShowSaveModal(false);
    if (tempPath) {
      await deleteFileSafe(tempPath);
    }
  }

  /* --------------------------- PLAYBACK --------------------------- */
  async function playMemo(memo) {
    // Block play during recording
    if (isRecording) {
      Alert.alert(
        'Recording in progress',
        'Stop recording first to play a memo.',
      );
      return;
    }

    try {
      if (playingId === memo.id) {
        await stopPlayback();
        return;
      }

      await stopPlayback();

      await Sound.startPlayer(memo.path);
      setPlayingId(memo.id);
      setPlaySecs(0);

      Sound.addPlayBackListener(e => {
        const pos = e.currentPosition ?? e.current_position ?? 0;
        setPlaySecs(pos);
      });

      Sound.addPlaybackEndListener(() => {
        stopPlayback();
      });
    } catch (e) {
      console.log('Play error:', e);
      Alert.alert(
        'Playback Failed',
        'Unable to play this audio file. It may have been moved or deleted from storage.',
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Remove Memo',
            style: 'destructive',
            onPress: () => handleDelete(memo.id),
          },
        ],
      );
      Toast.show({
        type: 'error',
        text1: 'Audio File Inaccessible',
        text2: 'File not found on device storage.',
        position: 'top',
      });
      setPlayingId(null);
    }
  }

  /* --------------------------- DELETE --------------------------- */
  async function handleDelete(id) {
    const target = memos.find(m => String(m.id) === String(id));
    if (playingId === id) {
      await stopPlayback();
    }
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMemos(prev => prev.filter(m => String(m.id) !== String(id)));
    setDeleteId(null);

    Toast.show({
      type: 'info',
      text1: 'Voice Memo Deleted',
      position: 'top',
      visibilityTime: 2000,
    });

    // Cleanup file after state update
    if (target?.path) {
      await deleteFileSafe(target.path);
    }
  }

  /* --------------------------- RENAME --------------------------- */
  function openRename(memo) {
    setRenameTarget(memo);
    setRenameDraft(memo.title);
    setActionTarget(null);
  }

  function saveRename() {
    if (!renameTarget) return;
    const newTitle = renameDraft.trim() || renameTarget.title;
    setMemos(prev =>
      prev.map(m =>
        String(m.id) === String(renameTarget.id)
          ? {...m, title: newTitle}
          : m,
      ),
    );
    setRenameTarget(null);
    setRenameDraft('');
  }

  /* --------------------------- SHARE --------------------------- */
  async function shareMemo(memo) {
    try {
      await Share.share({
        title: memo.title,
        message: `Voice memo: ${memo.title}\nDuration: ${formatDuration(
          memo.duration,
        )}\nFile: ${memo.path}`,
      });
    } catch (e) {
      console.log('Share error', e);
    }
    setActionTarget(null);
  }

  /* --------------------------- FILTERED --------------------------- */
  const filteredMemos = useMemo(() => {
    let list = memos;

    if (filter !== 'all') {
      list = list.filter(m => getFilterBucket(m) === filter);
    }

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(m =>
        (m.title || '').toLowerCase().includes(q),
      );
    }

    return [...list].sort(
      (a, b) => (b.createdAt || 0) - (a.createdAt || 0),
    );
  }, [memos, filter, search]);

  /* --------------------------- STATS --------------------------- */
  const totalDuration = useMemo(
    () => memos.reduce((s, m) => s + (m.duration || 0), 0),
    [memos],
  );

  const todayCount = useMemo(
    () => memos.filter(m => getFilterBucket(m) === 'today').length,
    [memos],
  );

  const weekCount = useMemo(
    () => memos.filter(m => getFilterBucket(m) === 'week').length,
    [memos],
  );

  /* --------------------------- REFRESH --------------------------- */
  function onRefresh() {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }

  /* --------------------------- RENDER ITEM --------------------------- */
  const renderItem = ({item}) => {
    const isPlaying = playingId === item.id;
    const progress =
      isPlaying && item.duration > 0
        ? Math.min(playSecs / item.duration, 1)
        : 0;

    return (
      <Pressable
        onPress={() => playMemo(item)}
        onLongPress={() => setActionTarget(item)}
        delayLongPress={350}
        accessibilityRole="button"
        accessibilityLabel={`Play ${item.title || 'memo'}`}
        style={({pressed}) => [
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderColor: isPlaying
              ? theme.colors.primary + '55'
              : theme.colors.border,
            opacity: pressed ? 0.9 : 1,
          },
        ]}>
        <View
          style={[
            styles.micIcon,
            {
              backgroundColor: isPlaying
                ? theme.colors.primary + '20'
                : theme.colors.primary + '12',
            },
          ]}>
          {isPlaying ? (
            <Volume2
              size={20}
              color={theme.colors.primary}
              strokeWidth={2.4}
            />
          ) : (
            <Mic
              size={20}
              color={theme.colors.primary}
              strokeWidth={2.4}
            />
          )}
        </View>

        <View style={styles.cardContent}>
          <Text
            numberOfLines={1}
            style={[styles.cardTitle, {color: theme.colors.text}]}>
            {item.title || 'Untitled memo'}
          </Text>

          <View style={styles.cardMetaRow}>
            <Clock
              size={11}
              color={theme.colors.textLight}
              strokeWidth={2.4}
            />
            <Text
              style={[
                styles.cardMeta,
                {color: theme.colors.textSecondary},
              ]}>
              {isPlaying
                ? formatDuration(playSecs)
                : formatDuration(item.duration)}
            </Text>
            <Text
              style={[
                styles.cardMetaDot,
                {color: theme.colors.textLight},
              ]}>
              •
            </Text>
            <Text
              style={[
                styles.cardMeta,
                {color: theme.colors.textSecondary},
              ]}>
              {formatDate(item.createdAt)}
            </Text>
          </View>

          {isPlaying && (
            <View
              style={[
                styles.progressTrack,
                {backgroundColor: theme.colors.border},
              ]}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${progress * 100}%`,
                    backgroundColor: theme.colors.primary,
                  },
                ]}
              />
            </View>
          )}
        </View>

        <View style={styles.cardRightActions}>
          <Pressable
            onPress={() => playMemo(item)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
            style={[
              styles.playBtn,
              {
                backgroundColor: isPlaying
                  ? theme.colors.primary
                  : theme.colors.primary + '14',
              },
            ]}>
            {isPlaying ? (
              <Pause
                size={14}
                color="#FFFFFF"
                strokeWidth={2.6}
                fill="#FFFFFF"
              />
            ) : (
              <Play
                size={14}
                color={theme.colors.primary}
                strokeWidth={2.6}
                fill={theme.colors.primary}
                style={{marginLeft: 1}}
              />
            )}
          </Pressable>

          <Pressable
            onPress={() => setActionTarget(item)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="More options"
            style={[
              styles.moreBtn,
              {backgroundColor: theme.colors.background},
            ]}>
            <MoreVertical
              size={14}
              color={theme.colors.textSecondary}
              strokeWidth={2.6}
            />
          </Pressable>
        </View>
      </Pressable>
    );
  };

  /* --------------------------- RENDER --------------------------- */
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <Pressable
            onPress={openDrawer}
            style={styles.menuBtn}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Open menu">
            <Menu
              size={18}
              color={theme.colors.text}
              strokeWidth={2.6}
            />
          </Pressable>

          <View style={styles.headerContent}>
            <Text style={styles.title}>Voice Memos</Text>
            <Text style={styles.subtitle}>
              {memos.length === 0
                ? 'Capture your thoughts'
                : `${memos.length} memo${
                    memos.length !== 1 ? 's' : ''
                  } · ${formatDuration(totalDuration)}`}
            </Text>
          </View>

          <Pressable
            onPress={() => {
              LayoutAnimation.configureNext(
                LayoutAnimation.Presets.easeInEaseOut,
              );
              setSearchOpen(v => !v);
              if (searchOpen) setSearch('');
            }}
            style={styles.headerIconBtn}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel="Toggle search">
            <Search
              size={16}
              color={theme.colors.text}
              strokeWidth={2.6}
            />
          </Pressable>

          <View
            style={[
              styles.countBadge,
              {backgroundColor: theme.colors.primary + '18'},
            ]}>
            <Headphones
              size={13}
              color={theme.colors.primary}
              strokeWidth={2.6}
            />
            <Text
              style={[
                styles.countNumber,
                {color: theme.colors.primary},
              ]}>
              {memos.length}
            </Text>
          </View>
        </View>

        {/* SEARCH */}
        {searchOpen && (
          <View
            style={[
              styles.searchBar,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}>
            <Search
              size={15}
              color={theme.colors.textSecondary}
              strokeWidth={2.4}
            />
            <TextInput
              style={[styles.searchInput, {color: theme.colors.text}]}
              placeholder="Search memos..."
              placeholderTextColor={theme.colors.textLight}
              value={search}
              onChangeText={setSearch}
              autoFocus
              returnKeyType="search"
            />
            {search.length > 0 && (
              <Pressable
                onPress={() => setSearch('')}
                hitSlop={8}
                accessibilityLabel="Clear search">
                <X
                  size={14}
                  color={theme.colors.textSecondary}
                  strokeWidth={2.6}
                />
              </Pressable>
            )}
          </View>
        )}

        {/* RECORD BAR */}
        <View
          style={[
            styles.recordBar,
            {
              backgroundColor: isRecording
                ? theme.colors.danger + '14'
                : theme.colors.surface,
              borderColor: isRecording
                ? theme.colors.danger + '40'
                : theme.colors.border,
            },
          ]}>
          <View style={styles.recordInfo}>
            <View style={styles.recordTopRow}>
              {isRecording && (
                <View style={styles.pulseWrap}>
                  <Animated.View
                    style={[
                      styles.pulse,
                      {
                        backgroundColor: theme.colors.danger,
                        transform: [{scale: pulseAnim}],
                        opacity: pulseAnim.interpolate({
                          inputRange: [1, 1.5],
                          outputRange: [0.5, 0],
                        }),
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.dot,
                      {backgroundColor: theme.colors.danger},
                    ]}
                  />
                </View>
              )}
              <Text
                style={[
                  styles.recordLabel,
                  {color: theme.colors.text},
                ]}>
                {isRecording ? 'Recording' : 'Ready to record'}
              </Text>
            </View>
            <Text
              style={[
                styles.recordTime,
                {
                  color: isRecording
                    ? theme.colors.danger
                    : theme.colors.textSecondary,
                },
              ]}>
              {formatDuration(recordSecs)}
              {isRecording ? ` / ${formatDuration(MAX_RECORD_MS)}` : ''}
            </Text>
          </View>

          <Pressable
            onPress={isRecording ? stopRecording : startRecording}
            accessibilityRole="button"
            accessibilityLabel={
              isRecording ? 'Stop recording' : 'Start recording'
            }
            style={({pressed}) => [
              styles.recordBtn,
              {
                backgroundColor: isRecording
                  ? theme.colors.danger
                  : theme.colors.primary,
                shadowColor: isRecording
                  ? theme.colors.danger
                  : theme.colors.primary,
                transform: [{scale: pressed ? 0.94 : 1}],
              },
            ]}>
            {isRecording ? (
              <Square
                size={16}
                color="#FFFFFF"
                strokeWidth={2.6}
                fill="#FFFFFF"
              />
            ) : (
              <Mic size={18} color="#FFFFFF" strokeWidth={2.6} />
            )}
            <Text style={styles.recordBtnText}>
              {isRecording ? 'Stop' : 'Record'}
            </Text>
          </Pressable>
        </View>

        {/* STATS ROW */}
        {memos.length > 0 && (
          <View style={styles.statsRow}>
            <View
              style={[
                styles.statMini,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}>
              <Clock size={12} color="#6366F1" strokeWidth={2.6} />
              <Text
                style={[
                  styles.statMiniValue,
                  {color: theme.colors.text},
                ]}>
                {formatDuration(totalDuration)}
              </Text>
              <Text
                style={[
                  styles.statMiniLabel,
                  {color: theme.colors.textSecondary},
                ]}
                numberOfLines={1}>
                Total
              </Text>
            </View>

            <View
              style={[
                styles.statMini,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}>
              <ListMusic size={12} color="#14B8A6" strokeWidth={2.6} />
              <Text
                style={[
                  styles.statMiniValue,
                  {color: theme.colors.text},
                ]}>
                {todayCount}
              </Text>
              <Text
                style={[
                  styles.statMiniLabel,
                  {color: theme.colors.textSecondary},
                ]}
                numberOfLines={1}>
                Today
              </Text>
            </View>

            <View
              style={[
                styles.statMini,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}>
              <Clock size={12} color="#8B5CF6" strokeWidth={2.6} />
              <Text
                style={[
                  styles.statMiniValue,
                  {color: theme.colors.text},
                ]}>
                {weekCount}
              </Text>
              <Text
                style={[
                  styles.statMiniLabel,
                  {color: theme.colors.textSecondary},
                ]}
                numberOfLines={1}>
                This week
              </Text>
            </View>
          </View>
        )}

        {/* FILTER PILLS */}
        {memos.length > 0 && (
          <View style={styles.filterRow}>
            {FILTERS.map(f => {
              const selected = filter === f.key;
              const count =
                f.key === 'today'
                  ? todayCount
                  : f.key === 'week'
                  ? weekCount
                  : memos.length;
              return (
                <Pressable
                  key={f.key}
                  onPress={() => setFilter(f.key)}
                  accessibilityRole="button"
                  accessibilityLabel={`Filter ${f.label}`}
                  style={[
                    styles.filterPill,
                    {
                      backgroundColor: selected
                        ? theme.colors.primary
                        : theme.colors.surface,
                      borderColor: selected
                        ? theme.colors.primary
                        : theme.colors.border,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.filterPillText,
                      {
                        color: selected
                          ? '#FFFFFF'
                          : theme.colors.textSecondary,
                      },
                    ]}>
                    {f.label}
                  </Text>
                  {count > 0 && (
                    <View
                      style={[
                        styles.filterBadge,
                        {
                          backgroundColor: selected
                            ? 'rgba(255,255,255,0.22)'
                            : theme.colors.background,
                        },
                      ]}>
                      <Text
                        style={[
                          styles.filterBadgeText,
                          {
                            color: selected
                              ? '#FFFFFF'
                              : theme.colors.textLight,
                          },
                        ]}>
                        {count}
                      </Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        )}

        {/* LIST */}
        <FlatList
          ref={listRef}
          data={filteredMemos}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={[
            styles.list,
            filteredMemos.length === 0 && styles.emptyList,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
            />
          }
          ListEmptyComponent={
            !loading ? (
              <View style={styles.empty}>
                <View
                  style={[
                    styles.emptyIcon,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                    },
                  ]}>
                  <Mic
                    size={32}
                    color={theme.colors.textLight}
                    strokeWidth={1.8}
                  />
                </View>
                <Text
                  style={[
                    styles.emptyTitle,
                    {color: theme.colors.text},
                  ]}>
                  {search.trim()
                    ? 'No matches'
                    : filter !== 'all'
                    ? 'No memos here'
                    : 'No voice memos yet'}
                </Text>
                <Text
                  style={[
                    styles.emptyText,
                    {color: theme.colors.textSecondary},
                  ]}>
                  {search.trim()
                    ? 'Try a different keyword.'
                    : filter !== 'all'
                    ? 'Change filter to see more memos.'
                    : 'Tap Record to capture your first voice note.'}
                </Text>
              </View>
            ) : null
          }
        />
      </View>

      {/* SAVE MODAL */}
      <Modal
        visible={showSaveModal}
        transparent
        animationType="fade"
        onRequestClose={cancelSave}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.border,
              },
            ]}>
            <View style={styles.modalHeader}>
              <View
                style={[
                  styles.modalIconWrap,
                  {backgroundColor: theme.colors.primary + '18'},
                ]}>
                <Mic
                  size={20}
                  color={theme.colors.primary}
                  strokeWidth={2.6}
                />
              </View>
              <View style={{flex: 1, minWidth: 0}}>
                <Text
                  style={[
                    styles.modalTitle,
                    {color: theme.colors.text},
                  ]}>
                  Save voice memo
                </Text>
                <Text
                  style={[
                    styles.modalSub,
                    {color: theme.colors.textSecondary},
                  ]}>
                  Duration: {formatDuration(recordSecs)}
                </Text>
              </View>
            </View>

            <TextInput
              style={[
                styles.modalInput,
                {
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surface,
                },
              ]}
              value={titleDraft}
              onChangeText={setTitleDraft}
              placeholder="Memo title"
              placeholderTextColor={theme.colors.textLight}
              autoFocus
            />

            <View style={styles.modalActions}>
              <Pressable
                onPress={cancelSave}
                accessibilityRole="button"
                accessibilityLabel="Discard recording"
                style={[
                  styles.modalBtn,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    borderWidth: 1,
                  },
                ]}>
                <Text
                  style={[
                    styles.modalBtnText,
                    {color: theme.colors.text},
                  ]}>
                  Discard
                </Text>
              </Pressable>
              <Pressable
                onPress={saveMemo}
                accessibilityRole="button"
                accessibilityLabel="Save recording"
                style={[
                  styles.modalBtn,
                  {
                    backgroundColor: theme.colors.primary,
                    shadowColor: theme.colors.primary,
                  },
                ]}>
                <Text
                  style={[styles.modalBtnText, {color: '#FFFFFF'}]}>
                  Save
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* RENAME MODAL */}
      <Modal
        visible={renameTarget !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setRenameTarget(null)}>
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.border,
              },
            ]}>
            <View style={styles.modalHeader}>
              <View
                style={[
                  styles.modalIconWrap,
                  {backgroundColor: '#8B5CF6' + '18'},
                ]}>
                <Edit3 size={20} color="#8B5CF6" strokeWidth={2.6} />
              </View>
              <View style={{flex: 1, minWidth: 0}}>
                <Text
                  style={[
                    styles.modalTitle,
                    {color: theme.colors.text},
                  ]}>
                  Rename memo
                </Text>
                <Text
                  style={[
                    styles.modalSub,
                    {color: theme.colors.textSecondary},
                  ]}
                  numberOfLines={1}>
                  {renameTarget?.title}
                </Text>
              </View>
            </View>

            <TextInput
              style={[
                styles.modalInput,
                {
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surface,
                },
              ]}
              value={renameDraft}
              onChangeText={setRenameDraft}
              placeholder="New title"
              placeholderTextColor={theme.colors.textLight}
              autoFocus
            />

            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setRenameTarget(null)}
                style={[
                  styles.modalBtn,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    borderWidth: 1,
                  },
                ]}>
                <Text
                  style={[
                    styles.modalBtnText,
                    {color: theme.colors.text},
                  ]}>
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={saveRename}
                style={[
                  styles.modalBtn,
                  {
                    backgroundColor: theme.colors.primary,
                    shadowColor: theme.colors.primary,
                  },
                ]}>
                <Text
                  style={[styles.modalBtnText, {color: '#FFFFFF'}]}>
                  Save
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ACTION SHEET */}
      <Modal
        visible={actionTarget !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setActionTarget(null)}>
        <Pressable
          style={styles.actionOverlay}
          onPress={() => setActionTarget(null)}>
          <Pressable
            style={[
              styles.actionCard,
              {backgroundColor: theme.colors.background},
            ]}
            onPress={() => {}}>
            <View style={styles.actionHeader}>
              <View
                style={[
                  styles.modalIconWrap,
                  {backgroundColor: theme.colors.primary + '18'},
                ]}>
                <Mic
                  size={18}
                  color={theme.colors.primary}
                  strokeWidth={2.6}
                />
              </View>
              <View style={{flex: 1, minWidth: 0}}>
                <Text
                  style={[
                    styles.actionTitle,
                    {color: theme.colors.text},
                  ]}
                  numberOfLines={1}>
                  {actionTarget?.title}
                </Text>
                <Text
                  style={[
                    styles.actionSubtitle,
                    {color: theme.colors.textSecondary},
                  ]}>
                  {formatDuration(actionTarget?.duration)} ·{' '}
                  {formatDate(actionTarget?.createdAt)}
                </Text>
              </View>
            </View>

            <View style={styles.actionOptions}>
              <Pressable
                onPress={() => {
                  if (actionTarget) openRename(actionTarget);
                }}
                style={[
                  styles.actionOption,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}>
                <View
                  style={[
                    styles.actionOptionIcon,
                    {backgroundColor: '#8B5CF6' + '18'},
                  ]}>
                  <Edit3 size={15} color="#8B5CF6" strokeWidth={2.6} />
                </View>
                <Text
                  style={[
                    styles.actionOptionText,
                    {color: theme.colors.text},
                  ]}>
                  Rename
                </Text>
                <ChevronRight
                  size={16}
                  color={theme.colors.textLight}
                  strokeWidth={2.4}
                />
              </Pressable>

              <Pressable
                onPress={() =>
                  actionTarget && shareMemo(actionTarget)
                }
                style={[
                  styles.actionOption,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}>
                <View
                  style={[
                    styles.actionOptionIcon,
                    {backgroundColor: '#0EA5E9' + '18'},
                  ]}>
                  <Share2 size={15} color="#0EA5E9" strokeWidth={2.6} />
                </View>
                <Text
                  style={[
                    styles.actionOptionText,
                    {color: theme.colors.text},
                  ]}>
                  Share
                </Text>
                <ChevronRight
                  size={16}
                  color={theme.colors.textLight}
                  strokeWidth={2.4}
                />
              </Pressable>

              <Pressable
                onPress={() => {
                  setDeleteId(actionTarget?.id);
                  setActionTarget(null);
                }}
                style={[
                  styles.actionOption,
                  {
                    backgroundColor: '#EF444418',
                    borderColor: '#EF444435',
                  },
                ]}>
                <View
                  style={[
                    styles.actionOptionIcon,
                    {backgroundColor: '#EF444425'},
                  ]}>
                  <Trash2 size={15} color="#EF4444" strokeWidth={2.6} />
                </View>
                <Text
                  style={[
                    styles.actionOptionText,
                    {color: '#EF4444'},
                  ]}>
                  Delete
                </Text>
                <ChevronRight
                  size={16}
                  color="#EF4444"
                  strokeWidth={2.4}
                />
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* CONFIRM DELETE */}
      <ConfirmModal
        visible={deleteId !== null}
        title="Delete Memo?"
        message="This voice memo will be permanently deleted."
        confirmText="Delete"
        cancelText="Cancel"
        danger
        onConfirm={() => handleDelete(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </SafeAreaView>
  );
}

/* --------------------------- STYLES --------------------------- */

function createStyles(theme, insets) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    container: {
      flex: 1,
    },

    /* Header */
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 20,
      paddingTop: 12,
      marginBottom: 14,
    },
    menuBtn: {
      width: 42,
      height: 42,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    headerContent: {
      flex: 1,
      minWidth: 0,
    },
    title: {
      fontSize: 24,
      fontWeight: '900',
      color: theme.colors.text,
      letterSpacing: -0.6,
    },
    subtitle: {
      marginTop: 2,
      fontSize: 12,
      fontWeight: '500',
      color: theme.colors.textSecondary,
      letterSpacing: 0.1,
    },
    headerIconBtn: {
      width: 38,
      height: 38,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    countBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 12,
      minWidth: 44,
      justifyContent: 'center',
    },
    countNumber: {
      fontSize: 14,
      fontWeight: '900',
      letterSpacing: -0.3,
    },

    /* Search */
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 14,
      borderWidth: 1,
      marginHorizontal: 20,
      marginBottom: 12,
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
      fontWeight: '600',
      padding: 0,
      letterSpacing: -0.1,
    },

    /* Record bar */
    recordBar: {
      marginHorizontal: 20,
      marginBottom: 14,
      padding: 14,
      borderRadius: 18,
      borderWidth: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    recordInfo: {
      flex: 1,
      minWidth: 0,
    },
    recordTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    pulseWrap: {
      width: 10,
      height: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pulse: {
      position: 'absolute',
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    recordLabel: {
      fontSize: 14,
      fontWeight: '800',
      letterSpacing: -0.2,
    },
    recordTime: {
      fontSize: 22,
      marginTop: 4,
      fontWeight: '900',
      letterSpacing: -0.6,
      fontVariant: ['tabular-nums'],
    },
    recordBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 14,
      shadowOffset: {width: 0, height: 6},
      shadowOpacity: 0.35,
      shadowRadius: 12,
      elevation: 6,
    },
    recordBtnText: {
      color: '#FFFFFF',
      fontSize: 13.5,
      fontWeight: '800',
      letterSpacing: 0.2,
    },

    /* Stats */
    statsRow: {
      flexDirection: 'row',
      gap: 8,
      paddingHorizontal: 20,
      marginBottom: 12,
    },
    statMini: {
      flex: 1,
      minWidth: 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
      paddingVertical: 10,
      paddingHorizontal: 8,
      borderRadius: 13,
      borderWidth: 1,
    },
    statMiniValue: {
      fontSize: 14,
      fontWeight: '900',
      letterSpacing: -0.3,
    },
    statMiniLabel: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 0.2,
    },

    /* Filters */
    filterRow: {
      flexDirection: 'row',
      gap: 6,
      paddingHorizontal: 20,
      marginBottom: 12,
    },
    filterPill: {
      flex: 1,
      minWidth: 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
      paddingVertical: 9,
      paddingHorizontal: 10,
      borderRadius: 12,
      borderWidth: 1.5,
    },
    filterPillText: {
      fontSize: 11.5,
      fontWeight: '800',
      letterSpacing: 0.2,
    },
    filterBadge: {
      minWidth: 16,
      height: 16,
      paddingHorizontal: 4,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    filterBadgeText: {
      fontSize: 9.5,
      fontWeight: '900',
      letterSpacing: 0.1,
    },

    /* List */
    list: {
      paddingHorizontal: 20,
      paddingBottom: Math.max(insets.bottom, 12) + 100,
    },
    emptyList: {
      flexGrow: 1,
    },

    /* Card */
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 12,
      paddingHorizontal: 12,
      marginBottom: 8,
      borderRadius: 15,
      borderWidth: 1,
    },
    micIcon: {
      width: 42,
      height: 42,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    cardContent: {
      flex: 1,
      minWidth: 0,
    },
    cardTitle: {
      fontSize: 14,
      fontWeight: '800',
      letterSpacing: -0.2,
    },
    cardMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      marginTop: 4,
    },
    cardMeta: {
      fontSize: 11.5,
      fontWeight: '700',
      letterSpacing: 0.1,
      fontVariant: ['tabular-nums'],
    },
    cardMetaDot: {
      fontSize: 11,
    },
    progressTrack: {
      height: 3,
      borderRadius: 2,
      marginTop: 8,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: 2,
    },

    /* Card actions */
    cardRightActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      flexShrink: 0,
    },
    playBtn: {
      width: 34,
      height: 34,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
    },
    moreBtn: {
      width: 32,
      height: 32,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },

    /* Empty */
    empty: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 30,
      paddingBottom: 60,
    },
    emptyIcon: {
      width: 84,
      height: 84,
      borderRadius: 26,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 18,
      borderWidth: 1,
    },
    emptyTitle: {
      fontSize: 17,
      fontWeight: '800',
      letterSpacing: -0.3,
      marginBottom: 6,
      textAlign: 'center',
    },
    emptyText: {
      fontSize: 13,
      lineHeight: 19,
      textAlign: 'center',
      maxWidth: 260,
      fontWeight: '500',
    },

    /* Modals */
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    modalCard: {
      width: '100%',
      maxWidth: 380,
      borderRadius: 24,
      padding: 20,
      borderWidth: 1,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 20},
      shadowOpacity: 0.3,
      shadowRadius: 40,
      elevation: 20,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 16,
    },
    modalIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    modalTitle: {
      fontSize: 17,
      fontWeight: '900',
      letterSpacing: -0.3,
    },
    modalSub: {
      fontSize: 12,
      fontWeight: '600',
      marginTop: 2,
      letterSpacing: 0.1,
    },
    modalInput: {
      borderWidth: 1,
      borderRadius: 13,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      fontWeight: '600',
      marginBottom: 16,
    },
    modalActions: {
      flexDirection: 'row',
      gap: 10,
    },
    modalBtn: {
      flex: 1,
      minHeight: 46,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalBtnText: {
      fontSize: 14,
      fontWeight: '800',
      letterSpacing: 0.2,
    },

    /* Action sheet */
    actionOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    actionCard: {
      width: '100%',
      maxWidth: 380,
      borderRadius: 24,
      padding: 18,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 20},
      shadowOpacity: 0.35,
      shadowRadius: 40,
      elevation: 20,
    },
    actionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 16,
    },
    actionTitle: {
      fontSize: 15,
      fontWeight: '900',
      letterSpacing: -0.2,
    },
    actionSubtitle: {
      fontSize: 12,
      fontWeight: '600',
      marginTop: 2,
      letterSpacing: 0.1,
    },
    actionOptions: {
      gap: 8,
    },
    actionOption: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 11,
      paddingHorizontal: 12,
      borderRadius: 13,
      borderWidth: 1,
    },
    actionOptionIcon: {
      width: 32,
      height: 32,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    actionOptionText: {
      flex: 1,
      fontSize: 14,
      fontWeight: '700',
      letterSpacing: -0.1,
    },
  });
}

export default VoiceMemosScreen;