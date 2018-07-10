/**
 * Copyright 2016-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow strict-local
 */

import path from 'path';
import process from 'process';
import {connect, createStore} from 'undux';
import configFile from './configFile';
import loadConfig from './loadConfig';
import * as log from './log';
import querySystem, {defaults as systemDefaults} from './querySystem';

import type {LogMessage} from './log';

type Focus = 'Note' | 'NoteList' | 'OmniBar' | 'TitleInput';

type State = {|
  'config.notesDirectory': ?string,
  'config.noteFontFamily': string,
  'config.noteFontSize': string,
  focus: Focus,
  log: Array<LogMessage>,
  'system.nameMax': number,
  'system.pathMax': number,
|};

const defaultConfig = {
  notesDirectory: path.join(
    process.env.HOME,
    'Library',
    'Application Support',
    'Corpus',
    'Notes',
  ),
};

const initialState: State = {
  'config.notesDirectory': null,
  'config.noteFontFamily': 'Monaco',
  'config.noteFontSize': '12',
  focus: 'OmniBar',
  log: [],
  'system.nameMax': systemDefaults.nameMax,
  'system.pathMax': systemDefaults.pathMax,
};

const store = createStore(initialState);

store.on('config.notesDirectory').subscribe(value => {
  log.info('Using notesDirectory: ' + value);
});

export const withStore = connect(store);

export type StoreProps = {|
  store: typeof store,
|};

function requireString(maybeString: mixed, key: string): string {
  // We can use a simple `typeof` check here instead of the more exotic
  // `Object.prototype.toString.call(maybeString) === '[object String]'`
  // because `maybeString` here comes from `loadConfig()` (and therefore
  // `JSON.parse()`), so we know we don't have to catch anything
  // "interesting" like strings created with `new String('...')` (which
  // have a `typeof` of "object").
  if (typeof maybeString === 'string') {
    return maybeString;
  }
  log.warn(`Reading ${configFile}: expected string value for key: ${key}`);
  return String(maybeString);
}

const mergerConfig = {
  notesDirectory(value: mixed, key: string) {
    const stringValue = requireString(value, key);
    return stringValue.replace(/^~/, process.env.HOME);
  },
};

loadConfig()
  .then(config => {
    Object.keys(config).forEach(key => {
      const prefixedKey = `config.${key}`;
      if (prefixedKey in initialState) {
        const value = config[key];
        store.set(prefixedKey)((mergerConfig[key] || requireString)(value));
      } else {
        log.warn(`Ignoring unsupported key ${key} in ${configFile}`);
      }
    });

    Object.entries(defaultConfig).forEach(([key, value]) => {
      if (!config.hasOwnProperty(key)) {
        store.set(`config.${key}`)(value);
      }
    });

    querySystem(config)
      .then(({nameMax, pathMax}) => {
        store.set('system.nameMax')(nameMax);
        store.set('system.pathMax')(pathMax);
      })
      .catch(log.error);
  })
  .catch(log.error);

export default store;
