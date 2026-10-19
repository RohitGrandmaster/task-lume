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
  Keyboard,
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

function renderFormattedInline(text, baseStyle, textKey) {
  if (!text) return null;
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|~~[^~]+~~|`[^`]+`)/g;
  const parts = text.split(regex);

  if (parts.length === 1) {
    return (
      <LocalizedText key={textKey} style={baseStyle} translate={false}>
        {text}
      </LocalizedText>
    );
  }

  return (
    <LocalizedText key={textKey} style={baseStyle} translate={false}>
      {parts.map((part, index) => {
        if (!part) return null;
        if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
          return (
            <LocalizedText key={index} style={{fontWeight: '800'}} translate={false}>
              {part.slice(2, -2)}
            </LocalizedText>
          );
        }
        if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
          return (
            <LocalizedText key={index} style={{fontStyle: 'italic'}} translate={false}>
              {part.slice(1, -1)}
            </LocalizedText>
          );
        }
        if (part.startsWith('~~') && part.endsWith('~~') && part.length >= 4) {
          return (
            <LocalizedText key={index} style={{textDecorationLine: 'line-through'}} translate={false}>
              {part.slice(2, -2)}
            </LocalizedText>
          );
        }
        if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
          return (
            <LocalizedText
              key={index}
              translate={false}
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

export default function NoteEditorScreen({navigation, route}) {
  const {theme} = useTheme();
  const insets = useSafeAreaInsets();
  const {notes, createNote, updateNote, deleteNote, cleanupEmptyNote} = useNotes();

  const noteIdParam = route.params?.noteId;
  const isNew = route.params?.isNew === true;

  const initialNote = noteIdParam
    ? notes.find(n => n.id === noteIdParam)
    : null;

  const [activeId, setActiveId] = useState(noteIdParam || null);
  const [title, setTitle] = useState(initialNote?.title || '');
  const [content, setContent] = useState(initialNote?.content || '');
  const [pinned, setPinned] = useState(initialNote?.pinned || false);
  const [colorId, setColorId] = useState(initialNote?.color || 'default');
  const [saveStatus, setSaveStatus] = useState('Saved');
  const [showColorBar, setShowColorBar] = useState(false);
  const [viewMode, setViewMode] = useState('edit');
  const [selection, setSelection] = useState({start: 0, end: 0});
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const contentInputRef = useRef(null);
  const selectionRef = useRef({start: 0, end: 0});
  const saveTimeoutRef = useRef(null);
  const createdOnceRef = useRef(false);
  const isDirtyRef = useRef(false);
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

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true),
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false),
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (activeId || createdOnceRef.current) return;
    if (!isNew && noteIdParam) {
      if (initialNote) {
        setActiveId(initialNote.id);
        activeIdRef.current = initialNote.id;
      }
      return;
    }
    createdOnceRef.current = true;
    const newId = createNote({title: '', content: ''});
    setActiveId(newId);
    activeIdRef.current = newId;
  }, [activeId, isNew, noteIdParam, initialNote, createNote]);

  useEffect(() => {
    if (!noteIdParam || isDirtyRef.current) return;
    const found = notes.find(n => n.id === noteIdParam);
    if (!found) return;
    if (!activeId) {
      setActiveId(found.id);
      activeIdRef.current = found.id;
    }
    if (!titleRef.current && !contentRef.current) {
      setTitle(found.title || '');
      setContent(found.content || '');
      setPinned(!!found.pinned);
      setColorId(found.color || 'default');
    }
  }, [notes, noteIdParam, activeId]);

  const triggerAutoSave = useCallback(
    (newTitle, newContent, newPinned, newColor) => {
      const idToSave = activeIdRef.current;
      if (!idToSave) return;

      isDirtyRef.current = true;
      setSaveStatus('Saving...');
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      updateNote(idToSave, {
        title: newTitle,
        content: newContent,
        pinned: newPinned,
        color: newColor === 'default' ? null : newColor,
      });

      saveTimeoutRef.current = setTimeout(() => {
        setSaveStatus('Saved');
      }, 350);
    },
    [updateNote],
  );

  function handleTitleChange(text) {
    setTitle(text);
    triggerAutoSave(text, contentRef.current, pinnedRef.current, colorIdRef.current);
  }

  function handleContentChange(text) {
    setContent(text);
    contentRef.current = text;
    triggerAutoSave(titleRef.current, text, pinnedRef.current, colorIdRef.current);
  }

  function handleTogglePin() {
    haptic('light');
    const nextPinned = !pinned;
    setPinned(nextPinned);
    triggerAutoSave(titleRef.current, contentRef.current, nextPinned, colorIdRef.current);
  }

  function handleSelectColor(cId) {
    haptic('light');
    setColorId(cId);
    triggerAutoSave(titleRef.current, contentRef.current, pinnedRef.current, cId);
  }

  function handleSelectionChange(e) {
    const next = e.nativeEvent.selection;
    selectionRef.current = next;
    setSelection(next);
  }

  function applyFormatting(type) {
    haptic('light');
    contentInputRef.current?.focus?.();

    const text = contentRef.current ?? '';
    let {start, end} = selectionRef.current || {start: 0, end: 0};

    start = Math.max(0, Math.min(start, text.length));
    end = Math.max(0, Math.min(end, text.length));
    if (start > end) {
      const t = start;
      start = end;
      end = t;
    }

    const isSelected = start !== end;
    const selectedText = isSelected ? text.slice(start, end) : '';

    let newText = text;
    let newStart = start;
    let newEnd = end;

    const wrapInline = (before, after, placeholder) => {
      if (isSelected) {
        if (
          selectedText.startsWith(before) &&
          selectedText.endsWith(after) &&
          selectedText.length >= before.length + after.length
        ) {
          const unwrapped = selectedText.slice(
            before.length,
            selectedText.length - after.length,
          );
          newText = text.slice(0, start) + unwrapped + text.slice(end);
          newStart = start;
          newEnd = start + unwrapped.length;
        } else {
          const wrapped = before + selectedText + after;
          newText = text.slice(0, start) + wrapped + text.slice(end);
          newStart = start + before.length;
          newEnd = start + before.length + selectedText.length;
        }
      } else {
        const insert = before + placeholder + after;
        newText = text.slice(0, start) + insert + text.slice(start);
        newStart = start + before.length;
        newEnd = start + before.length + placeholder.length;
      }
    };

    const toggleLinePrefix = (rules, defaultAdd) => {
      const lineStart = text.lastIndexOf('\n', start - 1) + 1;
      const lineEndIdx = text.indexOf('\n', start);
      const lineEnd = lineEndIdx === -1 ? text.length : lineEndIdx;
      const currentLine = text.slice(lineStart, lineEnd);

      let modifiedLine = currentLine;
      let matched = false;
      for (const p of rules) {
        if (p.match && currentLine.startsWith(p.match)) {
          modifiedLine = p.strip(currentLine);
          matched = true;
          break;
        }
      }
      if (!matched) {
        modifiedLine = defaultAdd + currentLine;
      }

      newText =
        text.slice(0, lineStart) +
        modifiedLine +
        (lineEndIdx === -1 ? '' : text.slice(lineEndIdx));
      const delta = modifiedLine.length - currentLine.length;
      newStart = Math.max(lineStart, Math.min(start + delta, newText.length));
      newEnd = Math.max(lineStart, Math.min(end + delta, newText.length));
    };

    switch (type) {
      case 'bold':
        wrapInline('**', '**', 'bold');
        break;
      case 'italic':
        if (
          isSelected &&
          selectedText.startsWith('*') &&
          selectedText.endsWith('*') &&
          selectedText.length >= 2 &&
          !(selectedText.startsWith('**') && selectedText.endsWith('**'))
        ) {
          const unwrapped = selectedText.slice(1, -1);
          newText = text.slice(0, start) + unwrapped + text.slice(end);
          newStart = start;
          newEnd = start + unwrapped.length;
        } else if (isSelected) {
          const wrapped = '*' + selectedText + '*';
          newText = text.slice(0, start) + wrapped + text.slice(end);
          newStart = start + 1;
          newEnd = start + 1 + selectedText.length;
        } else {
          const insert = '*italic*';
          newText = text.slice(0, start) + insert + text.slice(start);
          newStart = start + 1;
          newEnd = start + 7;
        }
        break;
      case 'heading':
        toggleLinePrefix(
          [
            {match: '## ', strip: l => '# ' + l.slice(3)},
            {match: '# ', strip: l => l.slice(2)},
          ],
          '## ',
        );
        break;
      case 'bullet':
        toggleLinePrefix(
          [
            {match: '• ', strip: l => l.slice(2)},
            {match: '- ', strip: l => l.slice(2)},
          ],
          '• ',
        );
        break;
      case 'checklist':
        toggleLinePrefix(
          [
            {match: '[ ] ', strip: l => '[x] ' + l.slice(4)},
            {match: '[x] ', strip: l => l.slice(4)},
            {match: '[X] ', strip: l => l.slice(4)},
          ],
          '[ ] ',
        );
        break;
      case 'quote':
        toggleLinePrefix([{match: '> ', strip: l => l.slice(2)}], '> ');
        break;
      case 'code':
        wrapInline('`', '`', 'code');
        break;
      case 'strike':
        wrapInline('~~', '~~', 'strike');
        break;
      case 'divider': {
        const insert = '\n---\n';
        newText = text.slice(0, start) + insert + text.slice(start);
        newStart = start + insert.length;
        newEnd = newStart;
        break;
      }
      default:
        return;
    }

    contentRef.current = newText;
    selectionRef.current = {start: newStart, end: newEnd};
    setSelection({start: newStart, end: newEnd});
    handleContentChange(newText);

    requestAnimationFrame(() => {
      contentInputRef.current?.focus?.();
      contentInputRef.current?.setNativeProps?.({
        selection: {start: newStart, end: newEnd},
      });
    });
  }

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
        color: colorIdRef.current === 'default' ? null : colorIdRef.current,
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

  const wordCount = (content.trim() ? content.trim().split(/\s+/) : []).length;
  const charCount = content.length;

  const paletteObj = PALETTE_MAP[colorId] || NOTE_PALETTES[0];
  const customBg =
    theme.mode === 'dark' ? paletteObj?.dark : paletteObj?.light;
  const activeBg = customBg || theme.colors.background;

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: activeBg}]}
      edges={['top', 'left', 'right']}>
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
            onPress={() => {
              Keyboard.dismiss();
              setViewMode('preview');
            }}
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

        <View style={styles.headerRightActions}>
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

          <Pressable
            onPress={handleShare}
            style={({pressed}) => [styles.iconBtn, pressed && {opacity: 0.6}]}
            hitSlop={6}>
            <Share2 size={17} color={theme.colors.textSecondary} />
          </Pressable>

          <Pressable
            onPress={handleDelete}
            style={({pressed}) => [styles.iconBtn, pressed && {opacity: 0.6}]}
            hitSlop={6}>
            <Trash2 size={17} color="#EF4444" />
          </Pressable>
        </View>
      </View>

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

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={0}>
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={[
            styles.scrollContent,
            {paddingBottom: insets.bottom + (keyboardVisible ? 8 : 100)},
            viewMode === 'edit' && styles.scrollContentEdit,
          ]}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="none"
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled>
          {viewMode === 'edit' ? (
            <>
              <LocalizedTextInput
                value={title}
                onChangeText={handleTitleChange}
                placeholder="Note Title"
                placeholderTextColor={theme.colors.textLight + '75'}
                style={[styles.titleInput, {color: theme.colors.text}]}
                maxLength={120}
                returnKeyType="next"
                onSubmitEditing={() => contentInputRef.current?.focus?.()}
                blurOnSubmit={false}
              />

              <LocalizedTextInput
                ref={contentInputRef}
                value={content}
                onChangeText={handleContentChange}
                onSelectionChange={handleSelectionChange}
                placeholder="Start writing here… Select text then tap Bold / Italic, or tap toolbar to insert."
                placeholderTextColor={theme.colors.textLight + '65'}
                style={[styles.contentInput, {color: theme.colors.text}]}
                multiline
                textAlignVertical="top"
                scrollEnabled={false}
                autoFocus={isNew}
                underlineColorAndroid="transparent"
                autoCorrect={false}
              />
            </>
          ) : (
            <View style={styles.previewContainer}>
              <LocalizedText
                translate={false}
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

        {viewMode === 'edit' && (
          <View
            style={[
              styles.formattingToolbar,
              {
                backgroundColor:
                  theme.mode === 'dark'
                    ? 'rgba(15, 23, 42, 0.98)'
                    : 'rgba(255, 255, 255, 0.99)',
                borderTopColor:
                  theme.mode === 'dark'
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(0,0,0,0.06)',
              },
            ]}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.formattingScroll}
              keyboardShouldPersistTaps="always">
              <Pressable
                onPressIn={() => applyFormatting('bold')}
                style={({pressed}) => [
                  styles.toolBtn,
                  pressed && {opacity: 0.6},
                ]}>
                <Bold size={16} color={theme.colors.text} strokeWidth={2.4} />
              </Pressable>

              <Pressable
                onPressIn={() => applyFormatting('italic')}
                style={({pressed}) => [
                  styles.toolBtn,
                  pressed && {opacity: 0.6},
                ]}>
                <Italic size={16} color={theme.colors.text} strokeWidth={2.4} />
              </Pressable>

              <Pressable
                onPressIn={() => applyFormatting('heading')}
                style={({pressed}) => [
                  styles.toolBtn,
                  pressed && {opacity: 0.6},
                ]}>
                <Heading size={16} color={theme.colors.text} strokeWidth={2.4} />
              </Pressable>

              <Pressable
                onPressIn={() => applyFormatting('bullet')}
                style={({pressed}) => [
                  styles.toolBtn,
                  pressed && {opacity: 0.6},
                ]}>
                <List size={16} color={theme.colors.text} strokeWidth={2.4} />
              </Pressable>

              <Pressable
                onPressIn={() => applyFormatting('checklist')}
                style={({pressed}) => [
                  styles.toolBtn,
                  pressed && {opacity: 0.6},
                ]}>
                <ListTodo size={16} color={theme.colors.text} strokeWidth={2.4} />
              </Pressable>

              <Pressable
                onPressIn={() => applyFormatting('quote')}
                style={({pressed}) => [
                  styles.toolBtn,
                  pressed && {opacity: 0.6},
                ]}>
                <Quote size={15} color={theme.colors.text} strokeWidth={2.4} />
              </Pressable>

              <Pressable
                onPressIn={() => applyFormatting('code')}
                style={({pressed}) => [
                  styles.toolBtn,
                  pressed && {opacity: 0.6},
                ]}>
                <Code size={15} color={theme.colors.text} strokeWidth={2.4} />
              </Pressable>

              <Pressable
                onPressIn={() => applyFormatting('strike')}
                style={({pressed}) => [
                  styles.toolBtn,
                  pressed && {opacity: 0.6},
                ]}>
                <Strikethrough size={15} color={theme.colors.text} strokeWidth={2.4} />
              </Pressable>

              <Pressable
                onPressIn={() => applyFormatting('divider')}
                style={({pressed}) => [
                  styles.toolBtn,
                  pressed && {opacity: 0.6},
                ]}>
                <Minus size={15} color={theme.colors.text} strokeWidth={2.6} />
              </Pressable>
            </ScrollView>
          </View>
        )}

        {!keyboardVisible && (
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
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function renderMarkdownContent(content, styles, theme, onToggleTask) {
  if (!content || !content.trim()) {
    return (
      <LocalizedText style={[styles.mdEmpty, {color: theme.colors.textLight}]}>
        Empty note. Tap Edit to add content.
      </LocalizedText>
    );
  }

  const lines = content.split('\n');

  return lines.map((line, idx) => {
    const trimmed = line.trim();

    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      return (
        <View
          key={idx}
          style={[styles.mdDivider, {backgroundColor: theme.colors.border}]}
        />
      );
    }

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

    if (!trimmed) {
      return <View key={idx} style={{height: 10}} />;
    }

    return (
      <View key={idx} style={styles.mdLineWrap}>
        {renderFormattedInline(
          line,
          [styles.mdBody, {color: theme.colors.text}],
          `p-${idx}`,
        )}
      </View>
    );
  });
}

const styles = StyleSheet.create({
  container: {flex: 1},
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
    borderBottomWidth: 1,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinnedBtnActive: {backgroundColor: 'rgba(245, 158, 11, 0.15)'},
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  statusText: {fontSize: 11, fontWeight: '700'},
  modeToggleWrap: {
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'rgba(120, 120, 128, 0.12)',
    marginLeft: 2,
  },
  modeToggleBtn: {
    width: 32,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    gap: 2,
  },
  colorBarContainer: {borderBottomWidth: 1, paddingVertical: 10},
  colorBarScroll: {paddingHorizontal: 14, gap: 10},
  colorCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyboardView: {flex: 1},
  scrollArea: {flex: 1},
  scrollContent: {paddingHorizontal: 18, paddingTop: 16},
  scrollContentEdit: {flexGrow: 1},
  titleInput: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
    padding: 0,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  contentInput: {
    fontSize: 16,
    lineHeight: 24,
    padding: 0,
    minHeight: 280,
    fontWeight: '400',
    flexGrow: 1,
  },
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
  previewContainer: {paddingTop: 4},
  previewTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.4,
    marginBottom: 16,
  },
  previewContent: {gap: 4},
  mdEmpty: {fontSize: 14, fontStyle: 'italic', marginTop: 20},
  mdHeadingWrap: {marginTop: 8, marginBottom: 4},
  mdH1: {fontSize: 21, fontWeight: '900', letterSpacing: -0.3},
  mdH2: {fontSize: 17, fontWeight: '800', letterSpacing: -0.2},
  mdH3: {fontSize: 15, fontWeight: '700'},
  mdBody: {fontSize: 15, lineHeight: 23},
  mdLineWrap: {marginBottom: 3},
  mdDivider: {height: 1.5, marginVertical: 10, borderRadius: 1},
  mdQuote: {
    borderLeftWidth: 3,
    paddingLeft: 10,
    paddingVertical: 6,
    borderRadius: 4,
    marginVertical: 4,
  },
  mdQuoteText: {fontSize: 14, fontStyle: 'italic', lineHeight: 20},
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
  mdTaskText: {fontSize: 14.5, lineHeight: 21, flex: 1},
  mdBulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingVertical: 2,
  },
  mdBulletDot: {width: 5.5, height: 5.5, borderRadius: 3},
  footerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    gap: 6,
  },
  footerStatItem: {flexDirection: 'row', alignItems: 'center', gap: 4},
  footerStatText: {fontSize: 11, fontWeight: '600'},
  footerDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#94A3B8',
  },
  footerNoteAutoText: {fontSize: 11, fontWeight: '700'},
});
