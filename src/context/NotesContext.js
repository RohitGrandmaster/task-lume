import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import {getItem, setItem} from '../storage/storage';

/* ============================================================ */
/*  STORAGE KEY                                                  */
/* ============================================================ */
const NOTES_STORAGE_KEY = '@todomaster/notes';

/* ============================================================ */
/*  HELPERS                                                      */
/* ============================================================ */
function createNoteId() {
  return `note-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function normalizeNote(note) {
  return {
    id: note?.id ?? createNoteId(),
    title: typeof note?.title === 'string' ? note.title : '',
    content: typeof note?.content === 'string' ? note.content : '',
    createdAt: note?.createdAt ?? Date.now(),
    updatedAt: note?.updatedAt ?? Date.now(),
    pinned: Boolean(note?.pinned),
    color: note?.color && note.color !== 'default' ? note.color : null,
  };
}

/* ============================================================ */
/*  CONTEXT                                                      */
/* ============================================================ */
const NotesContext = createContext(null);

export function NotesProvider({children}) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotes = useCallback(async () => {
    try {
      const saved = await getItem(NOTES_STORAGE_KEY, null);
      if (Array.isArray(saved)) {
        setNotes(saved.map(normalizeNote));
      } else {
        setNotes([]);
      }
    } catch (e) {
      console.log('[NotesContext] load error:', e);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  // Auto-persist whenever notes state changes
  useEffect(() => {
    if (!loading) {
      setItem(NOTES_STORAGE_KEY, notes).catch(() => {});
    }
  }, [notes, loading]);

  /* ---- CREATE — returns new note id ---- */
  const createNote = useCallback((initialValues = {}) => {
    const newNote = normalizeNote({
      id: createNoteId(),
      title: initialValues.title ?? '',
      content: initialValues.content ?? '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      pinned: false,
      color: null,
      ...initialValues,
    });
    setNotes(prev => [newNote, ...prev]);
    return newNote.id;
  }, []);

  /* ---- UPDATE (auto-save on every keystroke) ---- */
  const updateNote = useCallback((id, patch) => {
    setNotes(prev =>
      prev.map(n => {
        if (n.id !== id) return n;
        const updates =
          typeof patch === 'string' ? {content: patch} : (patch || {});
        // Normalize color: 'default' → null
        if (updates.color === 'default') {
          updates.color = null;
        }
        return {
          ...n,
          ...updates,
          updatedAt: Date.now(),
        };
      }),
    );
  }, []);

  /* ---- DELETE ---- */
  const deleteNote = useCallback(id => {
    setNotes(prev => prev.filter(n => n.id !== id));
  }, []);

  /* ---- TOGGLE PIN ---- */
  const togglePinNote = useCallback(id => {
    setNotes(prev =>
      prev.map(n => (n.id === id ? {...n, pinned: !n.pinned} : n)),
    );
  }, []);

  /* ---- SET COLOR TAG ---- */
  const setNoteColor = useCallback((id, color) => {
    const normalized = color === 'default' ? null : color;
    setNotes(prev =>
      prev.map(n => (n.id === id ? {...n, color: normalized} : n)),
    );
  }, []);

  /* ---- CLEAN UP UNTITLED EMPTY NOTES ON EXIT ---- */
  const cleanupEmptyNote = useCallback(id => {
    setNotes(prev =>
      prev.filter(n => {
        if (n.id !== id) return true;
        const hasTitle = (n.title || '').trim().length > 0;
        const hasContent = (n.content || '').trim().length > 0;
        return hasTitle || hasContent;
      }),
    );
  }, []);

  /* ---- GET BY ID ---- */
  const getNoteById = useCallback(
    id => notes.find(n => n.id === id) ?? null,
    [notes],
  );

  return (
    <NotesContext.Provider
      value={{
        notes,
        loading,
        loadNotes,
        createNote,
        updateNote,
        deleteNote,
        togglePinNote,
        setNoteColor,
        cleanupEmptyNote,
        getNoteById,
      }}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const ctx = useContext(NotesContext);
  if (!ctx) {
    throw new Error('useNotes must be used inside NotesProvider');
  }
  return ctx;
}

export default NotesContext;
