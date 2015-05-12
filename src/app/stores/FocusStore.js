// Copyright 2015-present Greg Hurrell. All rights reserved.
// Licensed under the terms of the MIT license.

'use strict';

import {EventEmitter} from 'events';

import Actions from '../Actions';
import Dispatcher from '../Dispatcher';

let focus = 'OmniBar';

Dispatcher.register(payload => {
  switch (payload.type) {
    case Actions.OMNI_BAR_FOCUS_REQUESTED:
      focus = 'OmniBar';
      FocusStore.emit('change');
      break;
  }
});

const FocusStore = {
  get focus() {
    return focus;
  },
  ...EventEmitter.prototype,
};

export default FocusStore;
