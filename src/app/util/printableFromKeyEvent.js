/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow strict
 */

export default function printableFromKeyEvent(
  event: SyntheticKeyboardEvent<>,
): ?string {
  if (event.metaKey) {
    // Potential menu short-cuts should never be printable.
    return null;
  }

  if (event.key.length === 1) {
    // Non-printable keys will have length > 1 (eg. "Shift", "F1" etc).
    return event.key;
  }

  return null;
}
