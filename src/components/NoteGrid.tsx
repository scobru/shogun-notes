import React, { useMemo } from 'react';
import type { Note } from '../types/Note';
import { NoteCard } from './NoteCard';

interface NoteGridProps {
  notes: Note[];
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onChangeColor: (id: string, color: string) => void;
  onToggleArchive: (id: string) => void;
  searchQuery?: string;
  showArchived?: boolean;
}

export const NoteGrid: React.FC<NoteGridProps> = ({
  notes,
  onEdit,
  onDelete,
  onTogglePin,
  onChangeColor,
  onToggleArchive,
  searchQuery = '',
  showArchived = false,
}) => {
  const filteredNotes = useMemo(() => {
    let filtered = notes;

    // Filter by archive status
    if (!showArchived) {
      filtered = filtered.filter(note => !note.archived);
    } else {
      filtered = filtered.filter(note => note.archived);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        note =>
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query) ||
          note.labels.some(label => label.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [notes, searchQuery, showArchived]);

  if (filteredNotes.length === 0) {
    return (
      <div className="text-center py-12 text-secondary">
        {showArchived ? 'No archived notes' : 'No notes yet. Create one to get started!'}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {filteredNotes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          onEdit={onEdit}
          onDelete={onDelete}
          onTogglePin={onTogglePin}
          onChangeColor={onChangeColor}
          onToggleArchive={onToggleArchive}
        />
      ))}
    </div>
  );
};

