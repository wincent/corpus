/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

'use strict';

import Actions from '../Actions';
import NotesSelectionStore from './NotesSelectionStore';
import Store from './Store';

let bubbling = null;

/**
 * Store which tracks the index of the note, if any, which has started bubbling
 * to the top of the NoteList.
 */
class NoteAnimationStore extends Store {
  handleDispatch(payload) {
    switch (payload.type) {
      case Actions.NOTE_BUBBLED:
      case Actions.NOTE_TITLE_CHANGED:
        this.waitFor(NotesSelectionStore.dispatchToken);
        if (payload.position !== bubbling) {
          bubbling = payload.position;
          this.emit('change');
        }
        break;
    }
  }

  get bubbling() {
    return bubbling;
  }
}

export default new NoteAnimationStore();
