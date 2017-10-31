/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

import Promise from 'bluebird';
import fs from 'fs';
import configFile from './configFile';
import * as log from './log';
import stripComments from './stripComments';

const readFile = Promise.promisify(fs.readFile);

export default async function loadConfig() {
  try {
    const data = await readFile(configFile);
    return JSON.parse(stripComments(data.toString()));
  } catch (error) {
    log.warn(`Reading ${configFile}: ${error.message}`);
  }
}
