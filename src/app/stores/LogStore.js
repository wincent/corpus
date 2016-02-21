/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

import {List as ImmutableList} from 'immutable';
import logs from '../reducers/logs';
import createFluxStore from './createFluxStore';

const state = ImmutableList();
const LogStore = createFluxStore(logs, state);

export default LogStore;
