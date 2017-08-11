/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

/**
 * Returns an escaped, case-insentive regular expression object suitable for
 * finding the literal string `string`.
 */
export default function stringFinder(string: string): RegExp {
  // From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
  return new RegExp(string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
}
