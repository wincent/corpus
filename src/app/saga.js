/**
 * Copyright 2016-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

'use strict';

import {put, take} from 'redux-saga';

export default function* saga() {
  yield take('SOME_ACTION');
  yield put({type: 'SOME_OTHER_ACTION'});
}
