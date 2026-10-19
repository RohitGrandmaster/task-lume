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
  UIManager
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
  FileText,
  StickyNote,
  Clock,
  Sparkles,
} from 'lucide-react-native';

import {useTheme} from '../../hooks/useTheme';
import {useNotes} from '../../context/NotesContext';
import ROUTES from '../../constants/routes';
import {haptic} from '../../utils/haptics';

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

import {PALETTE_MAP} from '../../constants/noteColors';

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
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'pinned'

  // Filter notes
  const filteredNotes = useMemo(() => {
    let list = [...notes];

    // Filter out completely blank notes
    list = list.filter(
      n => (n.title || '').trim().length > 0 || (n.content || '').trim().length > 0,
    );

    // Tab filter
    if (activeTab === 'pinned') {
      list = list.filter(n => n.pinned);
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        n =>
          (n.title || '').toLowerCase().includes(q) ||
          (n.content || '').toLowerCase().includes(q),
      );
    }

    // Sort: pinned first, then by updatedAt desc
    return list.sort((a, b) => {
      if (a.pinned !== b.pinned) {
        return a.pinned ? -1 : 1;
      }
      return (b.updatedAt || 0) - (a.updatedAt || 0);
    });
  }, [notes, activeTab, searchQuery]);

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
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            deleteNote(note.id);
          },
        },
      ],
    );
  }

  /* ---- RENDER NOTE CARD ---- */
  function renderNoteCard({item}) {
    const palette = PALETTE_MAP[item.color];
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

    const words = (item.content?.trim() ? item.content.trim().split(/\s+/) : []).length;
    const cleanContent = stripMarkdown(item.content || '');
    const displayTitle = item.title?.trim() || (cleanContent ? cleanContent.split('\n')[0] : 'Untitled Note');
    const displayBody = item.title?.trim()
      ? cleanContent
      : cleanContent?.split('\n')?.slice(1)?.join('\n')?.trim() || '';

    return (
      <Pressable
        onPress={() => handleOpenNote(item)}
        style={({pressed}) => [
          styles.card,
          {
            backgroundColor: cardBg,
            borderColor: cardBorder,
            opacity: pressed ? 0.85 : 1,
            transform: [{scale: pressed ? 0.985 : 1}],
          },
        ]}>
        {/* Card Header: Title + Pin button */}
        <View style={styles.cardHeader}>
          <LocalizedText
            translate={false}
            style={[
              styles.cardTitle,
              {color: theme.colors.text},
            ]}
            numberOfLines={2}>
            {displayTitle}
          </LocalizedText>

          <Pressable
            onPress={() => handleTogglePin(item.id)}
            style={({pressed}) => [
              styles.cardActionBtn,
              pressed && {opacity: 0.6},
            ]}
            hitSlop={6}>
            <Pin
              size={15}
              color={item.pinned ? '#F59E0B' : theme.colors.textLight + '80'}
              fill={item.pinned ? '#F59E0B' : 'none'}
            />
          </Pressable>
        </View>

        {/* Card Body Preview */}
        {displayBody ? (
          <LocalizedText
            translate={false}
            style={[
              styles.cardSnippet,
              {color: theme.colors.textLight},
            ]}
            numberOfLines={3}>
            {displayBody}
          </LocalizedText>
        ) : null}

        {/* Card Footer: Timestamp + Word count + Delete button */}
        <View style={styles.cardFooter}>
          <View style={styles.footerLeft}>
            <Clock size={11} color={theme.colors.textLight} />
            <LocalizedText style={[styles.cardTimeText, {color: theme.colors.textLight}]}>
              {formatTimeAgo(item.updatedAt)}
            </LocalizedText>

            {words > 0 && (
              <>
                <View style={styles.cardDot} />
                <LocalizedText style={[styles.cardWordBadge, {color: theme.colors.textLight}]}>
                  {words} {words === 1 ? 'word' : 'words'}
                </LocalizedText>
              </>
            )}
          </View>

          <Pressable
            onPress={() => handleDeleteNote(item)}
            style={({pressed}) => [
              styles.cardActionBtn,
              pressed && {opacity: 0.6},
            ]}
            hitSlop={8}>
            <Trash2 size={14} color="#EF4444" />
          </Pressable>
        </View>
      </Pressable>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.colors.background}]}
      edges={['top', 'left', 'right']}>
      {/* ----------------- APP HEADER ----------------- */}
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
              {backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'},
              pressed && {opacity: 0.6},
            ]}
            hitSlop={8}>
            <Menu size={20} color={theme.colors.text} />
          </Pressable>

          <View>
            <View style={styles.titleRow}>
              <LocalizedText style={[styles.headerTitle, {color: theme.colors.text}]}>
                Notes
              </LocalizedText>
              <View
                style={[
                  styles.countBadge,
                  {backgroundColor: `${theme.colors.primary}1A`},
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
            <LocalizedText style={[styles.headerSubtitle, {color: theme.colors.textLight}]}>
              Instant auto-saved thoughts & lists
            </LocalizedText>
          </View>
        </View>
      </View>

      {/* ----------------- SEARCH & FILTER BAR ----------------- */}
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
            placeholder="Search in notes..."
            placeholderTextColor={theme.colors.textLight + '80'}
            style={[styles.searchInput, {color: theme.colors.text}]}
            returnKeyType="search"
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery('')} hitSlop={6}>
              <X size={15} color={theme.colors.textLight} />
            </Pressable>
          ) : null}
        </View>

        {/* Filter Chips */}
        <View style={styles.filterTabsRow}>
          <Pressable
            onPress={() => setActiveTab('all')}
            style={[
              styles.filterTab,
              activeTab === 'all' && [
                styles.filterTabActive,
                {backgroundColor: theme.colors.primary},
              ],
            ]}>
            <LocalizedText
              style={[
                styles.filterTabText,
                {color: activeTab === 'all' ? '#FFFFFF' : theme.colors.textLight},
              ]}>
              All Notes
            </LocalizedText>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('pinned')}
            style={[
              styles.filterTab,
              activeTab === 'pinned' && [
                styles.filterTabActive,
                {backgroundColor: '#F59E0B'},
              ],
            ]}>
            <Pin
              size={12}
              color={activeTab === 'pinned' ? '#FFFFFF' : theme.colors.textLight}
              fill={activeTab === 'pinned' ? '#FFFFFF' : 'none'}
            />
            <LocalizedText
              style={[
                styles.filterTabText,
                {color: activeTab === 'pinned' ? '#FFFFFF' : theme.colors.textLight},
              ]}>
              Pinned
            </LocalizedText>
          </Pressable>
        </View>
      </View>

      {/* ----------------- NOTES LIST ----------------- */}
      <FlatList
        data={filteredNotes}
        keyExtractor={item => item.id}
        renderItem={renderNoteCard}
        contentContainerStyle={[
          styles.listContainer,
          {paddingBottom: insets.bottom + 90},
          filteredNotes.length === 0 && styles.listEmptyCenter,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View
              style={[
                styles.emptyIconWrap,
                {backgroundColor: `${theme.colors.primary}15`},
              ]}>
              <StickyNote size={38} color={theme.colors.primary} strokeWidth={1.8} />
            </View>

            <LocalizedText style={[styles.emptyTitle, {color: theme.colors.text}]}>
              {searchQuery ? 'No matching notes' : 'No notes yet'}
            </LocalizedText>

            <LocalizedText
              style={[styles.emptyDesc, {color: theme.colors.textLight}]}>
              {searchQuery
                ? 'Try a different keyword to find your saved notes.'
                : 'Jot down quick ideas, meeting logs, or reminders. Every word saves automatically as you type!'}
            </LocalizedText>

            {!searchQuery && (
              <Pressable
                onPress={handleCreateNote}
                style={[
                  styles.emptyBtn,
                  {backgroundColor: theme.colors.primary},
                ]}>
                <Plus size={16} color="#FFFFFF" strokeWidth={2.6} />
                <LocalizedText style={styles.emptyBtnText}>Create First Note</LocalizedText>
              </Pressable>
            )}
          </View>
        }
      />

      {/* ----------------- FLOATING ACTION BUTTON ----------------- */}
      <Pressable
        onPress={handleCreateNote}
        style={({pressed}) => [
          styles.fab,
          {
            backgroundColor: theme.colors.primary,
            bottom: insets.bottom + 20,
            transform: [{scale: pressed ? 0.94 : 1}],
          },
        ]}>
        <Plus size={24} color="#FFFFFF" strokeWidth={2.8} />
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
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    width: 38,
    height: 38,
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
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  countBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
    gap: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  filterTabsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(148, 163, 184, 0.12)',
  },
  filterTabActive: {
    backgroundColor: '#3B82F6',
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '700',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 10,
  },
  listEmptyCenter: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 21,
  },
  cardActionBtn: {
    padding: 3,
  },
  cardSnippet: {
    fontSize: 13,
    lineHeight: 19,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(148, 163, 184, 0.15)',
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
    backgroundColor: '#94A3B8',
    marginHorizontal: 4,
  },
  cardWordBadge: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
