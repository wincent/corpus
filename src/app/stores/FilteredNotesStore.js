/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

import Actions from '../Actions';
import NotesStore from './NotesStore';
import Store from './Store';
import store from '../store';
import stringFinder from '../util/stringFinder';

let query = null;
let notes = filter(query);

function filter(value: ?string): $FlowFixMe {
  const patterns =
    value != null &&
    value
      .trim()
      .split(/\s+/)
      .map(string => {
        if (string.startsWith('#')) {
          return {
            tag: string.slice(1),
            type: 'tag',
          };
        } else {
          return {
            finder: stringFinder(string),
            type: 'string',
          };
        }
      });
  if (patterns && patterns.length) {
    const indices = [];
    return store.get('notes')
      .filter((note, index) => {
        // TODO: only return new array if the filtering operation excluded any items
        if (
          patterns.every(pattern => {
            if (pattern.type === 'tag') {
              return note.tags.has(pattern.tag);
            } else {
              // Plain text search.
              return (
                note.title.search(pattern.finder) !== -1 ||
                note.text.search(pattern.finder) !== -1
              );
            }
          })
        ) {
          indices.push(index);
          return true;
        }
        return false;
      })
      .map((note, index) => ({
        // Augment note with its index.
        ...note,
        index: indices[index],
      }));
  } else {
    return store.get('notes').map((note, index) => ({
      // Augment note with its index.
      ...note,
      index,
    }));
  }
}

class FilteredNotesStore extends Store {
  handleDispatch(payload) {
    switch (payload.type) {
      // TODO: may need some events here to reset query
      case Actions.NOTE_BUBBLED:
      case Actions.NOTE_CREATION_COMPLETED:
      case Actions.SELECTED_NOTES_DELETED:
        this.waitFor(NotesStore.dispatchToken);
        this._change();
        break;

      case Actions.NOTE_TITLE_CHANGED:
        // Forget the query; the note will be bumped to the top.
        this.waitFor(NotesStore.dispatchToken);
        query = null;
        this._change();
        break;

      case Actions.NOTE_TEXT_CHANGED:
        if (!payload.isAutosave) {
          // Forget the query; the note will be bumped to the top.
          this.waitFor(NotesStore.dispatchToken);
          query = null;
          this._change();
        }
        break;

      case Actions.NOTES_LOADED:
        this._change();
        break;

      case Actions.SEARCH_REQUESTED:
        query = payload.value;
        this._change();
        break;
    }
  }

  _change() {
    const previous = notes;
    notes = filter(query);
    if (notes !== previous) {
      this.emit('change', query);
    }
  }

  get notes() {
    return notes;
  }
}

export default new FilteredNotesStore();
