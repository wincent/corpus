/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

import Keys from '../Keys';

/**
 * Browser keycode handling is kind of crazy. In "keypress" handlers you get
 * ASCII values for keycodes, but in "keydown" handlers you get some crazy
 * JS-specific value.
 *
 * Deal with the keyIdentifier property instead, which is unambiguous, and
 * Chrome supports.
 */
export default function printableFromKeyEvent(event: Event): ?string {
  if (event.metaKey) {
    // Potential menu short-cuts should never be printable.
    return null;
  }

  const match = event.keyIdentifier.match(/^U\+([0-9A-F]{4})$/);
  if (match) {
    let codePoint = parseInt(match[1], 16);
    if (codePoint >= Keys.SPACE && codePoint <= Keys.TILDE) {
      // Printable ASCII.
      if (
        codePoint >= Keys.A && codePoint <= Keys.Z &&
        !event.shiftKey
      ) {
        codePoint += 32; // Make lowercase.
      }
      return String.fromCodePoint(codePoint);
    }
  }
  return null;
}
