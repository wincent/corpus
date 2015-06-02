/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

'use strict';

/**
 * Debounce implementation that fires on the trailing edge only. If a call comes
 * in when a pending call is yet to be finalized, it replaces the pending call.
 */
export default function debounce(fn, interval) {
  let timeout = null;
  return function() {
    const args = arguments;
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(context, args), interval);
  };
}
