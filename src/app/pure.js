// Copyright 2015-present Greg Hurrell. All rights reserved.
// Licensed under the terms of the MIT license.

'use strict';

import shallowEqual from 'react/lib/shallowEqual';

function shouldComponentUpdate(nextProps, nextState) {
  return (
    !shallowEqual(this.props, nextProps) ||
    !shallowEqual(this.state, nextState)
  );
}

export default function pure(target) {
  if (target.prototype.hasOwnProperty('shouldComponentUpdate')) {
    throw new Error(
      target.name +
      " already implements shouldComponentUpdate: can't use @pure"
    );
  }
  target.prototype.shouldComponentUpdate = shouldComponentUpdate;
};
