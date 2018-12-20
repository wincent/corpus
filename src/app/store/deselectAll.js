/**
 * Copyright 2018-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow strict
 */

import type {StoreT} from '../Store';

export default function deselectAll(store: StoreT) {
  store.set('selection')(new Set());
}
