/**
 * Copyright 2016-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow strict-local
 */

import fs from 'fs';
import path from 'path';
import {createConnectedStore} from 'undux';
import unpackContent from 'unpack-content';
import {promisify} from 'util';
import OperationsQueue from './OperationsQueue';
import commitChanges from './commitChanges';
import effects from './effects';
import getNotesDirectory from './getNotesDirectory';
import handleError from './handleError';
import * as log from './log';
import {defaults as systemDefaults} from './querySystem';
import normalizeText from './util/normalizeText';

import type {Effects, Store} from 'undux';
import type {LogMessage} from './log';
import type {FilteredNote} from './store/filterNotes';

const close = promisify(fs.close);
const fsync = promisify(fs.fsync);
const open = promisify(fs.open);
const rename = promisify(fs.rename);
const unlink = promisify(fs.unlink);
const utimes = promisify(fs.utimes);
const write = promisify(fs.write);

type Focus = 'Note' | 'NoteList' | 'OmniBar' | 'TitleInput';

type Note = {|
  body: string,
  id: number,
  mtime: ?number,
  path: string,
  tags: Set<string>,
  text: string,
  title: string,
  version: number,
|};

type PathMap = {
  [path: string]: boolean,
};

type State = {|
  bubbling: ?number,
  'config.notesDirectory': ?string,
  'config.noteFontFamily': string,
  'config.noteFontSize': string,
  focus: Focus,
  filteredNotes: $ReadOnlyArray<FilteredNote>,
  log: Array<LogMessage>,
  notes: $ReadOnlyArray<Note>,
  selectedNotes: $ReadOnlyArray<FilteredNote>, // TODO: rename FilteredNote type
  selection: Set<number>, // TODO: rename to selectedIndices (or whatever it actually is: these are indices into filteredNotes)
  'system.nameMax': number,
  'system.pathMax': number,
  query: ?string,
|};

const initialState: State = {
  bubbling: null,
  'config.notesDirectory': null,
  'config.noteFontFamily': 'Monaco',
  'config.noteFontSize': '12',
  filteredNotes: [],
  focus: 'OmniBar',
  log: [],
  notes: [],
  selectedNotes: [],
  selection: new Set(),
  'system.nameMax': systemDefaults.nameMax,
  'system.pathMax': systemDefaults.pathMax,
  query: null,
};

export default createConnectedStore(initialState, effects);

export type StoreT = Store<State>;
export type StoreProps = {|
  store: StoreT,
|};

export type StoreEffects = Effects<State>;

/**
 * Ordered collection of notes (as they appear in the NoteList).
 */
let notes = [];

/**
 * Monotonically increasing, unique ID for each note.
 */
let noteID = 0;

/**
 * Map of note paths on disk to a boolean (`true`) indicating the path is in
 * use.
 *
 * Duplicate titles are disambiguated using a numeric prefix before the '.md'
 * extension; eg: `foo.md`, `foo.1.md`, `foo.2.md` etc.
 */
const pathMap: PathMap = {};

/**
 * Whenever we make changes we record the affected paths in this set. At the
 * same time, we monitor the filesystem for changes made by other processes. If
 * we detect a change to a path that we didn't make, we know that we have to
 * reload from disk.
 */
const changedPaths = new Set();

function notifyChanges(...notePaths: Array<string>): void {
  notePaths.forEach(notePath => changedPaths.add(notePath));
}

/**
 * Bump note to top.
 */
export function bubbleNote(index: number) {
  notes = [notes[index], ...notes.slice(0, index), ...notes.slice(index + 1)];
  store.set('notes')(notes);
}

async function getPathForTitle(title: string): string {
  const sanitizedTitle = title.replace('/', '-');
  // TODO: pass store here...
  const notesDirectory = await getNotesDirectory(/*store*/);

  for (var i = 0; i <= 999; i++) {
    const number = i ? `.${i}` : '';
    const notePath = path.join(notesDirectory, sanitizedTitle + number + '.md');
    if (!(notePath in pathMap)) {
      return notePath;
    }
  }

  // TODO: decide on better strategy here
  throw new Error(`Failed to find unique path name for title "${title}"`);
}

