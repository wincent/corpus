'use strict';

import {EventEmitter} from 'events';
import ipc from 'ipc';

import NotesStore from './NotesStore';

// TODO: persist this across restarts
// TODO: support null selection
let currentSelectionIndex = 0;

ipc.on('next', () => {
  const maxSelectionIndex = NotesStore.getNotes().length - 1;
  if (currentSelectionIndex < maxSelectionIndex) {
    currentSelectionIndex++;
    NoteSelectionStore.emit('change');
  }
});

ipc.on('previous', () => {
  if (currentSelectionIndex) {
    currentSelectionIndex--;
    NoteSelectionStore.emit('change');
  }
});

const NoteSelectionStore = Object.assign({
  getCurrentSelectionIndex() {
    return currentSelectionIndex;
  }
}, EventEmitter.prototype);

export default NoteSelectionStore;
