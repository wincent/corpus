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
  ALL_NOTES_DESELECTED: 'ALL_NOTES_DESELECTED',
  ALL_NOTES_SELECTED: 'ALL_NOTES_SELECTED',
  ADJUST_NOTE_SELECTION_DOWN: 'ADJUST_NOTE_SELECTION_DOWN',
  ADJUST_NOTE_SELECTION_UP: 'ADJUST_NOTE_SELECTION_UP',
  BUBBLE_ANIMATION_FINISHED: 'BUBBLE_ANIMATION_FINISHED',
  CHANGE_PERSISTED: 'CHANGE_PERSISTED',
  CONFIG_LOADED: 'CONFIG_LOADED',
  FIRST_NOTE_SELECTED: 'FIRST_NOTE_SELECTED',
  LAST_NOTE_SELECTED: 'LAST_NOTE_SELECTED',
  NEXT_NOTE_SELECTED: 'NEXT_NOTE_SELECTED',
  NOTES_LOADED: 'NOTES_LOADED',
  NOTE_BUBBLED: 'NOTE_BUBBLED',
  NOTE_CREATION_COMPLETED: 'NOTE_CREATION_COMPLETED',
  NOTE_CREATION_REQUESTED: 'NOTE_CREATION_REQUESTED',
  NOTE_DESELECTED: 'NOTE_DESELECTED',
  NOTE_FOCUS_REQUESTED: 'NOTE_FOCUS_REQUESTED',
  NOTE_LIST_FOCUS_REQUESTED: 'NOTE_LIST_FOCUS_REQUESTED',
  NOTE_RANGE_SELECTED: 'NOTE_RANGE_SELECTED',
  NOTE_RENAME_REQUESTED: 'NOTE_RENAME_REQUESTED',
  NOTE_SELECTED: 'NOTE_SELECTED',
  NOTE_TITLE_CHANGED: 'NOTE_TITLE_CHANGED',
  NOTE_TEXT_CHANGED: 'NOTE_TEXT_CHANGED',
  OMNI_BAR_FOCUS_REQUESTED: 'OMNI_BAR_FOCUS_REQUESTED',
  PREVIOUS_NOTE_SELECTED: 'PREVIOUS_NOTE_SELECTED',
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

  allNotesDeselected() {
    dispatch(actionTypes.ALL_NOTES_DESELECTED);
  },

  allNotesSelected() {
    dispatch(actionTypes.ALL_NOTES_SELECTED);
  },

  bubbleAnimationFinished() {
    dispatch(actionTypes.BUBBLE_ANIMATION_FINISHED);
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

  /**
   * Called when a note starts getting bubbled (animated) towards the top of
   * the notes list as the result of a change to its contents or title.
   *
   * In order to maintain an internally coherent state, the bubbling is actually
   * immediate (ie. we move the note in our internal data structures) and the
   * animation is shown after the fact.
   */
  noteBubbled(index: number, position: number) {
    dispatch(actionTypes.NOTE_BUBBLED, {index, position});
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

  omniBarFocused() {
    dispatch(actionTypes.OMNI_BAR_FOCUS_REQUESTED);
  },

  previousNoteSelected() {
    dispatch(actionTypes.PREVIOUS_NOTE_SELECTED);
  },

  renameRequested() {
    dispatch(actionTypes.NOTE_RENAME_REQUESTED);
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
