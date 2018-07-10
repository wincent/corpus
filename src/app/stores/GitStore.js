/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

import Actions from '../Actions';
import OperationsQueue from '../OperationsQueue';
import Repo from '../Repo';
import Store from './Store';
import getNotesDirectory from '../getNotesDirectory';
import handleError from '../handleError';

// Git operations run at a higher priority.
const GIT_PRIORITY = OperationsQueue.DEFAULT_PRIORITY - 20;

class GitStore extends Store {
  handleDispatch(payload) {
    switch (payload.type) {
      case Actions.CHANGE_PERSISTED:
        OperationsQueue.enqueue(async () => {
          try {
            const directory = await getNotesDirectory();
            const repo = new Repo(directory);
            await repo.add('*.md');
            await repo.commit('Corpus (post-change) snapshot');
          } catch (error) {
            handleError(error, 'Failed to create Git commit');
          }
        }, GIT_PRIORITY);
        break;
    }
  }
}

export default new GitStore();
