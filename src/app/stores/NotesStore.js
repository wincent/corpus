/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

import fs from 'fs';
import mkdirp from 'mkdirp';
import path from 'path';
import {promisify} from 'util';
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

const close = promisify(fs.close);
const fsync = promisify(fs.fsync);
const mkdir = promisify(mkdirp);
const open = promisify(fs.open);
const readFile = promisify(fs.readFile);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

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
    return notePath;
  }

  // TODO: decide on better strategy here
  throw new Error(`Failed to find unique path name for title "${title}"`);
}

function createNote(title) {
  OperationsQueue.enqueue(async () => {
    const notePath = getPathForTitle(title);
    // notifyChanges(notePath);
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
      Actions.noteCreationCompleted();
      commitChanges();
    } catch (error) {
      handleError(error, `Failed to open ${notePath} for writing`);
    }
  });
}

function loadNotes() {
  OperationsQueue.enqueue(async () => {
    notesDirectory = await getNotesDirectory();
    try {
      await mkdir(notesDirectory);
      new Repo(notesDirectory).init();
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
      // TODO: delete this (it is ported to store.js)
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

      // TODO: delete this (not needed with Undux)
      case Actions.NOTE_CREATION_COMPLETED:
        this.emit('change');
        break;

      // TODO: delete this (it is ported to store.js)
      case Actions.NOTE_CREATION_REQUESTED:
        createNote(payload.title);
        break;

      // TODO: delete this (it is ported to store.js)
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
          // updateNote(note); // Legacy/duplicative.
          this.emit('change');
        }
        break;

      // TODO: delete this (it is ported to store.js)
      case Actions.NOTE_TITLE_CHANGED:
        {
          // Update note and bump to top of list.
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

          this.emit('change');
        }
        break;

      // TODO: delete this (not needed with Undux)
      case Actions.NOTES_LOADED:
        this.emit('change');
        break;

      // TODO: delete this (it is ported to store.js)
      case Actions.SELECTED_NOTES_DELETED:
        {
          notes = notes.filter((note, index) => {
            if (payload.ids.has(index)) {
              return false;
            }
            return true;
          });
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
