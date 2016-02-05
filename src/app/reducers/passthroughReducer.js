/**
 * Copyright 2016-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

'use strict';

export default function passthroughReducer(state = {}, action) {
  switch (action.type) {
    default:
      return state;
  }
}
