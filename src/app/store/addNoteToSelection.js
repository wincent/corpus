/**
 * Copyright 2018-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow strict
 */

import type {StoreT} from '../Store';

/**
 * Selects the specified note (non-exclusively, adding it to any previous
 * selection).
 *
 * See `selectNote()` for the exclusive alternative.
 */
export default function addNoteToSelection(index: number, store: StoreT) {
  store.setFrom_EXPERIMENTAL(store => {
    const selection = new Set(store.get('selection'));
    selection.add(index);
    store.set('selection')(selection);
  });
}
