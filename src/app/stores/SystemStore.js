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

const defaults = {
  nameMax: 255,
  pathMax: 1024,
};

let values = ImmutableMap(defaults);

function load(): Promise {
  const notesDirectory = ConfigStore.config.get('notesDirectory');
  return Promise
    .all(
      run('getconf', 'NAME_MAX', notesDirectory),
      run('getconf', 'PATH_MAX', notesDirectory)
    )
    .then(([nameMax, pathMax]) => {
      values = values.merge({nameMax, pathMax});
    });
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
