import {LocalizedText, LocalizedTextInput} from '../../i18n/LocalizedText';
import React, {useState, useMemo} from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  FlatList,
  Alert,
  LayoutAnimation,
  Platform,
  UIManager,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {DrawerActions} from '@react-navigation/native';
import {
  Menu,
  Search,
  X,
  Plus,
  Pin,
  Trash2,
  StickyNote,
  Clock,
} from 'lucide-react-native';

import {useTheme} from '../../hooks/useTheme';
import {useNotes} from '../../context/NotesContext';
import ROUTES from '../../constants/routes';
import {haptic} from '../../utils/haptics';
import {PALETTE_MAP} from '../../constants/noteColors';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental &&
  !global._Bridgeless &&
  !global.RN$Bridgeless
) {
  try {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  } catch (e) {}
}

/* --------------------------- HELPERS --------------------------- */
function stripMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/^#+\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/~~([^~]+)~~/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^>\s+/gm, '')
    .replace(/^\[[ xX]\]\s+/gm, '☐ ')
    .replace(/^[•*-]\s+/gm, '• ')
    .trim();
}

function formatTimeAgo(timestamp) {
  if (!timestamp) return '';
  const now = Date.now();
  const diffSec = Math.floor((now - timestamp) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  const d = new Date(timestamp);
  return d.toLocaleDateString(undefined, {month: 'short', day: 'numeric'});
}

export default function NotesScreen({navigation}) {
  const {theme} = useTheme();
  const insets = useSafeAreaInsets();
  const {notes, loading, deleteNote, togglePinNote} = useNotes();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filteredNotes = useMemo(() => {
    let list = [...notes];

    list = list.filter(
      n =>
        (n.title || '').trim().length > 0 ||
        (n.content || '').trim().length > 0,
    );

    if (activeTab === 'pinned') {
      list = list.filter(n => n.pinned);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        n =>
          (n.title || '').toLowerCase().includes(q) ||
          (n.content || '').toLowerCase().includes(q),
      );
    }

    return list.sort((a, b) => {
      if (a.pinned !== b.pinned) {
        return a.pinned ? -1 : 1;
      }
      return (b.updatedAt || 0) - (a.updatedAt || 0);
    });
  }, [notes, activeTab, searchQuery]);

  const pinnedCount = useMemo(
    () => notes.filter(n => n.pinned).length,
    [notes],
  );

  function handleCreateNote() {
    haptic('medium');
    navigation.navigate(ROUTES.NOTE_EDITOR, {isNew: true});
  }

  function handleOpenNote(note) {
    haptic('light');
    navigation.navigate(ROUTES.NOTE_EDITOR, {noteId: note.id});
  }

  function handleTogglePin(id) {
    haptic('light');
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    togglePinNote(id);
  }

  function handleDeleteNote(note) {
    haptic('medium');
    Alert.alert(
      'Delete Note',
      `Delete "${note.title?.trim() || 'Untitled Note'}"?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            LayoutAnimation.configureNext(
              LayoutAnimation.Presets.easeInEaseOut,
            );
            deleteNote(note.id);
          },
        },
      ],
    );
  }

  function renderNoteCard({item}) {
    const palette = item.color ? PALETTE_MAP[item.color] : null;
    const isDark = theme.mode === 'dark';

    const cardBg = palette
      ? isDark
        ? palette.dark
        : palette.light
      : theme.colors.surface;

    const cardBorder = palette
      ? isDark
        ? palette.borderDark
        : palette.borderLight
      : theme.colors.border;

    const accent = palette?.accent || theme.colors.primary;

    const words = (
      item.content?.trim() ? item.content.trim().split(/\s+/) : []
    ).length;
    const cleanContent = stripMarkdown(item.content || '');
    const displayTitle =
      item.title?.trim() ||
      (cleanContent ? cleanContent.split('\n')[0] : 'Untitled Note');
    const displayBody = item.title?.trim()
      ? cleanContent
      : cleanContent?.split('\n')?.slice(1)?.join('\n')?.trim() || '';

    return (
      <Pressable
        onPress={() => handleOpenNote(item)}
        style={({pressed}) => [
          styles.card,
          {
            backgroundColor: cardBg || theme.colors.surface,
            borderColor: cardBorder || theme.colors.border,
            opacity: pressed ? 0.92 : 1,
            transform: [{scale: pressed ? 0.988 : 1}],
          },
        ]}>
        <View style={[styles.cardAccent, {backgroundColor: accent}]} />

        <View style={styles.cardInner}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              {item.pinned ? (
                <View style={styles.pinBadge}>
                  <Pin size={10} color="#F59E0B" fill="#F59E0B" />
                </View>
              ) : null}
              <LocalizedText
                translate={false}
                style={[styles.cardTitle, {color: theme.colors.text}]}
                numberOfLines={2}>
                {displayTitle}
              </LocalizedText>
            </View>

            <View style={styles.cardActions}>
              <Pressable
                onPress={() => handleTogglePin(item.id)}
                style={({pressed}) => [
                  styles.cardActionBtn,
                  pressed && {opacity: 0.55},
                ]}
                hitSlop={8}>
                <Pin
                  size={15}
                  color={
                    item.pinned ? '#F59E0B' : theme.colors.textLight + '70'
                  }
                  fill={item.pinned ? '#F59E0B' : 'none'}
                />
              </Pressable>
              <Pressable
                onPress={() => handleDeleteNote(item)}
                style={({pressed}) => [
                  styles.cardActionBtn,
                  pressed && {opacity: 0.55},
                ]}
                hitSlop={8}>
                <Trash2 size={14} color="#EF4444" />
              </Pressable>
            </View>
          </View>

          {displayBody ? (
            <LocalizedText
              translate={false}
              style={[styles.cardSnippet, {color: theme.colors.textLight}]}
              numberOfLines={3}>
              {displayBody}
            </LocalizedText>
          ) : null}

          <View style={styles.cardFooter}>
            <View style={styles.footerLeft}>
              <Clock size={11} color={theme.colors.textLight} />
              <LocalizedText
                style={[
                  styles.cardTimeText,
                  {color: theme.colors.textLight},
                ]}>
                {formatTimeAgo(item.updatedAt)}
              </LocalizedText>

              {words > 0 && (
                <>
                  <View
                    style={[
                      styles.cardDot,
                      {backgroundColor: theme.colors.textLight + '60'},
                    ]}
                  />
                  <LocalizedText
                    style={[
                      styles.cardWordBadge,
                      {color: theme.colors.textLight},
                    ]}>
                    {words} {words === 1 ? 'word' : 'words'}
                  </LocalizedText>
                </>
              )}
            </View>

            {palette && palette.id !== 'default' ? (
              <View
                style={[
                  styles.colorDot,
                  {
                    backgroundColor: palette.accent,
                    borderColor:
                      theme.mode === 'dark'
                        ? 'rgba(255,255,255,0.15)'
                        : 'rgba(0,0,0,0.06)',
                  },
                ]}
              />
            ) : null}
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.colors.background}]}
      edges={['top', 'left', 'right']}>
      <View
        style={[
          styles.headerRow,
          {borderBottomColor: theme.colors.border},
        ]}>
        <View style={styles.headerLeft}>
          <Pressable
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            style={({pressed}) => [
              styles.iconBtn,
              {
                backgroundColor:
                  theme.mode === 'dark'
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(0,0,0,0.05)',
              },
              pressed && {opacity: 0.6},
            ]}
            hitSlop={8}>
            <Menu size={20} color={theme.colors.text} />
          </Pressable>

          <View>
            <View style={styles.titleRow}>
              <LocalizedText
                style={[styles.headerTitle, {color: theme.colors.text}]}>
                Notes
              </LocalizedText>
              <View
                style={[
                  styles.countBadge,
                  {backgroundColor: `${theme.colors.primary}18`},
                ]}>
                <LocalizedText
                  style={[
                    styles.countBadgeText,
                    {color: theme.colors.primary},
                  ]}>
                  {filteredNotes.length}
                </LocalizedText>
              </View>
            </View>
            <LocalizedText
              style={[styles.headerSubtitle, {color: theme.colors.textLight}]}>
              Auto-saved thoughts & lists
            </LocalizedText>
          </View>
        </View>
      </View>

      <View style={styles.searchSection}>
        <View
          style={[
            styles.searchBox,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}>
          <Search size={16} color={theme.colors.textLight} />
          <LocalizedTextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search notes..."
            placeholderTextColor={theme.colors.textLight + '80'}
            style={[styles.searchInput, {color: theme.colors.text}]}
            returnKeyType="search"
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
              <X size={15} color={theme.colors.textLight} />
            </Pressable>
          ) : null}
        </View>

        <View style={styles.filterTabsRow}>
          <Pressable
            onPress={() => setActiveTab('all')}
            style={[
              styles.filterTab,
              {
                backgroundColor:
                  activeTab === 'all'
                    ? theme.colors.primary
                    : theme.mode === 'dark'
                    ? 'rgba(255,255,255,0.06)'
                    : 'rgba(148, 163, 184, 0.12)',
              },
            ]}>
            <LocalizedText
              style={[
                styles.filterTabText,
                {
                  color:
                    activeTab === 'all' ? '#FFFFFF' : theme.colors.textLight,
                },
              ]}>
              All
            </LocalizedText>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('pinned')}
            style={[
              styles.filterTab,
              {
                backgroundColor:
                  activeTab === 'pinned'
                    ? '#F59E0B'
                    : theme.mode === 'dark'
                    ? 'rgba(255,255,255,0.06)'
                    : 'rgba(148, 163, 184, 0.12)',
              },
            ]}>
            <Pin
              size={12}
              color={
                activeTab === 'pinned' ? '#FFFFFF' : theme.colors.textLight
              }
              fill={activeTab === 'pinned' ? '#FFFFFF' : 'none'}
            />
            <LocalizedText
              style={[
                styles.filterTabText,
                {
                  color:
                    activeTab === 'pinned'
                      ? '#FFFFFF'
                      : theme.colors.textLight,
                },
              ]}>
              Pinned{pinnedCount > 0 ? ` · ${pinnedCount}` : ''}
            </LocalizedText>
          </Pressable>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredNotes}
          keyExtractor={item => item.id}
          renderItem={renderNoteCard}
          contentContainerStyle={[
            styles.listContainer,
            {paddingBottom: insets.bottom + 100},
            filteredNotes.length === 0 && styles.listEmptyCenter,
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View
                style={[
                  styles.emptyIconWrap,
                  {backgroundColor: `${theme.colors.primary}14`},
                ]}>
                <StickyNote
                  size={40}
                  color={theme.colors.primary}
                  strokeWidth={1.7}
                />
              </View>

              <LocalizedText
                style={[styles.emptyTitle, {color: theme.colors.text}]}>
                {searchQuery
                  ? 'No matching notes'
                  : activeTab === 'pinned'
                  ? 'No pinned notes'
                  : 'No notes yet'}
              </LocalizedText>

              <LocalizedText
                style={[styles.emptyDesc, {color: theme.colors.textLight}]}>
                {searchQuery
                  ? 'Try a different keyword.'
                  : activeTab === 'pinned'
                  ? 'Pin important notes to find them quickly.'
                  : 'Capture ideas, meeting notes, and lists. Everything auto-saves as you type.'}
              </LocalizedText>

              {!searchQuery && activeTab === 'all' && (
                <Pressable
                  onPress={handleCreateNote}
                  style={({pressed}) => [
                    styles.emptyBtn,
                    {
                      backgroundColor: theme.colors.primary,
                      opacity: pressed ? 0.9 : 1,
                    },
                  ]}>
                  <Plus size={16} color="#FFFFFF" strokeWidth={2.6} />
                  <LocalizedText style={styles.emptyBtnText}>
                    Create first note
                  </LocalizedText>
                </Pressable>
              )}
            </View>
          }
        />
      )}

      <Pressable
        onPress={handleCreateNote}
        style={({pressed}) => [
          styles.fab,
          {
            backgroundColor: theme.colors.primary,
            bottom: insets.bottom + 22,
            transform: [{scale: pressed ? 0.94 : 1}],
            shadowColor: theme.colors.primary,
          },
        ]}>
        <Plus size={26} color="#FFFFFF" strokeWidth={2.6} />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
    gap: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  filterTabsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 6,
    gap: 12,
  },
  listEmptyCenter: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    flexDirection: 'row',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  cardAccent: {
    width: 4,
  },
  cardInner: {
    flex: 1,
    padding: 14,
    paddingLeft: 12,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  cardTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  pinBadge: {
    marginTop: 3,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  cardActionBtn: {
    padding: 5,
  },
  cardSnippet: {
    fontSize: 13.5,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(148, 163, 184, 0.18)',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  cardTimeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  cardDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    marginHorizontal: 2,
  },
  cardWordBadge: {
    fontSize: 11,
    fontWeight: '600',
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    paddingVertical: 48,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  emptyTitle: {
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  emptyDesc: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 22,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
  },
  emptyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
});
