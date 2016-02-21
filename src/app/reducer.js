/**
 * Copyright 2016-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

'use strict';

import {combineReducers} from 'redux';
import config from './reducers/config';
import logs from './reducers/logs';

/**
 * Root reducer for the entire application.
 */
export default combineReducers({
  config,
  logs,
});
