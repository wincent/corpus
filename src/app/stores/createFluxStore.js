/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

import Store from './Store';

export default function createFluxStore(reducer, state) {
  class WrappedReducerFluxStore extends Store {
    handleDispatch(payload) {
      const newState = reducer(state, payload);
      if (newState !== state) {
        state = newState;
        this.emit('change');
      }
    }
  }

  return new WrappedReducerFluxStore();
}
