/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow strict-local
 */

import fs from 'fs';
import {promisify} from 'util';
import configFile from './configFile';
import * as log from './log';
import stripComments from './stripComments';

const readFile = promisify(fs.readFile);

export type Config = {|
  notesDirectory: string,
  noteFontFamily: string,
  noteFontSize: string,
|};

export default async function loadConfig(): Promise<{[key: string]: mixed}> {
  try {
    log.debug(`Loading configuration file: ${configFile}`);
    const data = await readFile(configFile);
    return JSON.parse(stripComments(data.toString()));
  } catch (error) {
    log.warn(`Reading ${configFile}: ${error.message}`);
  }
}
