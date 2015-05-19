// Copyright 2015-present Greg Hurrell. All rights reserved.
// Licensed under the terms of the MIT license.

'use strict';

import Actions from '../Actions';
import Store from './Store';

// TODO: use Flow enum here
let focus = 'OmniBar';

// TODO: turn this into a proper focus-manager
class FocusStore extends Store {
  handleDispatch(payload) {
    switch (payload.type) {
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
