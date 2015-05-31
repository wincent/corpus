/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

'use strict';

/**
 * Browser keycode handling is kind of crazy. In "keypress" handlers you get
 * ASCII values for keycodes, but in "keydown" handlers you get some crazy
 * JS-specific value.
 *
 * Deal with the keyIdentifier property instead, which is unambiguous, and
 * Chrome supports.
 */
export default function printableFromKeyEvent(event: Event): ?string {
  const match = event.keyIdentifier.match(/^U\+([0-9A-F]{4})$/);
  if (match) {
    const codePoint = parseInt(match[1], 16);
    if (codePoint >= 32 && codePoint < 127) {
      return String.fromCodePoint(codePoint);
    }
  }
  return null;
}
