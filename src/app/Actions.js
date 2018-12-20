/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

import Dispatcher from './Dispatcher';

function dispatch(type: string, payload?: Object): void {
  if (payload) {
    Dispatcher.dispatch({...payload, type});
  } else {
    Dispatcher.dispatch({type});
  }
}

const actionTypes = {
  ALL_NOTES_SELECTED: 'ALL_NOTES_SELECTED',
  ADJUST_NOTE_SELECTION_DOWN: 'ADJUST_NOTE_SELECTION_DOWN',
  ADJUST_NOTE_SELECTION_UP: 'ADJUST_NOTE_SELECTION_UP',
  CONFIG_LOADED: 'CONFIG_LOADED',
  NOTES_LOADED: 'NOTES_LOADED',
  NOTE_BUBBLED: 'NOTE_BUBBLED',
  NOTE_CREATION_COMPLETED: 'NOTE_CREATION_COMPLETED',
  NOTE_CREATION_REQUESTED: 'NOTE_CREATION_REQUESTED',
  NOTE_DESELECTED: 'NOTE_DESELECTED',
  NOTE_RANGE_SELECTED: 'NOTE_RANGE_SELECTED',
  NOTE_SELECTED: 'NOTE_SELECTED',
  NOTE_TITLE_CHANGED: 'NOTE_TITLE_CHANGED',
  NOTE_TEXT_CHANGED: 'NOTE_TEXT_CHANGED',
  SEARCH_REQUESTED: 'SEARCH_REQUESTED',
  SELECTED_NOTES_DELETED: 'SELECTED_NOTES_DELETED',
};

const actionCreators = {
  adjustNoteSelectionDown() {
    dispatch(actionTypes.ADJUST_NOTE_SELECTION_DOWN);
  },

  adjustNoteSelectionUp() {
    dispatch(actionTypes.ADJUST_NOTE_SELECTION_UP);
  },

  allNotesSelected() {
    dispatch(actionTypes.ALL_NOTES_SELECTED);
  },

  noteBubbled(index: number) {
    dispatch(actionTypes.NOTE_BUBBLED, {index});
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

  noteRangeSelected(index: number) {
    dispatch(actionTypes.NOTE_RANGE_SELECTED, {index});
  },

  noteSelected(index: number, exclusive: boolean = false) {
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

  searchRequested(value: string, isDeletion: boolean = false) {
    dispatch(actionTypes.SEARCH_REQUESTED, {value, isDeletion});
  },

  selectedNotesDeleted(ids: Array<number>) {
    dispatch(actionTypes.SELECTED_NOTES_DELETED, {ids});
  },
};

const Actions = {...actionTypes, ...actionCreators};

export default Actions;
