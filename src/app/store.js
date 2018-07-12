/**
 * Copyright 2016-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow strict-local
 */

import chokidar from 'chokidar';
import fs from 'fs';
import mkdirp from 'mkdirp';
import path from 'path';
import process from 'process';
import {connect, createStore} from 'undux';
import unpackContent from 'unpack-content';
import {promisify} from 'util';
import Constants from './Constants';
import OperationsQueue from './OperationsQueue';
import Repo from './Repo';
import commitChanges from './commitChanges';
import configFile from './configFile';
import getNotesDirectory from './getNotesDirectory';
import handleError from './handleError';
import loadConfig from './loadConfig';
import * as log from './log';
import querySystem, {defaults as systemDefaults} from './querySystem';
import normalizeText from './util/normalizeText';

import type {LogMessage} from './log';

const close = promisify(fs.close);
const fsync = promisify(fs.fsync);
const mkdir = promisify(mkdirp);
const open = promisify(fs.open);
const readFile = promisify(fs.readFile);
const readdir = promisify(fs.readdir);
const rename = promisify(fs.rename);
const stat = promisify(fs.stat);
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
  log: Array<LogMessage>,
  notes: Array<Note>,
  selection: Set<number>,
  'system.nameMax': number,
  'system.pathMax': number,
  query: ?string,
|};

const defaultConfig = {
  notesDirectory: path.join(
    process.env.HOME,
    'Library',
    'Application Support',
    'Corpus',
    'Notes',
  ),
};

const initialState: State = {
  bubbling: null,
  'config.notesDirectory': null,
  'config.noteFontFamily': 'Monaco',
  'config.noteFontSize': '12',
  focus: 'OmniBar',
  log: [],
  notes: [],
  selection: new Set(),
  'system.nameMax': systemDefaults.nameMax,
  'system.pathMax': systemDefaults.pathMax,
  query: null,
};

const store = createStore(initialState);

store.on('config.notesDirectory').subscribe(value => {
  log.info('Using notesDirectory: ' + value);
});

export const withStore = connect(store);

export type StoreProps = {|
  store: typeof store,
|};

/**
 * The number of notes to load immediately on start-up. Remaining notes are
 * retrieved in a second pass.
 *
 * Intended to increase perceived responsiveness.
 */
const PRELOAD_COUNT =
  Math.floor(window.innerHeight / Constants.PREVIEW_ROW_HEIGHT) + 5;

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

function requireString(maybeString: mixed, key: string): string {
  // We can use a simple `typeof` check here instead of the more exotic
  // `Object.prototype.toString.call(maybeString) === '[object String]'`
  // because `maybeString` here comes from `loadConfig()` (and therefore
  // `JSON.parse()`), so we know we don't have to catch anything
  // "interesting" like strings created with `new String('...')` (which
  // have a `typeof` of "object").
  if (typeof maybeString === 'string') {
    return maybeString;
  }
  log.warn(`Reading ${configFile}: expected string value for key: ${key}`);
  return String(maybeString);
}

const mergerConfig = {
  notesDirectory(value: mixed, key: string) {
    const stringValue = requireString(value, key);
    return stringValue.replace(/^~/, process.env.HOME);
  },
};

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

const OPTION_KEY = '\u2325';
const COMMAND_KEY = '\u2318';

function confirmChange(notePath: string): void {
  const expected = changedPaths.delete(notePath);
  if (!expected) {
    log.error(
      `File changed outside of Corpus: ${notePath}\n` +
        `Reload with ${OPTION_KEY}${COMMAND_KEY}R`,
    );
  }
}

let watcher;

function initWatcher(notesDirectory: string) {
  if (watcher) {
    watcher.close();
  }
  watcher = chokidar
    .watch(notesDirectory, {
      awaitWriteFinish: {
        pollInterval: 1000,
      },
      depth: 1,
      disableGlobbing: true,
      ignoreInitial: true,
      ignored: /(^|\/)\../,
    })
    .on('all', (event, file) => {
      confirmChange(file);
    });
}

// TODO: handle edge case where notes directory has a long filename in it (not
// created by Corpus), which would overflow NAME_MAX or PATH_MAX if we end up
// appending .999 to the name...

