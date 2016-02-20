/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

'use strict';

import {Record as ImmutableRecord} from 'immutable';
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
  noteFontFamily: 'Monaco',
  noteFontSize: '12',
};

const Config = ImmutableRecord(defaults);
let config = new Config({});
const configFile = path.join(process.env.HOME, '.corpusrc');

const mergerConfig = {
  notesDirectory(value, key) {
    value = requireString(value, key);
    return value.replace(/^~/, process.env.HOME);
  },
};

function requireString(maybeString, key) {
  if (Object.prototype.toString.call(maybeString) === '[object String]') {
    return maybeString;
  } else {
    warn(`Reading ${configFile}: expected string value for key: ${key}`);
    return '' + maybeString;
  }
}

function validateAndStore(maybeObject) {
  Object.keys(maybeObject).forEach(key => {
    try {
      const value = key in mergerConfig ?
        mergerConfig[key](maybeObject[key], key) :
        requireString(maybeObject[key], key);
      config = config.set(key, value);
    } catch(error) {
      warn(`Problem with key ${key} in ${configFile}: ${error}`);
    }
  });
}

async function readConfig() {
  try {
    const data = await readFile(configFile);
    const parsed = JSON.parse(data.toString());
    validateAndStore(parsed);
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
