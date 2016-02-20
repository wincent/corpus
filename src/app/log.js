/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

'use strict';

import Actions from './Actions';

export function error(...args) {
  console.error(...args); // eslint-disable-line no-console
  Actions.errorLogged(...args);
}

export function warn(...args) {
  console.warn(...args); // eslint-disable-line no-console
  Actions.warningLogged(...args);
}
