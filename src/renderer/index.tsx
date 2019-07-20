/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

import * as React from 'react';
import {render} from 'react-dom';

import Corpus from './components/Corpus';

const root = document.getElementById('root');

if (!root) {
  throw new Error('No #root element');
}

render(<Corpus />, root);
