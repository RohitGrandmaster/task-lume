import {LocalizedText, LocalizedTextInput} from '../../i18n/LocalizedText';
import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Share,
  Alert,
  KeyboardAvoidingView,
  Platform,
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
  Bold,
  Italic,
  Heading,
  List,
  ListTodo,
  Quote,
  Code,
  Strikethrough,
  Minus,
  Eye,
  PenLine,
} from 'lucide-react-native';

import {useTheme} from '../../hooks/useTheme';
import {useNotes} from '../../context/NotesContext';
import {NOTE_PALETTES, PALETTE_MAP} from '../../constants/noteColors';
import {haptic} from '../../utils/haptics';

/* --------------------------- INLINE FORMATTER --------------------------- */

function renderFormattedInline(text, baseStyle, textKey) {
  if (!text) return null;
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|~~[^~]+~~|`[^`]+`)/g;
  const parts = text.split(regex);

  if (parts.length === 1) {
    return (
      <LocalizedText key={textKey} style={baseStyle}>
        {text}
      </LocalizedText>
    );
  }

  return (
    <LocalizedText key={textKey} style={baseStyle}>
      {parts.map((part, index) => {
        if (!part) return null;
        if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
          return (
            <LocalizedText key={index} style={{fontWeight: '800'}}>
              {part.slice(2, -2)}
            </LocalizedText>
          );
        }
        if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
          return (
            <LocalizedText key={index} style={{fontStyle: 'italic'}}>
              {part.slice(1, -1)}
            </LocalizedText>
          );
        }
        if (part.startsWith('~~') && part.endsWith('~~') && part.length >= 4) {
          return (
            <LocalizedText key={index} style={{textDecorationLine: 'line-through'}}>
              {part.slice(2, -2)}
            </LocalizedText>
          );
        }
        if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
          return (
            <LocalizedText
              key={index}
              style={{
                fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                fontWeight: '600',
              }}>
              {part.slice(1, -1)}
            </LocalizedText>
          );
        }
        return part;
      })}
    </LocalizedText>
  );
}

/* --------------------------- COMPONENT --------------------------- */

export default function NoteEditorScreen({navigation, route}) {
  const {theme} = useTheme();
  const insets = useSafeAreaInsets();
  const {notes, createNote, updateNote, deleteNote, cleanupEmptyNote} = useNotes();

  const noteId = route.params?.noteId;
  const isNew = route.params?.isNew;

  const existingNote = notes.find(n => n.id === noteId);

  const [activeId, setActiveId] = useState(noteId || null);
  const [title, setTitle] = useState(existingNote?.title || '');
  const [content, setContent] = useState(existingNote?.content || '');
  const [pinned, setPinned] = useState(existingNote?.pinned || false);
  const [colorId, setColorId] = useState(existingNote?.color || 'default');
  const [saveStatus, setSaveStatus] = useState('Saved');
  const [showColorBar, setShowColorBar] = useState(false);
  const [viewMode, setViewMode] = useState('edit'); // 'edit' | 'preview'
  const [selection, setSelection] = useState({start: 0, end: 0});

  const contentInputRef = useRef(null);
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

  // Initialize new note
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
    triggerAutoSave(title, content, pinned, cId);
  }

  /* ---- FORMATTING ENGINE ---- */
  function applyFormatting(type) {
    haptic('light');
    const {start, end} = selection;
    const text = content;
    const isSelected = start !== end;
    const selectedText = isSelected ? text.slice(start, end) : '';

    let newText = text;

    switch (type) {
      case 'bold': {
        if (isSelected) {
          if (
            selectedText.startsWith('**') &&
            selectedText.endsWith('**') &&
            selectedText.length >= 4
          ) {
            const unwrapped = selectedText.slice(2, -2);
            newText = text.slice(0, start) + unwrapped + text.slice(end);
          } else {
            const wrapped = `**${selectedText}**`;
            newText = text.slice(0, start) + wrapped + text.slice(end);
          }
        } else {
          newText = text.slice(0, start) + '**bold**' + text.slice(start);
        }
        break;
      }
      case 'italic': {
        if (isSelected) {
          if (
            selectedText.startsWith('*') &&
            selectedText.endsWith('*') &&
            selectedText.length >= 2
          ) {
            const unwrapped = selectedText.slice(1, -1);
            newText = text.slice(0, start) + unwrapped + text.slice(end);
          } else {
            const wrapped = `*${selectedText}*`;
            newText = text.slice(0, start) + wrapped + text.slice(end);
          }
        } else {
          newText = text.slice(0, start) + '*italic*' + text.slice(start);
        }
        break;
      }
      case 'heading': {
        const lineStart = text.lastIndexOf('\n', start - 1) + 1;
        const lineEnd = text.indexOf('\n', start);
        const currentLine = text.slice(
          lineStart,
          lineEnd === -1 ? text.length : lineEnd,
        );

        let modifiedLine = currentLine;
        if (currentLine.startsWith('## ')) {
          modifiedLine = '# ' + currentLine.slice(3);
        } else if (currentLine.startsWith('# ')) {
          modifiedLine = currentLine.slice(2);
        } else {
          modifiedLine = '## ' + currentLine;
        }
        newText =
          text.slice(0, lineStart) +
          modifiedLine +
          (lineEnd === -1 ? '' : text.slice(lineEnd));
        break;
      }
      case 'bullet': {
        const lineStart = text.lastIndexOf('\n', start - 1) + 1;
        const lineEnd = text.indexOf('\n', start);
        const currentLine = text.slice(
          lineStart,
          lineEnd === -1 ? text.length : lineEnd,
        );

        let modifiedLine = currentLine;
        if (currentLine.startsWith('• ')) {
          modifiedLine = currentLine.slice(2);
        } else if (currentLine.startsWith('- ')) {
          modifiedLine = currentLine.slice(2);
        } else {
          modifiedLine = '• ' + currentLine;
        }
        newText =
          text.slice(0, lineStart) +
          modifiedLine +
          (lineEnd === -1 ? '' : text.slice(lineEnd));
        break;
      }
      case 'checklist': {
        const lineStart = text.lastIndexOf('\n', start - 1) + 1;
        const lineEnd = text.indexOf('\n', start);
        const currentLine = text.slice(
          lineStart,
          lineEnd === -1 ? text.length : lineEnd,
        );

        let modifiedLine = currentLine;
        if (currentLine.startsWith('[ ] ')) {
          modifiedLine = '[x] ' + currentLine.slice(4);
        } else if (
          currentLine.startsWith('[x] ') ||
          currentLine.startsWith('[X] ')
        ) {
          modifiedLine = currentLine.slice(4);
        } else {
          modifiedLine = '[ ] ' + currentLine;
        }
        newText =
          text.slice(0, lineStart) +
          modifiedLine +
          (lineEnd === -1 ? '' : text.slice(lineEnd));
        break;
      }
      case 'quote': {
        const lineStart = text.lastIndexOf('\n', start - 1) + 1;
        const lineEnd = text.indexOf('\n', start);
        const currentLine = text.slice(
          lineStart,
          lineEnd === -1 ? text.length : lineEnd,
        );

        let modifiedLine = currentLine;
        if (currentLine.startsWith('> ')) {
          modifiedLine = currentLine.slice(2);
        } else {
          modifiedLine = '> ' + currentLine;
        }
        newText =
          text.slice(0, lineStart) +
          modifiedLine +
          (lineEnd === -1 ? '' : text.slice(lineEnd));
        break;
      }
      case 'code': {
        if (isSelected) {
          const wrapped = `\`${selectedText}\``;
          newText = text.slice(0, start) + wrapped + text.slice(end);
        } else {
          newText = text.slice(0, start) + '`code`' + text.slice(start);
        }
        break;
      }
      case 'strike': {
        if (isSelected) {
          const wrapped = `~~${selectedText}~~`;
          newText = text.slice(0, start) + wrapped + text.slice(end);
        } else {
          newText = text.slice(0, start) + '~~strike~~' + text.slice(start);
        }
        break;
      }
      case 'divider': {
        newText = text.slice(0, start) + '\n---\n' + text.slice(start);
        break;
      }
    }

    handleContentChange(newText);
  }

  // Interactive task toggle in preview mode
  function handleTogglePreviewTask(lineIdx) {
    haptic('light');
    const lines = content.split('\n');
    if (lineIdx >= 0 && lineIdx < lines.length) {
      const line = lines[lineIdx];
      if (line.startsWith('[ ] ')) {
        lines[lineIdx] = '[x] ' + line.slice(4);
      } else if (line.startsWith('[x] ') || line.startsWith('[X] ')) {
        lines[lineIdx] = '[ ] ' + line.slice(4);
      }
      handleContentChange(lines.join('\n'));
    }
  }

  /* ---- EXIT & CLEANUP ---- */
  const flushAndCleanup = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    const curId = activeIdRef.current;
    if (curId) {
      updateNote(curId, {
        title: titleRef.current,
        content: contentRef.current,
        pinned: pinnedRef.current,
        color: colorIdRef.current,
      });
      cleanupEmptyNote(curId);
    }
  }, [updateNote, cleanupEmptyNote]);

  useEffect(() => {
    const unsub = navigation.addListener('beforeRemove', () => {
      flushAndCleanup();
    });
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      unsub();
    };
  }, [navigation, flushAndCleanup]);

  function handleGoBack() {
    haptic('light');
    flushAndCleanup();
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

  // Statistics
  const wordCount = (content.trim() ? content.trim().split(/\s+/) : []).length;
  const charCount = content.length;

  // Selected background color
  const paletteObj = PALETTE_MAP[colorId] || NOTE_PALETTES[0];
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
          {
            borderBottomColor:
              theme.mode === 'dark'
                ? 'rgba(255,255,255,0.08)'
                : 'rgba(0,0,0,0.06)',
          },
        ]}>
        {/* Back Button */}
        <Pressable
          onPress={handleGoBack}
          style={({pressed}) => [
            styles.iconBtn,
            {
              backgroundColor:
                theme.mode === 'dark'
                  ? 'rgba(255,255,255,0.08)'
                  : 'rgba(0,0,0,0.04)',
            },
            pressed && {opacity: 0.6},
          ]}
          hitSlop={8}>
          <ArrowLeft size={20} color={theme.colors.text} />
        </Pressable>

        {/* Auto-save status indicator */}
        <View style={styles.statusPill}>
          {saveStatus === 'Saved' ? (
            <Check size={12} color="#10B981" strokeWidth={2.8} />
          ) : (
            <Clock size={12} color="#F59E0B" strokeWidth={2.4} />
          )}
          <LocalizedText
            style={[
              styles.statusText,
              {color: saveStatus === 'Saved' ? '#10B981' : '#F59E0B'},
            ]}>
            {saveStatus}
          </LocalizedText>
        </View>

        {/* View mode toggle: Edit vs Preview */}
        <View style={styles.modeToggleWrap}>
          <Pressable
            onPress={() => setViewMode('edit')}
            style={[
              styles.modeToggleBtn,
              viewMode === 'edit' && {
                backgroundColor: theme.colors.primary,
              },
            ]}>
            <PenLine
              size={13}
              color={viewMode === 'edit' ? '#FFFFFF' : theme.colors.textSecondary}
              strokeWidth={2.4}
            />
          </Pressable>

          <Pressable
            onPress={() => setViewMode('preview')}
            style={[
              styles.modeToggleBtn,
              viewMode === 'preview' && {
                backgroundColor: theme.colors.primary,
              },
            ]}>
            <Eye
              size={14}
              color={viewMode === 'preview' ? '#FFFFFF' : theme.colors.textSecondary}
              strokeWidth={2.4}
            />
          </Pressable>
        </View>

        {/* Action icons right */}
        <View style={styles.headerRightActions}>
          {/* Palette Toggle */}
          <Pressable
            onPress={() => setShowColorBar(s => !s)}
            style={({pressed}) => [
              styles.iconBtn,
              showColorBar && {
                backgroundColor: theme.colors.primary + '20',
              },
              pressed && {opacity: 0.6},
            ]}
            hitSlop={6}>
            <Palette
              size={17}
              color={
                showColorBar ? theme.colors.primary : theme.colors.textSecondary
              }
            />
          </Pressable>

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
              size={17}
              color={pinned ? '#F59E0B' : theme.colors.textSecondary}
              fill={pinned ? '#F59E0B' : 'none'}
            />
          </Pressable>

          {/* Share */}
          <Pressable
            onPress={handleShare}
            style={({pressed}) => [styles.iconBtn, pressed && {opacity: 0.6}]}
            hitSlop={6}>
            <Share2 size={17} color={theme.colors.textSecondary} />
          </Pressable>

          {/* Delete */}
          <Pressable
            onPress={handleDelete}
            style={({pressed}) => [styles.iconBtn, pressed && {opacity: 0.6}]}
            hitSlop={6}>
            <Trash2 size={17} color="#EF4444" />
          </Pressable>
        </View>
      </View>

      {/* ----------------- QUICK COLOR BAR ----------------- */}
      {showColorBar && (
        <View
          style={[
            styles.colorBarContainer,
            {
              backgroundColor:
                theme.mode === 'dark'
                  ? 'rgba(15, 23, 42, 0.95)'
                  : 'rgba(255, 255, 255, 0.97)',
              borderBottomColor:
                theme.mode === 'dark'
                  ? 'rgba(255,255,255,0.08)'
                  : 'rgba(0,0,0,0.06)',
            },
          ]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.colorBarScroll}>
            {NOTE_PALETTES.map(p => {
              const isSelected = colorId === p.id;
              const circleBg =
                p.id === 'default'
                  ? theme.colors.surface
                  : theme.mode === 'dark'
                  ? p.dark
                  : p.light;

              return (
                <Pressable
                  key={p.id}
                  onPress={() => handleSelectColor(p.id)}
                  style={[
                    styles.colorCircle,
                    {
                      backgroundColor: circleBg,
                      borderColor: isSelected
                        ? theme.colors.primary
                        : theme.colors.border,
                      borderWidth: isSelected ? 2.5 : 1.5,
                      transform: [{scale: isSelected ? 1.12 : 1}],
                    },
                  ]}>
                  {isSelected && (
                    <Check
                      size={13}
                      color={p.accent || theme.colors.primary}
                      strokeWidth={3}
                    />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* ----------------- EDITOR / PREVIEW CONTENT ----------------- */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}>
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={[
            styles.scrollContent,
            {paddingBottom: insets.bottom + 120},
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {viewMode === 'edit' ? (
            <>
              {/* Title Input */}
              <LocalizedTextInput
                value={title}
                onChangeText={handleTitleChange}
                placeholder="Note Title"
                placeholderTextColor={theme.colors.textLight + '75'}
                style={[styles.titleInput, {color: theme.colors.text}]}
                maxLength={120}
                returnKeyType="next"
              />

              {/* Body Multiline Input with Selection tracking */}
              <LocalizedTextInput
                ref={contentInputRef}
                value={content}
                onChangeText={handleContentChange}
                onSelectionChange={e => setSelection(e.nativeEvent.selection)}
                placeholder="Start typing notes, ideas, lists... Use the toolbar below to bold, heading, bullets, checklist!"
                placeholderTextColor={theme.colors.textLight + '65'}
                style={[styles.contentInput, {color: theme.colors.text}]}
                multiline
                textAlignVertical="top"
                scrollEnabled={false}
                autoFocus={isNew}
              />
            </>
          ) : (
            /* PREVIEW MODE */
            <View style={styles.previewContainer}>
              <LocalizedText
                style={[styles.previewTitle, {color: theme.colors.text}]}>
                {title.trim() || 'Untitled Note'}
              </LocalizedText>

              <View style={styles.previewContent}>
                {renderMarkdownContent(
                  content,
                  styles,
                  theme,
                  handleTogglePreviewTask,
                )}
              </View>
            </View>
          )}
        </ScrollView>

        {/* ----------------- RICH FORMATTING TOOLBAR (IN EDIT MODE) ----------------- */}
        {viewMode === 'edit' && (
          <View
            style={[
              styles.formattingToolbar,
              {
                backgroundColor:
                  theme.mode === 'dark'
                    ? 'rgba(15, 23, 42, 0.96)'
                    : 'rgba(255, 255, 255, 0.98)',
                borderTopColor:
                  theme.mode === 'dark'
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(0,0,0,0.06)',
              },
            ]}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.formattingScroll}>
              {/* Bold */}
              <Pressable
                onPress={() => applyFormatting('bold')}
                style={({pressed}) => [
                  styles.toolBtn,
                  pressed && {opacity: 0.6},
                ]}>
                <Bold size={15} color={theme.colors.text} strokeWidth={2.6} />
              </Pressable>

              {/* Italic */}
              <Pressable
                onPress={() => applyFormatting('italic')}
                style={({pressed}) => [
                  styles.toolBtn,
                  pressed && {opacity: 0.6},
                ]}>
                <Italic size={15} color={theme.colors.text} strokeWidth={2.4} />
              </Pressable>

              {/* Heading */}
              <Pressable
                onPress={() => applyFormatting('heading')}
                style={({pressed}) => [
                  styles.toolBtn,
                  pressed && {opacity: 0.6},
                ]}>
                <Heading size={16} color={theme.colors.text} strokeWidth={2.4} />
              </Pressable>

              {/* Bullet List */}
              <Pressable
                onPress={() => applyFormatting('bullet')}
                style={({pressed}) => [
                  styles.toolBtn,
                  pressed && {opacity: 0.6},
                ]}>
                <List size={16} color={theme.colors.text} strokeWidth={2.4} />
              </Pressable>

              {/* Checklist */}
              <Pressable
                onPress={() => applyFormatting('checklist')}
                style={({pressed}) => [
                  styles.toolBtn,
                  pressed && {opacity: 0.6},
                ]}>
                <ListTodo
                  size={16}
                  color={theme.colors.text}
                  strokeWidth={2.4}
                />
              </Pressable>

              {/* Quote */}
              <Pressable
                onPress={() => applyFormatting('quote')}
                style={({pressed}) => [
                  styles.toolBtn,
                  pressed && {opacity: 0.6},
                ]}>
                <Quote size={15} color={theme.colors.text} strokeWidth={2.4} />
              </Pressable>

              {/* Code */}
              <Pressable
                onPress={() => applyFormatting('code')}
                style={({pressed}) => [
                  styles.toolBtn,
                  pressed && {opacity: 0.6},
                ]}>
                <Code size={15} color={theme.colors.text} strokeWidth={2.4} />
              </Pressable>

              {/* Strikethrough */}
              <Pressable
                onPress={() => applyFormatting('strike')}
                style={({pressed}) => [
                  styles.toolBtn,
                  pressed && {opacity: 0.6},
                ]}>
                <Strikethrough
                  size={15}
                  color={theme.colors.text}
                  strokeWidth={2.4}
                />
              </Pressable>

              {/* Divider */}
              <Pressable
                onPress={() => applyFormatting('divider')}
                style={({pressed}) => [
                  styles.toolBtn,
                  pressed && {opacity: 0.6},
                ]}>
                <Minus size={15} color={theme.colors.text} strokeWidth={2.6} />
              </Pressable>
            </ScrollView>
          </View>
        )}

        {/* ----------------- BOTTOM STATS BAR ----------------- */}
        <View
          style={[
            styles.footerBar,
            {
              backgroundColor:
                theme.mode === 'dark'
                  ? 'rgba(15,23,42,0.92)'
                  : 'rgba(255,255,255,0.95)',
              borderTopColor:
                theme.mode === 'dark'
                  ? 'rgba(255,255,255,0.08)'
                  : 'rgba(0,0,0,0.06)',
              paddingBottom: Math.max(insets.bottom, 8),
            },
          ]}>
          <View style={styles.footerStatItem}>
            <FileText size={12} color={theme.colors.textLight} />
            <LocalizedText
              style={[styles.footerStatText, {color: theme.colors.textLight}]}>
              {wordCount} {wordCount === 1 ? 'word' : 'words'}
            </LocalizedText>
          </View>

          <View style={styles.footerDot} />

          <LocalizedText
            style={[styles.footerStatText, {color: theme.colors.textLight}]}>
            {charCount} chars
          </LocalizedText>

          <View style={{flex: 1}} />

          <LocalizedText
            style={[
              styles.footerNoteAutoText,
              {color: theme.colors.primary},
            ]}>
            Auto-saved
          </LocalizedText>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* --------------------------- MARKDOWN PREVIEW RENDERER --------------------------- */

function renderMarkdownContent(content, styles, theme, onToggleTask) {
  if (!content || !content.trim()) {
    return (
      <LocalizedText style={[styles.mdEmpty, {color: theme.colors.textLight}]}>
        Empty note. Tap "Edit" to add content.
      </LocalizedText>
    );
  }

  const lines = content.split('\n');

  return lines.map((line, idx) => {
    const trimmed = line.trim();

    // Divider
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      return (
        <View
          key={idx}
          style={[styles.mdDivider, {backgroundColor: theme.colors.border}]}
        />
      );
    }

    // Headings
    if (line.startsWith('# ')) {
      return (
        <View key={idx} style={styles.mdHeadingWrap}>
          {renderFormattedInline(
            line.slice(2),
            [styles.mdH1, {color: theme.colors.text}],
            `h1-${idx}`,
          )}
        </View>
      );
    }
    if (line.startsWith('## ')) {
      return (
        <View key={idx} style={styles.mdHeadingWrap}>
          {renderFormattedInline(
            line.slice(3),
            [styles.mdH2, {color: theme.colors.text}],
            `h2-${idx}`,
          )}
        </View>
      );
    }
    if (line.startsWith('### ')) {
      return (
        <View key={idx} style={styles.mdHeadingWrap}>
          {renderFormattedInline(
            line.slice(4),
            [styles.mdH3, {color: theme.colors.text}],
            `h3-${idx}`,
          )}
        </View>
      );
    }

    // Quote
    if (line.startsWith('> ')) {
      return (
        <View
          key={idx}
          style={[
            styles.mdQuote,
            {
              borderLeftColor: theme.colors.primary,
              backgroundColor:
                theme.mode === 'dark'
                  ? 'rgba(255,255,255,0.03)'
                  : 'rgba(0,0,0,0.02)',
            },
          ]}>
          {renderFormattedInline(
            line.slice(2),
            [styles.mdQuoteText, {color: theme.colors.textSecondary}],
            `q-${idx}`,
          )}
        </View>
      );
    }

    // Interactive Checklist
    const isCheckedTask = line.startsWith('[x] ') || line.startsWith('[X] ');
    const isUncheckedTask = line.startsWith('[ ] ');
    if (isCheckedTask || isUncheckedTask) {
      const taskText = line.slice(4);
      return (
        <Pressable
          key={idx}
          onPress={() => onToggleTask(idx)}
          style={styles.mdTaskRow}
          hitSlop={6}>
          <View
            style={[
              styles.mdTaskCheck,
              {
                borderColor: isCheckedTask
                  ? theme.colors.primary
                  : theme.colors.border,
                backgroundColor: isCheckedTask
                  ? theme.colors.primary
                  : 'transparent',
              },
            ]}>
            {isCheckedTask && (
              <Check size={11} color="#FFFFFF" strokeWidth={3} />
            )}
          </View>
          {renderFormattedInline(
            taskText,
            [
              styles.mdTaskText,
              {
                color: isCheckedTask
                  ? theme.colors.textLight
                  : theme.colors.text,
                textDecorationLine: isCheckedTask ? 'line-through' : 'none',
              },
            ],
            `task-${idx}`,
          )}
        </Pressable>
      );
    }

    // Bullet List
    if (
      line.startsWith('• ') ||
      line.startsWith('- ') ||
      line.startsWith('* ')
    ) {
      const bulletText = line.slice(2);
      return (
        <View key={idx} style={styles.mdBulletRow}>
          <View
            style={[styles.mdBulletDot, {backgroundColor: theme.colors.primary}]}
          />
          {renderFormattedInline(
            bulletText,
            [styles.mdBody, {color: theme.colors.text}],
            `b-${idx}`,
          )}
        </View>
      );
    }

    // Empty line
    if (!trimmed) {
      return <View key={idx} style={{height: 10}} />;
    }

    // Regular line
    return (
      <View key={idx} style={styles.mdLineWrap}>
        {renderFormattedInline(
          line,
          [styles.mdBody, {color: theme.colors.text}],
          `line-${idx}`,
        )}
      </View>
    );
  });
}

/* --------------------------- STYLES --------------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    borderBottomWidth: 1,
  },
  iconBtn: {
    width: 34,
    height: 34,
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
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  statusText: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  modeToggleWrap: {
    flexDirection: 'row',
    borderRadius: 9,
    padding: 2,
    backgroundColor: 'rgba(120, 120, 128, 0.12)',
  },
  modeToggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 7,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  /* Quick Color Bar */
  colorBarContainer: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  colorBarScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  colorCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Editor Inputs */
  keyboardView: {
    flex: 1,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  titleInput: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
    padding: 0,
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  contentInput: {
    fontSize: 15.5,
    lineHeight: 24,
    padding: 0,
    minHeight: 240,
    fontWeight: '400',
  },

  /* Formatting Toolbar */
  formattingToolbar: {
    borderTopWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  formattingScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  toolBtn: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(120, 120, 128, 0.08)',
  },

  /* Preview Styles */
  previewContainer: {
    paddingTop: 4,
  },
  previewTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.4,
    marginBottom: 16,
  },
  previewContent: {
    gap: 4,
  },
  mdEmpty: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 20,
  },
  mdHeadingWrap: {
    marginTop: 8,
    marginBottom: 4,
  },
  mdH1: {
    fontSize: 21,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  mdH2: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  mdH3: {
    fontSize: 15,
    fontWeight: '700',
  },
  mdBody: {
    fontSize: 15,
    lineHeight: 23,
  },
  mdLineWrap: {
    marginBottom: 3,
  },
  mdDivider: {
    height: 1.5,
    marginVertical: 10,
    borderRadius: 1,
  },
  mdQuote: {
    borderLeftWidth: 3,
    paddingLeft: 10,
    paddingVertical: 6,
    borderRadius: 4,
    marginVertical: 4,
  },
  mdQuoteText: {
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  mdTaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingVertical: 3,
  },
  mdTaskCheck: {
    width: 17,
    height: 17,
    borderRadius: 5,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mdTaskText: {
    fontSize: 14.5,
    lineHeight: 21,
    flex: 1,
  },
  mdBulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingVertical: 2,
  },
  mdBulletDot: {
    width: 5.5,
    height: 5.5,
    borderRadius: 3,
  },

  /* Footer */
  footerBar: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderTopWidth: 1,
  },
  footerStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerStatText: {
    fontSize: 11,
    fontWeight: '600',
  },
  footerDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#94A3B8',
    marginHorizontal: 8,
  },
  footerNoteAutoText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
