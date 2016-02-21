/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

import Actions from '../Actions';
import NotesSelectionStore from './NotesSelectionStore';
import Store from './Store';

// TODO: use Flow enum here
let focus = 'OmniBar';

// TODO: turn this into a proper focus-manager
class FocusStore extends Store {
  handleDispatch(payload) {
    switch (payload.type) {
      case Actions.NOTE_CREATION_COMPLETED:
        this.waitFor(NotesSelectionStore.dispatchToken);
        focus = 'Note';

        // Due to batched updates, we have to delay actually firing the change
        // event here, otherwise it will fire before the Note view has even
        // rendered and started listening to this store, which means that focus
        // won't actually transfer.
        setImmediate(() => this.emit('change'));
        break;

      case Actions.NOTE_FOCUS_REQUESTED:
        focus = 'Note';
        this.emit('change');
        break;

      case Actions.NOTE_LIST_FOCUS_REQUESTED:
        focus = 'NoteList';
        this.emit('change');
        break;

      case Actions.NOTE_RENAME_REQUESTED:
        focus = 'TitleInput';
        this.emit('change');
        break;

      case Actions.OMNI_BAR_FOCUS_REQUESTED:
        focus = 'OmniBar';
        this.emit('change');
        break;
    }
  }

  get focus() {
    return focus;
  }
}

export default new FocusStore();
