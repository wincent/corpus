// Copyright 2015-present Greg Hurrell. All rights reserved.
// Licensed under the terms of the MIT license.

'use strict';

import Immutable from 'immutable';

import Actions from '../Actions';
import NotesStore from './NotesStore';
import Store from './Store';

/**
 * Inverted index mapping from words to a set of noteIDs in which they appear.
 */
let index = Immutable.Map();

// TODO: consider different tokenization strategies
function tokenize(string) {
  return string.trim().split(/\s+/);
}

// TODO: make this yieldy; it could take a while (non-scientific [1 run]: 391ms)
function indexAll(notes) {
  index = index.withMutations(map => {
    notes.forEach(note => {
      [
        tokenize(note.get('title')),
        tokenize(note.get('text')),
      ].forEach(list => {
        list.forEach(word => {
          const set = map.get(word) || Immutable.Set();
          map = map.set(word, set.add(note.get('id')));
        });
      });
    })
    return map;
  });
}

class SearchIndexStore extends Store {
  // TODO: figure out how to avoid the race here
  // (we want to force registration of this store before the NotesStore finishes its loading);
  // could also consider trying to hook in more intimiately to the loader so
  // that we can start indexing while we're mostly blocked on IO
  handleDispatch(payload) {
    switch (payload.type) {
      case Actions.NOTES_LOADED:
        indexAll(NotesStore.notes);
        break;
    }
    // TODO: when notes mutate, invalidate only those parts of the index
  }

  // TODO: decide whether I want to expose a non-getter API
  // (I think I'd want that to be a wrapper class around the store)
  get index() {
    return index;
  }
}

export default new SearchIndexStore();
