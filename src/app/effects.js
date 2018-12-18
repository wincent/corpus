/**
 * Copyright 2018-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

import {withLogger} from 'undux';

import type {StoreEffects} from './Store';

const effects: StoreEffects = store => {
  return withLogger(store);
};

export default effects;
