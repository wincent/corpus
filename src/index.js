/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

import React from 'react'; // eslint-disable-line no-unused-vars
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import Corpus from './app/containers/Corpus.react';
import configureStore from './app/configureStore';

const store = configureStore();
const root = document.getElementById('app-root');

render(
  <Provider store={store}>
    <Corpus />
  </Provider>,
  root
);
