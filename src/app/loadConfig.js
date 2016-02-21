/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

'use strict';

import Promise from 'bluebird';
import fs from 'fs';
import path from 'path';
import process from 'process';
import * as log from './log';

const readFile = Promise.promisify(fs.readFile);

const configFile = path.join(process.env.HOME, '.corpusrc');

export default async function loadConfig() {
  try {
    const data = await readFile(configFile);
    return JSON.parse(data.toString());
  } catch(error) {
    log.warn(`Reading ${configFile}: ${error.message}`);
  }
}
