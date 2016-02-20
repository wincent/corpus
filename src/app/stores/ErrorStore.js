/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

'use strict';

import Actions from '../Actions';
import Store from './Store';

/**
 * Not a persistent store; just takes error messages and logs them to the
 * console. We might build a dedicated log-viewing UI later on, in which case
 * this will become a "real" store.
 */
class ErrorStore extends Store {
  handleDispatch(payload) {
    switch (payload.type) {
      case Actions.ERROR_LOGGED:
        console.error(payload.message); // eslint-disable-line no-console
        this.emit('change');
        break;
    }
  }
}

export default new ErrorStore();
