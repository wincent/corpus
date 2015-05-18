// Copyright 2015-present Greg Hurrell. All rights reserved.
// Licensed under the terms of the MIT license.

'use strict';

import Immutable from 'immutable';

import Actions from '../Actions';
import NotesStore from './NotesStore';
import Store from './Store';
import stringFinder from '../stringFinder';

let notes = NotesStore.notes;
let query = null;

function filter(value: string): Immutable.List {
  const regexen = value.trim().split(/\s+/).map(stringFinder);
  if (regexen.length) {
    let titleMatch;
    let count = 0;
    const filtered = NotesStore.notes.filter(note => {
      if (
        titleMatch != null &&
        note.get('title').toLowerCase().startsWith(value.toLowerCase())
      ) {
        // First seen prefix match on title; remember where we saw it.
        titleMatch = count;
      }
      const match = regexen.every(regexp => (
        note.get('title').search(regexp) !== -1 ||
        note.get('text').search(regexp) !== -1
      ));
      if (match) {
        count++;
      }
      return match;
    });

    // If we found an exact title match, bump first found to the top.
    if (titleMatch != null) {
      const note = filtered.get(titleMatch);
      return filtered.delete(titleMatch).unshift(note);
    } else {
      return filtered;
    }
  } else {
    return notes;
  }
}

class FilteredNotesStore extends Store {
  handleDispatch(payload) {
    switch (payload.type) {
      case Actions.NOTE_TITLE_CHANGED:
        // Forget the query; the note will be bumped to the top.
        this.waitFor(NotesStore.dispatchToken);
        query = null;
        this._change(() => NotesStore.notes);
        break;

      case Actions.NOTES_LOADED:
        this._change(() => {
          if (query !== null) {
            return filter(query)
          } else {
            return NotesStore.notes;
          }
        });
        break;

      case Actions.SEARCH_REQUESTED:
        query = payload.value;
        this._change(() => filter(query));
        break;
    }
  }

  _change(changer) {
    const previous = notes;
    notes = changer.call();
    if (notes !== previous) {
      this.emit('change');
    }
  }

  get notes() {
    return notes;
  }
}

export default new FilteredNotesStore();
