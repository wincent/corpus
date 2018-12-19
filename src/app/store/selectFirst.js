/**
 * Copyright 2018-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow strict
 */

import type {StoreT} from '../Store';

export default function selectFirst(store: StoreT) {
  store.setFrom_EXPERIMENTAL(store => {
    let selection;
    if (store.get('filteredNotes').length) {
      selection = new Set([0]);
    } else {
      selection = new Set();
    }
    store.set('selection')(selection);
  });
}
