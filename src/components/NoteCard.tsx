import React, { useState } from 'react';
import type { Note } from '../types/Note';
import { NOTE_COLORS } from '../types/Note';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onChangeColor: (id: string, color: string) => void;
  onToggleArchive: (id: string) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onEdit,
  onDelete,
  onTogglePin,
  onChangeColor,
  onToggleArchive,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleColorSelect = (color: string) => {
    onChangeColor(note.id, color);
    setShowColorPicker(false);
    setShowMenu(false);
  };

  const getTextColor = (bgColor: string) => {
    // Simple contrast check - for light backgrounds use dark text
    const isLight = bgColor === '#ffffff' || bgColor === '#fff475' || 
                    bgColor === '#ccff90' || bgColor === '#a7ffeb' || 
                    bgColor === '#cbf0f8' || bgColor === '#aecbfa' || 
                    bgColor === '#e8eaed';
    return isLight ? '#1f2937' : '#f9fafb';
  };

  return (
    <div
      className="note-card"
      style={{
        backgroundColor: note.color,
        color: getTextColor(note.color),
        borderRadius: '8px',
        padding: '16px',
        minHeight: '150px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        position: 'relative',
      }}
      onClick={(e) => {
        if (!showMenu && !showColorPicker) {
          onEdit(note);
        }
      }}
    >
      {note.pinned && (
        <div className="absolute top-2 right-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z" />
          </svg>
        </div>
      )}

      {note.title && (
        <h3
          className="font-semibold text-lg mb-2"
          style={{ color: getTextColor(note.color) }}
          onClick={(e) => e.stopPropagation()}
        >
          {note.title}
        </h3>
      )}

      <div
        className="flex-grow text-sm mb-2 whitespace-pre-wrap break-words"
        style={{ color: getTextColor(note.color) }}
        onClick={(e) => e.stopPropagation()}
      >
        {note.content}
      </div>

      {note.labels && note.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2" onClick={(e) => e.stopPropagation()}>
          {note.labels.map((label, idx) => (
            <span
              key={idx}
              className="text-xs px-2 py-1 rounded"
              style={{
                backgroundColor: getTextColor(note.color) === '#1f2937' 
                  ? 'rgba(0,0,0,0.1)' 
                  : 'rgba(255,255,255,0.2)',
                color: getTextColor(note.color),
              }}
            >
              {label}
            </span>
          ))}
        </div>
      )}

      <div
        className="flex justify-between items-center mt-auto pt-2 opacity-0 hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          {showColorPicker && (
            <div
              className="absolute bottom-full left-0 mb-2 p-2 bg-base-100 rounded-lg shadow-lg z-10 grid grid-cols-6 gap-1"
              style={{ minWidth: '200px' }}
            >
              {NOTE_COLORS.map((color) => (
                <button
                  key={color}
                  className="w-8 h-8 rounded border-2 border-base-content/20 hover:border-base-content/40 transition-colors"
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorSelect(color)}
                />
              ))}
            </div>
          )}
          <button
            className="p-1 rounded hover:bg-base-content/10"
            onClick={(e) => {
              e.stopPropagation();
              setShowColorPicker(!showColorPicker);
              setShowMenu(false);
            }}
            title="Change color"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
            </svg>
          </button>
        </div>

        <div className="relative">
          {showMenu && (
            <div
              className="absolute bottom-full right-0 mb-2 p-2 bg-base-100 rounded-lg shadow-lg z-10 min-w-[120px]"
            >
              <button
                className="w-full text-left px-3 py-2 hover:bg-base-200 rounded text-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePin(note.id);
                  setShowMenu(false);
                }}
              >
                {note.pinned ? 'Unpin' : 'Pin'}
              </button>
              <button
                className="w-full text-left px-3 py-2 hover:bg-base-200 rounded text-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleArchive(note.id);
                  setShowMenu(false);
                }}
              >
                {note.archived ? 'Unarchive' : 'Archive'}
              </button>
              <button
                className="w-full text-left px-3 py-2 hover:bg-base-200 rounded text-sm text-error"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(note.id);
                  setShowMenu(false);
                }}
              >
                Delete
              </button>
            </div>
          )}
          <button
            className="p-1 rounded hover:bg-base-content/10"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
              setShowColorPicker(false);
            }}
            title="More options"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
              <circle cx="5" cy="12" r="1" />
            </svg>
          </button>
        </div>
      </div>

      {(showMenu || showColorPicker) && (
        <div
          className="fixed inset-0 z-0"
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(false);
            setShowColorPicker(false);
          }}
        />
      )}
    </div>
  );
};

