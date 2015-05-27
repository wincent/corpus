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

- deal with boot-time races (ie. order of initialization of ConfigStore, GitStore etc)
- make Command-Delete and Command-R work when OmniBar or Note are focused, like nvALT
- make `ContentEditable` agnostic (no stores, no actions)
- can I use setState((state, props) => {}) to clean up some of my gnarly logic?
- tab in note should insert a tab; shift-tab should go back to OmniBar
- remember and restore cursor position when focusing Note textarea
- LEFT/RIGHT when NoteList has focus should move cursor to beginning end in OmniBar (and focus it, obviously)
- note creation when hitting Enter on a title that doesn't exist yet
- fix missing scrollbars (this is intermittent; not sure of cause)
- integrate Flow
- standardize approach to state-based style overrides; I have a few different techniques at play at the moment
- tidy up ugly handling of current-selected-index `null` values
- implement contextual menu for <NoteView>
- typing when NotePreview is focused should shift focus to OmniBar and insert (search)
- write tests for the logic in NotesSelectionStore; it's pretty complicated
- write linter (plugin?) that warns if files don't have license headers
- option-drag from NoteList to TextEdit etc should drag path(s); to Finder should copy actual file(s)
- Command-R to rename a note (focuses title in NotePreview)
- Command-Delete to delete a note (shows confirmation dialog, and is undoable with Command-Z)
- Save/Restore cursor position when moving between notes
- watch filesystem to notice external updates
- gracefully handle files going missing (and restoring); use case is mountable filesystems
- resolve clash of Command-R accelerators (using it for rename and reload); reloading shouldn't be too easy for users to do accidentally
- show pie chart indicator showing file reading/indexing progress
- implement "Show in Finder"
- add some more structure: "components" (React components), "util[?]" (data structures, reusable stuff?)

NICE TO HAVES

- figure out how to detect system color preference (Graphite vs Aqua) and change styles accordingly (eg. selections/focused in notelist, which is #095cdc in nvALT's Aqua mode)
- implment double-click-to-tag (lower half of <NotePreview>)
- i18n
- generated documentation
- show Git diffs in-app (Might take inspiration from Gundo)
- handle notes with duplicate titles (nvALT does this with suffixes eg. "foo.txt", "foo.1.txt", "foo.2.txt" etc)

IDEAS

- to avoid building a proper prefs UI (yet), use a dotfile for config
- use codemirror to get some stuff for free (syntax highlighting, vim mode)
- note that scroll jank is most noticeable when we prepend or delete from the front of the note list; so, we could make a point of not doing that (ie. when scrolling down, always only extend down; when scrolling up, insert everything in one go); the main reason we want to hide the non-visible bits is to make separator drags and window resizing fast, so we could actually do the hiding when idle, after scrolling stops.
- alternatively, make scrolling cheaper for React by getting it to do fewer DOM operations (probably smarter use of keys); I notice that appending is (relatively) fast; perhaps we can re-number keys to make it look like we're never appending, just reshuffling?
- use Uglify to remove dead code etc, including from node_modules dependencies

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
- [DONE] make `Store` base class and inherit some functionality from it to DRY up stores
- [DONE] implement notes-list ordering based on last-updated timestamp
- [DONE] Command+L should focus OmniBar (note: this will require us to build that focus store? or can we just listen directly via ipc?)
- [DONE] Escape should unfocus the NoteList and clear the selection (done) and revert focus to OmniBar (not yet done)
- [DONE] Escape should also unfocus Note view, clear the selection and revert focus to OmniBar
- [DONE] optimize rendering with large numbers of notes (basically at 60fps so ok for now)
- [DONE] get app icon
- [DONE] can we make menu operations faster? (Command-{J,K} is crappily slow; {UP,DOWN} is ultra-fast); note that in nvALT there are menu items with those shortcuts defined, but the menu does not highlight when they are pressed, indicating some kind of bypass is in effect [see NotesTableView.m:922]
- [DONE] investigate performance regression when dragging separator (or resizing window); profiler shows a lot of time being spent in layout, I suspect flex-box may be the culprit; I should compare it to a non-flexy approach (I did a quick experiment and its still pretty slow)
- [DONE] "Select All" scrolls to bottom of NotesList
- [DONE] "Select All" is broken (or rather, doesn't work when the note list is focus)
- [DONE] bug: when you deselect the last note in a selection, we scroll to the top
- [DONE] update separator and resizing behavior to match nvALT
- [DONE] resizing is slow, and you can see white background in the window in the interim (not even a background color on body/html fixes this....); reducing the number of notes in the `NoteList` does fix it, however (as does reducing the amount of text in each preview...)... which suggests I need a fixed-data-table-like thing
- [DONE] Investigate scroll slow-down (press-and-hold DOWN key; observe it slow down the farther you go, but if you release then press-and-hold it again it gets faster once more)
- [DONE] fix slight <Separator> drift when resizing window
- [DONE] possibly use dependent FilteredNotesStore (`waitFor` NotesStore) as a basis for filtered view; this ends up being the one that (most) of the app actually cares about)
- [DONE] on typing, if there is a prefix match, autocomplete
  - eg. given a note titled "foo bar baz"
  - if you type "foo"
  - omnibar should show "foo[ bar baz]" ([] indicates selected text)
  - and note view should show that note
  - and note list should show that note selected at the top
- [DONE] toggle icon-search for icon-pencil
  - when field empty: search
  - when field contains title of an existing note: pencil
  - when field contains text found in notes but not titles: search
  - when field contains text not found anywhere: search
  - when editing: pencil
- [DONE] clicking on the separator focuses it; you have to tab or shift-tab to remove focus
- [DONE] in nvALT, when you click on the note placeholder, the OmniBar retains focus
- [DONE] textarea focus doesn't seem to be working; where is the cursor? I have to click to edit (and I have to click twice...)
- [DONE] implement OmniBar search (note this is a full-text search; still need to decide whether to delegate to `git grep`, but for now we'll start with the in-memory store, and no index)
- [DONE] OmniBar should have search icon in it whenin search mode (and pen icon when in write mode) [can we build a Font Awesome subset?]
- [DONE] want a three-tab cycle (OmniBar -> NoteList -> Note) but we have a four-tab cycle (Body -> OmniBar -> NoteList -> Note); when body is active the focus is invisible [but curiously, when the NoteList has no selection, we _do_ have a three-tab cycle; but some CSS debugging shows the third item is still the body...]
- [DONE] click on note doesn't always focus it...
- [DONE] tab from OmniBar should focus current note, or do nothing if there is no current note
- [DONE] Fix tab-index stuff; I want a three-step cycle, but there are some hidden elements getting focus (body, for example becomes document.activeElement)
- [DONE] add "NOTE_TOUCHED" action whenever a note is modified (bubbles it to the top); note that we can assume this will only happen to one note at once (single selection)
- [DONE] update babel-lint (current master visits decorators, which means no more spurious unused variable warnings)
- [DONE] fix contextual menu lag; Atom doesn't have the problem... [update: yes it does, in the tree view...]
- [DONE] figure out how to disable menu items conditionally (eg. Rename, Delete tec)
- [DONE] put linting in Gulp too (probably watching?)
- [DONE] add note deletion (contextual menu, menu etc)
- [DONE] implement contextual menu for <NotePreview>
- [DONE] note possibility of file-system races with all my async code; I am assuming writes finish before I try to do subsequent dependent writes; I should make the dependency explicit

# vim: set nowrap:
