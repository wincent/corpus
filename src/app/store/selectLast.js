/**
 * Copyright 2018-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow strict
 */

import FrozenSet from '../util/FrozenSet';

import type {StoreT} from '../Store';

export default function selectLast(store: StoreT) {
  store.setFrom_EXPERIMENTAL(store => {
    let selection;
    const filteredNotes = store.get('filteredNotes');
    if (filteredNotes.length) {
      selection = new FrozenSet([filteredNotes.length - 1]);
    } else {
      selection = new FrozenSet();
    }
    store.set('selection')(selection);
  });
}
