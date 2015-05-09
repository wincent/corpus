'use strict';

import {EventEmitter} from 'events';
import ipc from 'ipc';

import Actions from '../Actions';
import Dispatcher from '../Dispatcher';
import NotesStore from './NotesStore';

// TODO: persist this across restarts
let currentSelectionIndex = null;

function changeCurrentSelectionIndex(index) {
  if (index !== currentSelectionIndex) {
    currentSelectionIndex = index;
    NoteSelectionStore.emit('change');
  }
}

function incrementCurrentSelectionIndex() {
  const maxSelectionIndex = NotesStore.notes.size - 1;
  if (currentSelectionIndex < maxSelectionIndex) {
    currentSelectionIndex++;
    NoteSelectionStore.emit('change');
  }
}

function decrementCurrentSelectionIndex() {
  if (currentSelectionIndex) {
    currentSelectionIndex--;
    NoteSelectionStore.emit('change');
  }
}

function setIndex(newIndex) {
  if (newIndex !== currentSelectionIndex) {
    currentSelectionIndex = newIndex;
    NoteSelectionStore.emit('change');
  }
}

Dispatcher.register(payload => {
  switch (payload.type) {
    case Actions.FIRST_NOTE_SELECTED:
      setIndex(NotesStore.notes.size ? 0 : null);
      break;
    case Actions.LAST_NOTE_SELECTED:
      setIndex(NotesStore.notes.size ? NotesStore.notes.size - 1 : null);
      break;
    case Actions.NEXT_NOTE_SELECTED:
      incrementCurrentSelectionIndex();
      break;
    case Actions.NOTE_DESELECTED:
      currentSelectionIndex = null;
      NoteSelectionStore.emit('change');
      break;
    case Actions.NOTE_SELECTED:
      changeCurrentSelectionIndex(payload.index);
      break;
    case Actions.NOTES_LOADED:
      currentSelectionIndex = NotesStore.notes.size ? 0 : null;
      NoteSelectionStore.emit('change');
      break;
    case Actions.PREVIOUS_NOTE_SELECTED:
      decrementCurrentSelectionIndex();
      break;
  }
});

ipc.on('next', () => Actions.nextNote());
ipc.on('previous', () => Actions.previousNote());

const NoteSelectionStore = {
  get currentSelectionIndex() {
    return currentSelectionIndex;
  },
  ...EventEmitter.prototype,
};

export default NoteSelectionStore;
