/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

import React from 'react'; // eslint-disable-line no-unused-vars
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import Corpus from './app/components/Corpus.react';
import configureStore from './app/configureStore';

const store = configureStore();
const root = document.getElementById('app-root');

// Throughout most of the app we can access `dispatch` from components.
// But we might need to emit log events from other places too; use this global
// hack for those cases. Sad that this is a global, but we're not a server app,
// so no concurrent access to worry about, and the alternatives all suck (not
// doing logging via Redux, trying to thread a dispatcher throught in a bunch of
// inconvenient places etc).
global.store = store;

render(
  <Provider store={store}>
    <Corpus />
  </Provider>,
  root
);
