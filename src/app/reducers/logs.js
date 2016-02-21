/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

import {
  List as ImmutableList,
  Map as ImmutableMap,
} from 'immutable';
import Actions from '../Actions';

export default function logs(state = ImmutableList(), action) {
  switch (action.type) {
    case Actions.LOG_ERROR:
    case Actions.LOG_WARNING:
      return state.push(ImmutableMap({
        level: action.level,
        message: action.message,
      }));
  }
  return state;
}
