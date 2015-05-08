'use strict';

import {EventEmitter} from 'events';

const notes = [
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
  },
];

const NotesStore = Object.assign({
  getNotes() {
    return notes;
  }
}, EventEmitter.prototype);

export default NotesStore;
