/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

/**
 * Helper function to get last item from an ES6 Set via iteration.
 */
export default function getLastInSet(set: Set<number>): ?number {
  let index = 0;
  const size = set.size;
  for (const value of set) {
    if (index === size - 1) {
      return value;
    }
    index++;
  }
}
