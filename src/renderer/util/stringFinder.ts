/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

/**
 * Returns an escaped, case-insentive regular expression object suitable for
 * finding the literal string `string`.
 */
export default function stringFinder(string: string): RegExp {
  // From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
  return new RegExp(string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
}
