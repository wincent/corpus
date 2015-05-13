// Copyright 2015-present Greg Hurrell. All rights reserved.
// Licensed under the terms of the MIT license.

'use strict';

import Immutable from 'immutable';
import Promise from 'bluebird';
import fs from 'fs';
import path from 'path';
import process from 'process';

import Actions from '../Actions';
import Store from './Store';
import handleError from '../handleError';

const readdir = Promise.promisify(fs.readdir);
const readFile = Promise.promisify(fs.readFile);
const stat = Promise.promisify(fs.stat);

/**
 * Ordered colllection of notes (as they appear in the NoteList).
 */
let notes = Immutable.List();

/**
 * Monotonically increasing, unique ID for each note.
 */
let noteID = 0;

class NotesStore extends Store {
  constructor() {
    super();

    const ignore = () => {};
    const notesDir = path.join(process.env.HOME, 'Documents', 'Notes');

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
            readFile(notePath).catch(ignore),
            stat(notePath).catch(ignore),
            (id, title, text, stat) => Immutable.Map({
              id,
              mtime: stat && stat.mtime.getTime(),
              text: text && text.toString(),
              title,
            })
          );
        },
        {concurrency: 5}
      )
      .then(data => {
        notes = notes.push(...data).sortBy(note => note.get('mtime')).reverse();
        Actions.notesLoaded();
      })
      .catch(error => handleError(error, 'Failed to read notes from disk'));
  }

  handleDispatch(payload) {
    switch (payload.type) {
      case Actions.NOTE_TITLE_CHANGED:
        // Update title.
        notes = notes.mergeIn(
          [payload.index],
          {
            mtime: Date.now(),
            title: payload.title,
          }
        );

        // Bump note to top of list.
        const note = notes.get(payload.index);
        notes = notes.delete(payload.index).unshift(note);
        this.emit('change');
        break;
      case Actions.NOTES_LOADED:
        this.emit('change');
        break;
    }
  }

  get notes() {
    return notes;
  }
}

export default new NotesStore();
