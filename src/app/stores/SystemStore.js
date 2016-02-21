/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

import {Map as ImmutableMap} from 'immutable';

import Actions from '../Actions';
import ConfigStore from './ConfigStore';
import Store from './Store';
import * as log from '../log';
import run from '../run';

const defaults = {
  nameMax: 255,
  pathMax: 1024,
};

let values = ImmutableMap(defaults);

function parseValue(value: string) {
  return parseInt(value.trim(), 10);
}

async function load() {
  const notesDirectory = ConfigStore.config.notesDirectory;
  try {
    const [nameMax, pathMax] = await Promise.all([
      run('getconf', 'NAME_MAX', notesDirectory).then(parseValue),
      run('getconf', 'PATH_MAX', notesDirectory).then(parseValue),
    ]);
    values = values.merge({nameMax, pathMax});
  } catch(error) {
    log.warn(error);
  }
}

/**
 * Store exposing system-specific information.
 */
class SystemStore extends Store {
  handleDispatch(payload) {
    switch (payload.type) {
      case Actions.CONFIG_LOADED:
        requestAnimationFrame(async () => {
          const previousValues = values;
          await load();
          if (values !== previousValues) {
            this.emit('change');
          }
        });
        break;
    }
  }

  get values() {
    return values;
  }
}

export default new SystemStore();
