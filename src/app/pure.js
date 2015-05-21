// Copyright 2015-present Greg Hurrell. All rights reserved.
// Licensed under the terms of the MIT license.

'use strict';

import shallowEqual from 'react/lib/shallowEqual';

/**
 * Implements a basic `shouldComponentUpdate` based on shallow comparison of
 * props and state. If the component is a "pure" function of its props and
 * state, it need not be updated unless those change.
 *
 * If a component implements its own `shouldComponentUpdate`, it may be called
 * as well. This is useful in a Flux world, where a component may wish to query
 * a store independently of props and state in order to decide whether to
 * render:
 *
 * - if shallow equality check of props and state fails, we return `true`; the
 *   component's `shouldComponentUpdate` method is not called
 * - if shallow equality check of props and state succeeds, and the component
 *   defined its own `shouldComponentUpdate, we call that and return the answer
 */
export default function pure(target) {
  let original = target.prototype.shouldComponentUpdate;

  function shouldComponentUpdate(nextProps, nextState) {
    const pureResult = (
      !shallowEqual(this.props, nextProps) ||
      !shallowEqual(this.state, nextState)
    );

    if (pureResult) {
      return true;
    } else if (original) {
      return original(nextProps, nextState);
    } else {
      return false;
    }
  }

  target.prototype.shouldComponentUpdate = shouldComponentUpdate;
}
