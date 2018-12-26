/**
 * Copyright 2016-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow strict
 */

export opaque type UUID = number;

/**
 * Monotonically increasing, unique ID for each note.
 */
let id = 0;

/**
 * Returns a unique "UUID" used to identify a given note.
 */
export default function getUUID(): UUID {
  return id++;
}
