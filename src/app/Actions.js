// Copyright 2015-present Greg Hurrell. All rights reserved.
// Licensed under the terms of the MIT license.

'use strict';

import Dispatcher from './Dispatcher';
import keyMirror from 'react/lib/keyMirror';

const actionTypes = keyMirror({
  NEXT_NOTE_SELECTED: null,
  NOTE_SELECTED: null,
  PREVIOUS_NOTE_SELECTED: null,
});

const actionCreators = {
  nextNote() {
    Dispatcher.dispatch({type: Actions.NEXT_NOTE_SELECTED});
  },

  noteSelected(payload) {
    Dispatcher.dispatch({
      ...payload,
      type: Actions.NOTE_SELECTED,
    });
  },

  previousNote() {
    Dispatcher.dispatch({type: Actions.PREVIOUS_NOTE_SELECTED});
  },
};

const Actions = Object.assign(actionTypes, actionCreators);

export default Actions;
