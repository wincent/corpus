/**
 * Copyright 2018-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow strict
 */

import type {StoreT} from '../Store';

export default function selectAll(store: StoreT) {
  store.setFrom_EXPERIMENTAL(store => {
    const length = store.get('filteredNotes').length;
    const range = Array.from(new Array(length), (_, i) => i);
    store.set('selection')(new Set(range));
  });
}
