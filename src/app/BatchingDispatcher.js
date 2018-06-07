/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

import {Dispatcher} from 'flux';
import {unstable_batchedUpdates as batchedUpdates} from 'react-dom';

export default class BatchingDispatcher extends Dispatcher {
  dispatch(payload) {
    batchedUpdates(() => super.dispatch(payload));
  }
}
