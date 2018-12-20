/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

import Actions from '../Actions';
import FilteredNotesStore from './FilteredNotesStore';
import Store from './Store';
import clamp from '../clamp';
import getLastInSet from '../getLastInSet';
// import store from '../Store';

/**
 * We use a Set (ordered by insertion) to support the "multiple
 * selection followed by {next,previous}-note action"; in this case the
 * "next"/"previous" note is defined as the note after/before the last
 * note added to the set.
 *
 * TODO: consider just maintaining first/last in separate variable.
 */
let selection = new Set();

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
  const lastLocation = getLastInSet(selection);
  if (lastLocation == null) {
    delta ? selectFirst() : selectLast();
    return;
  } else if (initialLocation == null) {
    // Starting selection.
    resetSelectionTracking();
    initialLocation = lastLocation;
  }

  const previousDelta = totalDelta;
  totalDelta = clamp(
    totalDelta + delta, // desired distance from where we started
    -initialLocation, // limit of upwards selection
    FilteredNotesStore.notes.length - initialLocation - 1, // limit of downwards selection
  );

  if (totalDelta < previousDelta) {
    // Moving upwards.
    if (totalDelta >= 0) {
      // Reducing downwards selection.
      selection = new Set(selection);
      selection.delete(initialLocation + totalDelta + 1);
    } else {
      // Extending upwards selection.
      if (selection.has(initialLocation + totalDelta)) {
        // Need to skip already-selected selection; recurse.
        if (initialLocation + totalDelta === 0) {
          // Unless we're already at the top.
          return;
        } else {
          totalDelta = previousDelta;
          adjustSelection(delta - 1);
        }
      } else {
        selection = new Set(selection);
        selection.add(initialLocation + totalDelta);
      }
    }
  } else if (totalDelta > previousDelta) {
    // We're moving downwards.
    if (totalDelta >= 0) {
      // Extending downwards selection.
      if (selection.has(initialLocation + totalDelta)) {
        // Need to skip already-selected selection; recurse.
        if (
          initialLocation + totalDelta ===
          FilteredNotesStore.notes.length - 1
        ) {
          // Unless we're already at the bottom.
          return;
        } else {
          totalDelta = previousDelta;
          adjustSelection(delta + 1);
        }
      } else {
        selection = new Set(selection);
        selection.add(initialLocation + totalDelta);
      }
    } else {
      // Reducing upwards selection.
      selection = new Set(selection);
      selection.delete(initialLocation + totalDelta - 1);
    }
  }
}

// TODO: delete; use store/selectFirst.js instead.
function selectFirst() {
  if (FilteredNotesStore.notes.length) {
    selection = new Set([0]);
  } else {
    selection = new Set();
  }
}

// TODO: delete; use store/selectLast.js instead
function selectLast() {
  if (FilteredNotesStore.notes.length) {
    selection = new Set([FilteredNotesStore.notes.length - 1]);
  } else {
    selection = new Set();
  }
}

class NotesSelectionStore extends Store {
  handleDispatch(payload) {
    switch (payload.type) {
      case Actions.ALL_NOTES_DESELECTED:
        this._change(payload.type, () => (selection = new Set()));
        break;

      case Actions.ADJUST_NOTE_SELECTION_DOWN:
        this._change(payload.type, () => adjustSelection(+1));
        break;

      case Actions.ADJUST_NOTE_SELECTION_UP:
        this._change(payload.type, () => adjustSelection(-1));
        break;

      case Actions.NOTE_BUBBLED:
      case Actions.NOTE_CREATION_COMPLETED:
        this.waitFor(FilteredNotesStore.dispatchToken);
        this._change(payload.type, selectFirst);
        // BUG: store not accessible here
        //store.set('focus')('Note');
        break;

      case Actions.NOTE_RANGE_SELECTED:
        this._change(payload.type, () => {
          const start = getLastInSet(selection) || 0;
          const end = payload.index;
          selection = new Set(selection);
          for (
            let i = Math.min(start, end), max = Math.max(start, end) + 1;
            i < max;
            i++
          ) {
            selection.add(i);
          }
        });
        break;

      case Actions.NOTE_TITLE_CHANGED:
        // A note was bumped to the top, so select it.
        this.waitFor(FilteredNotesStore.dispatchToken);
        this._change(payload.type, selectFirst);
        break;

      case Actions.SEARCH_REQUESTED:
        this.waitFor(FilteredNotesStore.dispatchToken);
        this._change(payload.type, () => {
          if (payload.value === '') {
            selection = new Set();
          } else if (payload.isDeletion) {
            // Special case: we don't want anything being selected if this is
            // the result of the user pressing BACKSPACE.
            selection = new Set();
          } else {
            // Find first matching title and select it, if there is one.
            let matchingIndex = null;
            FilteredNotesStore.notes.find((note, index) => {
              if (
                note.title.toLowerCase().startsWith(payload.value.toLowerCase())
              ) {
                matchingIndex = index;
                return true;
              }
            });
            if (matchingIndex !== null) {
              selection = new Set([matchingIndex]);
            } else {
              selection = new Set();
            }
          }
        });
        break;

      case Actions.SELECTED_NOTES_DELETED:
        this.waitFor(FilteredNotesStore.dispatchToken);
        this._change(payload.type, () => (selection = new Set()));
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
    changer.call();
    if (selection !== previousSelection) {
      this.emit('change');
    }
  }

  get selection() {
    return selection;
  }
}

export default new NotesSelectionStore();
