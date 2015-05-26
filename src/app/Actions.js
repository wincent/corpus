/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

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
  ALL_NOTES_DESELECTED: null,
  ALL_NOTES_SELECTED: null,
  ADJUST_NOTE_SELECTION_DOWN: null,
  ADJUST_NOTE_SELECTION_UP: null,
  CHANGE_PERSISTED: null,
  CONFIG_LOADED: null,
  FIRST_NOTE_SELECTED: null,
  LAST_NOTE_SELECTED: null,
  NEXT_NOTE_SELECTED: null,
  NOTES_LOADED: null,
  NOTE_CREATION_COMPLETED: null,
  NOTE_CREATION_REQUESTED: null,
  NOTE_DESELECTED: null,
  NOTE_FOCUS_REQUESTED: null,
  NOTE_LIST_FOCUS_REQUESTED: null,
  NOTE_RANGE_SELECTED: null,
  NOTE_RENAME_REQUESTED: null,
  NOTE_SELECTED: null,
  NOTE_TITLE_CHANGED: null,
  NOTE_TEXT_CHANGED: null,
  OMNI_BAR_FOCUS_REQUESTED: null,
  PREVIOUS_NOTE_SELECTED: null,
  SEARCH_REQUESTED: null,
  SELECTED_NOTES_DELETED: null,
});

const actionCreators = {
  adjustNoteSelectionDown() {
    dispatch(actionTypes.ADJUST_NOTE_SELECTION_DOWN);
  },

  adjustNoteSelectionUp() {
    dispatch(actionTypes.ADJUST_NOTE_SELECTION_UP);
  },

  allNotesDeselected() {
    dispatch(actionTypes.ALL_NOTES_DESELECTED);
  },

  allNotesSelected() {
    dispatch(actionTypes.ALL_NOTES_SELECTED);
  },

  changePersisted() {
    dispatch(actionTypes.CHANGE_PERSISTED);
  },

  configLoaded() {
    dispatch(actionTypes.CONFIG_LOADED);
  },

  firstNoteSelected() {
    dispatch(actionTypes.FIRST_NOTE_SELECTED);
  },

  lastNoteSelected() {
    dispatch(actionTypes.LAST_NOTE_SELECTED);
  },

  nextNoteSelected() {
    dispatch(actionTypes.NEXT_NOTE_SELECTED);
  },

  noteCreationRequested(title: string) {
    dispatch(actionTypes.NOTE_CREATION_REQUESTED, {title});
  },

  noteCreationCompleted() {
    dispatch(actionTypes.NOTE_CREATION_COMPLETED);
  },

  noteDeselected(index: number) {
    dispatch(actionTypes.NOTE_DESELECTED, {index});
  },

  noteFocused() {
    dispatch(actionTypes.NOTE_FOCUS_REQUESTED);
  },

  noteListFocused() {
    dispatch(actionTypes.NOTE_LIST_FOCUS_REQUESTED);
  },

  noteRangeSelected(index: number) {
    dispatch(actionTypes.NOTE_RANGE_SELECTED, {index});
  },

  noteSelected(index: number, exclusive=false: boolean) {
    dispatch(actionTypes.NOTE_SELECTED, {exclusive, index});
  },

  noteTextChanged(payload: {index: number, text: string}) {
    dispatch(actionTypes.NOTE_TEXT_CHANGED, payload);
  },

  noteTitleChanged(payload: {index: number, title: string}) {
    dispatch(actionTypes.NOTE_TITLE_CHANGED, payload);
  },

  notesLoaded() {
    dispatch(actionTypes.NOTES_LOADED);
  },

  omniBarFocused() {
    dispatch(actionTypes.OMNI_BAR_FOCUS_REQUESTED);
  },

  previousNoteSelected() {
    dispatch(actionTypes.PREVIOUS_NOTE_SELECTED);
  },

  renameRequested() {
    dispatch(actionTypes.NOTE_RENAME_REQUESTED);
  },

  searchRequested(value: string) {
    dispatch(actionTypes.SEARCH_REQUESTED, {value});
  },

  selectedNotesDeleted(ids) {
    dispatch(actionTypes.SELECTED_NOTES_DELETED, {ids});
  },
};

const Actions = {...actionTypes, ...actionCreators};

export default Actions;
