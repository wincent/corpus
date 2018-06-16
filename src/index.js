/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

import 'babel-polyfill';
import React from 'react';
import {render} from 'react-dom';
import Corpus from './app/components/Corpus.react';

const root = document.getElementById('app-root');

render(<Corpus />, root);
