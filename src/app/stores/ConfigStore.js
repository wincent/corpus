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

const configFile = path.join(process.env.HOME, '.corpusrc');
let config = ImmutableMap(defaults);

const mergerConfig = {
  notesDirectory(previousValue, nextValue, key) {
    const value = requireString(nextValue, previousValue, key);
    return value.replace(/^~/, process.env.HOME);
  },
};

function requireString(maybeString, defaultValue, key) {
  if (Object.prototype.toString.call(maybeString) === '[object String]') {
    return maybeString;
  } else {
    warn(`Reading ${configFile}: expected string value for key: ${key}`);
    return defaultValue;
  }
}

function merger(previousValue, nextValue, key) {
  if (key in mergerConfig) {
    return mergerConfig[key](previousValue, nextValue, key);
  } else {
    // Superfluous key.
    return null;
  }
}

async function readConfig() {
  try {
    const data = await readFile(configFile);
    config = config.mergeWith(merger, JSON.parse(data.toString()));
  } catch(error) {
    warn(`Reading ${configFile}: ${error.message}`);
  }
  Actions.configLoaded();
}

class ConfigStore extends Store {
  constructor() {
    super();
    requestAnimationFrame(readConfig);
  }

  handleDispatch(payload) { // eslint-disable-line no-unused-vars
    // Required override, but we have nothing to do.
  }

  get config() {
    return config;
  }
}

export default new ConfigStore();
