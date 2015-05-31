# Minutiae

- fix pre-delete snaphots (we don't actually flush unpersisted changes from a note that is currently being edited)
- take additional snapshots after certain amount of idle time without an FS write
- make Command-Delete and Command-R work when OmniBar or Note are focused, like nvALT
- make `ContentEditable` agnostic (no stores, no actions)
- can I use setState((state, props) => {}) to clean up some of my gnarly logic?
- tab in note should insert a tab; shift-tab should go back to OmniBar
- LEFT/RIGHT when NoteList has focus should move cursor to beginning end in OmniBar (and focus it, obviously)
- note creation when hitting Enter on a title that doesn't exist yet
- fix missing scrollbars (this is intermittent; not sure of cause)
- integrate Flow (currently blocked due to missing Flow support for many ES6 features)
- standardize approach to state-based style overrides; I have a few different techniques at play at the moment
- tidy up ugly handling of current-selected-index `null` values
- implement contextual menu for <NoteView>
- typing when NotePreview is focused should shift focus to OmniBar and insert (search)
- write tests for the logic in NotesSelectionStore; it's pretty complicated
- write linter (plugin?) that warns if files don't have license headers
- option-drag from NoteList to TextEdit etc should drag path(s); to Finder should copy actual file(s)
- Command-R to rename a note (focuses title in NotePreview)
- Command-Delete to delete a note (shows confirmation dialog, and is undoable with Command-Z)
- watch filesystem to notice external updates
- gracefully handle files going missing (and restoring); use case is mountable filesystems
- resolve clash of Command-R accelerators (using it for rename and reload); reloading shouldn't be too easy for users to do accidentally
- show pie chart indicator showing file reading/indexing progress
- add some more structure: "components" (React components), "util[?]" (data structures, reusable stuff?)
- save/restore cursor position across restarts

# Nice-to-haves

- figure out how to detect system color preference (Graphite vs Aqua) and change styles accordingly (eg. selections/focused in notelist, which is #095cdc in nvALT's Aqua mode)

# Ideas

- to avoid building a proper prefs UI (yet), use a dotfile for config
- use codemirror to get some stuff for free (syntax highlighting, vim mode)
- note that scroll jank is most noticeable when we prepend or delete from the front of the note list; so, we could make a point of not doing that (ie. when scrolling down, always only extend down; when scrolling up, insert everything in one go); the main reason we want to hide the non-visible bits is to make separator drags and window resizing fast, so we could actually do the hiding when idle, after scrolling stops.
- alternatively, make scrolling cheaper for React by getting it to do fewer DOM operations (probably smarter use of keys); I notice that appending is (relatively) fast; perhaps we can re-number keys to make it look like we're never appending, just reshuffling?
- use Uglify to remove dead code etc, including from node_modules dependencies

<!--- vim: set nowrap tw=0: -->
