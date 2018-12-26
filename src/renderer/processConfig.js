/**
 * Copyright 2016-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow strict
 */

import path from 'path';
import * as log from './log';
import nullthrows from '../common/nullthrows';

export type Config = {|
  +notesDirectory: string,
  +noteFontFamily: string,
  +noteFontSize: string,
|};

const HOME = nullthrows(process.env.HOME);

const DEFAULT_CONFIG: Config = Object.freeze({
  noteFontFamily: 'Monaco',
  noteFontSize: '12',
  notesDirectory: path.join(
    HOME,
    'Library',
    'Application Support',
    'Corpus',
    'Notes',
  ),
});

function expectString(maybeString: mixed, key: string): string {
  if (typeof maybeString === 'string') {
    return maybeString;
  }
  log.warn(
    `Expected string value for config key ${key} but got ${typeof maybeString}`,
  );
  return String(maybeString);
}

const CONFIG_NORMALIZERS = {
  notesDirectory(value: mixed, key: string) {
    const stringValue = expectString(value, key);
    return stringValue.replace(/^~/, HOME);
  },
  noteFontFamily: expectString,
  noteFontSize: expectString,
};

export default function processConfig(input: {[string]: mixed}): Config {
  const output = {
    ...DEFAULT_CONFIG,
  };

  for (const [key, value] of Object.entries(input)) {
    if (CONFIG_NORMALIZERS.hasOwnProperty(key)) {
      output[key] = CONFIG_NORMALIZERS[key](value);
    } else {
      log.warn(`Ignoring unsupported config key ${key}`);
    }
  }

  return Object.freeze(output);
}
