import React, { useState } from 'react';
import { useShogun } from 'shogun-button-react';
import { useNotes } from '../hooks/useNotes';
import { NoteEditor } from './NoteEditor';
import { NoteGrid } from './NoteGrid';
import { NoteList } from './NoteList';
import { SearchBar } from './SearchBar';
import type { Note } from '../types/Note';

type ViewMode = 'grid' | 'list';

export const NotesApp: React.FC = () => {
  const { isLoggedIn } = useShogun();
  const {
    notes,
    loading,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    changeColor,
    toggleArchive,
  } = useNotes();

  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [showNewEditor, setShowNewEditor] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  if (!isLoggedIn) {
    return (
      <div className="card content-card p-8">
        <div className="card-body text-center">
          <h2 className="text-2xl font-bold mb-4">Welcome to Shogun Notes</h2>
          <p className="text-secondary mb-4">
            Please authenticate to start creating and managing your notes.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="loading loading-lg"></span>
        <p className="ml-4 text-secondary">Loading notes...</p>
      </div>
    );
  }

  const handleSave = (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingNote) {
      updateNote(editingNote.id, noteData);
      setEditingNote(null);
    } else {
      createNote(noteData);
      setShowNewEditor(false);
    }
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setShowNewEditor(false);
  };

  const handleDelete = (id: string) => {
    deleteNote(id);
    if (editingNote?.id === id) {
      setEditingNote(null);
    }
  };

  const handleNewNote = () => {
    setShowNewEditor(true);
    setEditingNote(null);
  };

  return (
    <div className="notes-app">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">Notes</h1>
        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="btn-group btn-group-sm">
            <button
              className={`btn ${viewMode === 'grid' ? 'btn-active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            </button>
            <button
              className={`btn ${viewMode === 'list' ? 'btn-active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <button
            className={`btn btn-sm ${showArchived ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setShowArchived(!showArchived)}
          >
            {showArchived ? 'Show Active' : 'Show Archived'}
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleNewNote}
          >
            New Note
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
      />

      {/* Notes View */}
      {viewMode === 'grid' ? (
        <NoteGrid
          notes={notes}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onTogglePin={togglePin}
          onChangeColor={changeColor}
          onToggleArchive={toggleArchive}
          searchQuery={searchQuery}
          showArchived={showArchived}
        />
      ) : (
        <NoteList
          notes={notes}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onTogglePin={togglePin}
          onChangeColor={changeColor}
          onToggleArchive={toggleArchive}
          searchQuery={searchQuery}
          showArchived={showArchived}
        />
      )}

      {/* Note Editor */}
      {(editingNote || showNewEditor) && (
        <NoteEditor
          note={editingNote}
          onSave={handleSave}
          onClose={() => {
            setEditingNote(null);
            setShowNewEditor(false);
          }}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

