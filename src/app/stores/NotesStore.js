// Copyright 2015-present Greg Hurrell. All rights reserved.
// Licensed under the terms of the MIT license.

'use strict';

import {EventEmitter} from 'events';
import Immutable from 'immutable';
import Promise from 'bluebird';
import fs from 'fs';
import path from 'path';
import process from 'process';

import Actions from '../Actions';
import Dispatcher from '../Dispatcher';

const readdir = Promise.promisify(fs.readdir);
const readFile = Promise.promisify(fs.readFile);

const notesDir = path.join(process.env.HOME, 'Documents', 'Notes');

let notes = Immutable.List();
let noteID = 0;

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
    notes = notes.push(...data);
    Actions.notesLoaded();
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
    case Actions.NOTES_LOADED:
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
