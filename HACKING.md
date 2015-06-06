# Development environment bootstrap

```
# Install Electron to /usr/local/lib/node_modules/electron-prebuilt:
npm install electron-prebuilt -g

# Install other dependencies.
npm install

# NOTE: due to https://github.com/gulpjs/gulp/issues/810
# you may have to install gulp globally:
npm install -g gulp
```

# Running

```
# Transforms "src" to "dist".
gulp build

# Enters watch mode.
gulp

# Runs the app.
./corpus.sh

# Runs the app with React `__DEV__` checks activated.
NODE_ENV=development ./corpus.sh
```

# Gulp tasks

- `gulp`: Enter watch mode (equivalent to `gulp watch`).
- `gulp build`: Transform "src" to "dist".
- `gulp release`: Prepare release binary in "release" directory.

For a full listing, run `gulp --tasks`

# Architecture

## Flux Stores

The following diagram shows the data flow among the main Flux stores in the
application. Arrows indicate `waitFor` and dependency relationships (ie. the
arrow in `A <- B` indicates that `B` depends on `A` and may `waitFor` it during
dispatch.

```
                          /-------------\
            /------------>| ConfigStore |<------\
            |             \-------------/       |
            |                    ^              |
            |                    |              |
            |             /------------\  /-------------\
            | /---------->| NotesStore |  | SystemStore |
            | |           \------------/  \-------------/
            | |                  ^
            | |                  |
        /----------\  /--------------------\
        | GitStore |  | FilteredNotesStore |
        \----------/  \--------------------/
                                 ^
                                 |
                      /---------------------\
           /--------->| NotesSelectionStore |
           |          \---------------------/
           |                     ^
           |                     |
/--------------------\    /------------\
| NoteAnimationStore |    | FocusStore |
\--------------------/    \------------/
```

- `ConfigStore`: Reads configuration information from `~/.corpusrc`.
- `NotesStore`: Manages the set of all notes currently on disk.
- `FilteredNotesStore`: Manages the subset of notes from the `NotesStore` that
  are currently shown in the `NoteList.react` component, after any filtering
  (based on search terms) has been applied.
- `NotesSelectionStore`: Reflects the (possibly empty) subset of notes from the
  `FilteredNotesStore` that is currently selected.
- `FocusStore`: Tracks focus within the application between the three main areas
  of the UI (`OmniBar.react` across the top of the window, `NoteList.react` on
  the left side, and `Note.react` on the right side).
- `GitStore`: Takes Git snaphots (commits) of the filesystem when changes are
  persisted to disk.
- `SystemStore`: Gathers system-specific attributes.
- `NoteAnmationStore`: Tracks note animations ("bubbling" within
  `NoteList.react`).

## I/O operations

I/O operations are asynchronous and may depend on one another (for example, a
note rename followed by an update of the note's contents), so they are all
serialized via the `OperationsQueue`, which is a priority queue.

After each filesystem update in the queue completes, the `GitStore` inserts a
high-priority job at the head of the queue that records the new state of the
filesystem in a Git commit. In practice, the run-order of operations ends up
looking like this:

1. Rename a note (changes the note filename on the filesystem).
2. Create a Git commit.
3. Update note contents (update filesystem).
4. Create a Git commit.
