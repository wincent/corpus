/**
 * Copyright 2018-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow strict
 */

import FrozenSet from '../util/FrozenSet';

import type {StoreT} from '../Store';

/**
 * Selects the specified note (exclusively, replacing any previous selection).
 *
 * See `addNoteToSelection()` for the non-exclusive alternative.
 */
export default function selectNote(index: number, store: StoreT) {
  store.set('selection')(new FrozenSet([index]));
}
