/**
 * Copyright 2016-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

'use strict';

import {put, take} from 'redux-saga/effects';

/**
 * Root saga, started when application boots.
 */
export default function* saga() {
  yield put({type: 'LOAD_CONFIG'});
  yield take({type: 'CONFIG_LOADED'});
}
