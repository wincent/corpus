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
  CONFIG_LOADED: 'CONFIG_LOADED',
  NOTES_LOADED: 'NOTES_LOADED',
  NOTE_BUBBLED: 'NOTE_BUBBLED',
  NOTE_CREATION_COMPLETED: 'NOTE_CREATION_COMPLETED',
  NOTE_CREATION_REQUESTED: 'NOTE_CREATION_REQUESTED',
  NOTE_TITLE_CHANGED: 'NOTE_TITLE_CHANGED',
  NOTE_TEXT_CHANGED: 'NOTE_TEXT_CHANGED',
  SEARCH_REQUESTED: 'SEARCH_REQUESTED',
  SELECTED_NOTES_DELETED: 'SELECTED_NOTES_DELETED',
};

const actionCreators = {
  noteBubbled(index: number) {
    dispatch(actionTypes.NOTE_BUBBLED, {index});
  },

  noteCreationRequested(title: string) {
    dispatch(actionTypes.NOTE_CREATION_REQUESTED, {title});
  },

  noteCreationCompleted() {
    dispatch(actionTypes.NOTE_CREATION_COMPLETED);
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