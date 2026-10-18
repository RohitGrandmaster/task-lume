import React, {useMemo, useState} from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {DrawerActions} from '@react-navigation/native';
import {Menu, Search, ListTodo, StickyNote, ChevronRight, X} from 'lucide-react-native';
import {LocalizedText, LocalizedTextInput} from '../i18n/LocalizedText';
import useTheme from '../hooks/useTheme';
import useTodos from '../hooks/useTodos';
import {useNotes} from '../context/NotesContext';

function matchesQuery(value, query) {
  return String(value || '').toLocaleLowerCase().includes(query);
}

export default function UnifiedSearchScreen({navigation}) {
  const {theme} = useTheme();
  const {tasks = []} = useTodos();
  const {notes = []} = useNotes();
  const [query, setQuery] = useState('');
  const styles = useMemo(() => createStyles(theme), [theme]);
  const normalizedQuery = query.trim().toLocaleLowerCase();

  const results = useMemo(() => {
    if (!normalizedQuery) return {tasks: [], notes: []};
    return {
      tasks: tasks.filter(task =>
        task && !task.deleted &&
        (matchesQuery(task.title, normalizedQuery) ||
          matchesQuery(task.description, normalizedQuery) ||
          matchesQuery(task.category, normalizedQuery)),
      ).slice(0, 50),
      notes: notes.filter(note =>
        note &&
        (matchesQuery(note.title, normalizedQuery) ||
          matchesQuery(note.content, normalizedQuery)),
      ).slice(0, 50),
    };
  }, [tasks, notes, normalizedQuery]);

  function openDrawer() {
    navigation.dispatch(DrawerActions.openDrawer());
  }

  function openTask(task) {
    navigation.navigate('Task', {
      screen: 'TodoDetail',
      params: {todoId: task.id},
    });
  }

  function openNote(note) {
    navigation.navigate('Task', {
      screen: 'NoteEditor',
      params: {noteId: note.id},
    });
  }

  function renderEmpty() {
    if (!normalizedQuery) {
      return (
        <View style={styles.empty}>
          <Search size={28} color={theme.colors.textLight} />
          <LocalizedText style={styles.emptyTitle}>Search your workspace</LocalizedText>
          <LocalizedText style={styles.emptyBody}>Find tasks, descriptions, categories, and notes from one place.</LocalizedText>
        </View>
      );
    }
    if (!results.tasks.length && !results.notes.length) {
      return (
        <View style={styles.empty}>
          <Search size={28} color={theme.colors.textLight} />
          <LocalizedText style={styles.emptyTitle}>No results found</LocalizedText>
          <LocalizedText style={styles.emptyBody}>Try another title, keyword, or category.</LocalizedText>
        </View>
      );
    }
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.iconButton} onPress={openDrawer} accessibilityRole="button" accessibilityLabel="Open menu">
          <Menu size={19} color={theme.colors.text} />
        </Pressable>
        <View style={{flex: 1}}>
          <LocalizedText style={styles.title}>Search</LocalizedText>
          <LocalizedText style={styles.subtitle}>Tasks and notes together</LocalizedText>
        </View>
      </View>

      <View style={styles.searchBox}>
        <Search size={18} color={theme.colors.textSecondary} />
        <LocalizedTextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search tasks and notes..."
          placeholderTextColor={theme.colors.textLight}
          returnKeyType="search"
          autoCapitalize="none"
          style={styles.searchInput}
          accessibilityLabel="Search tasks and notes"
        />
        {query.length > 0 ? (
          <Pressable onPress={() => setQuery('')} hitSlop={8} accessibilityRole="button" accessibilityLabel="Clear search">
            <X size={17} color={theme.colors.textSecondary} />
          </Pressable>
        ) : null}
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {normalizedQuery && (results.tasks.length > 0 || results.notes.length > 0) ? (
          <LocalizedText style={styles.resultCount}>
            {results.tasks.length + results.notes.length} results · showing up to 50 per type
          </LocalizedText>
        ) : null}

        {results.tasks.length > 0 ? (
          <>
            <View style={styles.sectionHeader}>
              <ListTodo size={16} color={theme.colors.primary} />
              <LocalizedText style={styles.sectionTitle}>Tasks</LocalizedText>
              <LocalizedText style={styles.count}>{results.tasks.length}</LocalizedText>
            </View>
            {results.tasks.map(task => (
              <Pressable key={String(task.id)} onPress={() => openTask(task)} style={styles.resultCard}>
                <View style={styles.resultIcon}>
                  <ListTodo size={17} color={theme.colors.primary} />
                </View>
                <View style={styles.resultText}>
                  <LocalizedText translate={false} style={styles.resultTitle} numberOfLines={1}>{task.title || 'Untitled task'}</LocalizedText>
                  <LocalizedText translate={false} style={styles.resultBody} numberOfLines={2}>{task.description || task.category || ''}</LocalizedText>
                </View>
                <ChevronRight size={17} color={theme.colors.textLight} />
              </Pressable>
            ))}
          </>
        ) : null}

        {results.notes.length > 0 ? (
          <>
            <View style={[styles.sectionHeader, {marginTop: 18}]}>
              <StickyNote size={16} color="#F59E0B" />
              <LocalizedText style={styles.sectionTitle}>Notes</LocalizedText>
              <LocalizedText style={styles.count}>{results.notes.length}</LocalizedText>
            </View>
            {results.notes.map(note => (
              <Pressable key={String(note.id)} onPress={() => openNote(note)} style={styles.resultCard}>
                <View style={[styles.resultIcon, {backgroundColor: '#F59E0B18'}]}>
                  <StickyNote size={17} color="#F59E0B" />
                </View>
                <View style={styles.resultText}>
                  <LocalizedText translate={false} style={styles.resultTitle} numberOfLines={1}>
                    {note.title?.trim() || note.content?.trim()?.split('\n')[0] || 'Untitled Note'}
                  </LocalizedText>
                  <LocalizedText translate={false} style={styles.resultBody} numberOfLines={2}>{note.content || ''}</LocalizedText>
                </View>
                <ChevronRight size={17} color={theme.colors.textLight} />
              </Pressable>
            ))}
          </>
        ) : null}

        {renderEmpty()}
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    safeArea: {flex: 1, backgroundColor: theme.colors.background},
    header: {flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 14, gap: 12},
    iconButton: {width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border},
    title: {fontSize: 23, fontWeight: '900', color: theme.colors.text, letterSpacing: -0.5},
    subtitle: {fontSize: 12, marginTop: 2, color: theme.colors.textSecondary},
    searchBox: {flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 18, paddingHorizontal: 14, minHeight: 50, backgroundColor: theme.colors.surface, borderRadius: 15, borderWidth: 1, borderColor: theme.colors.border},
    searchInput: {flex: 1, minWidth: 0, paddingVertical: 12, color: theme.colors.text, fontSize: 14},
    content: {padding: 18, paddingBottom: 36},
    resultCount: {fontSize: 11, color: theme.colors.textLight, marginBottom: 12},
    sectionHeader: {flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10},
    sectionTitle: {fontSize: 14, fontWeight: '900', color: theme.colors.text, flex: 1},
    count: {fontSize: 11, fontWeight: '800', color: theme.colors.textSecondary},
    resultCard: {flexDirection: 'row', alignItems: 'center', gap: 11, padding: 13, borderRadius: 15, marginBottom: 9, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border},
    resultIcon: {width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primary + '18'},
    resultText: {flex: 1, minWidth: 0},
    resultTitle: {fontSize: 13, fontWeight: '800', color: theme.colors.text},
    resultBody: {fontSize: 11, marginTop: 4, color: theme.colors.textSecondary},
    empty: {alignItems: 'center', justifyContent: 'center', paddingHorizontal: 26, paddingVertical: 54},
    emptyTitle: {fontSize: 16, fontWeight: '900', color: theme.colors.text, marginTop: 14, textAlign: 'center'},
    emptyBody: {fontSize: 12, lineHeight: 19, color: theme.colors.textSecondary, marginTop: 7, textAlign: 'center'},
  });
}
