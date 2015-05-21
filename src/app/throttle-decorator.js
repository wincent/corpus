// Copyright 2015-present Greg Hurrell. All rights reserved.
// Licensed under the terms of the MIT license.

'use strict';

import throttle from './throttle';

export default function(interval: number) {
  return function(target, key, descriptor) {
    // Other decorators (eg. @autobind) may have set a getter on the descriptor
    // instead of a value, so check for both.
    let fn = descriptor.get ? descriptor.get() : descriptor.value;

    return {
      configurable: true,
      get() {
        const throttled = throttle(fn, interval);
        Object.defineProperty(this, key, {
          value: throttled,
          configurable: true,
          writable: true,
        });
        return throttled;
      },
    };
  };
}
