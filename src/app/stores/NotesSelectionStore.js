'use strict';

import {EventEmitter} from 'events';
import Immutable from 'immutable';
import ipc from 'ipc';

import Actions from '../Actions';
import Dispatcher from '../Dispatcher';
import NotesStore from './NotesStore';

/**
 * We use an OrderedSet to support the "multiple selection followed by
 * {next,previous}-note action"; in this case the "next" note is defined as the
 * note after the last note added to the set.
 */
let selection = Immutable.OrderedSet();

function change(changer) {
  const previousSelection = selection;
  selection = changer.call();
  if (selection !== previousSelection) {
    NotesSelectionStore.emit('change');
  }
}

function selectFirst() {
  const selection = selection.clear();
  return NotesStore.notes.size ? selection.add(0) : selection;
}

function selectLast() {
  const selection = selection.clear();
  if (NotesStore.notes.size) {
    return selection.add(NotesStore.notes.size - 1);
  } else {
    return selection;
  }
}

function selectNext() {
  const mostRecent = selection.last();
  if (mostRecent == null) {
    return selectFirst();
  } else {
    const maxSelectionIndex = NotesStore.notes.size - 1;
    if (mostRecent < maxSelectionIndex) {
      return selection.clear().add(mostRecent + 1);
    } else {
      return selection;
    }
  }
}

function selectPrevious() {
  const mostRecent = selection.last();
  if (mostRecent == null) {
    return selectLast();
  } else {
    if (mostRecent > 0) {
      return selection.clear().add(mostRecent - 1);
    } else {
      return selection;
    }
  }
}

Dispatcher.register(payload => {
  switch (payload.type) {
    case Actions.ALL_NOTES_SELECTED:
      // TODO: implement this; will need to be sure that we only get this
      // message when <NoteList> is focused;
      // perhaps we need a store for that too...
      break;
    case Actions.FIRST_NOTE_SELECTED:
      change(selectFirst);
      break;
    case Actions.LAST_NOTE_SELECTED:
      change(selectLast);
      break;
    case Actions.NEXT_NOTE_SELECTED:
      change(selectNext);
      break;
    case Actions.NOTE_DESELECTED:
      change(() => selection.remove(payload.index));
      break;
    case Actions.NOTE_SELECTED:
      change(() => {
        if (payload.exclusive) {
          selection = selection.clear();
        }
        return selection.add(payload.index);
      });
      break;
    case Actions.NOTE_RANGE_SELECTED:
      change(() => {
        const start = selection.last() || 0;
        const end = payload.index;
        const range = Immutable.Range(
          Math.min(start, end),
          Math.max(start, end) + 1
        );
        return selection.union(range);
      });
      break;
    case Actions.NOTES_LOADED:
      change(() => (
        // TODO: persist last selection across restarts
        NotesStore.notes.size ? selection.add(0) : selection
      ));
      break;
    case Actions.PREVIOUS_NOTE_SELECTED:
      change(selectPrevious);
      break;
  }
});

ipc.on('next', () => Actions.nextNote());
ipc.on('previous', () => Actions.previousNote());

const NotesSelectionStore = {
  get selection() {
    return selection;
  },
  ...EventEmitter.prototype,
};

export default NotesSelectionStore;
