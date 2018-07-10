/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

import Actions from './Actions';
import Keys from './Keys';
import store from './store';

/**
 * Common keyboard navigation code used by NoteList and OmniBar components.
 */
function performKeyboardNavigation(event: KeyboardEvent) {
  if (event.defaultPrevented) {
    // Event has already been handled.
    return;
  }

  switch (event.keyCode) {
    case Keys.DOWN:
      if (event.metaKey) {
        Actions.lastNoteSelected();
      } else if (event.shiftKey) {
        Actions.adjustNoteSelectionDown();
      } else {
        Actions.nextNoteSelected();
      }
      event.preventDefault();
      break;

    case Keys.ESCAPE:
      Actions.allNotesDeselected();
      store.set('focus')('OmniBar');
      event.preventDefault();
      break;

    case Keys.J:
      // Intercept before the menu shortcut gets fired to avoid annoying
      // flicker and slowdown.
      if (event.metaKey && !event.shiftKey && !event.altKey) {
        Actions.nextNoteSelected();
        event.preventDefault();
      }
      break;

    case Keys.K:
      // Intercept before the menu shortcut gets fired to avoid annoying
      // flicker and slowdown.
      if (event.metaKey && !event.shiftKey && !event.altKey) {
        Actions.previousNoteSelected();
        event.preventDefault();
      }
      break;

    case Keys.UP:
      if (event.metaKey) {
        Actions.firstNoteSelected();
      } else if (event.shiftKey) {
        Actions.adjustNoteSelectionUp();
      } else {
        Actions.previousNoteSelected();
      }
      event.preventDefault();
      break;
  }
}

export default performKeyboardNavigation;
