// Copyright 2015-present Greg Hurrell. All rights reserved.
// Licensed under the terms of the MIT license.

'use strict';

import {EventEmitter} from 'events';
import Immutable from 'immutable';
import Promise from 'bluebird';
import path from 'path';
import process from 'process';
import remote from 'remote';

import Actions from '../Actions';
import Dispatcher from '../Dispatcher';

const fs = remote.require('fs');
const readdir = Promise.promisify(fs.readdir);
const readFile = Promise.promisify(fs.readFile);

const notesDir = path.join(process.env.HOME, 'Documents', 'Notes');

// TODO: make sure the rest of the code can handle the no-notes case
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

let noteID = 3; // TODO: make this 0 once we no longer need sample data

console.time('reading');
readdir(notesDir)
  .filter(
    fileName => path.extname(fileName) === '.txt',
    {concurrency: Infinity}
  )
  .map(
    fileName => {
      const notePath = path.join(notesDir, fileName);
      const title = path.basename(notePath, '.txt');
      return Promise.join(
        noteID++,
        title,
        readFile(notePath).catch(() => {}),
        (id, title, text) => Immutable.Map({id, title, text: text.toString()})
      );
    },
    {concurrency: 5}
  )
  .then(data => {
    console.timeEnd('reading');
    notes = notes.push(...data);
    NotesStore.emit('change');
  })
  .catch(error => console.log('something went wrong', error));

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
