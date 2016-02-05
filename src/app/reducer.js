/**
 * Copyright 2016-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

'use strict';

import {combineReducers} from 'redux';
import passthroughReducer from './reducers/passthroughReducer';

const reducer = combineReducers({
  passthroughReducer,
});

export default reducer;
