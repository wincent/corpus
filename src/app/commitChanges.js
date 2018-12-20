/**
 * Copyright 2015-present Greg Hurrell. All rights reserved.
 * Licensed under the terms of the MIT license.
 *
 * @flow
 */

import OperationsQueue from './OperationsQueue';
import Repo from './Repo';
import getNotesDirectory from './getNotesDirectory';
import handleError from './handleError';

// Git operations run at a higher priority.
const GIT_PRIORITY = OperationsQueue.DEFAULT_PRIORITY - 20;

export default function commitChanges(
  message: string = 'Corpus (post-change) snapshot',
): void {
  OperationsQueue.enqueue(async () => {
    try {
      // TODO: pass store here as well
      const directory = await getNotesDirectory();
      const repo = new Repo(directory);
      await repo.add('*.md');
      await repo.commit(message);
    } catch (error) {
      handleError(error, 'Failed to create Git commit');
    }
  }, GIT_PRIORITY);
}
