import { useState, useEffect, useCallback } from 'react';
import { useShogun } from 'shogun-button-react';
import type { Note } from '../types/Note';

// Helper function to get user's SEA pair
const getUserPair = (user: any) => {
  // GunDB stores the user's key pair in user._.sea
  return user?._?.sea || null;
};

// Encrypt note data using user's private key
const encryptNote = async (noteData: any, user: any, SEA: any): Promise<string | null> => {
  try {
    const pair = getUserPair(user);
    if (!pair || !SEA || !pair.epriv) {
      console.error('Cannot encrypt: user pair or SEA not available', { hasPair: !!pair, hasSEA: !!SEA, hasEpriv: !!pair?.epriv });
      return null;
    }
    
    // Convert data to string if needed
    const dataString = typeof noteData === 'string' ? noteData : JSON.stringify(noteData);
    
    // Encrypt using user's private key (epriv)
    const encrypted = await SEA.encrypt(dataString, pair);
    
    // SEA.encrypt returns a string starting with "SEA" or an object
    // Convert to string if it's an object
    if (typeof encrypted === 'string') {
      return encrypted;
    } else if (encrypted && typeof encrypted === 'object') {
      return JSON.stringify(encrypted);
    }
    
    return null;
  } catch (error) {
    console.error('Error encrypting note:', error);
    return null;
  }
};

// Decrypt note data using user's private key
const decryptNote = async (encryptedData: string | any, user: any, SEA: any): Promise<any | null> => {
  try {
    const pair = getUserPair(user);
    if (!pair || !SEA || !pair.epriv) {
      console.error('Cannot decrypt: user pair or SEA not available');
      return null;
    }
    
    // Handle both string and object formats
    let dataToDecrypt = encryptedData;
    if (typeof encryptedData === 'string') {
      // If it's already a string starting with "SEA", use it directly
      if (!encryptedData.startsWith('SEA')) {
        // Try to parse as JSON in case it's a stringified object
        try {
          dataToDecrypt = JSON.parse(encryptedData);
        } catch (e) {
          // If parsing fails, use the string as-is
          dataToDecrypt = encryptedData;
        }
      }
    }
    
    // Decrypt using user's private key
    const decrypted = await SEA.decrypt(dataToDecrypt, pair);
    
    if (!decrypted) {
      return null;
    }
    
    // Try to parse as JSON if it's a string
    if (typeof decrypted === 'string') {
      try {
        return JSON.parse(decrypted);
      } catch (e) {
        return decrypted;
      }
    }
    
    return decrypted;
  } catch (error) {
    console.error('Error decrypting note:', error);
    return null;
  }
};

