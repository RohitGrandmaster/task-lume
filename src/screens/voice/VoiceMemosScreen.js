import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  FlatList, PermissionsAndroid, Platform, Pressable, StyleSheet, Text, TextInput, View,
  Alert, Animated, Share, RefreshControl, LayoutAnimation, Keyboard, Linking,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {DrawerActions, useFocusEffect} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import Sound, {
  AudioEncoderAndroidType, AudioSourceAndroidType, OutputFormatAndroidType,
  AVEncoderAudioQualityIOSType,
} from 'react-native-nitro-sound';
import {
  Menu, Mic, Square, Play, Pause, Trash2, Share2, Search, X,
  Headphones,
} from 'lucide-react-native';
import useTheme from '../../hooks/useTheme';
import {getItem, setItem} from '../../storage/storage';
import APP_CONFIG from '../../constants/appConfig';
import {createId} from '../../utils/helpers';
import ConfirmModal from '../../components/common/ConfirmModal';

const MAX_RECORD_MS = 10 * 60 * 1000;
const WARN_AT_MS = 9 * 60 * 1000;
const FILTERS = [{key: 'all', label: 'All'}, {key: 'today', label: 'Today'}, {key: 'week', label: 'Week'}];

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
  const diff = Math.round((today.getTime() - memoDay.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return `Today · ${d.toLocaleTimeString(undefined, {hour: 'numeric', minute: '2-digit'})}`;
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
  const diff = Math.round((today.getTime() - memoDay.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'today';
  if (diff < 7) return 'week';
  return 'older';
}

async function deleteFileSafe(path) {
  if (!path) return;
  try {
    if (typeof Sound.deleteFile === 'function') {
      try { await Sound.deleteFile(path); return; } catch (e) {}
    }
  } catch (e) {}
}

function VoiceMemosScreen({navigation}) {
  const {theme} = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme, insets), [theme, insets]);

  const [memos, setMemos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSecs, setRecordSecs] = useState(0);
  const [playingId, setPlayingId] = useState(null);
  const [playSecs, setPlaySecs] = useState(0);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const listRef = useRef(null);
  const maxWarnedRef = useRef(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const currentRecordingUriRef = useRef(null);
  const recordStartTimeRef = useRef(0);

  useEffect(() => {
    (async () => {
      try {
        const saved = await getItem(APP_CONFIG.STORAGE_KEYS.VOICE_MEMOS, []);
        setMemos(Array.isArray(saved) ? saved : []);
      } catch (e) {
        setMemos([]);
      } finally {
        setLoading(false);
      }
    })();
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
      setItem(APP_CONFIG.STORAGE_KEYS.VOICE_MEMOS, memos).catch(() => {});
    }
  }, [memos, loading]);

  useEffect(() => {
    if (isRecording) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {toValue: 1.5, duration: 900, useNativeDriver: true}),
          Animated.timing(pulseAnim, {toValue: 1, duration: 900, useNativeDriver: true}),
        ]),
      );
      loop.start();
      return () => loop.stop();
    }
    pulseAnim.setValue(1);
  }, [isRecording, pulseAnim]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        Sound.stopPlayer().catch(() => {});
        Sound.removePlayBackListener();
        Sound.removePlaybackEndListener();
        setPlayingId(null);
        setPlaySecs(0);
      };
    }, []),
  );

  function openDrawer() {
    navigation.dispatch(DrawerActions.openDrawer());
  }

  const stopPlayback = useCallback(async () => {
    try {
      await Sound.stopPlayer();
      Sound.removePlayBackListener();
      Sound.removePlaybackEndListener();
    } catch (_) {}
    setPlayingId(null);
    setPlaySecs(0);
  }, []);

  async function requestMicPermission() {
    if (Platform.OS !== 'android') return true;
    try {
      const already = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
      if (already) return true;
      const results = await PermissionsAndroid.requestMultiple([PermissionsAndroid.PERMISSIONS.RECORD_AUDIO]);
      return results[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] === PermissionsAndroid.RESULTS.GRANTED;
    } catch {
      return false;
    }
  }

  function autoSaveMemo(path, durationMs) {
    if (!path) return;
    const title = `Memo ${new Date().toLocaleString()}`;
    const newMemo = {
      id: createId(),
      title,
      path,
      duration: durationMs || 0,
      createdAt: Date.now(),
    };
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMemos(prev => [newMemo, ...prev]);
    setRecordSecs(0);
    setFilter('all');
    setSearch('');
    Toast.show({
      type: 'success',
      text1: 'Voice Memo Saved',
      text2: `"${title}" has been saved.`,
      position: 'top',
      visibilityTime: 2500,
    });
    setTimeout(() => listRef.current?.scrollToOffset?.({offset: 0, animated: true}), 250);
  }

  async function startRecording() {
    try {
      Keyboard.dismiss();
      if (searchOpen) { setSearchOpen(false); setSearch(''); }
      const hasPermission = await requestMicPermission();
      if (!hasPermission) {
        Alert.alert('Microphone Permission Required', 'Please grant microphone access.', [
          {text: 'Cancel', style: 'cancel'},
          {text: 'Open Settings', onPress: () => Linking.openSettings().catch(() => {})},
        ]);
        return;
      }
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
      const recordedUri = await Sound.startRecorder(undefined, audioSet);
      currentRecordingUriRef.current = recordedUri;
      setIsRecording(true);
      setRecordSecs(0);
      Sound.addRecordBackListener(e => {
        const pos = e.currentPosition ?? e.current_position ?? 0;
        setRecordSecs(pos);
        if (!maxWarnedRef.current && pos >= WARN_AT_MS) {
          maxWarnedRef.current = true;
          Alert.alert('Almost at limit', 'Recording will stop automatically at 10 minutes.');
        }
        if (pos >= MAX_RECORD_MS) stopRecording();
      });
    } catch (e) {
      Alert.alert('Recording Failed', e?.message || 'Unable to start recorder.');
      setIsRecording(false);
    }
  }

  async function stopRecording() {
    try {
      const elapsed = Date.now() - recordStartTimeRef.current;
      if (elapsed < 800) await new Promise(res => setTimeout(res, 800 - elapsed));
      const durationAtStop = recordSecs;
      const result = await Sound.stopRecorder();
      Sound.removeRecordBackListener();
      setIsRecording(false);
      const finalPath =
        typeof result === 'string' && result.length > 0 && result !== 'recorder already stopped'
          ? result
          : currentRecordingUriRef.current;
      // Auto-save on stop — no Save button / modal
      if (finalPath) autoSaveMemo(finalPath, durationAtStop);
    } catch (e) {
      setIsRecording(false);
      Sound.removeRecordBackListener();
      const fallbackPath = currentRecordingUriRef.current;
      if (fallbackPath) autoSaveMemo(fallbackPath, recordSecs);
    }
  }

  async function playMemo(memo) {
    if (isRecording) {
      Alert.alert('Recording in progress', 'Stop recording first to play a memo.');
      return;
    }
    try {
      if (playingId === memo.id) { await stopPlayback(); return; }
      await stopPlayback();
      await Sound.startPlayer(memo.path);
      setPlayingId(memo.id);
      setPlaySecs(0);
      Sound.addPlayBackListener(e => setPlaySecs(e.currentPosition ?? e.current_position ?? 0));
      Sound.addPlaybackEndListener(() => stopPlayback());
    } catch (e) {
      Alert.alert('Playback Failed', 'Unable to play this audio file.');
      setPlayingId(null);
    }
  }

  async function handleDelete(id) {
    const target = memos.find(m => String(m.id) === String(id));
    if (playingId === id) await stopPlayback();
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMemos(prev => prev.filter(m => String(m.id) !== String(id)));
    setDeleteId(null);
    Toast.show({type: 'info', text1: 'Voice Memo Deleted', position: 'top', visibilityTime: 2000});
    if (target?.path) await deleteFileSafe(target.path);
  }

  async function shareMemo(memo) {
    try {
      await Share.share({url: memo.path, message: memo.title, title: memo.title});
    } catch (_) {}
  }

  const filtered = useMemo(() => {
    let list = memos;
    if (filter !== 'all') {
      list = list.filter(m => getFilterBucket(m) === filter || (filter === 'week' && getFilterBucket(m) === 'today'));
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(m => (m.title || '').toLowerCase().includes(q));
    }
    return list;
  }, [memos, filter, search]);

  function renderItem({item}) {
    const playing = playingId === item.id;
    return (
      <View style={[styles.card, {backgroundColor: theme.colors.surface, borderColor: theme.colors.border}]}>
        <Pressable onPress={() => playMemo(item)} style={styles.cardMain}>
          <View style={[styles.playBtn, {backgroundColor: theme.colors.primary + '18'}]}>
            {playing ? <Pause size={18} color={theme.colors.primary} /> : <Play size={18} color={theme.colors.primary} />}
          </View>
          <View style={{flex: 1}}>
            <Text style={[styles.cardTitle, {color: theme.colors.text}]} numberOfLines={1}>{item.title}</Text>
            <Text style={[styles.cardMeta, {color: theme.colors.textLight}]}>
              {formatDuration(playing ? playSecs : item.duration)} · {formatDate(item.createdAt)}
            </Text>
          </View>
        </Pressable>
        <Pressable onPress={() => shareMemo(item)} hitSlop={8} style={styles.iconBtn}>
          <Share2 size={16} color={theme.colors.textSecondary} />
        </Pressable>
        <Pressable onPress={() => setDeleteId(item.id)} hitSlop={8} style={styles.iconBtn}>
          <Trash2 size={16} color={theme.colors.danger} />
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, {backgroundColor: theme.colors.background}]} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={openDrawer} style={styles.menuBtn} hitSlop={8}>
          <Menu size={18} color={theme.colors.text} strokeWidth={2.6} />
        </Pressable>
        <View style={{flex: 1}}>
          <Text style={[styles.title, {color: theme.colors.text}]}>Voice Memos</Text>
          <Text style={[styles.subtitle, {color: theme.colors.textSecondary}]}>
            {isRecording ? 'Recording… tap stop to auto-save' : 'Tap mic to record · auto-saves on stop'}
          </Text>
        </View>
        <Pressable onPress={() => setSearchOpen(s => !s)} hitSlop={8}>
          {searchOpen ? <X size={18} color={theme.colors.text} /> : <Search size={18} color={theme.colors.text} />}
        </Pressable>
      </View>

      {searchOpen && (
        <View style={[styles.searchWrap, {backgroundColor: theme.colors.surface, borderColor: theme.colors.border}]}>
          <Search size={14} color={theme.colors.textLight} />
          <TextInput
            style={{flex: 1, color: theme.colors.text, paddingVertical: 8, marginLeft: 8, fontSize: 14}}
            placeholder="Search memos…"
            placeholderTextColor={theme.colors.textLight}
            value={search}
            onChangeText={setSearch}
            autoFocus
          />
        </View>
      )}

      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <Pressable
            key={f.key}
            onPress={() => setFilter(f.key)}
            style={[
              styles.filterChip,
              {
                backgroundColor: filter === f.key ? theme.colors.primary + '18' : theme.colors.surface,
                borderColor: filter === f.key ? theme.colors.primary : theme.colors.border,
              },
            ]}>
            <Text style={{color: filter === f.key ? theme.colors.primary : theme.colors.textSecondary, fontWeight: '700', fontSize: 12}}>
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        ref={listRef}
        data={filtered}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={{padding: 16, paddingBottom: 120}}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Headphones size={36} color={theme.colors.textLight} />
              <Text style={[styles.emptyText, {color: theme.colors.textSecondary}]}>No voice memos yet</Text>
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              try {
                const saved = await getItem(APP_CONFIG.STORAGE_KEYS.VOICE_MEMOS, []);
                setMemos(Array.isArray(saved) ? saved : []);
              } finally {
                setRefreshing(false);
              }
            }}
            tintColor={theme.colors.primary}
          />
        }
      />

      <View style={[styles.recordBar, {paddingBottom: insets.bottom + 12, backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border}]}>
        {isRecording && (
          <View style={styles.recInfo}>
            <Animated.View style={[styles.recDot, {transform: [{scale: pulseAnim}]}]} />
            <Text style={[styles.recTime, {color: theme.colors.text}]}>{formatDuration(recordSecs)}</Text>
          </View>
        )}
        <Pressable
          onPress={isRecording ? stopRecording : startRecording}
          style={[styles.recBtn, {backgroundColor: isRecording ? theme.colors.danger : theme.colors.primary}]}>
          {isRecording ? <Square size={22} color="#FFF" fill="#FFF" /> : <Mic size={24} color="#FFF" />}
        </Pressable>
        <Text style={[styles.recHint, {color: theme.colors.textLight}]}>
          {isRecording ? 'Tap to stop & auto-save' : 'Tap to record'}
        </Text>
      </View>

      <ConfirmModal
        visible={!!deleteId}
        title="Delete voice memo?"
        message="This cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        destructive
        onConfirm={() => handleDelete(deleteId)}
        onCancel={() => setDeleteId(null)}
      />
    </SafeAreaView>
  );
}

