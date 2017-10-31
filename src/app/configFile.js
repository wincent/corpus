/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

import path from 'path';
import process from 'process';

const configFile =
  process.env.CORPUSRC || path.join(process.env.HOME, '.corpusrc');

export default configFile;
