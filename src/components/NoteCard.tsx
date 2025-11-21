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
    // Using a darker color for better contrast on light backgrounds
    const isLight = bgColor === '#ffffff' || bgColor === '#fff475' || 
                    bgColor === '#ccff90' || bgColor === '#a7ffeb' || 
                    bgColor === '#cbf0f8' || bgColor === '#aecbfa' || 
                    bgColor === '#e8eaed';
    // Use darker text for better readability on light backgrounds
    return isLight ? '#0f172a' : '#f9fafb';
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't open editor if clicking on buttons or their menus
    const target = e.target as HTMLElement;
    
    // Check if clicking directly on a button
    if (target.tagName === 'BUTTON') {
      return;
    }
    
    // Check if clicking inside a button
    const button = target.closest('button');
    if (button) {
      return;
    }
    
    // Check if clicking on color picker or menu (including their dropdowns)
    if (
      target.closest('.color-picker') ||
      target.closest('.note-menu') ||
      showMenu ||
      showColorPicker
    ) {
      return;
    }
    
    // Check if clicking on SVG icons (they might be inside buttons)
    if (target.tagName === 'svg' || target.closest('svg')) {
      const svgButton = target.closest('button');
      if (svgButton) {
        return;
      }
    }
    
    // Check if clicking on absolute positioned elements (like indicators)
    const absoluteElement = target.closest('[class*="absolute"]');
    if (absoluteElement) {
      // Only ignore if it's an interactive element
      if (absoluteElement.closest('button') || absoluteElement.onclick) {
        return;
      }
    }
    
    // Open editor - allow click on the card itself
    onEdit(note);
  };

  return (
    <div
      className="note-card group"
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
      onClick={handleCardClick}
    >
      {/* Pinned indicator */}
      {note.pinned && (
        <div className="absolute top-2 right-2" title="Pinned">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ color: getTextColor(note.color) }}
          >
            <path d="M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z" />
          </svg>
        </div>
      )}

      {/* Archived indicator */}
      {note.archived && (
        <div className="absolute top-2 left-2" title="Archived">
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
            style={{ color: getTextColor(note.color) }}
          >
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
        </div>
      )}

      {note.title && (
        <h3
          className="font-semibold text-lg mb-2 leading-tight"
          style={{ 
            color: getTextColor(note.color),
            opacity: getTextColor(note.color) === '#1f2937' ? 0.9 : 0.95
          }}
        >
          {note.title}
        </h3>
      )}

      <div
        className="flex-grow text-sm mb-2 whitespace-pre-wrap break-words leading-relaxed"
        style={{ 
          color: getTextColor(note.color),
          opacity: getTextColor(note.color) === '#1f2937' ? 0.85 : 0.9,
          lineHeight: '1.5'
        }}
      >
        {note.content}
      </div>

      {note.labels && note.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
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
        className="flex justify-between items-center mt-auto pt-2 opacity-0 group-hover:opacity-100 transition-opacity border-t pointer-events-none"
        style={{ 
          borderColor: getTextColor(note.color) === '#1f2937' 
            ? 'rgba(0,0,0,0.1)' 
            : 'rgba(255,255,255,0.2)'
        }}
      >
        <div className="flex items-center gap-2">
          {/* Archive button - always visible on hover */}
          <button
            className="p-1.5 rounded hover:bg-base-content/10 text-xs font-medium pointer-events-auto"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onToggleArchive(note.id);
            }}
            title={note.archived ? 'Unarchive' : 'Archive'}
            style={{ color: getTextColor(note.color) }}
          >
            {note.archived ? (
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
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            ) : (
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
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            )}
          </button>

          {/* Color picker */}
          <div className="relative color-picker pointer-events-auto">
            {showColorPicker && (
              <div
                className="absolute bottom-full left-0 mb-2 p-2 bg-base-100 rounded-lg shadow-lg z-[20] grid grid-cols-6 gap-1 border border-base-300 pointer-events-auto"
                style={{ minWidth: '200px' }}
              >
                {NOTE_COLORS.map((color) => (
                  <button
                    key={color}
                    className="w-8 h-8 rounded border-2 border-base-content/20 hover:border-base-content/40 transition-colors pointer-events-auto"
                    style={{ backgroundColor: color }}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleColorSelect(color);
                    }}
                  />
                ))}
              </div>
            )}
            <button
              className="p-1.5 rounded hover:bg-base-content/10 pointer-events-auto"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setShowColorPicker(!showColorPicker);
                setShowMenu(false);
              }}
              title="Change color"
              style={{ color: getTextColor(note.color) }}
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
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Menu button */}
        <div className="relative note-menu pointer-events-auto">
          {showMenu && (
            <div
              className="absolute bottom-full right-0 mb-2 p-1 bg-base-100 rounded-lg shadow-lg z-[20] min-w-[160px] border border-base-300 pointer-events-auto"
            >
              <button
                className="w-full text-left px-3 py-2 hover:bg-base-200 rounded text-sm flex items-center gap-2 pointer-events-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onTogglePin(note.id);
                  setShowMenu(false);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill={note.pinned ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z" />
                </svg>
                {note.pinned ? 'Unpin' : 'Pin'}
              </button>
              <button
                className="w-full text-left px-3 py-2 hover:bg-base-200 rounded text-sm flex items-center gap-2 pointer-events-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onToggleArchive(note.id);
                  setShowMenu(false);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
                {note.archived ? 'Unarchive' : 'Archive'}
              </button>
              <div className="border-t border-base-300 my-1"></div>
              <button
                className="w-full text-left px-3 py-2 hover:bg-base-200 rounded text-sm flex items-center gap-2 text-error pointer-events-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onDelete(note.id);
                  setShowMenu(false);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                Delete
              </button>
            </div>
          )}
          <button
            className="p-1.5 rounded hover:bg-base-content/10 pointer-events-auto"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setShowMenu(!showMenu);
              setShowColorPicker(false);
            }}
            title="More options"
            style={{ color: getTextColor(note.color) }}
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
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
              <circle cx="5" cy="12" r="1" />
            </svg>
          </button>
        </div>
      </div>

      {/* Overlay to close menus when clicking outside */}
      {(showMenu || showColorPicker) && (
        <div
          className="fixed inset-0 z-[10]"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowMenu(false);
            setShowColorPicker(false);
          }}
          style={{ backgroundColor: 'transparent' }}
        />
      )}
    </div>
  );
};


