// Copyright 2015-present Greg Hurrell. All rights reserved.
// Licensed under the terms of the MIT license.

'use strict';

import {EventEmitter} from 'events';
import Immutable from 'immutable';

const notes = Immutable.fromJS([
  {
    title: 'sample title',
    text: 'sample body',
  },
  {
    title: 'another sample title',
    text: 'some more sample body text',
  },
  {
    title: 'yet another sample title',
    text: 'and here is another sample body',
  }
]);

const NotesStore = {
  get notes() {
    return notes;
  },
  ...EventEmitter.prototype,
};

export default NotesStore;
