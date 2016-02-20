/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

'use strict';

import Actions from '../Actions';
import ConfigStore from './ConfigStore';
import NotesStore from './NotesStore';
import OperationsQueue from '../OperationsQueue';
import Repo from '../Repo';
import Store from './Store';
import handleError from '../handleError';

// Git operations run at a higher priority.
const GIT_PRIORITY = OperationsQueue.DEFAULT_PRIORITY - 20;

class GitStore extends Store {
  handleDispatch(payload) {
    switch (payload.type) {
      case Actions.CONFIG_LOADED:
        this.waitFor(NotesStore.dispatchToken); // creates directory if needed
        this._repo = new Repo(ConfigStore.config.notesDirectory);
        OperationsQueue.enqueue(
          async () => {
            try {
              await this._repo.init();
            } catch(error) {
              handleError(error, 'Failed to initialize Git repository');
            }
          },
          GIT_PRIORITY
        );
        break;

      case Actions.CHANGE_PERSISTED:
        OperationsQueue.enqueue(
          async () => {
            try {
              await this._repo.add('*.txt');
              await this._repo.commit('Corpus (post-change) snapshot');
            } catch(error) {
              handleError(error, 'Failed to create Git commit');
            }
          },
          GIT_PRIORITY
        );
        break;
    }
  }
}

export default new GitStore();
