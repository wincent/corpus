/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow strict
 */

export default function clamp(
  value: number,
  minimum: number,
  maximum: number,
): number {
  if (minimum <= maximum) {
    return Math.min(Math.max(value, minimum), maximum);
  } else {
    return NaN;
  }
}
