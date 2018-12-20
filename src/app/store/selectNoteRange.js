/**
 * Copyright 2018-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow strict
 */

import getLastInSet from '../getLastInSet';
import FrozenSet from '../util/FrozenSet';

import type {StoreT} from '../Store';

/**
 * Extends an existing selection by adding notes in the range of "the
 * last selected note" to `index`. Intended for use in a click handler
 * (ie. when the user does a Shift-Click on the NoteList component).
 */
export default function selectNoteRange(index: number, store: StoreT) {
  store.setFrom_EXPERIMENTAL(store => {
    const selection = new FrozenSet(store.get('selection'), set => {
      const start = getLastInSet(set) || 0;
      for (
        let i = Math.min(start, index), max = Math.max(start, index) + 1;
        i < max;
        i++
      ) {
        set.add(i);
      }
    });
    store.set('selection')(selection);
  });
}
