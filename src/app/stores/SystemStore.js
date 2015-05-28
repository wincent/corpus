/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

'use strict';

import {Map as ImmutableMap} from 'immutable';
import Promise from 'bluebird';
import run from '../run';

import Actions from '../Actions';
import ConfigStore from './ConfigStore';
import Store from './Store';
import warn from '../warn';

const defaults = {
  nameMax: 255,
  pathMax: 1024,
};

let values = ImmutableMap(defaults);

function parseValue(value: string) {
  return parseInt(value.trim(), 10);
}

function load(): Promise {
  const notesDirectory = ConfigStore.config.get('notesDirectory');
  return Promise
    .all([
      run('getconf', 'NAME_MAX', notesDirectory).then(parseValue),
      run('getconf', 'PATH_MAX', notesDirectory).then(parseValue),
    ])
    .then(([nameMax, pathMax]) => {
      values = values.merge({nameMax, pathMax});
    })
    .catch(warn);
}

/**
 * Store exposing system-specific information.
 */
class SystemStore extends Store {
  handleDispatch(payload) {
    switch (payload.type) {
      case Actions.CONFIG_LOADED:
        load().then(() => this.emit('change'));
        break;
    }
  }

  get values() {
    return values;
  }
}

export default new SystemStore();
