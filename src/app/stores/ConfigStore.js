/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

'use strict';

import {Map as ImmutableMap} from 'immutable';
import Promise from 'bluebird';
import fs from 'fs';
import path from 'path';
import process from 'process';

import Actions from '../Actions';
import Store from './Store';
import warn from '../warn';

const readFile = Promise.promisify(fs.readFile);

const defaults = {
  notesDirectory: path.join(
    process.env.HOME,
    'Library',
    'Application Support',
    'Corpus',
    'Notes'
  ),
};

let config = ImmutableMap(defaults);

class ConfigStore extends Store {
  constructor() {
    super();

    const configFile = path.join(process.env.HOME, '.corpusrc');
    readFile(configFile)
      .then(data => config = config.merge(JSON.parse(data.toString())))
      .catch(error => warn(`Reading ${configFile}: ${error.message}`))
      .finally(Actions.configLoaded);
  }

  handleDispatch(payload) { // eslint-disable-line no-unused-vars
    // Required override, but we have nothing to do.
  }

  get config() {
    return config;
  }
}

export default new ConfigStore();
