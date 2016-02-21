/**
 * Copyright 2016-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

import {createStore, applyMiddleware} from 'redux';
import createSagaMiddleware from 'redux-saga';
import reducer from './reducer';
import saga from './saga';

export default function configureStore(initialState) {
  return createStore(
    reducer,
    initialState,
    applyMiddleware(createSagaMiddleware(saga))
  );
}
