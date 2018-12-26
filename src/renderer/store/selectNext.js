/**
 * Copyright 2018-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow strict
 */

import selectFirst from './selectFirst';
import getLastInSet from '../getLastInSet';
import FrozenSet from '../util/FrozenSet';

import type {StoreT} from '../Store';

export default function selectNext(store: StoreT) {
  store.setFrom_EXPERIMENTAL(store => {
    const mostRecent = getLastInSet(store.get('selection'));
    if (mostRecent == null) {
      selectFirst(store);
    } else {
      const maxSelectionIndex = store.get('filteredNotes').length - 1;
      if (mostRecent < maxSelectionIndex) {
        store.set('selection')(new FrozenSet([mostRecent + 1]));
      }
    }
  });
}
