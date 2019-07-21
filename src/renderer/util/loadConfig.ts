/**
 * @copyright Copyright (c) 2019-present Greg Hurrell
 * @license MIT
 */

import * as fs from 'fs';
import * as path from 'path';
import {promisify} from 'util';

import stripComments from './stripComments';

const readFile = promisify(fs.readFile);

const HOME = process.env.HOME!;

const configFile = process.env.CORPUSRC || path.join(HOME, '.corpusrc');

export default async function loadConfig(): Promise<Config> {
  try {
    const data = await readFile(configFile);
    return processConfig(JSON.parse(stripComments(data.toString())));
  } catch (error) {
    console.warn(`Reading ${configFile}: ${error.message}`);
    return processConfig();
  }
}

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

function expectString(maybeString: unknown, key: string): string {
  if (typeof maybeString === 'string') {
    return maybeString;
  }
  console.warn(
    `Expected string value for config key ${key} but got ${typeof maybeString}`,
  );
  return String(maybeString);
}

const CONFIG_NORMALIZERS = {
  notesDirectory(value: unknown, key: string) {
    const stringValue = expectString(value, key);
    return stringValue.replace(/^~/, HOME);
  },
  noteFontFamily: expectString,
  noteFontSize: expectString,
};

function isValidConfigKey(key: string): key is keyof Config {
  return key in DEFAULT_CONFIG;
}

function processConfig(input: JSONValue = {}): Readonly<Config> {
  const output = {
    ...DEFAULT_CONFIG,
  };

  if (typeof input === 'object') {
    for (const [key, value] of Object.entries(input as JSONObject)) {
      if (isValidConfigKey(key)) {
        output[key] = CONFIG_NORMALIZERS[key](value, key);
      } else {
        console.warn(`Ignoring unsupported config key ${key}`);
      }
    }
  } else {
    console.warn('input JSON is not an object');
  }

  return Object.freeze(output);
}
