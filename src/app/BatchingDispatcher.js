/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

import {Dispatcher} from 'flux';
import {batchedUpdates} from 'react-dom/lib/ReactUpdates';

export default class BatchingDispatcher extends Dispatcher {
  dispatch(payload) {
    batchedUpdates(() => super.dispatch(payload));
  }
}
