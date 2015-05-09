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
  ALL_NOTES_SELECTED: null,
  FIRST_NOTE_SELECTED: null,
  LAST_NOTE_SELECTED: null,
  NEXT_NOTE_SELECTED: null,
  NOTES_LOADED: null,
  NOTE_DESELECTED: null,
  NOTE_RANGE_SELECTED: null,
  NOTE_SELECTED: null,
  NOTE_TITLE_CHANGED: null,
  PREVIOUS_NOTE_SELECTED: null,
});

const actionCreators = {
  firstNote() {
    dispatch(actionTypes.FIRST_NOTE_SELECTED);
  },

  lastNote() {
    dispatch(actionTypes.LAST_NOTE_SELECTED);
  },

  nextNote() {
    dispatch(actionTypes.NEXT_NOTE_SELECTED);
  },

  noteDeselected(payload) {
    dispatch(actionTypes.NOTE_DESELECTED, payload);
  },

  noteRangeSelected(payload) {
    dispatch(actionTypes.NOTE_RANGE_SELECTED, payload);
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
