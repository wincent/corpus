GOALS

- get started with Electron: https://github.com/atom/electron
- potentially check out: https://github.com/atom/electron-starter
- get "self-hosted" ASAP

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
- implement click-to-focus on <NotePreview>
- implement double-click-to-edit on <NotePreview>
- put linting in Gulp too (probably watching?)
- integrate Flow
- for small windows, should collapse right pane once it shrinks below a certain size; heck, do it for big windows too
- get app icon
- standardize approach to state-based style overrides; I have a few different techniques at play at the moment

NICE TO HAVES

- figure out how to detect system color preference (Graphite vs Aqua) and change styles accordingly (eg. selections/focused in notelist, which is #095cdc in nvALT's Aqua mode)

IDEAS

- use codemirror to get some stuff for free (syntax highlighting, vim mode)
- use Immutable.js because it's cool
