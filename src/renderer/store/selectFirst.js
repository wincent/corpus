/**
 * Copyright 2018-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow strict
 */

import FrozenSet from '../util/FrozenSet';

import type {StoreT} from '../Store';

export default function selectFirst(store: StoreT) {
  store.setFrom_EXPERIMENTAL(store => {
    let selection;
    if (store.get('filteredNotes').length) {
      selection = new FrozenSet([0]);
    } else {
      selection = new FrozenSet();
    }
    store.set('selection')(selection);
  });
}
