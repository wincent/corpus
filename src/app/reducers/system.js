/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

import {Map as ImmutableMap} from 'immutable';

const defaults = {
  nameMax: 255,
  pathMax: 1024,
};

export default function system(state = new ImmutableMap(defaults), action) {
  switch (action.type) {
    case 'SYSTEM_INFO_LOADED':
      return state.merge(action.info);
  }
  return state;
}
