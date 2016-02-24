/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

import Actions from './Actions';

export function error(message) {
  console.error(message); // eslint-disable-line no-console

  // Yes, hideous global state; see explaination in src/index.js.
  if (global.store) {
    Actions.logError(message, global.store);
  }
}

export function warn(message) {
  console.warn(message); // eslint-disable-line no-console

  // Yes, hideous global state; see explaination in src/index.js.
  if (global.store) {
    Actions.logWarning(message, global.store);
  }
}
