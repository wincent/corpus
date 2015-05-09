// Copyright 2015-present Greg Hurrell. All rights reserved.
// Licensed under the terms of the MIT license.

'use strict';

import Dispatcher from './Dispatcher';
import keyMirror from 'react/lib/keyMirror';

function dispatch(type: string, payload?: Object): void {
  if (payload) {
    Dispatcher.dispatch({...payload, type});
  } else {
    Dispatcher.dispatch({type});
  }
}

const actionTypes = keyMirror({
  NEXT_NOTE_SELECTED: null,
  NOTES_LOADED: null,
  NOTE_SELECTED: null,
  NOTE_TITLE_CHANGED: null,
  PREVIOUS_NOTE_SELECTED: null,
});

const actionCreators = {
  nextNote() {
    dispatch(actionTypes.NEXT_NOTE_SELECTED);
  },

  noteSelected(payload) {
    dispatch(actionTypes.NOTE_SELECTED, payload);
  },

  notesLoaded() {
    dispatch(actionTypes.NOTES_LOADED);
  },

  previousNote() {
    dispatch(actionTypes.PREVIOUS_NOTE_SELECTED);
  },

  noteTitleChanged(payload) {
    dispatch(actionTypes.NOTE_TITLE_CHANGED, payload);
  },
};

const Actions = {...actionTypes, ...actionCreators};

export default Actions;
