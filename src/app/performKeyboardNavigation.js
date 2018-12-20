/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

import Actions from './Actions';
import Keys from './Keys';
import selectFirst from './store/selectFirst';
import selectLast from './store/selectLast';
import selectNext from './store/selectNext';
import selectPrevious from './store/selectPrevious';

import type {StoreT} from './Store';

/**
 * Common keyboard navigation code used by NoteList and OmniBar components.
 */
function performKeyboardNavigation(event: KeyboardEvent, store: StoreT) {
  if (event.defaultPrevented) {
    // Event has already been handled.
    return;
  }

  switch (event.keyCode) {
    case Keys.DOWN:
      if (event.metaKey) {
        selectLast(store);
      } else if (event.shiftKey) {
        Actions.adjustNoteSelectionDown();
      } else {
        selectNext(store);
      }
      event.preventDefault();
      break;

    case Keys.ESCAPE:
      Actions.allNotesDeselected();
      // BUG Can't access store here...
      // store.set('focus')('OmniBar');
      event.preventDefault();
      break;

    case Keys.J:
      if (event.metaKey && !event.shiftKey && !event.altKey) {
        selectNext(store);

        // Intercept before the menu shortcut gets fired to avoid annoying
        // flicker and slowdown.
        event.preventDefault();
      }
      break;

    case Keys.K:
      if (event.metaKey && !event.shiftKey && !event.altKey) {
        selectPrevious(store);

        // Intercept before the menu shortcut gets fired to avoid annoying
        // flicker and slowdown.
        event.preventDefault();
      }
      break;

    case Keys.UP:
      if (event.metaKey) {
        selectFirst(store);
      } else if (event.shiftKey) {
        Actions.adjustNoteSelectionUp();
      } else {
        selectPrevious(store);
      }
      event.preventDefault();
      break;
  }
}

export default performKeyboardNavigation;
