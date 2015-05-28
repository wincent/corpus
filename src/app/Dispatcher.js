/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

'use strict';

import {Dispatcher} from 'flux';
import {batchedUpdates} from 'react/lib/ReactUpdates';

class CorpusDispatcher extends Dispatcher {
  dispatch(payload) {
    batchedUpdates(() => super.dispatch(payload));
  }
}

export default new CorpusDispatcher();
