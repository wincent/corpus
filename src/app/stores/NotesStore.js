// Copyright 2015-present Greg Hurrell. All rights reserved.
// Licensed under the terms of the MIT license.

'use strict';

import {EventEmitter} from 'events';
import Immutable from 'immutable';

import Actions from '../Actions';
import Dispatcher from '../Dispatcher';

let notes = Immutable.fromJS([
  {
    id: 0,
    title: 'sample title',
    text: 'sample body',
  },
  {
    id: 1,
    title: 'another sample title',
    text: 'some more sample body text',
  },
  {
    id: 2,
    title: 'yet another sample title',
    text: 'and here is another sample body',
  }
]);

Dispatcher.register(payload => {
  switch (payload.type) {
    case Actions.NOTE_TITLE_CHANGED:
      notes = notes.updateIn(
        [payload.noteID, 'title'],
        note => payload.title
      );
      NotesStore.emit('change');
      break;
  }
});

const NotesStore = {
  get notes() {
    return notes;
  },
  ...EventEmitter.prototype,
};

export default NotesStore;
