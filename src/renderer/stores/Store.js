/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

import EventEmitter from 'events';

import Dispatcher from '../Dispatcher';

import type {DispatchToken} from 'flux/lib/Dispatcher';

export default class Store extends EventEmitter {
  dispatchToken: DispatchToken;

  constructor() {
    super();
    this.dispatchToken = Dispatcher.register(this.handleDispatch.bind(this));
  }

  /* eslint-disable no-unused-vars */
  handleDispatch(payload: Object) {
    /* eslint-enable no-unused-vars */
    throw new Error(
      this.constructor.name + ' does not implement handleDispatch',
    );
  }

  waitFor(...tokens: Array<DispatchToken>) {
    Dispatcher.waitFor(tokens);
  }
}