function filterFilenames(filenames: Array<string>): Array<string> {
  return filenames.filter(fileName => path.extname(fileName) === '.md');
}

// TODO: make this a separate module so it can be tested separately
function getTitleFromPath(notePath: string): string {
  const title = path.basename(notePath, '.md');
  return title.replace(/\.\d{1,3}$/, '');
}

function appendResults(results) {
  if (results.length) {
    results.forEach(note => (pathMap[note.path] = true));
    notes = [...notes, ...results];
    store.set('notes')(notes);

    // TODO: remove debugging code
    window.store = store;
  }
}

async function getStatInfo(fileName: string): Promise<any> {
  let notesDirectory = await getNotesDirectory();
  const notePath = path.join(notesDirectory, fileName);
  const title = getTitleFromPath(notePath);
  let statResult;
  try {
    statResult = await stat(notePath);
  } catch (error) {
    // eslint-disable-line no-empty
    // Do nothing.
  }

  return {
    id: noteID++,
    mtime: statResult && statResult.mtime.getTime(),
    path: notePath,
    title,
  };
}

function compareMTime(a, b) {
  const aTime = a.mtime;
  const bTime = b.mtime;
  if (aTime > bTime) {
    return -1;
  } else if (aTime < bTime) {
    return 1;
  } else {
    return 0;
  }
}

async function readContents(info: $FlowFixMe): Promise<$FlowFixMe> {
  try {
    const content = (await readFile(info.path)).toString();
    const unpacked = unpackContent(content);
    return {
      ...info,
      body: unpacked.body,
      text: content,
      tags: new Set(unpacked.tags),
    };
  } catch (error) {
    // Soft-ignore the error. We return `null` here because we don't want views
    // to blow up trying to access `body`, `text` and `tags` (and we don't want
    // to provide default values for `body` etc because the user could use those
    // to overwrite real content on the disk).
    log.error(error);
    return null;
  }
}

function loadNotes() {
  OperationsQueue.enqueue(async () => {
    let notesDirectory = await getNotesDirectory();
    try {
      await mkdir(notesDirectory);
      new Repo(notesDirectory).init();
      initWatcher(notesDirectory);
      const filenames = await readdir(notesDirectory);
      const filtered = filterFilenames(filenames);
      const info = await Promise.all(filtered.map(getStatInfo));
      const sorted = info.sort(compareMTime);

      // Load in batches. First batch of size PRELOAD_COUNT is to improve
      // perceived responsiveness. Subsequent batches are to avoid running afoul
      // of miniscule macOS file count limits.
      const filterErrors = note => note;
      while (sorted.length) {
        const batch = sorted.splice(0, PRELOAD_COUNT);
        let results = await Promise.all(batch.map(readContents));
        appendResults(results.filter(filterErrors));
      }
    } catch (error) {
      handleError(error, 'Failed to read notes from disk');
    }
  });
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
  const notesDirectory = await getNotesDirectory();

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
      const fd = await open(
        notePath,
        'wx', // w = write, x = fail if already exists
      );
      await fsync(fd);
      await close(fd);
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
      fd = await open(notePath, 'w'); // w = write
      await write(fd, noteText);
      await utimes(notePath, time, time);
      await fsync(fd);
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
      await rename(oldPath, newPath);
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
          await unlink(notePath);
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

(async function() {
  const config = await loadConfig();

  Object.keys(config).forEach(key => {
    const prefixedKey = `config.${key}`;
    if (prefixedKey in initialState) {
      const value = config[key];
      store.set(prefixedKey)((mergerConfig[key] || requireString)(value));
    } else {
      log.warn(`Ignoring unsupported key ${key} in ${configFile}`);
    }
  });

  Object.entries(defaultConfig).forEach(([key, value]) => {
    if (!config.hasOwnProperty(key)) {
      store.set(`config.${key}`)(value);
    }
  });

  const {nameMax, pathMax} = await querySystem(config);
  store.set('system.nameMax')(nameMax);
  store.set('system.pathMax')(pathMax);

  const notesDirectory = await getNotesDirectory();
  loadNotes(notesDirectory);
})();

export default store;
