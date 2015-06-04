/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

'use strict';

// babel-eslint issue: https://github.com/babel/babel-eslint/issues/108
import type {List as ImmutableList} from 'immutable'; // eslint-disable-line no-unused-vars

import Actions from '../Actions';
import NotesStore from './NotesStore';
import Store from './Store';
import stringFinder from '../util/stringFinder';

let query = null;
let notes = filter(query);

function filter(value: ?string): ImmutableList {
  const regexen = (
    value != null &&
    value.trim().split(/\s+/).map(stringFinder)
  );
  if (regexen && regexen.length) {
    const indices = [];
    return NotesStore.notes
      .filter((note, index) => {
        if ((regexen.every(regexp => (
          note.get('title').search(regexp) !== -1 ||
          note.get('text').search(regexp) !== -1
        )))) {
          indices.push(index);
          return true;
        }
        return false;
      })
      .map((note, index) => (
        // Augment note with its index within the NotesStore.
        note.set('index', indices[index])
      ))
      .toList();
  } else {
    return NotesStore.notes.map((note, index) => (
      // Augment note with its index within the NoteStore.
      note.set('index', index)
    ));
  }
}

class FilteredNotesStore extends Store {
  handleDispatch(payload) {
    switch (payload.type) {
      // TODO: may need some events here to reset query

      case Actions.NOTE_CREATION_COMPLETED:
        this.waitFor(NotesStore.dispatchToken);
        this._change(() => filter(query));
        break;

      case Actions.NOTE_TITLE_CHANGED:
        // Forget the query; the note will be bumped to the top.
        this.waitFor(NotesStore.dispatchToken);
        query = null;
        this._change(() => filter(query));
        break;

      case Actions.NOTE_TEXT_CHANGED:
        if (!payload.isAutosave) {
          // Forget the query; the note will be bumped to the top.
          this.waitFor(NotesStore.dispatchToken);
          query = null;
          this._change(() => filter(query));
        }
        break;

      case Actions.NOTES_LOADED:
        this._change(() => filter(query));
        break;

      case Actions.SEARCH_REQUESTED:
        query = payload.value;
        this._change(() => filter(query));
        break;

      case Actions.SELECTED_NOTES_DELETED:
        // Keep and re-run the query, if we have one
        this.waitFor(NotesStore.dispatchToken);
        this._change(() => filter(query));
        break;
    }
  }

  // TODO: can we move a general version of this up to the Store for re-use?
  // (probably not)
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
