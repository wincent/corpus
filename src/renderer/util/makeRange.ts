/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

/**
 * Create a "range" -- an array containing monotonically increasing integers,
 * starting at 0 -- of the specified size.
 */
export default function makeRange(size: number) {
  return Array.from(new Array(size), (_, i) => i);
}
