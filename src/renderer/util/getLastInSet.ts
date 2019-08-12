/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

/**
 * Helper function to get last item from an ES6 Set via iteration.
 */
export default function getLastInSet<T>(set: Set<T>): T | undefined {
  let index = 0;

  const size = set.size;

  for (const value of set) {
    if (index === size - 1) {
      return value;
    }
    index++;
  }
}
