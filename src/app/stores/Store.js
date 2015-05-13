// Copyright 2015-present Greg Hurrell. All rights reserved.
// Licensed under the terms of the MIT license.

'use strict';

import {EventEmitter} from 'events';

import Dispatcher from '../Dispatcher';

export default class Store extends EventEmitter {
  constructor() {
    super();
    this.dispatchToken = Dispatcher.register(this.handleDispatch.bind(this));
  }

  handleDispatch(payload) {
    throw new Error(
      this.constructor.name + ' does not implement handleDispatch'
    );
  }

  waitFor(...tokens) {
    Dispatcher.waitFor(tokens);
  }
}
