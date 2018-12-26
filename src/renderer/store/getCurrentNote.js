/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

import type {Note, StoreT} from '../Store';

export default function getCurrentNote(store: StoreT): ?Note {
  if (store.get('selection').size === 1) {
    return store.get('selectedNotes')[0];
  } else {
    return null;
  }
}
