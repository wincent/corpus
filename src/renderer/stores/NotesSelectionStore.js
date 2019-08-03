/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

import Actions from '../Actions';
import FilteredNotesStore from './FilteredNotesStore';
import Store from './Store';
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

// TODO: delete; use store/selectFirst.js instead.
function selectFirst() {
  if (FilteredNotesStore.notes.length) {
    selection = new Set([0]);
  } else {
    selection = new Set();
  }
}

class NotesSelectionStore extends Store {
  handleDispatch(payload) {
    switch (payload.type) {
      case Actions.ALL_NOTES_DESELECTED:
        this._change(payload.type, () => (selection = new Set<any>()));
        break;

      case Actions.NOTE_BUBBLED:
      case Actions.NOTE_CREATION_COMPLETED:
        this.waitFor(FilteredNotesStore.dispatchToken);
        this._change(payload.type, selectFirst);
        // BUG: store not accessible here
        //store.set('focus')('Note');
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
            selection = new Set<any>();
          } else if (payload.isDeletion) {
            // Special case: we don't want anything being selected if this is
            // the result of the user pressing BACKSPACE.
            selection = new Set<any>();
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
              selection = new Set<any>([matchingIndex]);
            } else {
              selection = new Set<any>();
            }
          }
        });
        break;

      case Actions.SELECTED_NOTES_DELETED:
        this.waitFor(FilteredNotesStore.dispatchToken);
        this._change(payload.type, () => (selection = new Set<any>()));
        break;
    }
  }

  _change(action: string, changer: () => mixed) {
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
