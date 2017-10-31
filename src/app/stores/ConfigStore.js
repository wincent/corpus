/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

import {Record as ImmutableRecord} from 'immutable';
import path from 'path';
import process from 'process';

import Actions from '../Actions';
import Store from './Store';
import configFile from '../configFile';
import loadConfig from '../loadConfig';
import * as log from '../log';

const defaults = {
  notesDirectory: path.join(
    process.env.HOME,
    'Library',
    'Application Support',
    'Corpus',
    'Notes',
  ),
  noteFontFamily: 'Monaco',
  noteFontSize: '12',
};

const Config = ImmutableRecord(defaults);
let config = new Config({});

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
    log.warn(`Reading ${configFile}: expected string value for key: ${key}`);
    return '' + maybeString;
  }
}

function validateAndStore(maybeObject) {
  Object.keys(maybeObject).forEach(key => {
    try {
      const value =
        key in mergerConfig
          ? mergerConfig[key](maybeObject[key], key)
          : requireString(maybeObject[key], key);
      config = config.set(key, value);
    } catch (error) {
      log.warn(`Problem with key ${key} in ${configFile}: ${error}`);
    }
  });
}

class ConfigStore extends Store {
  constructor() {
    super();
    requestAnimationFrame(async () => {
      const data = await loadConfig();
      if (data) {
        validateAndStore(data);
      }
      Actions.configLoaded();
    });
  }

  /* eslint-disable no-unused-vars */
  handleDispatch(payload) {
    /* eslint-enable no-unused-vars */
    // Required override, but we have nothing to do.
  }

  get config() {
    return config;
  }
}

export default new ConfigStore();
