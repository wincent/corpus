'use strict';

import {EventEmitter} from 'events';
import ipc from 'ipc';

import Actions from '../Actions';
import Dispatcher from '../Dispatcher';
import NotesStore from './NotesStore';

// TODO: persist this across restarts
// TODO: support null selection
let currentSelectionIndex = 0;

function incrementCurrentSelectionIndex() {
  const maxSelectionIndex = NotesStore.getNotes().length - 1;
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

Dispatcher.register(payload => {
  switch (payload.type) {
    case Actions.NEXT_NOTE_SELECTED:
      incrementCurrentSelectionIndex();
      break;
    case Actions.NOTE_SELECTED:
      break;
    case Actions.PREVIOUS_NOTE_SELECTED:
      decrementCurrentSelectionIndex();
      break;
  }
});

ipc.on('next', () => (
  Dispatcher.dispatch({type: Actions.NEXT_NOTE_SELECTED})
));

ipc.on('previous', () => (
  Dispatcher.dispatch({type: Actions.PREVIOUS_NOTE_SELECTED})
));

const NoteSelectionStore = Object.assign({
  getCurrentSelectionIndex() {
    return currentSelectionIndex;
  }
}, EventEmitter.prototype);

export default NoteSelectionStore;
