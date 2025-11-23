import React, { useMemo } from 'react';
import type { Note } from '../types/Note';
import { NOTE_COLORS } from '../types/Note';

interface NoteListProps {
  notes: Note[];
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onChangeColor: (id: string, color: string) => void;
  onToggleArchive: (id: string) => void;
  searchQuery?: string;
  showArchived?: boolean;
}

const getTextColor = (bgColor: string): string => {
  // Convert hex to RGB
  const hex = bgColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return dark or light text color based on background
  return luminance > 0.5 ? '#1f2937' : '#f9fafb';
};

export const NoteList: React.FC<NoteListProps> = ({
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
    <div className="space-y-2">
      {filteredNotes.map((note) => {
        const textColor = getTextColor(note.color);
        return (
          <div
            key={note.id}
            className="card cursor-pointer hover:shadow-lg transition-shadow group"
            style={{
              backgroundColor: note.color,
              color: textColor,
              borderLeft: `4px solid ${textColor === '#1f2937' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.3)'}`,
            }}
            onClick={() => onEdit(note)}
          >
            <div className="card-body p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {note.pinned && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        style={{ color: textColor, opacity: 0.8 }}
                      >
                        <path d="M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z" />
                      </svg>
                    )}
                    {note.archived && (
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
                        style={{ color: textColor, opacity: 0.8 }}
                      >
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                      </svg>
                    )}
                    {note.title && (
                      <h3 className="font-semibold text-lg truncate" style={{ color: textColor }}>
                        {note.title}
                      </h3>
                    )}
                  </div>
                  
                  {note.content && (
                    <p 
                      className="text-sm mb-2 line-clamp-2" 
                      style={{ 
                        color: textColor,
                        opacity: textColor === '#1f2937' ? 0.85 : 0.9
                      }}
                    >
                      {note.content}
                    </p>
                  )}

                  {note.labels && note.labels.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {note.labels.map((label, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-1 rounded"
                          style={{
                            backgroundColor: textColor === '#1f2937' 
                              ? 'rgba(0,0,0,0.1)' 
                              : 'rgba(255,255,255,0.2)',
                            color: textColor,
                          }}
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="text-xs opacity-70" style={{ color: textColor }}>
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </div>
                </div>

                <div 
                  className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Color picker */}
                  <div className="dropdown dropdown-end">
                    <label tabIndex={0} className="btn btn-ghost btn-xs btn-circle">
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
                        style={{ color: textColor }}
                      >
                        <circle cx="13.5" cy="6.5" r=".5"></circle>
                        <circle cx="17.5" cy="10.5" r=".5"></circle>
                        <circle cx="8.5" cy="7.5" r=".5"></circle>
                        <circle cx="6.5" cy="12.5" r=".5"></circle>
                        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"></path>
                      </svg>
                    </label>
                    <ul
                      tabIndex={0}
                      className="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-box z-[20] grid grid-cols-6 gap-1"
                      style={{ minWidth: '200px' }}
                    >
                      {NOTE_COLORS.map((color) => (
                        <li key={color}>
                          <button
                            className="w-8 h-8 rounded border-2 border-base-content/20 hover:border-base-content/40 transition-colors"
                            style={{ backgroundColor: color }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onChangeColor(note.id, color);
                            }}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Menu */}
                  <div className="dropdown dropdown-end">
                    <label tabIndex={0} className="btn btn-ghost btn-xs btn-circle">
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
                        style={{ color: textColor }}
                      >
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="12" cy="5" r="1"></circle>
                        <circle cx="12" cy="19" r="1"></circle>
                      </svg>
                    </label>
                    <ul
                      tabIndex={0}
                      className="dropdown-content menu p-1 shadow-lg bg-base-100 rounded-box z-[20] min-w-[160px] border border-base-300"
                    >
                      <li>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onTogglePin(note.id);
                          }}
                        >
                          {note.pinned ? (
                            <>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                              >
                                <path d="M16,12V4H17V2H7V4H8V12L6,14V16H11.2V22H12.8V16H18V14L16,12Z" />
                              </svg>
                              Unpin
                            </>
                          ) : (
                            <>
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
                                <line x1="12" y1="2" x2="12" y2="22"></line>
                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                              </svg>
                              Pin
                            </>
                          )}
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleArchive(note.id);
                          }}
                        >
                          {note.archived ? (
                            <>
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
                              Unarchive
                            </>
                          ) : (
                            <>
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
                              Archive
                            </>
                          )}
                        </button>
                      </li>
                      <li className="divider my-1"></li>
                      <li>
                        <button
                          className="text-error"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Are you sure you want to delete this note?')) {
                              onDelete(note.id);
                            }
                          }}
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
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                          Delete
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

