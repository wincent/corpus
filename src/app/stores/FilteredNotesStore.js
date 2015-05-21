// Copyright 2015-present Greg Hurrell. All rights reserved.
// Licensed under the terms of the MIT license.

'use strict';

// babel-eslint issue: https://github.com/babel/babel-eslint/issues/108
import type {List as ImmutableList} from 'immutable'; // eslint-disable-line no-unused-vars

import Actions from '../Actions';
import NotesStore from './NotesStore';
import Store from './Store';
import stringFinder from '../stringFinder';

let notes = NotesStore.notes;
let query = null;

function filter(value: string): ImmutableList {
  const regexen = value.trim().split(/\s+/).map(stringFinder);
  if (regexen.length) {
    return NotesStore.notes.filter(note => (
      regexen.every(regexp => (
        note.get('title').search(regexp) !== -1 ||
        note.get('text').search(regexp) !== -1
      ))
    ));
  } else {
    return notes;
  }
}

class FilteredNotesStore extends Store {
  handleDispatch(payload) {
    switch (payload.type) {
      case Actions.NOTE_TEXT_CHANGED:
      case Actions.NOTE_TITLE_CHANGED:
        // Forget the query; the note will be bumped to the top.
        this.waitFor(NotesStore.dispatchToken);
        query = null;
        this._change(() => NotesStore.notes);
        break;

      case Actions.NOTES_LOADED:
        this._change(() => {
          if (query !== null) {
            return filter(query);
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
      this.emit('change', query);
    }
  }

  get notes() {
    return notes;
  }
}

export default new FilteredNotesStore();