export function createNote(title: string): void {
  OperationsQueue.enqueue(async () => {
    const notePath = await getPathForTitle(title);
    notifyChanges(notePath);
    try {
      // JUST PRETENDING FOR NOW
      /*
      const fd = await open(
        notePath,
        'wx', // w = write, x = fail if already exists
      );
      await fsync(fd);
      await close(fd);
      */
      pathMap[notePath] = true;
      notes = [
        {
          body: '',
          id: noteID++,
          mtime: Date.now(),
          path: notePath,
          tags: new Set(),
          text: '',
          title,
          version: 0,
        },
        ...notes,
      ];
      store.set('notes')(notes);
      // Actions.noteCreationCompleted();
      // NOTE: we are double-committing here until we delete NotesStore
      commitChanges();
    } catch (error) {
      handleError(error, `Failed to open ${notePath} for writing`);
    }
  });
}

export function updateNote(
  index: number,
  text: string,
  isAutosave: boolean,
): void {
  const unpacked = unpackContent(text);
  const note = {
    ...notes[index],
    body: unpacked.body,
    mtime: Date.now(),
    tags: new Set(unpacked.tags),
    text,
    version: notes[index].version + 1,
  };
  if (isAutosave) {
    // Don't bubble note to top for autosave events.
    notes = [...notes.slice(0, index), note, ...notes.slice(index + 1)];
    store.set('notes')(notes);
  } else {
    bubbleNote(index); // Does store.set().
  }

  // Persist changes to disk.
  OperationsQueue.enqueue(async () => {
    let fd = null;
    const notePath = note.path;
    notifyChanges(notePath);
    try {
      const time = new Date();
      const noteText = normalizeText(note.text);
      // JUST PRETENDING FOR NOW
      /* fd = await open(notePath, 'w'); // w = write
      await write(fd, noteText);
      await utimes(notePath, time, time);
      await fsync(fd); */
      commitChanges();
    } catch (error) {
      handleError(error, `Failed to write ${notePath}`);
    } finally {
      if (fd) {
        await close(fd);
      }
    }
  });
}

export async function renameNote(index: number, title: string): void {
  // Update note and bump to top of list.
  const oldPath = notes[index].path;
  const newPath = await getPathForTitle(title);
  notes = [
    {
      ...notes[index],
      mtime: Date.now(),
      path: newPath,
      title: title,
      version: notes[index].version + 1,
    },
    ...notes.slice(0, index),
    ...notes.slice(index + 1),
  ];
  store.set('notes')(notes);

  // Persist changes to disk.
  OperationsQueue.enqueue(async () => {
    notifyChanges(oldPath, newPath);
    try {
      const time = new Date();
      // JUST PRETENDING DURING MIGRATION
      // await rename(oldPath, newPath);
      await utimes(newPath, time, time);
      delete pathMap[oldPath];
      pathMap[newPath] = true;
      commitChanges();
    } catch (error) {
      handleError(error, `Failed to rename ${oldPath} to ${newPath}`);
    }
  });
}

// TODO: make this force a write for unsaved changes in active text area
export function deleteNotes(deletedNotes: Set<number>): void {
  commitChanges('Corpus (pre-deletion) snapshot');
  notes = notes.filter((note, index) => {
    if (deletedNotes.has(index)) {
      OperationsQueue.enqueue(async () => {
        const notePath = note.path;
        notifyChanges(notePath);
        try {
          // JUST PRETENDING DURING MIGRATION
          // await unlink(notePath);
          delete pathMap[notePath];
        } catch (error) {
          handleError(error, `Failed to delete ${notePath}`);
        }
      });
      return false;
    }
    return true;
  });
  store.set('notes')(notes);
  store.set('selection')(new Set());
}
