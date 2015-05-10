'use strict';

import {EventEmitter} from 'events';
import Immutable from 'immutable';
import ipc from 'ipc';

import Actions from '../Actions';
import Dispatcher from '../Dispatcher';
import NotesStore from './NotesStore';
import clamp from '../clamp';

/**
 * We use an OrderedSet to support the "multiple selection followed by
 * {next,previous}-note action"; in this case the "next" note is defined as the
 * note after the last note added to the set.
 */
let selection = Immutable.OrderedSet();

/**
 * We keep track of the total delta (how far we've moved up/down) when adjusting
 * the selection upwards or downwards. Changing direction (decrementing a
 * positive totalDelta, or incrementing a negative one) and "crossing" past 0
 * both represent a change of mode (from extending the selection in a particular
 * direction to reducing it).
 *
 * @see adjustSelection
 */
let totalDelta = 0;

function adjustSelection(delta) {
  const lastLocation = selection.last();
  if (lastLocation == null) {
    totalDelta = 0; // reset
    return delta ? selectFirst() : selectLast();
  } else {
    const initialLocation = lastLocation - totalDelta;
    const previousDelta = totalDelta;
    totalDelta = clamp(
      totalDelta + delta, // desired distance from where we started
      -initialLocation, // limit of upwards selection
      NotesStore.notes.size - initialLocation - 1 // limit of downwards selection
    );

    if (totalDelta < previousDelta) {
      // Moving upwards.
      if (totalDelta >= 0) {
        // Reducing downwards selection.
        return selection.remove(initialLocation + totalDelta + 1);
      } else {
        // Extending upwards selection.
        if (selection.has(lastLocation + delta)) {
          // Need to skip already-selected selection; recurse.
          return adjustSelection(delta - 1);
        } else {
          return selection.add(lastLocation + delta);
        }
      }
    } else if (totalDelta > previousDelta) {
      // We're moving downwards.
      if (totalDelta > 0) {
        // Extending downwards selection.
        if (selection.has(lastLocation + delta)) {
          // Need to skip already-selected selection; recurse.
          return adjustSelection(delta + 1);
        } else {
          return selection.add(lastLocation + delta);
        }
      } else {
        // Reducing upwards selection.
        return selection.remove(initialLocation + totalDelta - 1);
      }
    } else {
      return selection; // nothing to do
    }
  }
}

function change(action, changer) {
  if (
    action !== Actions.ADJUST_NOTE_SELECTION_DOWN &&
    action !== Actions.ADJUST_NOTE_SELECTION_UP
  ) {
    totalDelta = 0; // reset
  }
  const previousSelection = selection;
  selection = changer.call();
  if (selection !== previousSelection) {
    NotesSelectionStore.emit('change');
  }
}

function selectFirst() {
  selection = selection.clear();
  return NotesStore.notes.size ? selection.add(0) : selection;
}

function selectLast() {
  selection = selection.clear();
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
    case Actions.ALL_NOTES_DESELECTED:
      change(payload.type, () => selection.clear());
      break;
    case Actions.ALL_NOTES_SELECTED:
      // TODO: implement this; will need to be sure that we only get this
      // message when <NoteList> is focused;
      // perhaps we need a store for that too...
      break;
    case Actions.ADJUST_NOTE_SELECTION_DOWN:
      change(payload.type, () => adjustSelection(+1));
      break;
    case Actions.ADJUST_NOTE_SELECTION_UP:
      change(payload.type, () => adjustSelection(-1));
      break;
    case Actions.FIRST_NOTE_SELECTED:
      change(payload.type, selectFirst);
      break;
    case Actions.LAST_NOTE_SELECTED:
      change(payload.type, selectLast);
      break;
    case Actions.NEXT_NOTE_SELECTED:
      change(payload.type, selectNext);
      break;
    case Actions.NOTE_DESELECTED:
      change(payload.type, () => selection.remove(payload.index));
      break;
    case Actions.NOTE_SELECTED:
      change(payload.type, () => {
        if (payload.exclusive) {
          selection = selection.clear();
        }
        return selection.add(payload.index);
      });
      break;
    case Actions.NOTE_RANGE_SELECTED:
      change(payload.type, () => {
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
      change(payload.type, () => (
        // TODO: persist last selection across restarts
        NotesStore.notes.size ? selection.add(0) : selection
      ));
      break;
    case Actions.PREVIOUS_NOTE_SELECTED:
      change(payload.type, selectPrevious);
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
