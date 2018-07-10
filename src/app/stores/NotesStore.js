/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

import Promise from 'bluebird';
import fs from 'fs';
import mkdirp from 'mkdirp';
import path from 'path';
import unpackContent from 'unpack-content';

import Actions from '../Actions';
import Constants from '../Constants';
import OperationsQueue from '../OperationsQueue';
import Repo from '../Repo';
import Store from './Store';
import commitChanges from '../commitChanges';
import getNotesDirectory from '../getNotesDirectory';
import handleError from '../handleError';
import * as log from '../log';
import normalizeText from '../util/normalizeText';
import chokidar from 'chokidar';

const close = Promise.promisify(fs.close);
const fsync = Promise.promisify(fs.fsync);
const mkdir = Promise.promisify(mkdirp);
const open = Promise.promisify(fs.open);
const readdir = Promise.promisify(fs.readdir);
const readFile = Promise.promisify(fs.readFile);
const rename = Promise.promisify(fs.rename);
const stat = Promise.promisify(fs.stat);
const unlink = Promise.promisify(fs.unlink);
const utimes = Promise.promisify(fs.utimes);
const write = Promise.promisify(fs.write);

type PathMap = {
  [path: string]: boolean,
};

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

let notesDirectory;

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

// TODO: handle edge case where notes directory has a long filename in it (not
// created by Corpus), which would overflow NAME_MAX or PATH_MAX if we end up
// appending .999 to the name...

function filterFilenames(filenames: Array<string>): Array<string> {
  return filenames.filter(fileName => path.extname(fileName) === '.md');
}

async function getStatInfo(fileName: string): Promise<any> {
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

function appendResults(results) {
  if (results.length) {
    notes = [...notes, ...results];
    results.forEach(note => (pathMap[note.path] = true));
    Actions.notesLoaded();
  }
}

// TODO: make this a separate module so it can be tested separately
function getTitleFromPath(notePath: string): string {
  const title = path.basename(notePath, '.md');
  return title.replace(/\.\d{1,3}$/, '');
}

function getPathForTitle(title: string): string {
  const sanitizedTitle = title.replace('/', '-');

  for (var ii = 0; ii <= 999; ii++) {
    const number = ii ? `.${ii}` : '';
    const notePath = path.join(notesDirectory, sanitizedTitle + number + '.md');
    if (!(notePath in pathMap)) {
      return notePath;
    }
  }

  // TODO: decide on better strategy here
  throw new Error(`Failed to find unique path name for title "${title}"`);
}

function createNote(title) {
  OperationsQueue.enqueue(async () => {
    const notePath = getPathForTitle(title);
    notifyChanges(notePath);
    try {
      const fd = await open(
        notePath,
        'wx', // w = write, x = fail if already exists
      );
      await fsync(fd);
      await close(fd);
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
      pathMap[notePath] = true;
      Actions.noteCreationCompleted();
      commitChanges();
    } catch (error) {
      handleError(error, `Failed to open ${notePath} for writing`);
    }
  });
}

// TODO: make this force a write for unsaved changes in active text area
function deleteNotes(deletedNotes) {
  commitChanges('Corpus (pre-deletion) snapshot');
  deletedNotes.forEach(note => {
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
  });
}

function updateNote(note) {
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

function renameNote(oldPath, newPath) {
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

function loadNotes() {
  OperationsQueue.enqueue(async () => {
    notesDirectory = await getNotesDirectory();
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
      // of miniscule OS X file count limits.
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

getNotesDirectory().then(loadNotes);

class NotesStore extends Store {
  handleDispatch(payload) {
    switch (payload.type) {
      case Actions.NOTE_BUBBLED:
        {
          // Bump note to top.
          notes = [
            notes[payload.index],
            ...notes.slice(0, payload.index),
            ...notes.slice(payload.index + 1),
          ];
          this.emit('change');
        }
        break;

      case Actions.NOTE_CREATION_COMPLETED:
        this.emit('change');
        break;

      case Actions.NOTE_CREATION_REQUESTED:
        createNote(payload.title);
        break;

      case Actions.NOTE_TEXT_CHANGED:
        {
          const unpacked = unpackContent(payload.text);
          const note = {
            ...notes[payload.index],
            body: unpacked.body,
            mtime: Date.now(),
            tags: new Set(unpacked.tags),
            text: payload.text,
          };
          if (payload.isAutosave) {
            // Don't bubble note to top for autosave events.
            notes = [
              ...notes.slice(0, payload.index),
              note,
              ...notes.slice(payload.index + 1),
            ];
          } else {
            notes = [
              note,
              ...notes.slice(0, payload.index),
              ...notes.slice(payload.index + 1),
            ];
          }

          // Persist changes to disk.
          updateNote(note);
          this.emit('change');
        }
        break;

      case Actions.NOTE_TITLE_CHANGED:
        {
          // Update note and bump to top of list.
          const originalPath = notes[payload.index].path;
          const newPath = getPathForTitle(payload.title);
          notes = [
            {
              ...notes[payload.index],
              mtime: Date.now(),
              path: newPath,
              title: payload.title,
            },
            ...notes.slice(0, payload.index),
            ...notes.slice(payload.index + 1),
          ];

          // Persist changes to disk.
          renameNote(originalPath, newPath);
          this.emit('change');
        }
        break;

      case Actions.NOTES_LOADED:
        this.emit('change');
        break;

      case Actions.SELECTED_NOTES_DELETED:
        {
          const deletedNotes = [];
          notes = notes.filter((note, index) => {
            if (payload.ids.has(index)) {
              deletedNotes.push(note);
              return false;
            }
            return true;
          });
          deleteNotes(deletedNotes);
          this.emit('change');
        }
        break;
    }
  }

  get notes() {
    return notes;
  }
}

export default new NotesStore();
