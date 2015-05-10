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

- make `Store` base class and inherit some functionality from it to DRY up stores
- fix missing scrollbars (this is intermittent; not sure of cause)
- optimize rendering with large numbers of notes (basically at 60fps so ok for now)
- <NoteList> should scroll <NotePreview> intro view using Command+{J,K} or UP/DOWN to switch notes (and {Shift,Commmand}+{Up,DOWN} to jump etc)
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
- tab when NotePreview is focused should shift to current note
- typing when NotePreview is focused should shift focus to OmniBar and insert
- OmniBar should have search icon in it whenin search mode (and pen icon when in write mode) [can we build a Font Awesome subset?]
- Command+L should focus OmniBar
- Escape should unfocus the NoteList and clear the selection (focus reverts to OmniBar)
- write tests for the logic in NotesSelectionStore; it's pretty complicated
- write linter (plugin?) that warns if files don't have license headers
- [DONE] fix: start drag in NoteList or NoteView up towards OmniBar and you see unwanted user-select
- fix: text cursor shows up when hovering over "No Notes Selected"
- option-drag from NoteList to TextEdit etc should drag path(s); to Finder should copy actual file(s)
- don't need FocusStore; can just subscribe to Select-All in notes list via ipc and do the action if currently have focus

NICE TO HAVES

- figure out how to detect system color preference (Graphite vs Aqua) and change styles accordingly (eg. selections/focused in notelist, which is #095cdc in nvALT's Aqua mode)
- implment double-click-to-tag (lower half of <NotePreview>)
- i18n
- generated documentation
- show Git diffs in-app (Might take inspiration from Gundo)

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
