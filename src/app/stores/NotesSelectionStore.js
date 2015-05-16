'use strict';

import Immutable from 'immutable';

import Actions from '../Actions';
import Store from './Store';
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

let initialLocation = null;

function resetSelectionTracking() {
  totalDelta = 0;
  initialLocation = null;
}

function adjustSelection(delta) {
  const lastLocation = selection.last();
  if (lastLocation == null) {
    return delta ? selectFirst() : selectLast();
  } else if (initialLocation == null) {
    // Starting selection.
    resetSelectionTracking();
    initialLocation = lastLocation;
  }

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
      if (selection.has(initialLocation + totalDelta)) {
        // Need to skip already-selected selection; recurse.
        if (initialLocation + totalDelta === 0) {
          // Unless we're already at the top.
          return selection;
        } else {
          totalDelta = previousDelta;
          return adjustSelection(delta - 1);
        }
      } else {
        return selection.add(initialLocation + totalDelta);
      }
    }
  } else if (totalDelta > previousDelta) {
    // We're moving downwards.
    if (totalDelta >= 0) {
      // Extending downwards selection.
      if (selection.has(initialLocation + totalDelta)) {
        // Need to skip already-selected selection; recurse.
        if (initialLocation + totalDelta === NotesStore.notes.size - 1) {
          // Unless we're already at the bottom.
          return selection;
        } else {
          totalDelta = previousDelta;
          return adjustSelection(delta + 1);
        }
      } else {
        return selection.add(initialLocation + totalDelta);
      }
    } else {
      // Reducing upwards selection.
      return selection.remove(initialLocation + totalDelta - 1);
    }
  } else {
    return selection; // nothing to do
  }
}

function selectAll() {
  // NOTE: once we support deletion, will need to worry about holes
  const range = Immutable.Range(NotesStore.notes.size, -1);
  return selection.clear().merge(range);
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

class NotesSelectionStore extends Store {
  handleDispatch(payload) {
    switch (payload.type) {
      case Actions.ALL_NOTES_DESELECTED:
        this._change(payload.type, () => selection.clear());
        break;

      case Actions.ALL_NOTES_SELECTED:
        this._change(payload.type, selectAll);
        break;

      case Actions.ADJUST_NOTE_SELECTION_DOWN:
        this._change(payload.type, () => adjustSelection(+1));
        break;

      case Actions.ADJUST_NOTE_SELECTION_UP:
        this._change(payload.type, () => adjustSelection(-1));
        break;

      case Actions.FIRST_NOTE_SELECTED:
        this._change(payload.type, selectFirst);
        break;

      case Actions.LAST_NOTE_SELECTED:
        this._change(payload.type, selectLast);
        break;

      case Actions.NEXT_NOTE_SELECTED:
        this._change(payload.type, selectNext);
        break;

      case Actions.NOTE_DESELECTED:
        this._change(payload.type, () => selection.remove(payload.index));
        break;

      case Actions.NOTE_RANGE_SELECTED:
        this._change(payload.type, () => {
          const start = selection.last() || 0;
          const end = payload.index;
          const range = Immutable.Range(
            Math.min(start, end),
            Math.max(start, end) + 1
          );
          return selection.union(range);
        });
        break;

      case Actions.NOTE_SELECTED:
        this._change(payload.type, () => {
          if (payload.exclusive) {
            selection = selection.clear();
          }
          return selection.add(payload.index);
        });
        break;

      case Actions.NOTE_TITLE_CHANGED:
        // A note was bumped to the top, so select it.
        this.waitFor(NotesStore.dispatchToken);
        this._change(payload.type, () => {
          return selection.clear().add(0);
        });
        break;

      case Actions.NOTES_LOADED:
        this._change(payload.type, () => (
          // TODO: persist last selection across restarts
          NotesStore.notes.size ? selection.add(0) : selection
        ));
        break;

      case Actions.PREVIOUS_NOTE_SELECTED:
        this._change(payload.type, selectPrevious);
        break;
    }
  }

  _change(action, changer) {
    if (
      action !== Actions.ADJUST_NOTE_SELECTION_DOWN &&
      action !== Actions.ADJUST_NOTE_SELECTION_UP
    ) {
      resetSelectionTracking();
    }
    const previousSelection = selection;
    selection = changer.call();
    if (selection !== previousSelection) {
      this.emit('change');
    }
  }

  get selection() {
    return selection;
  }
}

export default new NotesSelectionStore();
