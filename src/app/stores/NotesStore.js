/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

'use strict';

// https://github.com/eslint/eslint/issues/2584
import {
  List as ImmutableList,
  Map as ImmutableMap,
} from 'immutable';

import Promise from 'bluebird';
import fs from 'fs';
import mkdirp from 'mkdirp';
import path from 'path';
import process from 'process';

import Actions from '../Actions';
import ConfigStore from './ConfigStore';
import Constants from '../Constants';
import Store from './Store';
import handleError from '../handleError';

const close = Promise.promisify(fs.close);
const fsync = Promise.promisify(fs.fsync);
const mkdir = Promise.promisify(mkdirp);
const open = Promise.promisify(fs.open);
const readdir = Promise.promisify(fs.readdir);
const readFile = Promise.promisify(fs.readFile);
const rename = Promise.promisify(fs.rename);
const stat = Promise.promisify(fs.stat);
const utimes = Promise.promisify(fs.utimes);
const write = Promise.promisify(fs.write);

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

let notesDirectory;

function ignore(): void {
  return;
}

function filterFilenames(filenames: Array<string>): Array<string> {
  return filenames.filter(fileName => path.extname(fileName) === '.txt');
}

function getStatInfo(fileName: string): ImmutableMap {
  const notePath = path.join(notesDirectory, fileName);
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

// TODO: munge filenames with illegal characters in their names
function getPathForTitle(title: string): string {
  return path.join(notesDirectory, title + '.txt');
}

function createNote(title) {
  const notePath = getPathForTitle(title);
  open(notePath, 'wx') // w = write, x = fail if already exists
    .then(fd => new Promise(resolve => fsync(fd).then(() => resolve(fd))))
    .then(fd => close(fd))
    .then(() => {
      notes = notes.unshift(ImmutableMap({
        id: noteID++,
        mtime: Date.now(),
        path: notePath,
        text: '',
        title,
      }));
      Actions.noteCreationCompleted();
    })
    .catch(error => handleError(error, `Failed to open ${notePath} for writing`));
}

function updateNote(note) {
  const notePath = note.get('path');
  const time = new Date();
  open(notePath, 'w') // w = write
    .then(fd => new Promise(resolve => write(fd, note.get('text')).then(() => resolve(fd))))
    .then(fd => new Promise(resolve => utimes(notePath, time, time).then(resolve(fd))))
    .then(fd => new Promise(resolve => fsync(fd).then(() => resolve(fd))))
    .then(fd => close(fd))
    .catch(error => handleError(error, `Failed to write ${notePath}`));
}

function renameNote(oldPath, newPath) {
  const time = new Date();
  rename(oldPath, newPath)
    .then(() => new Promise(resolve => utimes(newPath, time, time).then(resolve)))
    .then(() => {
      // TODO: Fire an action here advising Git to commit; ditto above
    })
    .catch(error => handleError(error, `Failed to rename ${oldPath} to ${newPath}`));
}

function loadNotes() {
  notesDirectory = ConfigStore.config.get('notesDirectory');
  mkdir(notesDirectory)
    .then(() => readdir(notesDirectory))
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

class NotesStore extends Store {
  handleDispatch(payload) {
    switch (payload.type) {
      case Actions.CONFIG_LOADED:
        // Can't load notes without config telling us where to look.
        loadNotes();
        break;

      case Actions.NOTE_CREATION_COMPLETED:
        this.emit('change');
        break;

      case Actions.NOTE_CREATION_REQUESTED:
        createNote(payload.title);
        break;

      case Actions.NOTE_TEXT_CHANGED:
        // NOTE: At the moment, we don't fire NOTE_TEXT_CHANGED for every text
        // change (only when we've lost textarea focus); this will eventually
        // change, because we probably want to save more often than that.
        {
          const update = {
            mtime: Date.now(),
            text: payload.text,
          };
          notes = notes.mergeIn(
            [payload.index],
            update
          );

          // Bump note to top of list.
          const note = notes.get(payload.index);
          notes = notes.delete(payload.index).unshift(note);

          // Persist changes to disk.
          updateNote(note);
          this.emit('change');
        }
        break;

      case Actions.NOTE_TITLE_CHANGED:
        {
          const update = {
            mtime: Date.now(),
            path: getPathForTitle(payload.title),
            title: payload.title,
          };
          const originalNote = notes.get(payload.index);
          notes = notes.mergeIn(
            [payload.index],
            update
          );

          // Bump note to top of list.
          const newNote = notes.get(payload.index);
          notes = notes.delete(payload.index).unshift(newNote);

          // Persist changes to disk.
          renameNote(originalNote.get('path'), newNote.get('path'));
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
