/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

'use strict';

/**
 * Prepares a normalized version of `text` suitable for writing to the
 * file-system.
 */
export default function normalizeText(text: string): string {
  // Ensure trailing newline at end of file.
  return text.replace(/([^\n])$/, '$1\n');
}
