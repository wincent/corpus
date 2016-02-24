/**
 * Copyright 2016-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

import {call, put, select} from 'redux-saga/effects';
import loadConfig from './loadConfig';
import querySystem from './querySystem';
import configSelector from './selectors/configSelector';

/**
 * Root saga, started when application boots.
 */
export default function* saga() {
  const rawConfig = yield call(loadConfig);
  yield put({type: 'CONFIG_LOADED', config: rawConfig});
  const config = yield select(configSelector);
  const info = yield call(querySystem, config);
  yield put({type: 'SYSTEM_INFO_LOADED', info});
}
