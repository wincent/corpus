/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

import Promise from 'bluebird';
import * as log from './log';
import run from './run';

import type {ConfigT} from './stores/ConfigStore';

function parseValue(value: string) {
  return parseInt(value.trim(), 10);
}

/**
 * Interrogates the system for information.
 */
export default async function querySystem(config: ConfigT) {
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

  return {nameMax, pathMax};
}
