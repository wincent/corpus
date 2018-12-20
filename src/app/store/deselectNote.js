/**
 * Copyright 2018-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow strict
 */

import FrozenSet from '../util/FrozenSet';

import type {StoreT} from '../Store';

export default function deselectNote(index: number, store: StoreT) {
  store.setFrom_EXPERIMENTAL(store => {
    const selection = new FrozenSet(store.get('selection'), set => {
      set.delete(index);
    });
    store.set('selection')(selection);
  });
}
