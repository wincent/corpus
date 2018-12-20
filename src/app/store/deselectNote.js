/**
 * Copyright 2018-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow strict
 */

import type {StoreT} from '../Store';

export default function deselectNote(index: number, store: StoreT) {
  store.setFrom_EXPERIMENTAL(store => {
    const selection = new Set(store.get('selection'));
    selection.delete(index);
    store.set('selection')(selection);
  });
}
