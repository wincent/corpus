/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

'use strict';

import {Record as ImmutableRecord} from 'immutable';
import path from 'path';
import process from 'process';

import Actions from '../Actions';
import * as log from '../log';

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
    log.warn(`Reading ${configFile}: expected string value for key: ${key}`);
    return '' + maybeString;
  }
}
/**
 * Validates the new configuration in `maybeObject` and merges valid
 * configuration into `state`, returning a new `state`.
 */
function merge(state, maybeObject) {
  Object.keys(maybeObject).forEach(key => {
    try {
      const value = key in mergerConfig ?
        mergerConfig[key](maybeObject[key], key) :
        requireString(maybeObject[key], key);
      state = state.set(key, value);
    } catch(error) {
      log.warn(`Problem with key ${key} in ${configFile}: ${error}`);
    }
  });
  return state;
}

export default function config(state = new Config({}), action) {
  switch (action.type) {
    case Actions.CONFIG_LOADED:
      if (action.config) {
        return merge(state, action.config);
      } else {
        log.warn(`Config ${configFile} contents invalid`);
      }
      break;
  }
  return state;
}
