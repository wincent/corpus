/**
 * Copyright 2016-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

'use strict';

import {createStore, applyMiddleware} from 'redux';
import sagaMiddleware from 'redux-saga';
import reducer from './reducer';
import saga from './saga';

const createStoreWithSaga = applyMiddleware(
  sagaMiddleware(saga)
)(createStore);

export default function configureStore(initialState) {
  return createStoreWithSaga(reducer, initialState);
}
