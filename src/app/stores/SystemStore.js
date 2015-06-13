/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

'use strict';

import {Map as ImmutableMap} from 'immutable';

import Actions from '../Actions';
import ConfigStore from './ConfigStore';
import Store from './Store';
import run from '../run';
import warn from '../warn';

const defaults = {
  nameMax: 255,
  pathMax: 1024,
};

let values = ImmutableMap(defaults);

function parseValue(value: string) {
  return parseInt(value.trim(), 10);
}

async function load() {
  const notesDirectory = ConfigStore.config.get('notesDirectory');
  try {
    const [nameMax, pathMax] = await* [
      run('getconf', 'NAME_MAX', notesDirectory).then(parseValue),
      run('getconf', 'PATH_MAX', notesDirectory).then(parseValue),
    ];
    values = values.merge({nameMax, pathMax});
  } catch(error) {
    warn(error);
  }
}

/**
 * Store exposing system-specific information.
 */
class SystemStore extends Store {
  handleDispatch(payload) {
    switch (payload.type) {
      case Actions.CONFIG_LOADED:
        requestAnimationFrame(
          async function() {
            const previousValues = values;
            await load();
            if (values !== previousValues) {
              this.emit('change');
            }
          }.bind(this)
        );
        break;
    }
  }

  get values() {
    return values;
  }
}

export default new SystemStore();