function createStyles(theme, insets) {
  return StyleSheet.create({
    safe: {flex: 1},
    header: {flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12},
    menuBtn: {
      width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
      backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border,
    },
    title: {fontSize: 20, fontWeight: '900', letterSpacing: -0.3},
    subtitle: {fontSize: 12, marginTop: 2, fontWeight: '500'},
    searchWrap: {
      marginHorizontal: 16, marginBottom: 8, flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: 12, borderRadius: 12, borderWidth: 1,
    },
    filterRow: {flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 8},
    filterChip: {paddingHorizontal: 12, paddingVertical: 6, borderRadius: 99, borderWidth: 1},
    card: {
      flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1,
      padding: 12, marginBottom: 10, gap: 8,
    },
    cardMain: {flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12},
    playBtn: {width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center'},
    cardTitle: {fontSize: 14, fontWeight: '700'},
    cardMeta: {fontSize: 11, marginTop: 2},
    iconBtn: {padding: 6},
    empty: {alignItems: 'center', paddingTop: 60, gap: 12},
    emptyText: {fontSize: 14, fontWeight: '600'},
    recordBar: {
      position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center',
      paddingTop: 12, borderTopWidth: 1, gap: 8,
    },
    recInfo: {flexDirection: 'row', alignItems: 'center', gap: 8},
    recDot: {width: 10, height: 10, borderRadius: 5, backgroundColor: '#EF4444'},
    recTime: {fontSize: 16, fontWeight: '800'},
    recBtn: {
      width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center',
      elevation: 4, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: {width: 0, height: 4},
    },
    recHint: {fontSize: 11, fontWeight: '600', marginBottom: 4},
  });
}

export default VoiceMemosScreen;
