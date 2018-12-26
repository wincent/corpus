/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow strict
 */

import path from 'path';
import nullthrows from './nullthrows';

const configFile =
  process.env.CORPUSRC ?? path.join(nullthrows(process.env.HOME), '.corpusrc');

export default configFile;
