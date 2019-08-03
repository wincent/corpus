/**
 * Copyright 2018-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow strict
 */

import selectLast from './selectLast';
import getLastInSet from '../getLastInSet';
import FrozenSet from '../util/FrozenSet';

import type {StoreT} from '../Store';

export default function selectPrevious(store: StoreT) {
  store.setFrom_EXPERIMENTAL(store => {
    const mostRecent = getLastInSet(store.get('selection'));
    if (mostRecent == null) {
      selectLast(store);
    } else if (mostRecent > 0) {
      store.set('selection')(new FrozenSet([mostRecent - 1]));
    }
  });
}