export function useNotes() {
  const { isLoggedIn, core, userPub } = useShogun();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  // Load notes from GunDB
  useEffect(() => {
    if (!isLoggedIn || !core?.gun || !userPub) {
      setNotes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const gun = core.gun;
    const user = gun.user();
    // Access SEA from gun instance (TypeScript cast needed)
    const SEA = (gun as any).SEA || (globalThis as any).Gun?.SEA || (globalThis as any).SEA;
    
    console.log('[useNotes] Loading notes...', { 
      hasGun: !!gun, 
      hasUser: !!user, 
      hasSEA: !!SEA,
      userIs: user.is 
    });
    
    // Ensure user is authenticated
    const userIs = user.is;
    if (!userIs) {
      console.log('[useNotes] User not authenticated, stopping load');
      setLoading(false);
      return;
    }
    
    // Notes are stored in user's private space: user.get('notes')
    // Path in GunDB: user().get('notes').get(noteId)
    // All notes are encrypted with user's private key (epriv) using SEA
    const notesRef = user.get('notes');
    console.log('[useNotes] Subscribing to notes changes');
    const notesMap: Record<string, Note> = {}; 
    let hasReceivedData = false;

    // Debounce function to limit updates
    let updateTimeout: NodeJS.Timeout | null = null;
    const pendingUpdates: Record<string, Note> = {};

    // Helper function to process decrypted note data
    const processNoteData = (key: string, noteData: any) => {
      console.log('[useNotes] Processing note data:', { key, hasTitle: !!noteData?.title });
      
      // Parse labels from JSON string if it's a string
      let labels: string[] = [];
      if (noteData?.labels) {
        if (typeof noteData.labels === 'string') {
          try {
            labels = JSON.parse(noteData.labels);
          } catch (e) {
            labels = [];
          }
        } else if (Array.isArray(noteData.labels)) {
          labels = noteData.labels;
        }
      }
      
      pendingUpdates[key] = {
        id: key,
        title: noteData?.title || '',
        content: noteData?.content || '',
        color: noteData?.color || '#ffffff',
        pinned: noteData?.pinned || false,
        labels: labels,
        createdAt: noteData?.createdAt || Date.now(),
        updatedAt: noteData?.updatedAt || Date.now(),
        archived: noteData?.archived || false,
      };
      
      // Trigger debounced update
      if (updateTimeout) {
        clearTimeout(updateTimeout);
      }

      updateTimeout = setTimeout(() => {
        // Merge pending updates into notesMap
        Object.keys(pendingUpdates).forEach(k => {
          notesMap[k] = pendingUpdates[k];
        });

        // Convert map to array and sort
        const notesList = Object.values(notesMap);
        notesList.sort((a, b) => {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          return b.updatedAt - a.updatedAt;
        });

        console.log('[useNotes] Setting notes:', notesList.length);
        setNotes(notesList);
        setLoading(false);
      }, 100);
    };

    // Listen for changes to notes
    const updateNotes = (noteData: any, key: string) => {
      if (!key) {
        // Empty key means no data, but we still want to stop loading
        if (!hasReceivedData) {
          hasReceivedData = true;
          setNotes([]);
          setLoading(false);
        }
        return;
      }

      hasReceivedData = true;

      // Store update in pending updates
      if (!noteData || noteData === null) {
        // Note deleted - update immediately for better UX
        delete pendingUpdates[key];
        delete notesMap[key];
        
        // Update state immediately (no debounce for deletions)
        const notesList = Object.values(notesMap);
        notesList.sort((a, b) => {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          return b.updatedAt - a.updatedAt;
        });
        
        // Clear any pending debounce
        if (updateTimeout) {
          clearTimeout(updateTimeout);
          updateTimeout = null;
        }
        
        console.log('[useNotes] Note deleted:', key, 'Total notes:', notesList.length);
        setNotes(notesList);
        setLoading(false);
        return;
      }

      // Check if note is encrypted
      // Encrypted notes are strings starting with "SEA" or objects with ct/iv/s
      const isEncrypted = (
        (typeof noteData === 'string' && (
          noteData.startsWith('SEA') || 
          noteData.startsWith('{"ct"') ||
          noteData.includes('"ct"')
        )) ||
        (typeof noteData === 'object' && noteData !== null && (
          'ct' in noteData || 'iv' in noteData
        ))
      );

      // Check if it's a valid unencrypted note object
      const isUnencryptedNote = typeof noteData === 'object' && noteData !== null && 
        (noteData.title !== undefined || noteData.content !== undefined || noteData.color !== undefined);

      if (isEncrypted && SEA) {
        // Decrypt the note asynchronously
        decryptNote(noteData, user, SEA).then((decrypted) => {
          if (decrypted) {
            processNoteData(key, decrypted);
          } else {
            // Decryption failed, try to process as unencrypted (backward compatibility)
            console.warn('Failed to decrypt note, trying unencrypted format:', key);
            if (isUnencryptedNote) {
              processNoteData(key, noteData);
            }
          }
        }).catch((error) => {
          console.error('Error decrypting note:', key, error);
          // Try to process as unencrypted (backward compatibility)
          if (isUnencryptedNote) {
            processNoteData(key, noteData);
          }
        });
      } else {
        // Note is not encrypted or SEA not available, process directly
        if (isUnencryptedNote) {
          processNoteData(key, noteData);
        } else {
          // Unknown format, log for debugging
          console.warn('Unknown note format:', key, typeof noteData, noteData);
        }
      }
    };

    // Subscribe to changes
    notesRef.map().on(updateNotes);
    
    console.log('[useNotes] Subscribed to notes, waiting for data...');

    // Immediate check: if there are no notes, stop loading faster
    // Use once() to check if there are any notes at all
    notesRef.map().once((data: any, key: string) => {
      // This will fire once when the initial data is loaded (even if empty)
      console.log('[useNotes] Initial data check:', { key, hasData: !!data, dataType: typeof data });
      
      // If we get an empty response (no key), it means there are no notes
      if (!key) {
        console.log('[useNotes] No notes found, stopping load');
        if (!hasReceivedData) {
          hasReceivedData = true;
          setNotes([]);
          setLoading(false);
        }
      } else {
        // We have at least one note key, mark that we've received data
        hasReceivedData = true;
        // Let the regular listener handle processing the note
      }
    });

    // Fallback timeout: if no data arrives in 3 seconds, assume empty
    // This handles cases where GunDB takes time to respond or notes are empty
    const timeoutId = setTimeout(() => {
      console.log('[useNotes] Timeout reached:', { 
        hasReceivedData, 
        pendingCount: Object.keys(pendingUpdates).length,
        notesMapCount: Object.keys(notesMap).length,
        loading
      });
      
      if (!hasReceivedData) {
        console.log('[useNotes] Timeout: No notes received, assuming empty');
        hasReceivedData = true;
        setNotes([]);
        setLoading(false);
      } else if (loading && Object.keys(pendingUpdates).length === 0 && Object.keys(notesMap).length === 0) {
        // We received data but no valid notes were processed
        console.log('[useNotes] Timeout: Received data but no valid notes found, stopping load');
        setNotes([]);
        setLoading(false);
      } else if (loading) {
        // Force stop loading if we have any notes
        console.log('[useNotes] Timeout: Force stopping load, have notes');
        setLoading(false);
      }
    }, 3000);

    return () => {
      // Cleanup
      console.log('[useNotes] Cleaning up notes listener');
      clearTimeout(timeoutId);
      if (updateTimeout) {
        clearTimeout(updateTimeout);
      }
      try {
        notesRef.map().off();
      } catch (e) {
        console.warn('[useNotes] Error unsubscribing:', e);
      }
    };
  }, [isLoggedIn, core, userPub]);

  // Create a new note
  const createNote = useCallback((note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Debug logging (disabled in production)
    // console.log('createNote called:', { 
    //   isLoggedIn, 
    //   hasCore: !!core, 
    //   hasGun: !!(core?.gun), 
    //   userPub,
    //   note 
    // });

    if (!core?.gun) {
      console.error('Cannot create note: GunDB instance not available', { core, hasGun: !!core?.gun });
      alert('Error: GunDB not available. Please refresh the page and try again.');
      return;
    }

    try {
      const gun = core.gun;
      const user = gun.user();
      // Access SEA from gun instance (TypeScript cast needed)
      const SEA = (gun as any).SEA || (globalThis as any).Gun?.SEA || (globalThis as any).SEA;
      
      // Helper function to actually create the note
      // Note: Saved in user's private space (user.get('notes'))
      // and encrypted with user's private key
      const doCreateNote = async (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
        const notesRef = user.get('notes');
        
        // Generate ID for the note
        const noteId = `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Prepare note data for GunDB
        // Don't include id in the object - GunDB uses it as the path key
        const noteForGunDB = {
          title: noteData.title || '',
          content: noteData.content || '',
          color: noteData.color || '#ffffff',
          pinned: noteData.pinned || false,
          labels: JSON.stringify(noteData.labels || []),
          archived: noteData.archived || false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        // Encrypt the note before saving
        const encrypted = await encryptNote(noteForGunDB, user, SEA);
        
        if (encrypted) {
          // Save encrypted note
          notesRef.get(noteId).put(encrypted);
        } else {
          // Fallback: save unencrypted if encryption fails
          console.warn('Encryption failed, saving unencrypted note');
          notesRef.get(noteId).put(noteForGunDB);
        }
      };

      // Check if user is authenticated
      const userIs = user.is;
      
      if (!userIs) {
        // Try waiting a bit for auth to propagate (async auth might still be completing)
        setTimeout(() => {
          const retryUserIs = user.is;
          if (retryUserIs) {
            doCreateNote(note);
          } else {
            alert('Error: You are not authenticated. Please ensure you are logged in and try again.');
          }
        }, 500);
        return;
      }
      
      // User is authenticated, create the note
      doCreateNote(note);
    } catch (error) {
      console.error('Error creating note:', error);
      alert('Error creating note: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }, [isLoggedIn, core, userPub]);

  // Update an existing note
  const updateNote = useCallback((id: string, updates: Partial<Note>) => {
    if (!core?.gun) {
      console.error('Cannot update note: GunDB instance not available');
      return;
    }

    try {
      const gun = core.gun;
      const user = gun.user();
      // Access SEA from gun instance (TypeScript cast needed)
      const SEA = (gun as any).SEA || (globalThis as any).Gun?.SEA || (globalThis as any).SEA;
      
      // Ensure user is authenticated
      if (!user.is) {
        console.error('User is not authenticated for update');
        return;
      }

      // Notes are in user's private space and encrypted
      const notesRef = user.get('notes');
      const noteRef = notesRef.get(id);
      
      // Get current note from state first (faster than GunDB read)
      const currentNote = notes.find(n => n.id === id);
      
      const doUpdate = async (updateData: any) => {
        // Encrypt the note before saving
        const encrypted = await encryptNote(updateData, user, SEA);
        
        if (encrypted) {
          // Save encrypted note
          noteRef.put(encrypted);
        } else {
          // Fallback: save unencrypted if encryption fails
          console.warn('Encryption failed, saving unencrypted note');
          noteRef.put(updateData);
        }
      };
      
      if (currentNote) {
        // Build update object with proper formatting for GunDB
        const updateData: any = {
          ...updates,
          updatedAt: Date.now(),
        };
        
        // Handle labels: convert array to JSON string if needed
        if (updates.labels !== undefined) {
          updateData.labels = JSON.stringify(updates.labels);
        } else if (currentNote.labels && currentNote.labels.length > 0) {
          updateData.labels = JSON.stringify(currentNote.labels);
        }
        
        // Preserve all existing fields that aren't being updated
        updateData.title = updates.title !== undefined ? updates.title : (currentNote.title || '');
        updateData.content = updates.content !== undefined ? updates.content : (currentNote.content || '');
        updateData.color = updates.color !== undefined ? updates.color : (currentNote.color || '#ffffff');
        updateData.pinned = updates.pinned !== undefined ? updates.pinned : (currentNote.pinned || false);
        updateData.archived = updates.archived !== undefined ? updates.archived : (currentNote.archived || false);
        updateData.createdAt = currentNote.createdAt || Date.now();
        
        // Remove id from update (GunDB uses path as key)
        delete updateData.id;
        
        doUpdate(updateData);
      } else {
        // Fallback: read from GunDB if not in state
        noteRef.once(async (noteData: any) => {
          if (noteData) {
            // Try to decrypt if encrypted
            let decryptedData = noteData;
            if (typeof noteData === 'string' && (noteData.startsWith('SEA') || noteData.includes('ct'))) {
              const decrypted = await decryptNote(noteData, user, SEA);
              if (decrypted) {
                decryptedData = decrypted;
              }
            }
            
            const updateData: any = {
              ...decryptedData,
              ...updates,
              updatedAt: Date.now(),
            };
            
            // Handle labels
            if (updates.labels !== undefined) {
              updateData.labels = JSON.stringify(updates.labels);
            } else if (updateData.labels && typeof updateData.labels !== 'string') {
              updateData.labels = JSON.stringify(updateData.labels);
            }
            
            delete updateData.id;
            delete updateData._;
            
            doUpdate(updateData);
          }
        });
      }
    } catch (error) {
      console.error('Error updating note:', error);
    }
  }, [isLoggedIn, core, userPub, notes]);

  // Delete a note
  const deleteNote = useCallback((id: string) => {
    if (!isLoggedIn || !core?.gun || !userPub) {
      console.warn('[useNotes] Cannot delete note: not logged in or GunDB not available');
      return;
    }

    console.log('[useNotes] Deleting note:', id);
    
    // Optimistically update UI immediately (before GunDB confirmation)
    setNotes((currentNotes) => {
      const filtered = currentNotes.filter(note => note.id !== id);
      console.log('[useNotes] Optimistically removed note, remaining:', filtered.length);
      return filtered;
    });

    try {
      const gun = core.gun;
      const user = gun.user();
      const notesRef = user.get('notes');
      
      // Delete from GunDB (this will trigger the listener which will also update state)
      notesRef.get(id).put(null);
      console.log('[useNotes] Note deletion sent to GunDB:', id);
    } catch (error) {
      console.error('[useNotes] Error deleting note:', error);
      // Revert optimistic update on error by reloading notes
      // The listener should handle this, but we can force a refresh if needed
    }
  }, [isLoggedIn, core, userPub]);

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

