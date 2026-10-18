import {LocalizedText, LocalizedTextInput} from '../../i18n/LocalizedText';
import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  ScrollView,
  Share,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Pin,
  Palette,
  Share2,
  Trash2,
  Check,
  Clock,
  FileText,
} from 'lucide-react-native';

import {useTheme} from '../../hooks/useTheme';
import {useNotes} from '../../context/NotesContext';
import {haptic} from '../../utils/haptics';

/* --------------------------- PALETTE OPTIONS --------------------------- */
const NOTE_PALETTES = [
  {id: 'default', label: 'Default', light: null, dark: null},
  {id: 'amber', label: 'Amber', light: '#FEF3C7', dark: '#31230B'},
  {id: 'emerald', label: 'Emerald', light: '#D1FAE5', dark: '#0D3323'},
  {id: 'sky', label: 'Sky', light: '#E0F2FE', dark: '#0C2B3C'},
  {id: 'purple', label: 'Purple', light: '#EDE9FE', dark: '#241B3B'},
  {id: 'rose', label: 'Rose', light: '#FFE4E6', dark: '#391720'},
  {id: 'orange', label: 'Sunset', light: '#FFEDD5', dark: '#371E0B'},
];

export default function NoteEditorScreen({navigation, route}) {
  const {theme} = useTheme();
  const insets = useSafeAreaInsets();
  const {notes, createNote, updateNote, deleteNote, cleanupEmptyNote} = useNotes();

  const noteId = route.params?.noteId;
  const isNew = route.params?.isNew;

  // Active note in state
  const existingNote = notes.find(n => n.id === noteId);

  const [activeId, setActiveId] = useState(noteId || null);
  const [title, setTitle] = useState(existingNote?.title || '');
  const [content, setContent] = useState(existingNote?.content || '');
  const [pinned, setPinned] = useState(existingNote?.pinned || false);
  const [colorId, setColorId] = useState(existingNote?.color || 'default');
  const [saveStatus, setSaveStatus] = useState('Saved');
  const [paletteModalVisible, setPaletteModalVisible] = useState(false);

  const saveTimeoutRef = useRef(null);
  const activeIdRef = useRef(activeId);
  const titleRef = useRef(title);
  const contentRef = useRef(content);
  const pinnedRef = useRef(pinned);
  const colorIdRef = useRef(colorId);

  activeIdRef.current = activeId;
  titleRef.current = title;
  contentRef.current = content;
  pinnedRef.current = pinned;
  colorIdRef.current = colorId;

  // If new note and no id yet, create one immediately
  useEffect(() => {
    if (!activeId) {
      const newId = createNote({
        title: '',
        content: '',
      });
      setActiveId(newId);
      activeIdRef.current = newId;
    }
  }, [activeId, createNote]);

  // Sync if note updated externally
  useEffect(() => {
    if (existingNote && activeId === existingNote.id) {
      if (titleRef.current !== existingNote.title) {
        setTitle(existingNote.title || '');
      }
      if (contentRef.current !== existingNote.content) {
        setContent(existingNote.content || '');
      }
      setPinned(existingNote.pinned || false);
      setColorId(existingNote.color || 'default');
    }
  }, [existingNote, activeId]);

  /* ---- AUTO SAVE CORE ---- */
  const triggerAutoSave = useCallback(
    (newTitle, newContent, newPinned, newColor) => {
      const idToSave = activeIdRef.current;
      if (!idToSave) return;

      setSaveStatus('Saving...');
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      updateNote(idToSave, {
        title: newTitle,
        content: newContent,
        pinned: newPinned,
        color: newColor,
      });

      saveTimeoutRef.current = setTimeout(() => {
        setSaveStatus('Saved');
      }, 400);
    },
    [updateNote],
  );

  function handleTitleChange(text) {
    setTitle(text);
    triggerAutoSave(text, content, pinned, colorId);
  }

  function handleContentChange(text) {
    setContent(text);
    triggerAutoSave(title, text, pinned, colorId);
  }

  function handleTogglePin() {
    haptic('light');
    const nextPinned = !pinned;
    setPinned(nextPinned);
    triggerAutoSave(title, content, nextPinned, colorId);
  }

  function handleSelectColor(cId) {
    haptic('light');
    setColorId(cId);
    setPaletteModalVisible(false);
    triggerAutoSave(title, content, pinned, cId);
  }

  /* ---- EXIT & CLEANUP ---- */
  function handleGoBack() {
    haptic('light');
    // Ensure final state is saved
    const curId = activeIdRef.current;
    if (curId) {
      updateNote(curId, {
        title: titleRef.current,
        content: contentRef.current,
        pinned: pinnedRef.current,
        color: colorIdRef.current,
      });
      // If user typed nothing at all, clean it up
      cleanupEmptyNote(curId);
    }
    navigation.goBack();
  }

  /* ---- SHARE ---- */
  async function handleShare() {
    haptic('light');
    const textToShare = [title.trim(), content.trim()]
      .filter(Boolean)
      .join('\n\n');
    if (!textToShare) {
      Alert.alert('Empty Note', 'Write something first to share.');
      return;
    }
    try {
      await Share.share({
        title: title || 'Tasklume Note',
        message: textToShare,
      });
    } catch (_) {}
  }

  /* ---- DELETE ---- */
  function handleDelete() {
    haptic('medium');
    Alert.alert(
      'Delete Note',
      'Are you sure you want to permanently delete this note?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (activeIdRef.current) {
              deleteNote(activeIdRef.current);
            }
            navigation.goBack();
          },
        },
      ],
    );
  }

  // Calculate statistics
  const wordCount = (content.trim() ? content.trim().split(/\s+/) : []).length;
  const charCount = content.length;

  // Selected background color
  const paletteObj = NOTE_PALETTES.find(p => p.id === colorId);
  const customBg =
    theme.mode === 'dark' ? paletteObj?.dark : paletteObj?.light;
  const activeBg = customBg || theme.colors.background;

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: activeBg}]}
      edges={['top', 'left', 'right']}>
      {/* ----------------- TOP BAR ----------------- */}
      <View
        style={[
          styles.headerBar,
          {borderBottomColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'},
        ]}>
        {/* Back Button */}
        <Pressable
          onPress={handleGoBack}
          style={({pressed}) => [
            styles.iconBtn,
            {backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'},
            pressed && {opacity: 0.6},
          ]}
          hitSlop={8}>
          <ArrowLeft size={20} color={theme.colors.text} />
        </Pressable>

        {/* Auto-save status indicator */}
        <View style={styles.statusPill}>
          {saveStatus === 'Saved' ? (
            <Check size={13} color="#10B981" strokeWidth={2.8} />
          ) : (
            <Clock size={13} color="#F59E0B" strokeWidth={2.4} />
          )}
          <LocalizedText
            style={[
              styles.statusText,
              {color: saveStatus === 'Saved' ? '#10B981' : '#F59E0B'},
            ]}>
            {saveStatus}
          </LocalizedText>
        </View>

        {/* Action icons right */}
        <View style={styles.headerRightActions}>
          {/* Pin */}
          <Pressable
            onPress={handleTogglePin}
            style={({pressed}) => [
              styles.iconBtn,
              pinned && styles.pinnedBtnActive,
              pressed && {opacity: 0.6},
            ]}
            hitSlop={6}>
            <Pin
              size={18}
              color={pinned ? '#F59E0B' : theme.colors.textLight}
              fill={pinned ? '#F59E0B' : 'none'}
            />
          </Pressable>

          {/* Color palette */}
          <Pressable
            onPress={() => setPaletteModalVisible(true)}
            style={({pressed}) => [
              styles.iconBtn,
              pressed && {opacity: 0.6},
            ]}
            hitSlop={6}>
            <Palette size={18} color={theme.colors.textLight} />
          </Pressable>

          {/* Share */}
          <Pressable
            onPress={handleShare}
            style={({pressed}) => [
              styles.iconBtn,
              pressed && {opacity: 0.6},
            ]}
            hitSlop={6}>
            <Share2 size={18} color={theme.colors.textLight} />
          </Pressable>

          {/* Delete */}
          <Pressable
            onPress={handleDelete}
            style={({pressed}) => [
              styles.iconBtn,
              pressed && {opacity: 0.6},
            ]}
            hitSlop={6}>
            <Trash2 size={18} color="#EF4444" />
          </Pressable>
        </View>
      </View>

      {/* ----------------- EDITOR CONTENT ----------------- */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}>
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={[
            styles.scrollContent,
            {paddingBottom: insets.bottom + 80},
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* Title Input */}
          <LocalizedTextInput
            value={title}
            onChangeText={handleTitleChange}
            placeholder="Note Title"
            placeholderTextColor={theme.colors.textLight + '70'}
            style={[
              styles.titleInput,
              {color: theme.colors.text},
            ]}
            maxLength={120}
            returnKeyType="next"
          />

          {/* Body Multiline Input */}
          <LocalizedTextInput
            value={content}
            onChangeText={handleContentChange}
            placeholder="Start typing your notes, thoughts, tasks, ideas..."
            placeholderTextColor={theme.colors.textLight + '60'}
            style={[
              styles.contentInput,
              {color: theme.colors.text},
            ]}
            multiline
            textAlignVertical="top"
            scrollEnabled={false}
            autoFocus={isNew}
          />
        </ScrollView>

        {/* ----------------- BOTTOM STATS BAR ----------------- */}
        <View
          style={[
            styles.footerBar,
            {
              backgroundColor: theme.mode === 'dark' ? 'rgba(15,23,42,0.92)' : 'rgba(255,255,255,0.95)',
              borderTopColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
              paddingBottom: Math.max(insets.bottom, 10),
            },
          ]}>
          <View style={styles.footerStatItem}>
            <FileText size={13} color={theme.colors.textLight} />
            <LocalizedText style={[styles.footerStatText, {color: theme.colors.textLight}]}>
              {wordCount} {wordCount === 1 ? 'word' : 'words'}
            </LocalizedText>
          </View>

          <View style={styles.footerDot} />

          <LocalizedText style={[styles.footerStatText, {color: theme.colors.textLight}]}>
            {charCount} chars
          </LocalizedText>

          <View style={{flex: 1}} />

          <LocalizedText style={[styles.footerNoteAutoText, {color: theme.colors.primary}]}>
            Auto-saves continuously
          </LocalizedText>
        </View>
      </KeyboardAvoidingView>

      {/* ----------------- COLOR PALETTE MODAL ----------------- */}
      <Modal
        visible={paletteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPaletteModalVisible(false)}>
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setPaletteModalVisible(false)}>
          <View
            style={[
              styles.paletteSheet,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}>
            <LocalizedText style={[styles.paletteTitle, {color: theme.colors.text}]}>
              Note Color
            </LocalizedText>

            <View style={styles.paletteRow}>
              {NOTE_PALETTES.map(p => {
                const isSelected = colorId === p.id;
                const circleBg =
                  theme.mode === 'dark'
                    ? p.dark || theme.colors.card
                    : p.light || theme.colors.card;

                return (
                  <Pressable
                    key={p.id}
                    onPress={() => handleSelectColor(p.id)}
                    style={[
                      styles.paletteOption,
                      {
                        backgroundColor: circleBg,
                        borderColor: isSelected
                          ? theme.colors.primary
                          : theme.colors.border,
                        borderWidth: isSelected ? 2.5 : 1,
                      },
                    ]}>
                    {isSelected && (
                      <Check
                        size={16}
                        color={theme.mode === 'dark' ? '#FFFFFF' : '#0F172A'}
                        strokeWidth={3}
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinnedBtnActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.18)',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  keyboardView: {
    flex: 1,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  titleInput: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
    marginBottom: 12,
    paddingVertical: 4,
  },
  contentInput: {
    fontSize: 16,
    lineHeight: 24,
    minHeight: 260,
    paddingVertical: 4,
  },
  footerBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  footerStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  footerDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#94A3B8',
    marginHorizontal: 8,
  },
  footerStatText: {
    fontSize: 12,
    fontWeight: '500',
  },
  footerNoteAutoText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  paletteSheet: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  paletteTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  paletteRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  paletteOption: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
