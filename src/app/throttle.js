/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

/**
 * Throttle implementation that fires on the leading and trailing edges.
 * If a call comes in when a pending call is yet to be processed, it replaces
 * the pending call.
 *
 * @see throttle-decorator
 */
export default function throttle(fn, interval) {
  let timeout = null;
  let last = null;
  return function() {
    const args = arguments;
    const context = this;
    const now = Date.now();
    if (timeout === null) {
      timeout = setTimeout(() => timeout = null, interval);
      last = now;
      fn.apply(context, args);
    } else {
      const remaining = Math.max(last + interval - now, 0);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        timeout = setTimeout(() => timeout = null, interval);
        last = now;
        fn.apply(context, args);
      }, remaining);
    }
  };
}
