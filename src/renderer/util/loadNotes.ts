/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

// import chokidar from 'chokidar';
import * as fs from 'fs';
// import mkdirp from 'mkdirp';
import * as path from 'path';
import {Observable} from 'rxjs';
import {promisify} from 'util';
import * as Constants from '../Constants';
import getUUID, {UUID} from './getUUID';
import * as log from './log';
import unpackContent from './unpackContent';

// import OperationsQueue from '../OperationsQueue';
// import Repo from '../Repo';
// import handleError from '../handleError';

// const mkdir = promisify(mkdirp);
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
 * Whenever we make changes we record the affected paths in this set. At the
 * same time, we monitor the filesystem for changes made by other processes. If
 * we detect a change to a path that we didn't make, we know that we have to
 * reload from disk.
 */
// const changedPaths = new Set();
// TODO ^^ fix this (unused)

// const OPTION_KEY = '\u2325';
// const COMMAND_KEY = '\u2318';

// function confirmChange(notePath: string): void {
//   const expected = changedPaths.delete(notePath);
//   if (!expected) {
//     log.error(
//       `File changed outside of Corpus: ${notePath}\n` +
//         `Reload with ${OPTION_KEY}${COMMAND_KEY}R`,
//     );
//   }
// }

// let watcher;

// function initWatcher(notesDirectory: string) {
//   if (watcher) {
//     watcher.close();
//   }
//   watcher = chokidar
//     .watch(notesDirectory, {
//       awaitWriteFinish: {
//         pollInterval: 1000,
//       },
//       depth: 1,
//       disableGlobbing: true,
//       ignoreInitial: true,
//       ignored: /(^|\/)\../,
//     })
//     .on('all', (event, file) => {
//       confirmChange(file);
//     });
// }

// TODO: handle edge case where notes directory has a long filename in it (not
// created by Corpus), which would overflow NAME_MAX or PATH_MAX if we end up
// appending .999 to the name...

function filterFilenames(filenames: string[]): string[] {
  return filenames.filter(filename => path.extname(filename) === '.md');
}

// TODO: make this a separate module so it can be tested separately
function getTitleFromPath(notePath: string): string {
  const title = path.basename(notePath, '.md');
  return title.replace(/\.\d{1,3}$/, '');
}

interface StatInfo {
  readonly id: UUID;
  readonly mtime: number;
  readonly path: string;
  readonly title: string;
}

// TODO: make this actually return only stat info (not the extra crap that is
// currently in there)
async function getStatInfo(
  filename: string,
  notesDirectory: string,
): Promise<StatInfo> {
  const notePath = path.join(notesDirectory, filename);
  const title = getTitleFromPath(notePath);
  let mtime;
  try {
    mtime = (await stat(notePath)).mtimeMs;
  } catch {
    mtime = 0;
  }

  return {
    id: getUUID(),
    mtime,
    path: notePath,
    title,
  };
}

function compareMTime({mtime: a}: StatInfo, {mtime: b}: StatInfo) {
  if (a > b) {
    return -1;
  } else if (a < b) {
    return 1;
  } else {
    return 0;
  }
}

async function readContents(info: any): Promise<Note | null> {
  try {
    const content = (await readFile(info.path)).toString();
    const unpacked = unpackContent(content);
    return {
      ...info,
      body: unpacked.body,
      text: content,
      tags: new Set(unpacked.tags),
      version: 0,
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

function isNonNull<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export default function loadNotes(
  notesDirectory: string,
): Observable<Readonly<Note[]>> {
  return new Observable(subscriber => {
    // OperationsQueue.enqueue
    (async () => {
      try {
        // await mkdir(notesDirectory);
        // new Repo(notesDirectory).init();
        // initWatcher(notesDirectory);
        const filenames = await readdir(notesDirectory);
        const filtered = filterFilenames(filenames);
        const info = await Promise.all(
          filtered.map(filename => {
            // TODO: should this also happen in batches?
            return getStatInfo(filename, notesDirectory);
          }),
        );
        const sorted = info.sort(compareMTime);

        // Load in batches. First batch of size PRELOAD_COUNT is to improve
        // perceived responsiveness. Subsequent batches are to avoid running afoul
        // of miniscule macOS file count limits.
        while (sorted.length) {
          const batch = sorted.splice(0, PRELOAD_COUNT);
          const results = await Promise.all(batch.map(readContents));
          subscriber.next(results.filter(isNonNull));
        }
      } catch (error) {
        subscriber.error(`Failed to read notes from disk: ${error}`);
        // handleError(error, 'Failed to read notes from disk');
      } finally {
        subscriber.complete();
      }
    })();
  });
}
