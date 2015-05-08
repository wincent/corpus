'use strict';

import Dispatcher from './Dispatcher';
import keyMirror from 'react/lib/keyMirror';

const Actions = keyMirror({
  NEXT_NOTE_SELECTED: null,
  NOTE_SELECTED: null,
  PREVIOUS_NOTE_SELECTED: null,
});

Actions.nextNote = function() {
  Dispatcher.dispatch({type: Actions.NEXT_NOTE_SELECTED});
};

Actions.noteSelected = function(payload) {
  Dispatcher.dispatch({
    ...payload,
    type: Actions.NOTE_SELECTED,
  });
};

Actions.previousNote = function() {
  Dispatcher.dispatch({type: Actions.PREVIOUS_NOTE_SELECTED});
};

export default Actions;
