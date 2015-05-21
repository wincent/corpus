// Copyright 2015-present Greg Hurrell. All rights reserved.
// Licensed under the terms of the MIT license.

'use strict';

// https://github.com/eslint/eslint/issues/2584
import {
  List as ImmutableList,
  Map as ImmutableMap,
} from 'immutable';

import Promise from 'bluebird';
import fs from 'fs';
import path from 'path';
import process from 'process';

import Actions from '../Actions';
import Constants from '../Constants';
import Store from './Store';
import handleError from '../handleError';

const readdir = Promise.promisify(fs.readdir);
const readFile = Promise.promisify(fs.readFile);
const stat = Promise.promisify(fs.stat);

/**
 * The number of notes to load immediately on start-up. Remaining notes are
 * retrieved in a second pass.
 *
 * Intended to increase perceived responsiveness.
 */
const PRELOAD_COUNT = Math.floor(window.innerHeight / Constants.PREVIEW_ROW_HEIGHT) + 5;

/**
 * Ordered colllection of notes (as they appear in the NoteList).
 */
let notes = ImmutableList();

/**
 * Monotonically increasing, unique ID for each note.
 */
let noteID = 0;

const notesDir = path.join(process.env.HOME, 'Documents', 'Notes');

function ignore(): void {
  return;
}

function filterFilenames(filenames: Array<string>): Array<string> {
  return filenames.filter(fileName => path.extname(fileName) === '.txt');
}

function getStatInfo(fileName: string): ImmutableMap {
  const notePath = path.join(notesDir, fileName);
  const title = path.basename(notePath, '.txt');
  return Promise.join(
    noteID++,
    title,
    notePath,
    stat(notePath).catch(ignore),
    (id, _, __, statResult) => ImmutableMap({
      id,
      mtime: statResult && statResult.mtime.getTime(),
      path: notePath,
      title,
    })
  );
}

function compareMTime(a, b) {
  const aTime = a.get('mtime');
  const bTime = b.get('mtime');
  if (aTime > bTime) {
    return -1;
  } else if (aTime < bTime) {
    return 1;
  } else {
    return 0;
  }
}

function readContents(info) {
  return Promise.join(
    info,
    readFile(info.get('path')).catch(ignore),
    (_, text) => info.set('text', text.toString())
  );
}

function appendResults(results) {
  if (results.length) {
    notes = notes.push(...results);
    Actions.notesLoaded();
  }
}

class NotesStore extends Store {
  constructor() {
    super();

    readdir(notesDir)
      .then(filterFilenames)
      .map(getStatInfo)
      .then(info => {
        const sorted = info.sort(compareMTime);
        const preload = sorted.splice(0, PRELOAD_COUNT);
        return new Promise(resolve => (
          Promise.map(preload, readContents, {concurrency: 5})
            .then(appendResults)
            .then(() => Promise.map(sorted, readContents, {concurrency: 5}))
            .then(appendResults)
            .then(resolve)
        ));
      })
      .catch(error => handleError(error, 'Failed to read notes from disk'));
  }

  handleDispatch(payload) {
    switch (payload.type) {
      case Actions.NOTE_TEXT_CHANGED:
      case Actions.NOTE_TITLE_CHANGED:
        {
          const update = {mtime: Date.now()};
          if (payload.text) {
            update.text = payload.text;
          }
          if (payload.title) {
            update.title = payload.title;
          }
          notes = notes.mergeIn(
            [payload.index],
            update
          );

          // Bump note to top of list.
          const note = notes.get(payload.index);
          notes = notes.delete(payload.index).unshift(note);
          this.emit('change');
        }
        break;

      case Actions.NOTES_LOADED:
        this.emit('change');
        break;

      case Actions.SELECTED_NOTES_DELETED:
        notes = notes.filterNot((note, index) => payload.ids.has(index));
        this.emit('change');
        break;
    }
  }

  get notes() {
    return notes;
  }
}

export default new NotesStore();
