/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

export type UUID = number;

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
