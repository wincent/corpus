FEATURES

Base features (motivating features):

- plain-text (Markdown) storage format
- Git-backed versioning
- toggleable editing mode: rich text editor -> preview as Formatted Markdown
- Vim mode
- note search (bonus points if it's fuzzy)

Parity with nvALT:

- tagging
- linking between articles

Nice to haves:

- syntax highlighting of source markdown (markdown is assumed everywhere)
- incremental search

MINUTIAE

- [DONE] make `Store` base class and inherit some functionality from it to DRY up stores
- fix missing scrollbars (this is intermittent; not sure of cause)
- optimize rendering with large numbers of notes (basically at 60fps so ok for now)
- fix slight <Separator> drift when resizing window
- implement notes-list ordering based on last-updated timestamp
- add "NOTE_TOUCHED" action whenever a note is modified (bubbles it to the top); note that we can assume this will only happen to one note at once (single selection)
- implement OmniBar search (note this is a full-text search; still need to decide whether to delegate to `git grep`, but for now we'll start with the in-memory store, and no index)
- put linting in Gulp too (probably watching?)
- integrate Flow
- get app icon
- standardize approach to state-based style overrides; I have a few different techniques at play at the moment
- tidy up ugly handling of current-selected-index `null` values
- implement contextual menu for <NoteView>
- implement contextual menu for <NotePreview>
- tab from OmniBar should focus current note, or do nothing if there is no current note
- tab in note should insert a tab; shift-tab should go back to OmniBar
- typing when NotePreview is focused should shift focus to OmniBar and insert
- OmniBar should have search icon in it whenin search mode (and pen icon when in write mode) [can we build a Font Awesome subset?]
- Command+L should focus OmniBar (note: this will require us to build that focus store? or can we just listen directly via ipc?)
- Escape should unfocus the NoteList and clear the selection (done) and revert focus to OmniBar (not yet done)
- Escape should also unfocus Note view, clear the selection and revert focus to OmniBar
- write tests for the logic in NotesSelectionStore; it's pretty complicated
- write linter (plugin?) that warns if files don't have license headers
- option-drag from NoteList to TextEdit etc should drag path(s); to Finder should copy actual file(s)
- Fix tab-index stuff; I want a three-step cycle, but there are some hidden elements getting focus (body, for example becomes document.activeElement)
- Command-R to rename a note (focuses title in NotePreview)
- build inverted index to make searching faster; or use IndexedDB (if Electron supports it, and if it looks like it will be faster); will need an index for title names and also for full-text search (although note: IndexedDB has no equivalent of the SQL "LIKE" keyword, so if I want that, I'll need to store multiple keys as substrings)
- Command-Delete to delete a note (shows confirmation dialog, and is undoable with Command-Z)
- Save/Restore cursor position when moving between notes
- Investigate scroll slow-down (press-and-hold DOWN key; observe it slow down the farther you go, but if you release then press-and-hold it again it gets faster once more)
- in nvALT, when you click on the note placeholder, the OmniBar retains focus
- possibly use dependent FilteredNotesStore (`waitFor` NotesStore) as a basis for filtered view; this ends up being the one that (most) of the app actually cares about)
- watch filesystem to notice external updates

NICE TO HAVES

- figure out how to detect system color preference (Graphite vs Aqua) and change styles accordingly (eg. selections/focused in notelist, which is #095cdc in nvALT's Aqua mode)
- implment double-click-to-tag (lower half of <NotePreview>)
- i18n
- generated documentation
- show Git diffs in-app (Might take inspiration from Gundo)

BUGS

- clicking on the separator focuses it; you have to tab or shift-tab to remove focus
- want a three tab cycle (OmniBar -> NoteList -> Note) but we have a four-tab cycle (Body -> OmniBar -> NoteList -> Note); when body is active the focus is invisible

IDEAS

- use codemirror to get some stuff for free (syntax highlighting, vim mode)

ARCHIVES

- [DONE] get started with Electron: https://github.com/atom/electron
- [DONE] potentially check out: https://github.com/atom/electron-starter
- [DONE] get Babel working
- [DONE] figure out how to bootstrap render processes (require modules etc)
- [DONE] is it possible to render directly from JS without an intermediate HTML file?
- [DONE] get basic view layout working (search box up top, list on left, note on right)
- [DONE] stop gulp watch task from dying when there's an error (again; I thought I'd done this, but it doesn't seem to catch all errors)
- [DONE] add JS linting, probably via ESLint (http://eslint.org)
- [DONE] add linear gradient to OmniBar to extend window title
- [DONE] switch OmniBar gradient when window goes into the background
- [DONE] hook BrowserWindow.toggleDevTools up to a menu item
- [DONE] make split view slider draggable
- [DONE] figure out how to disable text-selection in the note if we drag over it while dragging separator
- [DONE] separator constraints: notes area shouldn't ever be < 50%, but can collapse list side entirely
- [DONE] add Flux to handle data access
- [DONE] focused and selected styling for NotePreviews
- [DONE] set up "accelerator" short-cuts for next/prev note (nvALT actually has these in the "View" menu)
- [DONE] implement click-to-focus on <NotePreview>
- [DONE] use Immutable.js because it's cool
- [DONE] implement double-click-to-edit-title on <NotePreview> (also, switch to `cursor: text` when hovering and editing)
- [DONE] fix grabbing cursor during <Separator> drags
- [DONE] read files off disk instead of using fake data (to decide: load whole files or just snippets and lazy-load the rest)
- [DONE] <NoteView> should never scroll sideways (it is now, which may account for the missing scrollbars)
- [DONE] for small windows, should collapse left pane once it shrinks below a certain size; heck, do it for big windows too
- [DONE] when no notes are selected, OmniBar should show placeholder text of "Search or Create"
- [DONE] Select a note, hold shift, tap up or down; it should do a range selection
- [DONE] Make range adjustment work with multiple selections with gaps between them
- [DONE] Select a note, hold command, tap up or down; it should select the first or last note
- [DONE] Escape when editing note preview subject should abort editing
- [DONE] fix: start drag in NoteList or NoteView up towards OmniBar and you see unwanted user-select
- [DONE] fix: text cursor shows up when hovering over "No Notes Selected"
- [DONE] BUG: Double-clicking NotePreview title performs a "Select All" on NoteList
- [DONE] consider throttling note navigation with {UP,DOWN} or better still, speed it up
- [DONE] should focus OmniBar on first load
- [DONE] "Select All" when NoteList has focus should select all notes:
- [DONE] fix bugs with selection range extension: select top note, select a lower note, shift-up to just before the top note, then up again and enter an infinite loop
- [DONE] focus ring for Omnibar, to match nvALT
- [DONE] Make decorator equivalent to PureRenderMixin for ES6 classes
- [DONE] {UP,DOWN} when OmniBar is focused move to next previous note, and highlight note title (overrides default text field behavior)
- [DONE] <NoteList> should scroll <NotePreview> intro view using Command+{J,K} or UP/DOWN to switch notes (and {Shift,Commmand}+{Up,DOWN} to jump etc)
- [DONE] tab when NotePreview is focused should shift to current note
- [DONE] Clearing (X, or hitting Escape) in OmniBar should scroll NoteList to top
