// Copyright 2015-present Greg Hurrell. All rights reserved.
// Licensed under the terms of the MIT license.

'use strict';

import Actions from './Actions';
import Keys from './Keys';

/**
 * Common keyboard navigation code used by NoteList and OmniBar components.
 */
function performKeyboardNavigation(event) {
  switch (event.keyCode) {
    case Keys.DOWN:
      if (event.metaKey) {
        Actions.lastNote();
      } else if (event.shiftKey) {
        Actions.adjustNoteSelectionDown();
      } else {
        Actions.nextNote();
      }
      event.preventDefault();
      break;

    case Keys.ESCAPE:
      Actions.deselectAll();
      Actions.focusOmniBar();
      break;

    case Keys.J:
      // Intercept before the menu shortcut gets fired to avoid annoying
      // flicker and slowdown.
      if (event.metaKey) {
        Actions.nextNote();
        event.preventDefault();
      }
      break;

    case Keys.K:
      // Intercept before the menu shortcut gets fired to avoid annoying
      // flicker and slowdown.
      if (event.metaKey) {
        Actions.previousNote();
        event.preventDefault();
      }
      break;

    case Keys.UP:
      if (event.metaKey) {
        Actions.firstNote();
      } else if (event.shiftKey) {
        Actions.adjustNoteSelectionUp();
      } else {
        Actions.previousNote();
      }
      event.preventDefault();
      break;
  }
}

export default performKeyboardNavigation;
