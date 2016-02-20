/**
 * Copyright 2016-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

'use strict';

import {combineReducers} from 'redux';
import logs from './reducers/logs';

const reducer = combineReducers({
  logs,
});

export default reducer;
