/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow strict-local
 */

import * as log from './log';
import run from './run';

import type {Config} from './loadConfig';

type SystemInfo = {|
  +nameMax: number,
  +pathMax: number,
|};

export const defaults = {
  nameMax: 255,
  pathMax: 1024,
};

function parseValue(value: string): number {
  return parseInt(value.trim(), 10);
}

/**
 * Query the system for information.
 */
export default async function querySystem(config: Config): Promise<SystemInfo> {
  const {notesDirectory} = config;
  let nameMax = null;
  let pathMax = null;

  try {
    [nameMax, pathMax] = await Promise.all([
      run('getconf', 'NAME_MAX', notesDirectory).then(parseValue),
      run('getconf', 'PATH_MAX', notesDirectory).then(parseValue),
    ]);
  } catch (error) {
    log.warn(error);
  }

  return {
    nameMax: nameMax || defaults.nameMax,
    pathMax: pathMax || defaults.pathMax,
  };
}
