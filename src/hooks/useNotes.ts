import { useState, useEffect, useCallback } from 'react';
import { useShogun } from 'shogun-button-react';
import type { Note } from '../types/Note';

export function useNotes() {
  const { isLoggedIn, sdk, userPub } = useShogun();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  // Load notes from GunDB
  useEffect(() => {
    if (!isLoggedIn || !sdk?.gun || !userPub) {
      setNotes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const gun = sdk.gun;
    const user = gun.user();
    const notesRef = user.get('notes');
    const notesMap: Record<string, Note> = {};

    // Listen for changes to notes
    const updateNotes = (noteData: any, key: string) => {
      if (!key) return;

      if (!noteData || noteData === null) {
        // Note deleted
        delete notesMap[key];
      } else {
        // Note added or updated
        notesMap[key] = {
          id: key,
          title: noteData.title || '',
          content: noteData.content || '',
          color: noteData.color || '#ffffff',
          pinned: noteData.pinned || false,
          labels: noteData.labels || [],
          createdAt: noteData.createdAt || Date.now(),
          updatedAt: noteData.updatedAt || Date.now(),
          archived: noteData.archived || false,
        };
      }

      // Convert map to array and sort
      const notesList = Object.values(notesMap);
      notesList.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return b.updatedAt - a.updatedAt;
      });

      setNotes(notesList);
      setLoading(false);
    };

    // Subscribe to changes
    notesRef.map().on(updateNotes);

    return () => {
      // Cleanup
      notesRef.map().off();
    };
  }, [isLoggedIn, sdk, userPub]);

  // Create a new note
  const createNote = useCallback((note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!isLoggedIn || !sdk?.gun || !userPub) return;

    const gun = sdk.gun;
    const user = gun.user();
    const notesRef = user.get('notes');
    
    const newNote: Note = {
      ...note,
      id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    notesRef.get(newNote.id).put(newNote);
  }, [isLoggedIn, sdk, userPub]);

  // Update an existing note
  const updateNote = useCallback((id: string, updates: Partial<Note>) => {
    if (!isLoggedIn || !sdk?.gun || !userPub) return;

    const gun = sdk.gun;
    const user = gun.user();
    const notesRef = user.get('notes');
    
    notesRef.get(id).once((currentNote: Note) => {
      if (currentNote) {
        const updatedNote = {
          ...currentNote,
          ...updates,
          updatedAt: Date.now(),
        };
        notesRef.get(id).put(updatedNote);
      }
    });
  }, [isLoggedIn, sdk, userPub]);

  // Delete a note
  const deleteNote = useCallback((id: string) => {
    if (!isLoggedIn || !sdk?.gun || !userPub) return;

    const gun = sdk.gun;
    const user = gun.user();
    const notesRef = user.get('notes');
    
    notesRef.get(id).put(null);
  }, [isLoggedIn, sdk, userPub]);

  // Toggle pin status
  const togglePin = useCallback((id: string) => {
    const note = notes.find(n => n.id === id);
    if (note) {
      updateNote(id, { pinned: !note.pinned });
    }
  }, [notes, updateNote]);

  // Change note color
  const changeColor = useCallback((id: string, color: string) => {
    updateNote(id, { color });
  }, [updateNote]);

  // Toggle archive status
  const toggleArchive = useCallback((id: string) => {
    const note = notes.find(n => n.id === id);
    if (note) {
      updateNote(id, { archived: !note.archived });
    }
  }, [notes, updateNote]);

  return {
    notes,
    loading,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    changeColor,
    toggleArchive,
  };
}

