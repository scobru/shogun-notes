import React, { useState, useEffect, useRef } from 'react';
import type { Note } from '../types/Note';
import { NOTE_COLORS } from '../types/Note';

interface NoteEditorProps {
  note?: Note | null;
  onSave: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  note,
  onSave,
  onClose,
  onDelete,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('#ffffff');
  const [labels, setLabels] = useState<string[]>([]);
  const [labelInput, setLabelInput] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setColor(note.color || '#ffffff');
      setLabels(note.labels || []);
    } else {
      setTitle('');
      setContent('');
      setColor('#ffffff');
      setLabels([]);
    }
    // Focus title input when editor opens
    setTimeout(() => {
      titleRef.current?.focus();
    }, 100);
  }, [note]);

  const handleSave = async () => {
    // If both title and content are empty, just close without saving
    if (!title.trim() && !content.trim()) {
      onClose();
      return;
    }

    setIsSaving(true);
    
    // Save the note
    onSave({
      title: title.trim(),
      content: content.trim(),
      color,
      pinned: note?.pinned || false,
      labels,
      archived: note?.archived || false,
    });

    // Small delay for visual feedback
    await new Promise(resolve => setTimeout(resolve, 200));

    setTitle('');
    setContent('');
    setColor('#ffffff');
    setLabels([]);
    setIsSaving(false);
    onClose();
  };

  const handleAddLabel = () => {
    const trimmed = labelInput.trim();
    if (trimmed && !labels.includes(trimmed)) {
      setLabels([...labels, trimmed]);
      setLabelInput('');
    }
  };

  const handleRemoveLabel = (labelToRemove: string) => {
    setLabels(labels.filter(l => l !== labelToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    }
    if (e.key === 'Escape') {
      handleSave();
    }
  };

  const getTextColor = (bgColor: string) => {
    const isLight = bgColor === '#ffffff' || bgColor === '#fff475' || 
                    bgColor === '#ccff90' || bgColor === '#a7ffeb' || 
                    bgColor === '#cbf0f8' || bgColor === '#aecbfa' || 
                    bgColor === '#e8eaed';
    return isLight ? '#1f2937' : '#f9fafb';
  };

  return (
    <div
      className="note-editor fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleSave();
        }
      }}
    >
      <div
        className="bg-base-100 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        style={{ backgroundColor: color }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 flex flex-col flex-grow overflow-hidden">
          <input
            ref={titleRef}
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            className="text-2xl font-semibold bg-transparent border-none outline-none mb-2"
            style={{ color: getTextColor(color) }}
          />

          <textarea
            ref={contentRef}
            placeholder="Take a note..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-grow resize-none bg-transparent border-none outline-none text-base mb-2"
            style={{ color: getTextColor(color) }}
          />

          {labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {labels.map((label, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2 py-1 rounded flex items-center gap-1"
                  style={{
                    backgroundColor: getTextColor(color) === '#1f2937' 
                      ? 'rgba(0,0,0,0.1)' 
                      : 'rgba(255,255,255,0.2)',
                    color: getTextColor(color),
                  }}
                >
                  {label}
                  <button
                    onClick={() => handleRemoveLabel(label)}
                    className="ml-1 hover:opacity-70"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-base-content/10">
            <input
              type="text"
              placeholder="Add label"
              value={labelInput}
              onChange={(e) => setLabelInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddLabel();
                }
              }}
              className="flex-1 px-2 py-1 text-sm bg-transparent border border-base-content/20 rounded"
              style={{ color: getTextColor(color) }}
            />
            <button
              onClick={handleAddLabel}
              className="px-3 py-1 text-sm rounded hover:bg-base-content/10"
              style={{ color: getTextColor(color) }}
            >
              Add
            </button>
          </div>

          <div className="flex items-center justify-between mt-4 pt-2 border-t border-base-content/10">
            <div className="relative">
              {showColorPicker && (
                <div
                  className="absolute bottom-full left-0 mb-2 p-2 bg-base-100 rounded-lg shadow-lg z-10 grid grid-cols-6 gap-1"
                  style={{ minWidth: '200px' }}
                >
                  {NOTE_COLORS.map((c) => (
                    <button
                      key={c}
                      className={`w-8 h-8 rounded border-2 transition-colors ${
                        c === color ? 'border-base-content' : 'border-base-content/20'
                      } hover:border-base-content/40`}
                      style={{ backgroundColor: c }}
                      onClick={() => {
                        setColor(c);
                        setShowColorPicker(false);
                      }}
                    />
                  ))}
                </div>
              )}
              <button
                className="p-2 rounded hover:bg-base-content/10"
                onClick={() => setShowColorPicker(!showColorPicker)}
                title="Change color"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ color: getTextColor(color) }}
                >
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {note && onDelete && (
                <button
                  className="px-4 py-2 text-sm rounded hover:bg-base-content/10 text-error"
                  onClick={() => {
                    if (note.id && onDelete) {
                      onDelete(note.id);
                    }
                    onClose();
                  }}
                >
                  Delete
                </button>
              )}
              <button
                className="px-4 py-2 text-sm rounded hover:bg-base-content/10 opacity-60"
                style={{ color: getTextColor(color) }}
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  color: getTextColor(color),
                  backgroundColor: getTextColor(color) === '#1f2937' 
                    ? 'rgba(0,0,0,0.15)' 
                    : 'rgba(255,255,255,0.25)',
                }}
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

